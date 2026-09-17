export default function Button({ variant = 'primary', size = 'md', loading = false, block = false, children, className = '', ...rest }) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${block ? 'btn--block' : ''} ${className}`}
      disabled={loading || rest.disabled}
      aria-busy={loading}
      {...rest}
    >
      {loading && <span className="spinner spinner--sm" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
