export type UserRole = 'estudiante' | 'tutor'

export type LoginRequest = {
  correo: string
  password: string
}

export type RegisterRequest = {
  nombre: string
  apellido: string
  correo: string
  password: string
  rol: UserRole
}

export type AuthUser = {
  id: number | string
  nombre: string
  apellido: string
  correo: string
  rol: UserRole
  avatar_url?: string | null
}

export type RegisterResponse = {
  ok: true
  mensaje: string
  usuario: AuthUser
}

export type LoginResponse = RegisterResponse & {
  token: string
}
