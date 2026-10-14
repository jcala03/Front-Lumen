import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { ApiError } from '../../services/api/client'
import type { RegisterRequest } from '../../types/auth'
import { useSession } from './useSession'
import { validateRegister, type RegisterFormValues } from './validation'

type RegisterField = keyof RegisterFormValues

const initialValues: RegisterFormValues = {
  nombre: '',
  apellido: '',
  correo: '',
  password: '',
  telefono: '',
  ciudad: '',
  nivel_educativo: '',
  institucion: '',
  biografia: '',
  tarifa_hora_base: '',
}

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('rol')
  const [role, setRole] = useState<'estudiante' | 'tutor' | null>(
    roleParam === 'estudiante' || roleParam === 'tutor' ? roleParam : null,
  )
  const [values, setValues] = useState<RegisterFormValues>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<RegisterField, string>>>({})
  const [formError, setFormError] = useState('')
  const [serverFieldErrors, setServerFieldErrors] = useState<Partial<Record<RegisterField, string>>>({})
  const { signUp, isLoading } = useSession()
  const navigate = useNavigate()

  const updateField = (field: RegisterField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
    setServerFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  const chooseRole = (nextRole: 'estudiante' | 'tutor') => {
    setRole(nextRole)
    setErrors({})
    setFormError('')
    setServerFieldErrors({})
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!role) return

    const nextErrors = validateRegister(values, role)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const payload: RegisterRequest = {
      nombre: values.nombre.trim(),
      apellido: values.apellido.trim(),
      correo: values.correo.trim(),
      password: values.password,
      rol: role,
      ...(values.telefono.trim() ? { telefono: values.telefono.trim() } : {}),
      ...(values.ciudad.trim() ? { ciudad: values.ciudad.trim() } : {}),
      ...(role === 'estudiante' && values.nivel_educativo
        ? { nivel_educativo: values.nivel_educativo }
        : {}),
      ...(role === 'estudiante' && values.institucion.trim()
        ? { institucion: values.institucion.trim() }
        : {}),
      ...(role === 'tutor' && values.biografia.trim()
        ? { biografia: values.biografia.trim() }
        : {}),
      ...(role === 'tutor' && values.tarifa_hora_base.trim()
        ? { tarifa_hora_base: Number(values.tarifa_hora_base) }
        : {}),
    }

    setFormError('')
    setServerFieldErrors({})
    try {
      await signUp(payload)
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        const allowedFields = new Set<RegisterField>([
          'nombre', 'apellido', 'correo', 'password', 'telefono', 'ciudad',
          'nivel_educativo', 'institucion', 'biografia', 'tarifa_hora_base',
        ])
        const fieldErrors = Object.fromEntries(
          Object.entries(error.fields ?? {}).filter(
            ([field]) => allowedFields.has(field as RegisterField),
          ),
        ) as Partial<Record<RegisterField, string>>
        setServerFieldErrors(fieldErrors)
        setFormError(error.message)
      } else {
        setFormError('No se pudo conectar con el servidor. Inténtalo de nuevo.')
      }
    }
  }

  return (
    <section className="auth-page register-page">
      <div className="register-shell">
        <div className="register-heading">
          <p className="eyebrow">Cada historia comienza distinto</p>
          <h1 className="auth-title">Tu camino empieza <span>aquí.</span></h1>
          <p className="auth-description">Cuéntanos un poco sobre ti. Los campos marcados como opcionales no son necesarios para el registro.</p>
        </div>

        {!role ? (
          <>
            <div className="role-choice-grid" aria-label="Selecciona tu tipo de cuenta">
              <button className="role-choice" type="button" onClick={() => chooseRole('estudiante')}>
                <span className="role-choice-icon student-icon" aria-hidden="true">✳</span>
                <span className="role-choice-label">Soy estudiante</span>
                <span className="role-choice-description">Quiero encontrar acompañamiento para aprender.</span>
                <span className="role-choice-arrow" aria-hidden="true">→</span>
              </button>
              <button className="role-choice" type="button" onClick={() => chooseRole('tutor')}>
                <span className="role-choice-icon tutor-icon" aria-hidden="true">↗</span>
                <span className="role-choice-label">Soy tutor</span>
                <span className="role-choice-description">Quiero compartir lo que sé con otras personas.</span>
                <span className="role-choice-arrow" aria-hidden="true">→</span>
              </button>
            </div>
            <p className="auth-switch register-switch">
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </>
        ) : (
          <div className="register-form-card">
            <div className="register-form-top">
              <div>
                <span className="register-role-chip">{role === 'estudiante' ? 'Cuenta de estudiante' : 'Cuenta de tutor'}</span>
                <h2>Completa tus datos</h2>
              </div>
              <button className="change-role-button" type="button" onClick={() => chooseRole(role === 'estudiante' ? 'tutor' : 'estudiante')}>
                Cambiar tipo
              </button>
            </div>

            <form className="auth-form register-form" noValidate onSubmit={handleSubmit}>
              <input type="hidden" name="rol" value={role} />
              <div className="form-grid">
                <FormField id="register-nombre" label="Nombre" required error={errors.nombre ?? serverFieldErrors.nombre}>
                  <Input
                    id="register-nombre"
                    name="nombre"
                    autoComplete="given-name"
                    placeholder="Tu nombre"
                    value={values.nombre}
                    error={Boolean(errors.nombre ?? serverFieldErrors.nombre)}
                    onChange={(event) => updateField('nombre', event.target.value)}
                  />
                </FormField>
                <FormField id="register-apellido" label="Apellido" required error={errors.apellido ?? serverFieldErrors.apellido}>
                  <Input
                    id="register-apellido"
                    name="apellido"
                    autoComplete="family-name"
                    placeholder="Tu apellido"
                    value={values.apellido}
                    error={Boolean(errors.apellido ?? serverFieldErrors.apellido)}
                    onChange={(event) => updateField('apellido', event.target.value)}
                  />
                </FormField>
              </div>

              <FormField id="register-correo" label="Correo electrónico" required error={errors.correo ?? serverFieldErrors.correo}>
                <Input
                  id="register-correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={values.correo}
                  error={Boolean(errors.correo ?? serverFieldErrors.correo)}
                  onChange={(event) => updateField('correo', event.target.value)}
                />
              </FormField>

              <FormField id="register-password" label="Contraseña" required hint="Mínimo 8 caracteres." error={errors.password ?? serverFieldErrors.password}>
                <PasswordInput
                  id="register-password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Crea una contraseña"
                  value={values.password}
                  error={Boolean(errors.password ?? serverFieldErrors.password)}
                  onChange={(event) => updateField('password', event.target.value)}
                />
              </FormField>

              <div className="form-grid">
                <FormField id="register-telefono" label="Teléfono" optional error={errors.telefono ?? serverFieldErrors.telefono}>
                  <Input
                    id="register-telefono"
                    name="telefono"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Tu teléfono"
                    value={values.telefono}
                    error={Boolean(errors.telefono ?? serverFieldErrors.telefono)}
                    onChange={(event) => updateField('telefono', event.target.value)}
                  />
                </FormField>
                <FormField id="register-ciudad" label="Ciudad" optional error={errors.ciudad ?? serverFieldErrors.ciudad}>
                  <Input
                    id="register-ciudad"
                    name="ciudad"
                    autoComplete="address-level2"
                    placeholder="Tu ciudad"
                    value={values.ciudad}
                    error={Boolean(errors.ciudad ?? serverFieldErrors.ciudad)}
                    onChange={(event) => updateField('ciudad', event.target.value)}
                  />
                </FormField>
              </div>

              {role === 'estudiante' ? (
                <div className="form-grid">
                  <FormField id="register-nivel" label="Nivel educativo" optional error={errors.nivel_educativo ?? serverFieldErrors.nivel_educativo}>
                    <Select
                      id="register-nivel"
                      name="nivel_educativo"
                      value={values.nivel_educativo}
                      error={Boolean(errors.nivel_educativo ?? serverFieldErrors.nivel_educativo)}
                      onChange={(event) => updateField('nivel_educativo', event.target.value)}
                    >
                      <option value="">Selecciona tu nivel</option>
                      <option value="pregrado">Pregrado</option>
                    </Select>
                  </FormField>
                  <FormField id="register-institucion" label="Institución" optional error={errors.institucion ?? serverFieldErrors.institucion}>
                    <Input
                      id="register-institucion"
                      name="institucion"
                      autoComplete="organization"
                      placeholder="Tu institución"
                      value={values.institucion}
                      error={Boolean(errors.institucion ?? serverFieldErrors.institucion)}
                      onChange={(event) => updateField('institucion', event.target.value)}
                    />
                  </FormField>
                </div>
              ) : (
                <>
                  <FormField id="register-biografia" label="Biografía" optional hint="Cuéntanos brevemente qué te gustaría enseñar." error={errors.biografia ?? serverFieldErrors.biografia}>
                    <Textarea
                      id="register-biografia"
                      name="biografia"
                      rows={4}
                      placeholder="Comparte un poco sobre tu experiencia e intereses"
                      value={values.biografia}
                      error={Boolean(errors.biografia ?? serverFieldErrors.biografia)}
                      onChange={(event) => updateField('biografia', event.target.value)}
                    />
                  </FormField>
                  <FormField id="register-tarifa" label="Tarifa por hora" optional hint="Valor numérico no negativo." error={errors.tarifa_hora_base ?? serverFieldErrors.tarifa_hora_base}>
                    <Input
                      id="register-tarifa"
                      name="tarifa_hora_base"
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      placeholder="0"
                      value={values.tarifa_hora_base}
                      error={Boolean(errors.tarifa_hora_base ?? serverFieldErrors.tarifa_hora_base)}
                      onChange={(event) => updateField('tarifa_hora_base', event.target.value)}
                    />
                  </FormField>
                </>
              )}

              {formError && <FormError>{formError}</FormError>}
              <Button className="auth-submit" type="submit" loading={isLoading} loadingLabel="Creando cuenta…">
                Crear cuenta <span aria-hidden="true">→</span>
              </Button>
              <p className="auth-connection-note">
                <span className="connection-dot connection-dot-live" aria-hidden="true" />
                El registro enviará tus datos al endpoint configurado
              </p>
            </form>

            <p className="auth-switch">
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
