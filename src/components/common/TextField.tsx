import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FieldBase { label: string; error?: string; hint?: string }

export function TextField({ label, error, hint, id, ...rest }: FieldBase & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <div className="field">
      <label htmlFor={fieldId} className="field__label">{label}</label>
      <input id={fieldId} className="field__control" aria-invalid={!!error} aria-describedby={describedBy} {...rest} />
      {error ? <p id={`${fieldId}-error`} className="field__error" role="alert">{error}</p>
        : hint ? <p id={`${fieldId}-hint`} className="field__hint">{hint}</p> : null}
    </div>
  );
}

export function TextArea({ label, error, hint, id, ...rest }: FieldBase & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className="field">
      <label htmlFor={fieldId} className="field__label">{label}</label>
      <textarea id={fieldId} className="field__control field__control--area" aria-invalid={!!error} {...rest} />
      {error ? <p className="field__error" role="alert">{error}</p> : hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}
