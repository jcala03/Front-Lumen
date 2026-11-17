import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { ApiError } from '../../services/api/client'
import { getSolicitudesAbiertas, getMisSolicitudes } from '../../services/api/solicitudes'
import { crearOferta, getMisOfertas } from '../../services/api/ofertas'
import type { Id, Solicitud } from '../../types/tutorias'
import { useSession } from '../auth/useSession'
import { formatoCOP, formatoFecha, formatoFechaHora, modalidadLabel } from '../tutorias/format'

const ESTADO_LABEL: Record<string, string> = {
  activa: 'Activa',
  asignada: 'Asignada',
  cancelada: 'Cancelada',
  cerrada: 'Cerrada',
}

export function SolicitudesPage() {
  const { session } = useSession()
  const rol = session?.user.rol

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Estado para formulario de oferta (tutor)
  const [ofertaOpen, setOfertaOpen] = useState<Id | null>(null)
  const [precio, setPrecio] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [ofertaLoading, setOfertaLoading] = useState(false)
  const [ofertaError, setOfertaError] = useState('')
  const [solicitudesOfertadas, setSolicitudesOfertadas] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!session) return
    let active = true

    const loadData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [res, misOfertas] = await Promise.all([
          rol === 'tutor' ? getSolicitudesAbiertas(session.token) : getMisSolicitudes(session.token),
          rol === 'tutor' ? getMisOfertas(session.token) : null,
        ])
        if (active) {
          setSolicitudes(res.solicitudes)
          setSolicitudesOfertadas(new Set(misOfertas?.ofertas.map((oferta) => String(oferta.solicitud_id))))
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

  const handleOfertar = async (solicitudId: Id) => {
    if (!session || ofertaLoading) return
    const precioHora = Number(precio)
    if (!Number.isFinite(precioHora) || precioHora <= 0) {
      setOfertaError('Ingresa un precio por hora mayor que cero.')
      return
    }
    setOfertaLoading(true)
    setOfertaError('')
    try {
      await crearOferta(
        { solicitud_id: solicitudId, precio_ofrecido: precioHora, mensaje: mensaje.trim() },
        session.token,
      )
      setSolicitudesOfertadas((actuales) => new Set(actuales).add(String(solicitudId)))
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
          {esTutor ? (
            <Link className="text-link" to="/ofertas">Mis ofertas <span aria-hidden="true">→</span></Link>
          ) : (
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
                  <h2 className="solicitud-materia">{s.materia_nombre ?? `Materia #${s.materia_id}`}</h2>
                  {s.tema_especifico && (
                    <p className="solicitud-tema">{s.tema_especifico}</p>
                  )}
                </div>
                <div className="solicitud-meta">
                  <span className="meta-chip">{modalidadLabel[s.modalidad] ?? s.modalidad}</span>
                  <span className="meta-chip">{s.duracion_horas}h</span>
                  {s.nivel_educativo && <span className="meta-chip">{s.nivel_educativo}</span>}
                  <span className="meta-chip">{s.tipo === 'programada' ? 'Programada' : 'Inmediata'}</span>
                </div>
              </div>

              {(s.fecha_programada || Number(s.presupuesto_hora) > 0 || s.ciudad) && (
                <div className="solicitud-datos">
                  {s.fecha_programada && <div>Programada para {formatoFechaHora.format(new Date(s.fecha_programada))}</div>}
                  {Number(s.presupuesto_hora) > 0 && <div>Presupuesto de {formatoCOP.format(Number(s.presupuesto_hora))}/h</div>}
                  {s.ciudad && <div>{s.ciudad}</div>}
                </div>
              )}

              <div className="solicitud-card-footer">
                <span className="solicitud-fecha">
                  {formatoFecha.format(new Date(s.creada_en))}
                </span>

                {/* Vista estudiante: ir al detalle */}
                {!esTutor && (
                  <div className="solicitud-actions">
                    <Link className="text-link" to={`/solicitudes/${s.id}`}>
                      Ver ofertas <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                )}

                {/* Vista tutor: formulario de oferta */}
                {esTutor && s.estado === 'activa' && (
                  <div className="solicitud-actions">
                    {solicitudesOfertadas.has(String(s.id)) ? (
                      <span className="oferta-enviada">✓ Oferta enviada</span>
                    ) : ofertaOpen === s.id ? (
                      <div className="oferta-inline-form">
                        <input
                          className="ui-input oferta-precio-input"
                          type="number"
                          min="0"
                          step="any"
                          aria-label="Precio por hora (COP)"
                          placeholder="Precio por hora (COP)"
                          value={precio}
                          onChange={(e) => setPrecio(e.target.value)}
                        />
                        <input
                          className="ui-input"
                          type="text"
                          aria-label="Mensaje opcional"
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
                            disabled={ofertaLoading}
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
                        disabled={ofertaLoading}
                        onClick={() => {
                          setOfertaOpen(s.id)
                          setPrecio('')
                          setMensaje('')
                          setOfertaError('')
                        }}
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
