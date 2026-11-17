export type LoginFormValues = {
  correo: string
  password: string
}

export type LoginValidationErrors = Partial<Record<keyof LoginFormValues, string>>

export type RegisterFormValues = {
  nombre: string
  apellido: string
  correo: string
  password: string
}

export type RegisterValidationErrors = Partial<Record<keyof RegisterFormValues, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value: string): string | undefined {
  const correo = value.trim()
  if (!correo) return 'Ingresa tu correo electrónico.'
  if (correo.length > 254 || !emailPattern.test(correo)) {
    return 'Ingresa un correo electrónico válido.'
  }
  return undefined
}

export function validateLogin(values: LoginFormValues): LoginValidationErrors {
  const errors: LoginValidationErrors = {}
  const emailError = validateEmail(values.correo)
  if (emailError) errors.correo = emailError

  if (!values.password) {
    errors.password = 'Ingresa tu contraseña.'
  }

  return errors
}

export function validateRegister(
  values: RegisterFormValues,
): RegisterValidationErrors {
  const errors: RegisterValidationErrors = {}

  if (!values.nombre.trim()) errors.nombre = 'Ingresa tu nombre.'
  if (!values.apellido.trim()) errors.apellido = 'Ingresa tu apellido.'

  const emailError = validateEmail(values.correo)
  if (emailError) errors.correo = emailError

  if (!values.password.trim() || values.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.'
  }

  return errors
}
