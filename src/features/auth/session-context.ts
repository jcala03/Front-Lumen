import { createContext } from 'react'
import type { AuthUser, LoginRequest, RegisterRequest } from '../../types/auth'

export type Session = {
  token: string
  user: AuthUser
  expiresAt: number
}

export type SessionContextValue = {
  session: Session | null
  sessionExpired: boolean
  isLoading: boolean
  signIn: (payload: LoginRequest) => Promise<void>
  signUp: (payload: RegisterRequest) => Promise<void>
  signOut: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)
