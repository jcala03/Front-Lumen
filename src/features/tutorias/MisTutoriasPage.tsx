import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { Input } from '../../components/ui/Input'
import { FormField } from '../../components/ui/FormField'
import { Select } from '../../components/ui/Select'
import { ApiError } from '../../services/api/client'
import { getMisTutorias, actualizarEnlaceSala, actualizarEstadoTutoria } from '../../services/api/tutorias'
import type { Id, Tutoria, TutoriaEstado } from '../../types/tutorias'
import { useSession } from '../auth/useSession'
import { formatoCOP, formatoFechaHora, modalidadLabel } from './format'

const ESTADO_LABEL: Record<TutoriaEstado, string> = {
  confirmada: 'Confirmada',
  en_curso: 'En curso',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
}

const ESTADOS_POSIBLES = Object.keys(ESTADO_LABEL) as TutoriaEstado[]

function enlaceWeb(enlace: string | null): string | null {
  if (!enlace) return null
  try {
    const url = new URL(enlace)
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href
  } catch {
    return null
  }
  return null
}

export function MisTutoriasPage() {
  const { session } = useSession()
  const esTutor = session?.user.rol === 'tutor'

  const [tutorias, setTutorias] = useState<Tutoria[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Formulario enlace sala (tutor)
  const [enlaceOpen, setEnlaceOpen] = useState<Id | null>(null)
  const [enlaceValue, setEnlaceValue] = useState('')
  const [enlaceLoading, setEnlaceLoading] = useState(false)
  const [enlaceError, setEnlaceError] = useState('')

  // Formulario cambio de estado
  const [estadoOpen, setEstadoOpen] = useState<Id | null>(null)
  const [estadoValue, setEstadoValue] = useState<TutoriaEstado>('confirmada')
  const [estadoLoading, setEstadoLoading] = useState(false)
  const [estadoError, setEstadoError] = useState('')

  useEffect(() => {
    if (!session) return
    let active = true

    const loadData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const res = await getMisTutorias(session.token)
        if (active) {
          setTutorias(res.tutorias)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las tutorías.')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadData()
    return () => {
      active = false
    }
  }, [session])

  const handleEnlace = async (tutoriaId: Id) => {
    if (!session || !esTutor || enlaceLoading) return
    const enlace = enlaceWeb(enlaceValue.trim())
    if (!enlace) {
      setEnlaceError('Ingresa un enlace válido que empiece con https:// o http://.')
      return
    }
    setEnlaceLoading(true)
    setEnlaceError('')
    try {
      const res = await actualizarEnlaceSala(tutoriaId, enlace, session.token)
      setTutorias((prev) =>
        prev.map((t) => (t.id === tutoriaId ? { ...t, enlace_sala: res.tutoria.enlace_sala } : t)),
      )
      setEnlaceOpen(null)
      setEnlaceValue('')
    } catch (err) {
      setEnlaceError(err instanceof ApiError ? err.message : 'No se pudo guardar el enlace.')
    } finally {
      setEnlaceLoading(false)
    }
  }

  const handleEstado = async (tutoriaId: Id) => {
    if (!session || estadoLoading) return
    setEstadoLoading(true)
    setEstadoError('')
    try {
      const { tutoria } = await actualizarEstadoTutoria(tutoriaId, estadoValue, session.token)
      setTutorias((prev) =>
        prev.map((t) => (t.id === tutoriaId ? { ...t, estado: tutoria.estado } : t)),
      )
      setEstadoOpen(null)
    } catch (err) {
      setEstadoError(err instanceof ApiError ? err.message : 'No se pudo actualizar el estado.')
    } finally {
      setEstadoLoading(false)
    }
  }

  if (!session) {
    return (
      <section className="page-section">
        <div className="container narrow-container">
          <div className="form-card location-auth-prompt">
            <h2>Inicia sesión para ver tus tutorías</h2>
            <Link className="button" to="/login">Iniciar sesión <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="container narrow-container">
        <p className="eyebrow">Sesiones confirmadas</p>
        <h1 className="page-title">Mis <span>tutorías.</span></h1>
        <p className="page-lead">
          {esTutor
            ? 'Revisa tus sesiones confirmadas, agrega el enlace de sala y actualiza el estado.'
            : 'Consulta tus sesiones de tutoría confirmadas y sigue su progreso.'}
        </p>

        {isLoading && <p className="loading-text">Cargando tutorías…</p>}
        {error && <FormError>{error}</FormError>}

        {!isLoading && tutorias.length === 0 && !error && (
          <div className="coming-soon-card">
            <span className="coming-soon-symbol" aria-hidden="true">📅</span>
            <h2>No tienes tutorías confirmadas aún.</h2>
            <p>
              {esTutor
                ? 'Cuando acepten una de tus ofertas, la sesión aparecerá aquí.'
                : 'Acepta una oferta de tutor y la sesión aparecerá aquí.'}
            </p>
            <Link className="text-link" to="/solicitudes">
              {esTutor ? 'Ver solicitudes disponibles' : 'Ver mis solicitudes'} <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}

        <ul className="solicitud-list" aria-label="Lista de tutorías">
          {tutorias.map((t) => {
            const sala = enlaceWeb(t.enlace_sala)
            return (
              <li className="solicitud-card tutoria-card" key={t.id}>
                <div className="solicitud-card-header">
                  <div>
                    <span className={`estado-badge estado-${t.estado}`}>
                      {ESTADO_LABEL[t.estado] ?? t.estado}
                    </span>
                    <h2 className="solicitud-materia">{t.tema_especifico || `Tutoría #${t.id}`}</h2>
                    <p className="solicitud-tema">
                      {esTutor
                        ? `Estudiante #${t.estudiante_id}`
                        : `Tutor #${t.tutor_id}`}
                    </p>
                  </div>
                  <div className="solicitud-meta">
                    {t.modalidad && <span className="meta-chip">{modalidadLabel[t.modalidad] ?? t.modalidad}</span>}
                    {t.duracion_horas && <span className="meta-chip">{t.duracion_horas}h</span>}
                  </div>
                </div>

                <div className="solicitud-datos">
                  <div>Precio de {formatoCOP.format(Number(t.precio_hora))}/h</div>
                  {t.precio_total != null && <div>Total de {formatoCOP.format(Number(t.precio_total))}</div>}
                </div>

                {(sala || (esTutor && t.modalidad === 'virtual')) && (
                  <div className="tutoria-enlace-row">
                    {sala ? (
                      <a href={sala} target="_blank" rel="noreferrer" className="text-link">Abrir sala virtual</a>
                    ) : (
                      <span className="tutoria-no-enlace">Sin enlace de sala</span>
                    )}
                    {esTutor && (
                      <button
                        className="nav-link"
                        type="button"
                        disabled={enlaceLoading}
                        onClick={() => {
                          setEnlaceOpen(t.id)
                          setEnlaceValue(t.enlace_sala ?? '')
                          setEnlaceError('')
                        }}
                      >
                        {sala ? 'Editar enlace' : 'Agregar enlace'}
                      </button>
                    )}
                  </div>
                )}

                {/* Formulario enlace */}
                {esTutor && enlaceOpen === t.id && (
                  <div className="tutoria-inline-form">
                    <FormField id={`enlace-${t.id}`} label="Enlace de sala (Meet, Zoom, etc.)" required>
                      <Input
                        id={`enlace-${t.id}`}
                        type="url"
                        placeholder="https://meet.google.com/..."
                        value={enlaceValue}
                        onChange={(e) => setEnlaceValue(e.target.value)}
                      />
                    </FormField>
                    {enlaceError && <FormError>{enlaceError}</FormError>}
                    <div className="oferta-inline-actions">
                      <Button
                        loading={enlaceLoading}
                        loadingLabel="Guardando…"
                        onClick={() => handleEnlace(t.id)}
                      >
                        Guardar enlace
                      </Button>
                      <button className="nav-link" type="button" disabled={enlaceLoading} onClick={() => setEnlaceOpen(null)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="solicitud-card-footer">
                  <span className="solicitud-fecha">
                    {t.fecha_inicio ? 'Inicio el ' : 'Creada el '}
                    {formatoFechaHora.format(new Date(t.fecha_inicio ?? t.creada_en))}
                  </span>
                  <div className="solicitud-actions">
                    {estadoOpen === t.id ? (
                      <div className="tutoria-estado-form">
                        <Select
                          id={`estado-${t.id}`}
                          aria-label="Estado de la tutoría"
                          value={estadoValue}
                          onChange={(e) => setEstadoValue(e.target.value as TutoriaEstado)}
                        >
                          {ESTADOS_POSIBLES.map((es) => (
                            <option key={es} value={es}>{ESTADO_LABEL[es]}</option>
                          ))}
                        </Select>
                        {estadoError && <FormError>{estadoError}</FormError>}
                        <div className="oferta-inline-actions">
                          <Button
                            className="button-small"
                            loading={estadoLoading}
                            loadingLabel="Guardando…"
                            onClick={() => handleEstado(t.id)}
                          >
                            Guardar
                          </Button>
                          <button className="nav-link" type="button" disabled={estadoLoading} onClick={() => setEstadoOpen(null)}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      t.estado !== 'finalizada' && t.estado !== 'cancelada' && (
                        <button
                          className="button button-small"
                          type="button"
                          disabled={estadoLoading}
                          onClick={() => {
                            setEstadoOpen(t.id)
                            setEstadoValue(t.estado)
                            setEstadoError('')
                          }}
                        >
                          Cambiar estado
                        </button>
                      )
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
