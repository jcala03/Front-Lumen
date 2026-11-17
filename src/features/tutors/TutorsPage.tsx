import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { ApiError } from '../../services/api/client'
import { searchNearby, type NearbySearchResponse } from '../../services/api/maps'
import { useSession } from '../auth/useSession'

export function TutorsPage() {
  const { session } = useSession()
  const [radio, setRadio] = useState('10')
  const [results, setResults] = useState<NearbySearchResponse['resultados'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState('')

  const buscarTutores = (lat: number, lng: number) => {
    if (!session) return
    setError('')
    setResults(null)
    setIsLoading(true)
    searchNearby({ lat, lng, radio: Number(radio) || 10, rol: 'tutor' }, session.token)
      .then((res) => setResults(res.resultados ?? []))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'No se pudo realizar la búsqueda.'),
      )
      .finally(() => setIsLoading(false))
  }

  const handleGeoSearch = () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.')
      return
    }
    setGeoLoading(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false)
        buscarTutores(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        setGeoLoading(false)
        setGeoError('No se pudo obtener tu ubicación. Verifica los permisos del navegador.')
      },
    )
  }

  return (
    <section className="page-section">
      <div className="container narrow-container">
        <p className="eyebrow">Comunidad Lumen</p>
        <h1 className="page-title">Tutores <span>cerca de ti.</span></h1>
        <p className="page-lead">
          Encuentra tutores disponibles en tu zona. Usamos tu ubicación para mostrarte quién está más cerca.
        </p>

        {!session ? (
          <div className="form-card location-auth-prompt">
            <h2>Inicia sesión para buscar tutores</h2>
            <p>Necesitas una sesión activa de Lumen para acceder al directorio de tutores.</p>
            <Link className="button" to="/login">Iniciar sesión <span aria-hidden="true">→</span></Link>
          </div>
        ) : (
          <>
            <div className="form-card location-search-form">
              <FormField id="radio-busqueda" label="Radio de búsqueda (km)" hint="Distancia máxima desde tu ubicación actual.">
                <Input
                  id="radio-busqueda"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={radio}
                  onChange={(e) => setRadio(e.target.value)}
                />
              </FormField>
              {geoError && <FormError>{geoError}</FormError>}
              <Button
                type="button"
                loading={geoLoading || isLoading}
                loadingLabel={geoLoading ? 'Obteniendo ubicación…' : 'Buscando…'}
                onClick={handleGeoSearch}
              >
                📍 Buscar tutores cerca de mí <span aria-hidden="true">→</span>
              </Button>
            </div>

            {error && <FormError>{error}</FormError>}

            <section
              className="location-results"
              aria-labelledby="tutores-title"
              aria-live="polite"
              aria-busy={isLoading}
            >
              {results !== null && (
                <>
                  <h2 id="tutores-title">Resultados</h2>
                  {results.length === 0 ? (
                    <p className="location-empty">
                      No se encontraron tutores en un radio de {radio} km. Intenta ampliar el radio.
                    </p>
                  ) : (
                    <ul className="tutor-list">
                      {results.map((tutor) => (
                        <li className="tutor-card" key={tutor.id}>
                          <div className="tutor-card-header">
                            <div className="tutor-avatar" aria-hidden="true">
                              {tutor.nombre.charAt(0)}{tutor.apellido.charAt(0)}
                            </div>
                            <div>
                              <h3 className="tutor-name">
                                {tutor.nombre} {tutor.apellido}
                              </h3>
                              {tutor.ciudad && (
                                <p className="tutor-city">{tutor.ciudad}</p>
                              )}
                            </div>
                            <div className="tutor-distance">
                              <span>{tutor.distancia_km.toFixed(1)} km</span>
                            </div>
                          </div>

                          {tutor.biografia && (
                            <p className="tutor-bio">{tutor.biografia}</p>
                          )}

                          <div className="tutor-card-footer">
                            {tutor.tarifa_hora_base != null && (
                              <span className="tutor-rate">
                                ${Number(tutor.tarifa_hora_base).toLocaleString('es-CO')}<small>/hora</small>
                              </span>
                            )}
                            {tutor.calificacion_promedio != null && (
                              <span className="tutor-rating">
                                ★ {Number(tutor.calificacion_promedio).toFixed(1)}
                              </span>
                            )}
                            <Link className="text-link" to="/solicitudes/nueva">
                              Crear solicitud <span aria-hidden="true">→</span>
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </div>
    </section>
  )
}
