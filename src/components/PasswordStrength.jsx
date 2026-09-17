export default function PasswordStrength({ password = '' }) {
  if (!password) return null;
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  const label = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][score];
  return (
    <div className="pw-strength" aria-live="polite">
      <div className="pw-strength__bar"><span style={{ width: `${(score / 5) * 100}%` }} data-score={score} /></div>
      <small>{label}</small>
    </div>
  );
}
