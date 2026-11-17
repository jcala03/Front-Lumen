import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { ApiError } from '../../services/api/client'
import { getSolicitudesAbiertas, getMisSolicitudes } from '../../services/api/solicitudes'
import { crearOferta } from '../../services/api/ofertas'
import type { Solicitud } from '../../types/tutorias'
import { useSession } from '../auth/useSession'

const ESTADO_LABEL: Record<string, string> = {
  abierta: 'Abierta',
  aceptada: 'Aceptada',
  cancelada: 'Cancelada',
  cerrada: 'Cerrada',
}

const MODALIDAD_LABEL: Record<string, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
}

export function SolicitudesPage() {
  const { session } = useSession()
  const rol = session?.user.rol

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Estado para formulario de oferta (tutor)
  const [ofertaOpen, setOfertaOpen] = useState<number | null>(null)
  const [precio, setPrecio] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [ofertaLoading, setOfertaLoading] = useState(false)
  const [ofertaError, setOfertaError] = useState('')
  const [ofertaOk, setOfertaOk] = useState<number | null>(null)

  useEffect(() => {
    if (!session) return
    let active = true

    const loadData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const fetcher = rol === 'tutor'
          ? getSolicitudesAbiertas(session.token)
          : getMisSolicitudes(session.token)
        const res = await fetcher
        if (active) {
          setSolicitudes(res.solicitudes ?? [])
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las solicitudes.')
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
  }, [session, rol])

  const handleOfertar = async (solicitudId: number) => {
    if (!session || !precio.trim()) return
    setOfertaLoading(true)
    setOfertaError('')
    try {
      await crearOferta(
        { solicitud_id: solicitudId, precio_ofrecido: Number(precio), mensaje },
        session.token,
      )
      setOfertaOk(solicitudId)
      setOfertaOpen(null)
      setPrecio('')
      setMensaje('')
    } catch (err) {
      setOfertaError(err instanceof ApiError ? err.message : 'No se pudo enviar la oferta.')
    } finally {
      setOfertaLoading(false)
    }
  }

  if (!session) {
    return (
      <section className="page-section">
        <div className="container narrow-container">
          <p className="eyebrow">Gestión de tutorías</p>
          <h1 className="page-title">Solicitudes de <span>tutoría.</span></h1>
          <div className="form-card location-auth-prompt">
            <h2>Inicia sesión para continuar</h2>
            <p>Necesitas una cuenta de Lumen para ver o crear solicitudes de tutoría.</p>
            <Link className="button" to="/login">Iniciar sesión <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    )
  }

  const esTutor = rol === 'tutor'

  return (
    <section className="page-section">
      <div className="container narrow-container">
        <p className="eyebrow">{esTutor ? 'Oportunidades disponibles' : 'Mis solicitudes'}</p>
        <div className="page-title-row">
          <h1 className="page-title">
            {esTutor ? (
              <>Solicitudes <span>abiertas.</span></>
            ) : (
              <>Mis solicitudes de <span>tutoría.</span></>
            )}
          </h1>
          {!esTutor && (
            <Link className="button" to="/solicitudes/nueva">
              Nueva solicitud <span aria-hidden="true">+</span>
            </Link>
          )}
        </div>
        <p className="page-lead">
          {esTutor
            ? 'Revisa las solicitudes de los estudiantes y envía tus ofertas.'
            : 'Gestiona tus solicitudes y revisa las ofertas que recibes de tutores.'}
        </p>

        {isLoading && <p className="loading-text">Cargando solicitudes…</p>}
        {error && <FormError>{error}</FormError>}

        {!isLoading && solicitudes.length === 0 && !error && (
          <div className="coming-soon-card">
            <span className="coming-soon-symbol" aria-hidden="true">📋</span>
            <h2>{esTutor ? 'No hay solicitudes abiertas.' : 'Todavía no tienes solicitudes.'}</h2>
            <p>
              {esTutor
                ? 'En cuanto un estudiante abra una solicitud, aparecerá aquí.'
                : 'Crea tu primera solicitud y recibe ofertas de tutores.'}
            </p>
            {!esTutor && (
              <Link className="button" to="/solicitudes/nueva">
                Crear solicitud <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        )}

        <ul className="solicitud-list" aria-label="Lista de solicitudes">
          {solicitudes.map((s) => (
            <li className="solicitud-card" key={s.id}>
              <div className="solicitud-card-header">
                <div>
                  <span className={`estado-badge estado-${s.estado}`}>
                    {ESTADO_LABEL[s.estado] ?? s.estado}
                  </span>
                  <h2 className="solicitud-materia">{s.materia}</h2>
                  {s.tema_especifico && (
                    <p className="solicitud-tema">{s.tema_especifico}</p>
                  )}
                </div>
                <div className="solicitud-meta">
                  <span className="meta-chip">{MODALIDAD_LABEL[s.modalidad] ?? s.modalidad}</span>
                  <span className="meta-chip">{s.duracion_horas}h</span>
                  {s.nivel_educativo && <span className="meta-chip">{s.nivel_educativo}</span>}
                </div>
              </div>

              {s.descripcion && (
                <p className="solicitud-descripcion">{s.descripcion}</p>
              )}

              {/* Info del estudiante (vista tutor) */}
              {esTutor && (s.nombre || s.ciudad) && (
                <div className="solicitud-student-info">
                  <span>
                    {s.nombre} {s.apellido}
                    {s.institucion && ` · ${s.institucion}`}
                    {s.ciudad && ` · ${s.ciudad}`}
                  </span>
                </div>
              )}

              <div className="solicitud-card-footer">
                <span className="solicitud-fecha">
                  {new Date(s.fecha_creacion).toLocaleDateString('es-CO', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>

                {/* Vista estudiante: ir al detalle */}
                {!esTutor && (
                  <div className="solicitud-actions">
                    {typeof s.total_ofertas === 'number' && (
                      <span className="ofertas-count">
                        {s.total_ofertas} oferta{s.total_ofertas !== 1 ? 's' : ''}
                      </span>
                    )}
                    <Link className="text-link" to={`/solicitudes/${s.id}`}>
                      Ver ofertas <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                )}

                {/* Vista tutor: formulario de oferta */}
                {esTutor && s.estado === 'abierta' && (
                  <div className="solicitud-actions">
                    {ofertaOk === s.id ? (
                      <span className="oferta-enviada">✓ Oferta enviada</span>
                    ) : ofertaOpen === s.id ? (
                      <div className="oferta-inline-form">
                        <input
                          className="ui-input oferta-precio-input"
                          type="number"
                          min="0"
                          step="any"
                          placeholder="Precio (COP)"
                          value={precio}
                          onChange={(e) => setPrecio(e.target.value)}
                        />
                        <input
                          className="ui-input"
                          type="text"
                          placeholder="Mensaje opcional"
                          value={mensaje}
                          onChange={(e) => setMensaje(e.target.value)}
                        />
                        {ofertaError && <FormError>{ofertaError}</FormError>}
                        <div className="oferta-inline-actions">
                          <Button
                            loading={ofertaLoading}
                            loadingLabel="Enviando…"
                            onClick={() => handleOfertar(s.id)}
                          >
                            Enviar oferta
                          </Button>
                          <button
                            className="nav-link"
                            type="button"
                            onClick={() => { setOfertaOpen(null); setOfertaError('') }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="button button-small"
                        type="button"
                        onClick={() => setOfertaOpen(s.id)}
                      >
                        Hacer oferta <span aria-hidden="true">↗</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
