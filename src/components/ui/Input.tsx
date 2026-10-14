import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

export function Input({ className = '', error = false, ...props }: InputProps) {
  return (
    <input
      className={`ui-input${error ? ' input-error' : ''}${className ? ` ${className}` : ''}`}
      aria-invalid={error || undefined}
      {...props}
    />
  )
}
