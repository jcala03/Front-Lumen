import { useState, type InputHTMLAttributes } from 'react'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  error?: boolean
}

export function PasswordInput({ className = '', error = false, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={`password-input-wrap${error ? ' has-error' : ''}`}>
      <input
        className={`ui-input password-input${className ? ` ${className}` : ''}`}
        type={visible ? 'text' : 'password'}
        aria-invalid={error || undefined}
        {...props}
      />
      <button
        className="password-toggle"
        type="button"
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  )
}
