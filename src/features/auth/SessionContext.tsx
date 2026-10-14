import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getProfile, login as requestLogin, register as requestRegister } from '../../services/api/auth'
import type { AuthUser, LoginRequest, RegisterRequest } from '../../types/auth'
import { SessionContext, type Session } from './session-context'

type SessionProviderProps = {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    if (!session?.claims.exp) return

    const timeout = window.setTimeout(() => {
      setSession(null)
      setSessionExpired(true)
    }, Math.max(0, session.claims.exp * 1000 - Date.now()))

    return () => window.clearTimeout(timeout)
  }, [session])

  const authenticate = useCallback(async (
    request: () => Promise<{ token: string; usuario: AuthUser }>,
  ) => {
    setIsLoading(true)
    setSessionExpired(false)
    try {
      const response = await request()
      const profile = await getProfile(response.token)
      setSession({
        token: response.token,
        user: response.usuario,
        claims: profile.usuario,
      })
    } catch (error) {
      setSession(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signIn = useCallback((payload: LoginRequest) => (
    authenticate(() => requestLogin(payload))
  ), [authenticate])

  const signUp = useCallback((payload: RegisterRequest) => (
    authenticate(() => requestRegister(payload))
  ), [authenticate])

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
