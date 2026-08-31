import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className="field">
      <label className="field-label">
        {label}
        {hint ? <span className="field-hint" style={{ marginLeft: 8 }}>{hint}</span> : null}
      </label>
      {children}
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, ...rest }: InputProps) {
  return <input className={`input ${invalid ? "input-error" : ""}`} {...rest} />;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, ...rest }: TextareaProps) {
  return <textarea className={`textarea ${invalid ? "input-error" : ""}`} {...rest} />;
}
