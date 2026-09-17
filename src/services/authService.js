import { transaction, query } from './mockDb';
import { simulate } from './apiClient';
import { config } from './config';
import { ApiError, ERR } from './errors';
import { hashPassword, randomHex, sha256, safeEqual } from './crypto';
import { validateRegistration, validatePassword, validateProfile, hasErrors } from '../utils/validators';

const now = () => Date.now();
const publicUser = ({ passwordHash, salt, ...u }) => u; // eslint-disable-line no-unused-vars
const normEmail = (e) => e.trim().toLowerCase();

async function createSession(userId) {
  const token = randomHex(32);
  const tokenHash = await sha256(token);
  const expiresAt = now() + config.sessionTtlMinutes * 60_000;
  transaction((db) => {
    db.sessions = db.sessions.filter((s) => s.expiresAt > now());
    db.sessions.push({ tokenHash, userId, expiresAt });
  });
  return { token, expiresAt };
}

const SLIDE_MIN_GAP_MS = 60_000; // avoid rewriting the session on every call

/**
 * Resolves the user for a token, or throws UNAUTHORIZED / SESSION_EXPIRED.
 * Valid sessions are extended (sliding idle timeout) unless `slide` is false.
 */
export async function requireUser(token, { slide = true } = {}) {
  if (!token) throw new ApiError('Please sign in to continue.', ERR.UNAUTHORIZED, 401);
  const tokenHash = await sha256(token);
  const session = query((db) => db.sessions.find((s) => s.tokenHash === tokenHash));
  if (!session) throw new ApiError('Your session is invalid. Please sign in again.', ERR.UNAUTHORIZED, 401);
  if (session.expiresAt <= now()) {
    transaction((db) => {
      db.sessions = db.sessions.filter((s) => s.tokenHash !== tokenHash);
    });
    throw new ApiError('Your session has expired. Please sign in again.', ERR.SESSION_EXPIRED, 401);
  }
  const user = query((db) => db.users.find((u) => u.id === session.userId));
  if (!user) throw new ApiError('Account not found.', ERR.UNAUTHORIZED, 401);

  const renewed = now() + config.sessionTtlMinutes * 60_000;
  if (slide && renewed - session.expiresAt > SLIDE_MIN_GAP_MS) {
    transaction((db) => {
      const s = db.sessions.find((x) => x.tokenHash === tokenHash);
      if (s) s.expiresAt = renewed;
    });
    session.expiresAt = renewed;
  }
  return { user, session };
}

export const authService = {
  register: (form) =>
    simulate(async () => {
      const errors = validateRegistration(form);
      if (hasErrors(errors)) throw Object.assign(new ApiError('Please fix the highlighted fields.', ERR.VALIDATION), { fields: errors });
      const email = normEmail(form.email);
      if (query((db) => db.users.some((u) => u.email === email))) {
        throw Object.assign(new ApiError('An account with this email already exists.', ERR.EMAIL_TAKEN, 409), {
          fields: { email: 'This email is already registered.' },
        });
      }
      const salt = randomHex(16);
      const user = {
        id: `u_${randomHex(6)}`,
        name: form.name.trim(),
        email,
        phone: form.phone.trim(),
        address: '',
        passwordHash: await hashPassword(form.password, salt),
        salt,
        createdAt: new Date().toISOString(),
      };
      transaction((db) => db.users.push(user));
      const session = await createSession(user.id);
      return { user: publicUser(user), ...session };
    }),

  login: ({ email, password }) =>
    simulate(async () => {
      const user = query((db) => db.users.find((u) => u.email === normEmail(email || '')));
      // Same generic message for unknown email or wrong password (no account enumeration).
      const invalid = new ApiError('Invalid email or password.', ERR.INVALID_CREDENTIALS, 401);
      if (!user) throw invalid;
      const hash = await hashPassword(password || '', user.salt);
      if (!safeEqual(hash, user.passwordHash)) throw invalid;
      const session = await createSession(user.id);
      return { user: publicUser(user), ...session };
    }),

  logout: (token) =>
    simulate(async () => {
      if (!token) return;
      const tokenHash = await sha256(token);
      transaction((db) => {
        db.sessions = db.sessions.filter((s) => s.tokenHash !== tokenHash);
      });
    }),

  /** Extend the session because the user is active. No simulated latency. */
  touch: async (token) => {
    const { session } = await requireUser(token);
    return { expiresAt: session.expiresAt };
  },

  /** Check a session without extending it (used by the expiry timer). */
  check: async (token) => {
    const { session } = await requireUser(token, { slide: false });
    return { expiresAt: session.expiresAt };
  },

  me: (token) =>
    simulate(async () => {
      const { user, session } = await requireUser(token);
      return { user: publicUser(user), expiresAt: session.expiresAt };
    }),

  updateProfile: (token, data) =>
    simulate(async () => {
      const { user } = await requireUser(token);
      const errors = validateProfile(data);
      if (hasErrors(errors)) throw Object.assign(new ApiError('Please fix the highlighted fields.', ERR.VALIDATION), { fields: errors });
      const updated = transaction((db) => {
        const u = db.users.find((x) => x.id === user.id);
        u.name = data.name.trim();
        u.phone = data.phone.trim();
        u.address = (data.address || '').trim();
        return { ...u };
      });
      return publicUser(updated);
    }),

  changePassword: (token, { currentPassword, newPassword }) =>
    simulate(async () => {
      const { user } = await requireUser(token);
      const currentHash = await hashPassword(currentPassword || '', user.salt);
      if (!safeEqual(currentHash, user.passwordHash)) {
        throw Object.assign(new ApiError('Current password is incorrect.', ERR.INVALID_CREDENTIALS), {
          fields: { currentPassword: 'Current password is incorrect.' },
        });
      }
      const pwErr = validatePassword(newPassword);
      if (pwErr) throw Object.assign(new ApiError(pwErr, ERR.VALIDATION), { fields: { newPassword: pwErr } });
      const salt = randomHex(16);
      const passwordHash = await hashPassword(newPassword, salt);
      transaction((db) => Object.assign(db.users.find((u) => u.id === user.id), { salt, passwordHash }));
    }),

  /**
   * Step 1 of password reset. A real backend would e-mail the code. Because this is a
   * mock backend, the code is returned as `demoCode` so the flow can be tested.
   * The response is identical whether or not the email exists.
   */
  requestPasswordReset: (email) =>
    simulate(async () => {
      const normalized = normEmail(email || '');
      const exists = query((db) => db.users.some((u) => u.email === normalized));
      if (!exists) return { sent: true, demoCode: null };
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const codeHash = await sha256(`${normalized}:${code}`);
      transaction((db) => {
        db.resetCodes = db.resetCodes.filter((r) => r.email !== normalized);
        db.resetCodes.push({ email: normalized, codeHash, expiresAt: now() + config.resetCodeTtlMinutes * 60_000 });
      });
      return { sent: true, demoCode: code };
    }),

  /** Step 2: verify code, set new password and revoke all existing sessions. */
  resetPassword: ({ email, code, newPassword }) =>
    simulate(async () => {
      const normalized = normEmail(email || '');
      const codeHash = await sha256(`${normalized}:${(code || '').trim()}`);
      const entry = query((db) => db.resetCodes.find((r) => r.email === normalized));
      if (!entry || entry.expiresAt <= now() || !safeEqual(entry.codeHash, codeHash)) {
        throw Object.assign(new ApiError('The reset code is invalid or has expired.', ERR.INVALID_RESET_CODE), {
          fields: { code: 'Invalid or expired code.' },
        });
      }
      const pwErr = validatePassword(newPassword);
      if (pwErr) throw Object.assign(new ApiError(pwErr, ERR.VALIDATION), { fields: { newPassword: pwErr } });
      const salt = randomHex(16);
      const passwordHash = await hashPassword(newPassword, salt);
      transaction((db) => {
        const u = db.users.find((x) => x.email === normalized);
        Object.assign(u, { salt, passwordHash });
        db.resetCodes = db.resetCodes.filter((r) => r.email !== normalized);
        db.sessions = db.sessions.filter((s) => s.userId !== u.id);
      });
    }),
};
