import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  loading?: boolean
  loadingLabel?: string
}

export function Button({
  children,
  className = '',
  loading = false,
  loadingLabel = 'Procesando…',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button ui-button${className ? ` ${className}` : ''}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="button-spinner" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : children}
    </button>
  )
}
