import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { ApiError } from '../../services/api/client'
import { crearSolicitud } from '../../services/api/solicitudes'
import type { Modalidad } from '../../types/tutorias'
import { useSession } from '../auth/useSession'

type FormValues = {
  materia: string
  tema_especifico: string
  descripcion: string
  nivel_educativo: string
  modalidad: Modalidad | ''
  duracion_horas: string
  direccion_texto: string
}

const initial: FormValues = {
  materia: '',
  tema_especifico: '',
  descripcion: '',
  nivel_educativo: '',
  modalidad: '',
  duracion_horas: '',
  direccion_texto: '',
}

export function NuevaSolicitudPage() {
  const { session } = useSession()
  const navigate = useNavigate()
  const [values, setValues] = useState<FormValues>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  if (!session || session.user.rol !== 'estudiante') {
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

  const getLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.')
      return
    }
    setGeoLoading(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoLoading(false)
      },
      () => {
        setGeoError('No se pudo obtener la ubicación. Escribe la dirección manualmente.')
        setGeoLoading(false)
      },
    )
  }

  const validate = (): Partial<Record<keyof FormValues, string>> => {
    const e: Partial<Record<keyof FormValues, string>> = {}
    if (!values.materia.trim()) e.materia = 'Indica la materia.'
    if (!values.modalidad) e.modalidad = 'Selecciona la modalidad.'
    if (!values.duracion_horas || Number(values.duracion_horas) <= 0)
      e.duracion_horas = 'Indica la duración en horas.'
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
          materia: values.materia.trim(),
          modalidad: values.modalidad as Modalidad,
          duracion_horas: Number(values.duracion_horas),
          ...(values.nivel_educativo ? { nivel_educativo: values.nivel_educativo } : {}),
          ...(values.tema_especifico.trim() ? { tema_especifico: values.tema_especifico.trim() } : {}),
          ...(values.descripcion.trim() ? { descripcion: values.descripcion.trim() } : {}),
          ...(values.direccion_texto.trim() ? { direccion_texto: values.direccion_texto.trim() } : {}),
          ...(coords ? { latitud: coords.lat, longitud: coords.lng } : {}),
        },
        session.token,
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
              <FormField id="ns-materia" label="Materia" required error={errors.materia}>
                <Input
                  id="ns-materia"
                  placeholder="Ej. Cálculo diferencial"
                  value={values.materia}
                  error={Boolean(errors.materia)}
                  onChange={(e) => update('materia', e.target.value)}
                />
              </FormField>
              <FormField id="ns-duracion" label="Duración (horas)" required error={errors.duracion_horas}>
                <Input
                  id="ns-duracion"
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="2"
                  value={values.duracion_horas}
                  error={Boolean(errors.duracion_horas)}
                  onChange={(e) => update('duracion_horas', e.target.value)}
                />
              </FormField>
            </div>

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
              <FormField id="ns-nivel" label="Nivel educativo" optional>
                <Select
                  id="ns-nivel"
                  value={values.nivel_educativo}
                  onChange={(e) => update('nivel_educativo', e.target.value)}
                >
                  <option value="">Selecciona el nivel</option>
                  <option value="pregrado">Pregrado</option>
                  <option value="bachillerato">Bachillerato</option>
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

            <FormField id="ns-descripcion" label="Descripción" optional hint="Cuéntale al tutor en qué necesitas ayuda.">
              <Textarea
                id="ns-descripcion"
                rows={4}
                placeholder="Explica brevemente tu situación académica y qué esperas de la tutoría."
                value={values.descripcion}
                onChange={(e) => update('descripcion', e.target.value)}
              />
            </FormField>

            <FormField id="ns-direccion" label="Dirección o lugar de encuentro" optional hint="Para modalidad presencial.">
              <Input
                id="ns-direccion"
                placeholder="Ej. Biblioteca de la universidad, Barranquilla"
                value={values.direccion_texto}
                onChange={(e) => update('direccion_texto', e.target.value)}
              />
            </FormField>

            <div className="geo-row">
              <button
                type="button"
                className="geo-button"
                disabled={geoLoading}
                onClick={getLocation}
              >
                {geoLoading ? 'Obteniendo ubicación…' : '📍 Usar mi ubicación actual'}
              </button>
              {coords && (
                <span className="geo-ok">
                  ✓ Ubicación capturada ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                </span>
              )}
              {geoError && <FormError>{geoError}</FormError>}
            </div>

            {formError && <FormError>{formError}</FormError>}

            <Button className="auth-submit" type="submit" loading={isLoading} loadingLabel="Creando solicitud…">
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
