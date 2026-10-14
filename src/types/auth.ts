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
  telefono?: string
  ciudad?: string
  nivel_educativo?: string
  institucion?: string
  biografia?: string
  tarifa_hora_base?: number
}

export type AuthUser = {
  id: number | string
  nombre: string
  apellido: string
  correo: string
  rol: UserRole
  avatar_url?: string | null
}

export type AuthResponse = {
  mensaje: string
  usuario: AuthUser
  token: string
}

export type ProfileResponse = {
  mensaje: string
  usuario: {
    id: number | string
    rol: UserRole
    iat?: number
    exp?: number
  }
}
