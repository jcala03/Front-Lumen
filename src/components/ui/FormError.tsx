type FormErrorProps = {
  children: string
  id?: string
}

export function FormError({ children, id }: FormErrorProps) {
  return <p className="form-error" id={id} role="alert">{children}</p>
}
