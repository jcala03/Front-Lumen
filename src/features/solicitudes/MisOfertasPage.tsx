import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FormError } from '../../components/ui/FormError'
import { ApiError } from '../../services/api/client'
import { getMisOfertas } from '../../services/api/ofertas'
import type { Oferta } from '../../types/tutorias'
import { useSession } from '../auth/useSession'
import { formatoCOP, formatoFechaHora, ofertaEstadoLabel } from '../tutorias/format'

export function MisOfertasPage() {
  const { session } = useSession()
  const token = session?.user.rol === 'tutor' ? session.token : null
  const [ofertas, setOfertas] = useState<Oferta[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    let active = true
    getMisOfertas(token)
      .then((res) => {
        if (active) setOfertas(res.ofertas)
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : 'No se pudieron cargar tus ofertas.')
      })
    return () => { active = false }
  }, [token])

  return (
    <section className="page-section">
      <div className="container narrow-container">
        <h1 className="page-title">Mis <span>ofertas.</span></h1>
        {!token ? (
          <div className="form-card location-auth-prompt">
            <h2>{session ? 'Esta sección es para tutores' : 'Inicia sesión para consultar tus ofertas'}</h2>
            <Link className="button" to={session ? '/solicitudes' : '/login'}>
              {session ? 'Ver mis solicitudes' : 'Iniciar sesión'}
            </Link>
          </div>
        ) : (
          <>
            <Link className="text-link" to="/solicitudes">← Ver solicitudes abiertas</Link>
            {error && <FormError>{error}</FormError>}
            {!error && !ofertas && <p className="loading-text" role="status">Cargando ofertas…</p>}
            {ofertas?.length === 0 && <p className="location-empty">Aún no has enviado ofertas.</p>}
            {ofertas && ofertas.length > 0 && (
              <ul className="solicitud-list" aria-label="Ofertas enviadas">
                {ofertas.map((oferta) => (
                  <li className="solicitud-card oferta-card" key={oferta.id}>
                    <div className="solicitud-card-header">
                      <div>
                        <span className={`estado-badge estado-${oferta.estado}`}>
                          {ofertaEstadoLabel[oferta.estado] ?? oferta.estado}
                        </span>
                        <h2 className="solicitud-materia">
                          {oferta.tema_especifico || `Solicitud #${oferta.solicitud_id}`}
                        </h2>
                        {oferta.nivel_educativo && <p className="solicitud-tema">{oferta.nivel_educativo}</p>}
                      </div>
                      <span className="oferta-precio">{formatoCOP.format(Number(oferta.precio_hora))}/h</span>
                    </div>
                    {oferta.mensaje && <p className="solicitud-descripcion">{oferta.mensaje}</p>}
                    <div className="solicitud-card-footer">
                      <span className="solicitud-fecha">
                        Enviada el {formatoFechaHora.format(new Date(oferta.creada_en))}
                      </span>
                      {oferta.estado === 'aceptada' && <Link className="text-link" to="/tutorias">Ver mis tutorías</Link>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  )
}
