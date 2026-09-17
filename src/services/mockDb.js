/**
 * A tiny mock "backend database" persisted in localStorage.
 * It stands in for a real server (e.g. Firebase / REST API). The UI never
 * touches this module directly - only the service layer does.
 */
import seedProducts from '../data/products.json';

const DB_KEY = 'myshoppy_mock_db_v1';

const emptyDb = () => ({
  users: [], // { id, name, email, phone, address, passwordHash, salt, createdAt }
  sessions: [], // { tokenHash, userId, expiresAt }
  resetCodes: [], // { email, codeHash, expiresAt }
  orders: [], // { id, userId, items, delivery, totals, createdAt, status }
  carts: {}, // { [userId]: [{ productId, quantity }] }
  inventory: Object.fromEntries(seedProducts.map((p) => [p.id, p.stock])),
});

// In-memory copy so the app keeps working (for this visit) even if the browser
// blocks or fills up localStorage - otherwise writes would be silently lost.
let memoryDb = null;

function read() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return { ...emptyDb(), ...JSON.parse(raw) };
  } catch {
    /* storage blocked or corrupt - fall back to memory */
  }
  return memoryDb ? structuredClone(memoryDb) : emptyDb();
}

function write(db) {
  memoryDb = structuredClone(db);
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (err) {
    console.warn('[myShoppy] Could not save to localStorage, using in-memory data for this visit.', err);
  }
}

/** Run a mutation against the DB and persist it. */
export function transaction(fn) {
  const db = read();
  const result = fn(db);
  write(db);
  return result;
}

export function query(fn) {
  return fn(read());
}

export function resetDb() {
  localStorage.removeItem(DB_KEY);
}
