import { Link } from 'react-router-dom';

export function Loader({ label = 'Loading…' }) {
  return (
    <div className="state state--loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton-card">
          <div className="skeleton skeleton--img" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line short" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon = '🛒', title, message, actionLabel, actionTo, onAction }) {
  return (
    <div className="state state--empty">
      <div className="state__icon" aria-hidden="true">{icon}</div>
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {actionLabel && actionTo && <Link className="btn btn--primary btn--md" to={actionTo}>{actionLabel}</Link>}
      {actionLabel && onAction && <button className="btn btn--primary btn--md" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <div className="state__icon" aria-hidden="true">⚠️</div>
      <h2>Oops!</h2>
      <p>{message}</p>
      {onRetry && <button className="btn btn--outline btn--md" onClick={onRetry}>Try again</button>}
    </div>
  );
}
