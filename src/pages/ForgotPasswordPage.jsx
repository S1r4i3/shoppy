import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import PasswordStrength from '../components/PasswordStrength';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { patterns, validatePassword } from '../utils/validators';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('request'); // request | reset
  const [email, setEmail] = useState('');
  const [demoCode, setDemoCode] = useState(null);
  const [form, setForm] = useState({ code: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  async function requestCode(e) {
    e.preventDefault();
    if (!patterns.email.test(email.trim())) return setErrors({ email: 'Enter a valid email address.' });
    setErrors({});
    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(email);
      setDemoCode(res.demoCode);
      setStep('reset');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setFormError('');
    const v = {};
    if (!/^\d{6}$/.test(form.code.trim())) v.code = 'Enter the 6-digit code.';
    const pwErr = validatePassword(form.newPassword);
    if (pwErr) v.newPassword = pwErr;
    if (form.confirmPassword !== form.newPassword) v.confirmPassword = 'Passwords do not match.';
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      await authService.resetPassword({ email, code: form.code, newPassword: form.newPassword });
      toast.success('Password updated. Please sign in with your new password.');
      navigate('/login', { replace: true, state: { email, notice: 'Password reset successful. Sign in with your new password.' } });
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      setFormError(err.message);
      setLoading(false);
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === 'code' ? e.target.value.replace(/\D/g, '') : e.target.value }));

  return (
    <AuthLayout
      title={step === 'request' ? 'Reset password' : 'Enter reset code'}
      subtitle={step === 'request' ? "Enter your registered email and we'll send you a 6-digit reset code." : `If an account exists for ${email}, a code has been sent. It expires in 10 minutes.`}
      footer={<Link to="/login">Back to sign in</Link>}
    >
      {formError && <p className="notice notice--error" role="alert">{formError}</p>}
      {step === 'request' ? (
        <form className="form" onSubmit={requestCode} noValidate>
          <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" autoFocus />
          <Button type="submit" block size="lg" loading={loading}>Send reset code</Button>
        </form>
      ) : (
        <form className="form" onSubmit={resetPassword} noValidate>
          {demoCode && (
            <p className="notice notice--info">
              <strong>Demo mode:</strong> no email service is connected, so your code is <code className="code">{demoCode}</code>
            </p>
          )}
          <FormField label="6-digit code" value={form.code} onChange={set('code')} error={errors.code} inputMode="numeric" maxLength={6} autoComplete="one-time-code" />
          <FormField label="New password" type="password" value={form.newPassword} onChange={set('newPassword')} error={errors.newPassword} autoComplete="new-password" />
          <PasswordStrength password={form.newPassword} />
          <FormField label="Confirm new password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" />
          <Button type="submit" block size="lg" loading={loading}>Update password</Button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setStep('request'); setFormError(''); setErrors({}); }}>Use a different email</button>
        </form>
      )}
    </AuthLayout>
  );
}
