import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { login as requestLogin, register as requestRegister } from '../../services/api/auth'
import type { LoginRequest, RegisterRequest } from '../../types/auth'
import { SessionContext, type Session } from './session-context'

type SessionProviderProps = {
  children: ReactNode
}

function getTokenExpiration(token: string): number {
  try {
    const part = token.split('.')[1] ?? ''
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    const { exp } = JSON.parse(json) as { exp?: unknown }
    if (typeof exp === 'number' && Number.isFinite(exp) && exp * 1000 > Date.now()) return exp * 1000
  } catch {
    // El servidor valida la firma en cada ruta protegida.
  }
  throw new Error('No se pudo leer la vigencia del token de sesión.')
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    if (!session) return

    const timeout = window.setTimeout(() => {
      setSession(null)
      setSessionExpired(true)
    }, Math.max(0, session.expiresAt - Date.now()))

    return () => window.clearTimeout(timeout)
  }, [session])

  const signIn = useCallback(async (payload: LoginRequest) => {
    setIsLoading(true)
    setSessionExpired(false)
    try {
      const { token, usuario } = await requestLogin(payload)
      setSession({ token, user: usuario, expiresAt: getTokenExpiration(token) })
    } catch (error) {
      setSession(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signUp = useCallback(async (payload: RegisterRequest) => {
    setIsLoading(true)
    try {
      await requestRegister(payload)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(() => {
    setSession(null)
    setSessionExpired(false)
  }, [])

  const value = useMemo(
    () => ({ session, sessionExpired, isLoading, signIn, signUp, signOut }),
    [session, sessionExpired, isLoading, signIn, signUp, signOut],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
