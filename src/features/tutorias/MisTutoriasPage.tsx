import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { Input } from '../../components/ui/Input'
import { FormField } from '../../components/ui/FormField'
import { Select } from '../../components/ui/Select'
import { ApiError } from '../../services/api/client'
import { getMisTutorias, actualizarEnlaceSala, actualizarEstadoTutoria } from '../../services/api/tutorias'
import type { Tutoria, TutoriaEstado } from '../../types/tutorias'
import { useSession } from '../auth/useSession'

const ESTADO_LABEL: Record<TutoriaEstado, string> = {
  programada: 'Programada',
  en_curso: 'En curso',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
}

const ESTADOS_POSIBLES: TutoriaEstado[] = ['programada', 'en_curso', 'finalizada', 'cancelada']

export function MisTutoriasPage() {
  const { session } = useSession()
  const esTutor = session?.user.rol === 'tutor'

  const [tutorias, setTutorias] = useState<Tutoria[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Formulario enlace sala (tutor)
  const [enlaceOpen, setEnlaceOpen] = useState<number | null>(null)
  const [enlaceValue, setEnlaceValue] = useState('')
  const [enlaceLoading, setEnlaceLoading] = useState(false)
  const [enlaceError, setEnlaceError] = useState('')

  // Formulario cambio de estado
  const [estadoOpen, setEstadoOpen] = useState<number | null>(null)
  const [estadoValue, setEstadoValue] = useState<TutoriaEstado>('programada')
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
          setTutorias(res.tutorias ?? [])
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

  const handleEnlace = async (tutoriaId: number) => {
    if (!session || !enlaceValue.trim()) return
    setEnlaceLoading(true)
    setEnlaceError('')
    try {
      const res = await actualizarEnlaceSala(tutoriaId, enlaceValue.trim(), session.token)
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

  const handleEstado = async (tutoriaId: number) => {
    if (!session) return
    setEstadoLoading(true)
    setEstadoError('')
    try {
      await actualizarEstadoTutoria(tutoriaId, estadoValue, session.token)
      setTutorias((prev) =>
        prev.map((t) => (t.id === tutoriaId ? { ...t, estado: estadoValue } : t)),
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
          {tutorias.map((t) => (
            <li className="solicitud-card tutoria-card" key={t.id}>
              <div className="solicitud-card-header">
                <div>
                  <span className={`estado-badge estado-${t.estado}`}>
                    {ESTADO_LABEL[t.estado] ?? t.estado}
                  </span>
                  <h2 className="solicitud-materia">{t.materia ?? 'Tutoría'}</h2>
                  <p className="solicitud-tema">
                    {esTutor
                      ? `Estudiante: ${t.nombre_estudiante ?? ''} ${t.apellido_estudiante ?? ''}`
                      : `Tutor: ${t.nombre_tutor ?? ''} ${t.apellido_tutor ?? ''}`}
                  </p>
                </div>
                <div className="solicitud-meta">
                  {t.modalidad && <span className="meta-chip">{t.modalidad}</span>}
                  {t.duracion_horas && <span className="meta-chip">{t.duracion_horas}h</span>}
                </div>
              </div>

              {/* Enlace de sala */}
              {t.enlace_sala ? (
                <div className="tutoria-enlace-row">
                  <span className="tutoria-enlace-label">Sala:</span>
                  <a
                    href={t.enlace_sala}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                  >
                    {t.enlace_sala}
                  </a>
                  {esTutor && (
                    <button
                      className="nav-link"
                      type="button"
                      style={{ marginLeft: '8px', fontSize: '11px' }}
                      onClick={() => { setEnlaceOpen(t.id); setEnlaceValue(t.enlace_sala ?? '') }}
                    >
                      Editar
                    </button>
                  )}
                </div>
              ) : esTutor && (
                <div className="tutoria-enlace-row">
                  <span className="tutoria-no-enlace">Sin enlace de sala</span>
                  <button
                    className="nav-link"
                    type="button"
                    onClick={() => setEnlaceOpen(t.id)}
                  >
                    + Agregar enlace
                  </button>
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
                    <button className="nav-link" type="button" onClick={() => setEnlaceOpen(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="solicitud-card-footer">
                <span className="solicitud-fecha">
                  {new Date(t.fecha_confirmacion).toLocaleDateString('es-CO', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
                <div className="solicitud-actions">
                  {estadoOpen === t.id ? (
                    <div className="tutoria-estado-form">
                      <Select
                        id={`estado-${t.id}`}
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
                        <button className="nav-link" type="button" onClick={() => setEstadoOpen(null)}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    t.estado !== 'finalizada' && t.estado !== 'cancelada' && (
                      <button
                        className="button button-small"
                        type="button"
                        onClick={() => { setEstadoOpen(t.id); setEstadoValue(t.estado) }}
                      >
                        Cambiar estado
                      </button>
                    )
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
