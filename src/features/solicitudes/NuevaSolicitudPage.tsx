import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { ApiError } from '../../services/api/client'
import { getMaterias, type Materia } from '../../services/api/materias'
import { crearSolicitud } from '../../services/api/solicitudes'
import type { Modalidad, NivelEducativo, SolicitudTipo } from '../../types/tutorias'
import { useSession } from '../auth/useSession'

type FormValues = {
  materia_id: string
  tema_especifico: string
  nivel_educativo: NivelEducativo | ''
  modalidad: Modalidad | ''
  duracion_horas: string
  tipo: SolicitudTipo
  fecha_programada: string
  presupuesto_hora: string
  ciudad: string
}

const initial: FormValues = {
  materia_id: '',
  tema_especifico: '',
  nivel_educativo: '',
  modalidad: '',
  duracion_horas: '',
  tipo: 'inmediata',
  fecha_programada: '',
  presupuesto_hora: '',
  ciudad: '',
}

export function NuevaSolicitudPage() {
  const { session } = useSession()
  const navigate = useNavigate()
  const [values, setValues] = useState<FormValues>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [materias, setMaterias] = useState<Materia[] | null>(null)
  const [catalogError, setCatalogError] = useState('')
  const [catalogAttempt, setCatalogAttempt] = useState(0)
  const token = session?.user.rol === 'estudiante' ? session.token : null

  useEffect(() => {
    if (!token) return
    let active = true
    getMaterias(token)
      .then((res) => {
        if (active) setMaterias(res.materias)
      })
      .catch((error) => {
        if (active) {
          setCatalogError(error instanceof ApiError ? error.message : 'No se pudo cargar el catálogo de materias.')
        }
      })
    return () => { active = false }
  }, [token, catalogAttempt])

  if (!token) {
    return (
      <section className="page-section">
        <div className="container narrow-container">
          <p className="eyebrow">Acceso restringido</p>
          <h1 className="page-title">Solo para <span>estudiantes.</span></h1>
          <p className="page-lead">Esta página es exclusiva para cuentas de estudiante.</p>
          <Link className="button" to="/">Ir al inicio <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    )
  }

  const update = (field: keyof FormValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
    setFormError('')
  }

  const validate = (): Partial<Record<keyof FormValues, string>> => {
    const e: Partial<Record<keyof FormValues, string>> = {}
    if (!materias?.some(({ id }) => String(id) === values.materia_id)) e.materia_id = 'Selecciona una materia.'
    if (!values.nivel_educativo) e.nivel_educativo = 'Selecciona el nivel educativo.'
    if (!values.modalidad) e.modalidad = 'Selecciona la modalidad.'
    if (values.modalidad === 'presencial' && !values.ciudad.trim()) {
      e.ciudad = 'Indica la ciudad para la tutoría presencial.'
    }
    const duracion = Number(values.duracion_horas)
    if (!Number.isFinite(duracion) || duracion <= 0) {
      e.duracion_horas = 'Indica la duración en horas.'
    }
    if (values.tipo === 'programada' && !Number.isFinite(Date.parse(values.fecha_programada))) {
      e.fecha_programada = 'Indica la fecha y la hora.'
    }
    const presupuesto = Number(values.presupuesto_hora)
    if (!Number.isFinite(presupuesto) || presupuesto < 0) {
      e.presupuesto_hora = 'Ingresa un presupuesto igual o mayor que cero.'
    }
    return e
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setFormError('')
    setIsLoading(true)
    try {
      await crearSolicitud(
        {
          materia_id: values.materia_id,
          nivel_educativo: values.nivel_educativo as NivelEducativo,
          modalidad: values.modalidad as Modalidad,
          tipo: values.tipo,
          duracion_horas: Number(values.duracion_horas),
          ...(values.tema_especifico.trim() ? { tema_especifico: values.tema_especifico.trim() } : {}),
          ...(values.tipo === 'programada' ? { fecha_programada: new Date(values.fecha_programada).toISOString() } : {}),
          ...(values.presupuesto_hora ? { presupuesto_hora: Number(values.presupuesto_hora) } : {}),
          ...(values.ciudad.trim() ? { ciudad: values.ciudad.trim() } : {}),
        },
        token,
      )
      navigate('/solicitudes', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo crear la solicitud. Inténtalo de nuevo.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="page-section">
      <div className="container narrow-container">
        <p className="eyebrow">Nueva solicitud</p>
        <h1 className="page-title">¿Qué quieres <span>aprender?</span></h1>
        <p className="page-lead">
          Describe lo que necesitas y los tutores disponibles podrán enviarte ofertas.
        </p>

        <div className="form-card register-form-card">
          <form className="auth-form register-form" noValidate onSubmit={handleSubmit}>
            <div className="form-grid">
              <FormField
                id="ns-materia"
                label="Materia"
                required
                error={catalogError || errors.materia_id}
              >
                <Select
                  id="ns-materia"
                  disabled={!materias?.length}
                  value={values.materia_id}
                  error={Boolean(catalogError || errors.materia_id)}
                  onChange={(e) => update('materia_id', e.target.value)}
                >
                  <option value="">
                    {catalogError ? 'Catálogo no disponible'
                      : !materias ? 'Cargando materias…'
                      : materias.length === 0 ? 'No hay materias registradas'
                      : 'Selecciona una materia'}
                  </option>
                  {materias?.map(({ id, nombre }) => <option key={id} value={id}>{nombre}</option>)}
                </Select>
              </FormField>
              <FormField id="ns-duracion" label="Duración (horas)" required error={errors.duracion_horas}>
                <Input
                  id="ns-duracion"
                  type="number"
                  step="any"
                  placeholder="2"
                  value={values.duracion_horas}
                  error={Boolean(errors.duracion_horas)}
                  onChange={(e) => update('duracion_horas', e.target.value)}
                />
              </FormField>
            </div>
            {catalogError && (
              <Button
                type="button"
                className="button-small"
                onClick={() => {
                  setCatalogError('')
                  setCatalogAttempt((attempt) => attempt + 1)
                }}
              >
                Volver a cargar materias
              </Button>
            )}

            <div className="form-grid">
              <FormField id="ns-modalidad" label="Modalidad" required error={errors.modalidad}>
                <Select
                  id="ns-modalidad"
                  value={values.modalidad}
                  error={Boolean(errors.modalidad)}
                  onChange={(e) => update('modalidad', e.target.value)}
                >
                  <option value="">Selecciona la modalidad</option>
                  <option value="virtual">Virtual</option>
                  <option value="presencial">Presencial</option>
                </Select>
              </FormField>
              <FormField id="ns-nivel" label="Nivel educativo" required error={errors.nivel_educativo}>
                <Select
                  id="ns-nivel"
                  value={values.nivel_educativo}
                  error={Boolean(errors.nivel_educativo)}
                  onChange={(e) => update('nivel_educativo', e.target.value)}
                >
                  <option value="">Selecciona el nivel</option>
                  <option value="pregrado">Pregrado</option>
                  <option value="colegio">Colegio (bachillerato)</option>
                  <option value="posgrado">Posgrado</option>
                </Select>
              </FormField>
            </div>

            <FormField id="ns-tema" label="Tema específico" optional>
              <Input
                id="ns-tema"
                placeholder="Ej. Derivadas parciales, integrales dobles…"
                value={values.tema_especifico}
                onChange={(e) => update('tema_especifico', e.target.value)}
              />
            </FormField>

            <div className="form-grid">
              <FormField id="ns-tipo" label="¿Cuándo necesitas la tutoría?" required>
                <Select id="ns-tipo" value={values.tipo} onChange={(e) => update('tipo', e.target.value)}>
                  <option value="inmediata">Lo antes posible</option>
                  <option value="programada">Fecha programada</option>
                </Select>
              </FormField>
              {values.tipo === 'programada' && (
                <FormField id="ns-fecha" label="Fecha y hora" required error={errors.fecha_programada}>
                  <Input
                    id="ns-fecha"
                    type="datetime-local"
                    value={values.fecha_programada}
                    error={Boolean(errors.fecha_programada)}
                    onChange={(e) => update('fecha_programada', e.target.value)}
                  />
                </FormField>
              )}
            </div>

            <div className="form-grid">
              <FormField id="ns-presupuesto" label="Presupuesto por hora (COP)" optional error={errors.presupuesto_hora}>
                <Input
                  id="ns-presupuesto"
                  type="number"
                  min="0"
                  step="any"
                  value={values.presupuesto_hora}
                  error={Boolean(errors.presupuesto_hora)}
                  onChange={(e) => update('presupuesto_hora', e.target.value)}
                />
              </FormField>
              <FormField
                id="ns-ciudad"
                label="Ciudad"
                required={values.modalidad === 'presencial'}
                optional={values.modalidad !== 'presencial'}
                error={errors.ciudad}
              >
                <Input
                  id="ns-ciudad"
                  autoComplete="address-level2"
                  required={values.modalidad === 'presencial'}
                  error={Boolean(errors.ciudad)}
                  value={values.ciudad}
                  onChange={(e) => update('ciudad', e.target.value)}
                />
              </FormField>
            </div>

            {formError && <FormError>{formError}</FormError>}

            <Button className="auth-submit" type="submit" disabled={!materias?.length} loading={isLoading} loadingLabel="Creando solicitud…">
              Crear solicitud <span aria-hidden="true">→</span>
            </Button>
          </form>

          <p className="auth-switch">
            ¿Cambias de idea? <Link to="/solicitudes">Ver mis solicitudes</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
