import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { ApiError } from '../../services/api/client'
import { getOfertasDeSolicitud } from '../../services/api/solicitudes'
import { aceptarOferta } from '../../services/api/ofertas'
import type { Id, Oferta } from '../../types/tutorias'
import { useSession } from '../auth/useSession'
import { formatoCOP, formatoFechaHora, ofertaEstadoLabel } from '../tutorias/format'

export function DetalleSolicitudPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { session } = useSession()

  if (!session || session.user.rol !== 'estudiante' || !/^[1-9]\d*$/.test(id)) {
    let title = 'Solo el estudiante puede ver sus ofertas'
    if (!session) title = 'Inicia sesión para ver las ofertas'
    else if (session.user.rol === 'estudiante') title = 'Solicitud no válida'
    return (
      <section className="page-section">
        <div className="container narrow-container">
          <div className="form-card location-auth-prompt">
            <h1>{title}</h1>
            <Link className="button" to={session ? '/solicitudes' : '/login'}>
              {session ? 'Ver solicitudes' : 'Iniciar sesión'} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return <OfertasRecibidas key={id} solicitudId={id} token={session.token} />
}

function OfertasRecibidas({ solicitudId, token }: { solicitudId: string; token: string }) {
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [acceptingId, setAcceptingId] = useState<Id | null>(null)
  const [acceptError, setAcceptError] = useState('')
  const [aceptacion, setAceptacion] = useState('')
  const tieneOfertaAceptada = ofertas.some((o) => o.estado === 'aceptada')

  useEffect(() => {
    let active = true

    const loadData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const res = await getOfertasDeSolicitud(solicitudId, token)
        if (active) {
          setOfertas(res.ofertas)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las ofertas.')
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
  }, [token, solicitudId])

  const handleAccept = async (ofertaId: Id) => {
    if (acceptingId !== null || tieneOfertaAceptada) return
    setAcceptingId(ofertaId)
    setAcceptError('')
    try {
      const { mensaje } = await aceptarOferta(ofertaId, token)
      setAceptacion(mensaje)
      setOfertas((prev) =>
        prev.map((o) => (o.id === ofertaId ? { ...o, estado: 'aceptada' } : o)),
      )
    } catch (err) {
      setAcceptError(err instanceof ApiError ? err.message : 'No se pudo aceptar la oferta.')
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <section className="page-section">
      <div className="container narrow-container">
        <p className="eyebrow">Detalle de solicitud</p>
        <h1 className="page-title">Ofertas <span>recibidas.</span></h1>
        <p className="page-lead">
          Revisa las propuestas de los tutores y acepta la que mejor se adapte a ti.
        </p>

        <Link className="text-link" to="/solicitudes">← Volver a mis solicitudes</Link>

        {isLoading && <p className="loading-text">Cargando ofertas…</p>}
        {error && <FormError>{error}</FormError>}

        {tieneOfertaAceptada && (
          <div className="accept-success-notice" role="status">
            {aceptacion || 'Ya hay una oferta aceptada.'} <Link to="/tutorias">Ver mis tutorías</Link>
          </div>
        )}

        {acceptError && <FormError>{acceptError}</FormError>}

        {!isLoading && ofertas.length === 0 && !error && (
          <div className="coming-soon-card" style={{ marginTop: '24px' }}>
            <span className="coming-soon-symbol" aria-hidden="true">📬</span>
            <h2>Todavía no hay ofertas.</h2>
            <p>Los tutores verán tu solicitud y podrán enviarte ofertas pronto.</p>
          </div>
        )}

        <ul className="solicitud-list" style={{ marginTop: '24px' }}>
          {ofertas.map((o) => (
            <li className="solicitud-card oferta-card" key={o.id}>
              <div className="solicitud-card-header">
                <div>
                  <span className={`estado-badge estado-${o.estado}`}>
                    {ofertaEstadoLabel[o.estado] ?? o.estado}
                  </span>
                  <h2 className="solicitud-materia">
                    {[o.nombre_tutor, o.apellido_tutor].filter(Boolean).join(' ') || `Tutor #${o.tutor_id}`}
                  </h2>
                </div>
                <div>
                  <span className="oferta-precio">
                    {formatoCOP.format(Number(o.precio_hora))}/h
                  </span>
                  {o.tarifa_tutor != null && (
                    <span className="oferta-tarifa-base">
                      Tarifa base de {formatoCOP.format(Number(o.tarifa_tutor))}/h
                    </span>
                  )}
                </div>
              </div>

              {o.mensaje && <p className="solicitud-descripcion">{o.mensaje}</p>}

              <div className="solicitud-card-footer">
                <span className="solicitud-fecha">
                  {formatoFechaHora.format(new Date(o.creada_en))}
                  {o.estado === 'pendiente' && o.expira_en && (
                    <> · Vence el {formatoFechaHora.format(new Date(o.expira_en))}</>
                  )}
                </span>
                {o.estado === 'pendiente' && !tieneOfertaAceptada && (
                  <Button
                    className="button-small"
                    disabled={acceptingId !== null}
                    loading={acceptingId === o.id}
                    loadingLabel="Aceptando…"
                    onClick={() => handleAccept(o.id)}
                  >
                    Aceptar oferta <span aria-hidden="true">✓</span>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
