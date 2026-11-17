import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { ApiError } from '../../services/api/client'
import { getOfertasDeSolicitud as getOfertasEstudiante } from '../../services/api/solicitudes'
import { aceptarOferta } from '../../services/api/ofertas'
import type { Oferta } from '../../types/tutorias'
import { useSession } from '../auth/useSession'

export function DetalleSolicitudPage() {
  const { id } = useParams<{ id: string }>()
  const { session } = useSession()
  const solicitudId = Number(id)

  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptingId, setAcceptingId] = useState<number | null>(null)
  const [acceptError, setAcceptError] = useState('')
  const [acceptedId, setAcceptedId] = useState<number | null>(null)

  useEffect(() => {
    if (!session || !solicitudId) return
    let active = true

    const loadData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const res = await getOfertasEstudiante(solicitudId, session.token)
        if (active) {
          setOfertas(res.ofertas ?? [])
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
  }, [session, solicitudId])

  const handleAccept = async (ofertaId: number) => {
    if (!session) return
    setAcceptingId(ofertaId)
    setAcceptError('')
    try {
      await aceptarOferta(ofertaId, session.token)
      setAcceptedId(ofertaId)
      // Actualizar estado local
      setOfertas((prev) =>
        prev.map((o) => ({
          ...o,
          estado: o.id === ofertaId ? 'aceptada' : 'rechazada',
        })),
      )
    } catch (err) {
      setAcceptError(err instanceof ApiError ? err.message : 'No se pudo aceptar la oferta.')
    } finally {
      setAcceptingId(null)
    }
  }

  if (!session) {
    return (
      <section className="page-section">
        <div className="container narrow-container">
          <div className="form-card location-auth-prompt">
            <h2>Inicia sesión para ver las ofertas</h2>
            <Link className="button" to="/login">Iniciar sesión <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    )
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

        {acceptedId && (
          <div className="accept-success-notice">
            <span aria-hidden="true">✓</span> Oferta aceptada. Encontrarás la tutoría en <Link to="/tutorias">Mis tutorías</Link>.
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
                    {o.estado === 'pendiente' ? 'Pendiente' : o.estado === 'aceptada' ? 'Aceptada' : 'Rechazada'}
                  </span>
                  <h2 className="solicitud-materia">
                    {o.nombre} {o.apellido}
                  </h2>
                  {o.biografia && <p className="solicitud-tema">{o.biografia}</p>}
                </div>
                <div>
                  <span className="oferta-precio">
                    ${Number(o.precio_ofrecido).toLocaleString('es-CO')} COP
                  </span>
                  {o.tarifa_hora_base && (
                    <span className="oferta-tarifa-base">
                      Tarifa base: ${Number(o.tarifa_hora_base).toLocaleString('es-CO')}/h
                    </span>
                  )}
                </div>
              </div>

              {o.mensaje && <p className="solicitud-descripcion">{o.mensaje}</p>}

              <div className="solicitud-card-footer">
                <span className="solicitud-fecha">
                  {new Date(o.fecha_oferta).toLocaleDateString('es-CO', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
                {o.estado === 'pendiente' && (
                  <Button
                    className="button-small"
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
