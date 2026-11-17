import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getProfile, login as requestLogin, register as requestRegister } from '../../services/api/auth'
import type { AuthUser, LoginRequest, ProfileResponse, RegisterRequest } from '../../types/auth'
import { SessionContext, type Session } from './session-context'

type SessionProviderProps = {
  children: ReactNode
}

/** Decodifica el payload del JWT sin verificar la firma (solo para leer claims locales). */
function decodeJwtClaims(token: string): ProfileResponse['usuario'] | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as Record<string, unknown>
    return {
      id: (payload.id as number | string) ?? 0,
      rol: (payload.rol as ProfileResponse['usuario']['rol']) ?? 'estudiante',
      iat: payload.iat as number | undefined,
      exp: payload.exp as number | undefined,
    }
  } catch {
    return null
  }
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

      let claims: ProfileResponse['usuario']
      try {
        const profile = await getProfile(response.token)
        claims = profile.usuario
      } catch {
        // El endpoint /api/auth/perfil puede no estar disponible;
        // decodificamos el JWT localmente para obtener los claims.
        const decoded = decodeJwtClaims(response.token)
        if (!decoded) throw new Error('No se pudo verificar el token de sesión.')
        claims = decoded
      }

      setSession({
        token: response.token,
        user: response.usuario,
        claims,
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
