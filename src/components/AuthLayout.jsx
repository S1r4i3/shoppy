import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <Link to="/" className="logo logo--lg" aria-label="myShoppy home"><img src="/logo.png" alt="MyShoppy" className="logo__img" /></Link>
      <div className="auth__card card">
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
        {children}
      </div>
      {footer && <div className="auth__footer">{footer}</div>}
    </div>
  );
}
