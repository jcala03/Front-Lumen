import type { SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean
}

export function Select({ className = '', error = false, children, ...props }: SelectProps) {
  return (
    <select
      className={`ui-input ui-select${error ? ' input-error' : ''}${className ? ` ${className}` : ''}`}
      aria-invalid={error || undefined}
      {...props}
    >
      {children}
    </select>
  )
}
