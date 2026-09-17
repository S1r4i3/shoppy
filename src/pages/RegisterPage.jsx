import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import PasswordStrength from '../components/PasswordStrength';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateRegistration, hasErrors } from '../utils/validators';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => {
    const value = k === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
  };
  const blur = (k) => () => {
    const v = validateRegistration(form);
    setErrors((prev) => {
      const next = { ...prev };
      if (v[k] && form[k]) next[k] = v[k];
      else delete next[k];
      return next;
    });
  };

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    const v = validateRegistration(form);
    setErrors(v);
    if (hasErrors(v)) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created. Welcome to myShoppy!');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      setFormError(err.message);
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Join myShoppy for a faster, personalised shopping experience." footer={<>Already have an account? <Link to="/login" state={location.state}>Sign in</Link></>}>
      {formError && <p className="notice notice--error" role="alert">{formError}</p>}
      <form className="form" onSubmit={onSubmit} noValidate>
        <FormField label="Full name" value={form.name} onChange={set('name')} onBlur={blur('name')} error={errors.name} autoComplete="name" />
        <FormField label="Email" type="email" value={form.email} onChange={set('email')} onBlur={blur('email')} error={errors.email} autoComplete="email" />
        <FormField label="Mobile number" value={form.phone} onChange={set('phone')} onBlur={blur('phone')} error={errors.phone} inputMode="numeric" maxLength={10} autoComplete="tel" />
        <FormField label="Password" type="password" value={form.password} onChange={set('password')} onBlur={blur('password')} error={errors.password} autoComplete="new-password" hint="8+ characters with upper, lower case and a number" />
        <PasswordStrength password={form.password} />
        <FormField label="Confirm password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} onBlur={blur('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" />
        <Button type="submit" block size="lg" loading={loading}>Create Account</Button>
      </form>
    </AuthLayout>
  );
}
