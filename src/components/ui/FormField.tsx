import { cloneElement, isValidElement, type ReactElement } from 'react'
import { FormError } from './FormError'

type FormControlProps = {
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

type FormFieldProps = {
  id: string
  label: string
  children: ReactElement<FormControlProps>
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
}

export function FormField({
  id,
  label,
  children,
  required = false,
  optional = false,
  hint,
  error,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={`form-field${error ? ' has-error' : ''}`}>
      <div className="form-label-row">
        <label htmlFor={id}>{label}</label>
        {required && <span className="field-required">Obligatorio</span>}
        {optional && <span className="field-optional">Opcional</span>}
      </div>
      {isValidElement<FormControlProps>(children)
        ? cloneElement(children, {
            'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
            'aria-invalid': Boolean(error) || undefined,
          })
        : children}
      {hint && <p className="field-hint" id={hintId}>{hint}</p>}
      {error && <FormError id={errorId}>{error}</FormError>}
    </div>
  )
}
