import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { StatusNotice } from '../../components/ui/StatusNotice'
import { ApiError } from '../../services/api/client'
import { useSession } from './useSession'
import { validateEmail, validateLogin } from './validation'
import type { LoginFormValues } from './validation'

export function LoginPage() {
  const [values, setValues] = useState<LoginFormValues>({ correo: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({})
  const [formError, setFormError] = useState('')
  const { signIn, isLoading } = useSession()
  const navigate = useNavigate()

  const updateField = (field: keyof LoginFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateLogin(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setFormError('')
    try {
      await signIn({ correo: values.correo.trim(), password: values.password })
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        const nextErrors = error.fields ?? {}
        setErrors({
          ...(typeof nextErrors.correo === 'string' ? { correo: nextErrors.correo } : {}),
          ...(typeof nextErrors.password === 'string' ? { password: nextErrors.password } : {}),
        })
        setFormError(error.message)
      } else {
        setFormError('No se pudo conectar con el servidor. Inténtalo de nuevo.')
      }
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside login-aside">
          <span className="auth-aside-kicker">Tu aprendizaje continúa</span>
          <span className="auth-aside-mark" aria-hidden="true">L</span>
          <p className="auth-aside-quote">“Cada paso que das también cuenta como aprendizaje.”</p>
          <span className="auth-aside-caption">Lumen · aprender en comunidad</span>
        </aside>

        <div className="auth-panel">
          <p className="eyebrow">Qué bueno tenerte de vuelta</p>
          <h1 className="auth-title">Inicia sesión en <span>Lumen.</span></h1>
          <p className="auth-description">Ingresa tus datos para continuar tu camino de aprendizaje.</p>

          <form className="auth-form" noValidate onSubmit={handleSubmit}>
            <FormField id="login-email" label="Correo electrónico" required error={errors.correo}>
              <Input
                id="login-email"
                name="correo"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                value={values.correo}
                error={Boolean(errors.correo)}
                onChange={(event) => updateField('correo', event.target.value)}
                onBlur={() => setErrors((current) => ({ ...current, correo: validateEmail(values.correo) }))}
              />
            </FormField>

            <FormField id="login-password" label="Contraseña" required error={errors.password}>
              <PasswordInput
                id="login-password"
                name="password"
                autoComplete="current-password"
                placeholder="Escribe tu contraseña"
                value={values.password}
                error={Boolean(errors.password)}
                onChange={(event) => updateField('password', event.target.value)}
              />
            </FormField>

            {formError && <FormError>{formError}</FormError>}

            <Button className="auth-submit" type="submit" loading={isLoading} loadingLabel="Verificando acceso…">
              Iniciar sesión <span aria-hidden="true">→</span>
            </Button>
            <p className="auth-connection-note">
              <span className="connection-dot connection-dot-live" aria-hidden="true" />
              El acceso se validará con el servicio configurado
            </p>
          </form>

          <p className="auth-switch">
            ¿Todavía no tienes cuenta? <Link to="/registro">Crea tu cuenta</Link>
          </p>

          <div className="auth-inline-notice">
            <StatusNotice title="Sesión protegida">
              El token se conserva solo en memoria durante esta pestaña y se valida con el endpoint de perfil.
            </StatusNotice>
          </div>
        </div>
      </div>
    </section>
  )
}
