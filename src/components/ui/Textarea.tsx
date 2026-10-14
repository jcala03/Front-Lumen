import type { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean
}

export function Textarea({ className = '', error = false, ...props }: TextareaProps) {
  return (
    <textarea
      className={`ui-input ui-textarea${error ? ' input-error' : ''}${className ? ` ${className}` : ''}`}
      aria-invalid={error || undefined}
      {...props}
    />
  )
}
