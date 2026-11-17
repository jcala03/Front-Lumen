import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { ApiError } from '../../services/api/client'
import { searchNearby, type NearbySearchResponse } from '../../services/api/maps'
import { useSession } from '../auth/useSession'

type SearchRol = 'tutor' | 'estudiante'

export function LocationsPage() {
  const { session } = useSession()
  const [radio, setRadio] = useState('10')
  const [rol, setRol] = useState<SearchRol>('tutor')
  const [results, setResults] = useState<NearbySearchResponse['resultados'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState('')

  const buscarNearby = (lat: number, lng: number) => {
    if (!session) return
    setError('')
    setResults(null)
    setIsLoading(true)
    searchNearby({ lat, lng, radio: Number(radio) || 10, rol }, session.token)
      .then((res) => setResults(res.resultados ?? []))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'No fue posible conectar con el servicio.'),
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
        buscarNearby(pos.coords.latitude, pos.coords.longitude)
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
        <p className="eyebrow">Buscar por ubicación</p>
        <h1 className="page-title">Encuentra personas <span>cerca de ti.</span></h1>
        <p className="page-lead">
          Usa tu ubicación para encontrar tutores o estudiantes disponibles en tu zona. Los resultados se calculan con la distancia real entre coordenadas.
        </p>

        {!session ? (
          <div className="form-card location-auth-prompt">
            <h2>Inicia sesión para buscar</h2>
            <p>La búsqueda por ubicación requiere una sesión válida de Lumen.</p>
            <Link className="button" to="/login">Iniciar sesión <span aria-hidden="true">→</span></Link>
          </div>
        ) : (
          <>
            <form
              className="form-card location-search-form"
              onSubmit={(e) => { e.preventDefault(); handleGeoSearch() }}
            >
              <div className="form-grid">
                <FormField id="loc-rol" label="Buscar" required>
                  <Select
                    id="loc-rol"
                    value={rol}
                    onChange={(e) => setRol(e.target.value as SearchRol)}
                  >
                    <option value="tutor">Tutores</option>
                    <option value="estudiante">Estudiantes</option>
                  </Select>
                </FormField>
                <FormField id="loc-radio" label="Radio (km)" hint="Distancia máxima desde tu ubicación.">
                  <Input
                    id="loc-radio"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={radio}
                    onChange={(e) => setRadio(e.target.value)}
                  />
                </FormField>
              </div>

              {geoError && <FormError>{geoError}</FormError>}

              <Button
                type="submit"
                loading={geoLoading || isLoading}
                loadingLabel={geoLoading ? 'Obteniendo ubicación…' : 'Buscando…'}
              >
                📍 Usar mi ubicación y buscar <span aria-hidden="true">→</span>
              </Button>
              {error && <FormError>{error}</FormError>}
            </form>

            <section
              className="location-results"
              aria-labelledby="nearby-results-title"
              aria-live="polite"
              aria-busy={isLoading}
            >
              {results !== null && (
                <>
                  <h2 id="nearby-results-title">Resultados</h2>
                  {results.length === 0 ? (
                    <p className="location-empty">
                      No se encontraron {rol === 'tutor' ? 'tutores' : 'estudiantes'} en un radio de {radio} km.
                    </p>
                  ) : (
                    <ul className="tutor-list">
                      {results.map((u) => (
                        <li className="tutor-card" key={u.id}>
                          <div className="tutor-card-header">
                            <div className="tutor-avatar" aria-hidden="true">
                              {u.nombre.charAt(0)}{u.apellido.charAt(0)}
                            </div>
                            <div>
                              <h3 className="tutor-name">{u.nombre} {u.apellido}</h3>
                              {u.ciudad && <p className="tutor-city">{u.ciudad}</p>}
                              {u.nivel_educativo && <p className="tutor-city">{u.nivel_educativo}</p>}
                              {u.institucion && <p className="tutor-city">{u.institucion}</p>}
                            </div>
                            <span className="tutor-distance">{u.distancia_km.toFixed(1)} km</span>
                          </div>
                          {u.biografia && <p className="tutor-bio">{u.biografia}</p>}
                          {u.tarifa_hora_base != null && (
                            <div className="tutor-card-footer">
                              <span className="tutor-rate">
                                ${Number(u.tarifa_hora_base).toLocaleString('es-CO')}<small>/hora</small>
                              </span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </section>
          </>
        )}

        <p className="location-attribution">
          Búsqueda calculada a partir de coordenadas geográficas almacenadas en la plataforma.
        </p>
      </div>
    </section>
  )
}
