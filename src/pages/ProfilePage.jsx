import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateProfile, validatePassword, hasErrors } from '../utils/validators';
import { formatDate } from '../utils/format';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, logout, handleAuthError, expiresAt } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, phone: user.phone, address: user.address || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const dirty = form.name !== user.name || form.phone !== user.phone || form.address !== (user.address || '');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value }));

  async function save(e) {
    e.preventDefault();
    const v = validateProfile(form);
    setErrors(v);
    if (hasErrors(v)) return;
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated.');
    } catch (err) {
      if (!handleAuthError(err)) {
        if (err.fields) setErrors(err.fields);
        toast.error(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    const v = {};
    if (!pw.currentPassword) v.currentPassword = 'Current password is required.';
    const pwErr = validatePassword(pw.newPassword);
    if (pwErr) v.newPassword = pwErr;
    setPwErrors(v);
    if (hasErrors(v)) return;
    setPwSaving(true);
    try {
      await changePassword(pw);
      setPw({ currentPassword: '', newPassword: '' });
      toast.success('Password changed.');
    } catch (err) {
      if (!handleAuthError(err)) {
        if (err.fields) setPwErrors(err.fields);
        toast.error(err.message);
      }
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <>
      <AppHeader title="My Account" />
      <section className="profile-head">
        <div className="avatar avatar--lg">{user.name.charAt(0).toUpperCase()}</div>
        <div>
          <h2>{user.name}</h2>
          <p className="muted">{user.email}</p>
          <p className="muted small">Member since {new Date(user.createdAt).toLocaleDateString('en-IN')}</p>
        </div>
      </section>

      <form className="card form" onSubmit={save} noValidate>
        <h2 className="summary__title">Profile details</h2>
        <FormField label="Full name" value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />
        <FormField label="Email" value={user.email} disabled hint="Email cannot be changed." />
        <FormField label="Mobile number" value={form.phone} onChange={set('phone')} error={errors.phone} inputMode="numeric" maxLength={10} />
        <FormField as="textarea" label="Default delivery address" value={form.address} onChange={set('address')} hint="Used to pre-fill checkout." />
        <Button type="submit" block loading={saving} disabled={!dirty}>Save changes</Button>
      </form>

      <form className="card form" onSubmit={savePassword} noValidate>
        <h2 className="summary__title">Change password</h2>
        <FormField label="Current password" type="password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} error={pwErrors.currentPassword} autoComplete="current-password" />
        <FormField label="New password" type="password" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} error={pwErrors.newPassword} autoComplete="new-password" />
        <Button type="submit" variant="outline" block loading={pwSaving}>Update password</Button>
      </form>

      <section className="card">
        <h2 className="summary__title">Session</h2>
        <p className="muted small">Signed in securely. Session expires {expiresAt ? formatDate(new Date(expiresAt).toISOString()) : 'soon'}.</p>
        <Button variant="danger" block loading={signingOut} onClick={async () => { setSigningOut(true); await logout(); }}>Sign out</Button>
      </section>
    </>
  );
}
