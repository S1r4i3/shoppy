import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateLogin, hasErrors } from '../utils/validators';

export default function LoginPage() {
  const { login, authNotice, clearAuthNotice } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const notice = location.state?.notice || authNotice;

  useEffect(() => () => clearAuthNotice(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    const v = validateLogin(form);
    setErrors(v);
    if (hasErrors(v)) return;
    setLoading(true);
    try {
      await login(form);
      toast.success('Signed in successfully.');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setFormError(err.message);
      setForm((f) => ({ ...f, password: '' }));
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to shop, manage your cart and checkout."
      footer={<>New to myShoppy? <Link to="/register" state={location.state}>Create an account</Link></>}
    >
      {notice && !formError && <p className="notice notice--warn" role="status">{notice}</p>}
      {formError && <p className="notice notice--error" role="alert">{formError}</p>}
      <form className="form" onSubmit={onSubmit} noValidate>
        <FormField label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" autoFocus />
        <FormField label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="current-password" />
        <Link to="/forgot-password" className="form__link">Forgot password?</Link>
        <Button type="submit" block size="lg" loading={loading}>Sign In</Button>
      </form>
    </AuthLayout>
  );
}
