import { useId, useState } from 'react';
import { EyeIcon } from './Icons';

export default function FormField({ label, error, hint, type = 'text', as = 'input', children, ...rest }) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  const common = { id, 'aria-invalid': !!error, 'aria-describedby': describedBy, className: 'field__control', ...rest };

  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={id} className="field__label">{label}</label>
      <div className="field__wrap">
        {as === 'textarea' && <textarea rows={3} {...common} />}
        {as === 'select' && <select {...common}>{children}</select>}
        {as === 'input' && <input type={isPassword && reveal ? 'text' : type} {...common} />}
        {isPassword && (
          <button type="button" className="field__reveal" onClick={() => setReveal((r) => !r)} aria-label={reveal ? 'Hide password' : 'Show password'}>
            <EyeIcon width={18} height={18} />
          </button>
        )}
      </div>
      {error ? <p id={`${id}-err`} className="field__error" role="alert">{error}</p> : hint ? <p id={`${id}-hint`} className="field__hint">{hint}</p> : null}
    </div>
  );
}
