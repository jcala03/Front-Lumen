import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { ApiError } from '../../services/api/client'
import { searchLocations, type LocationResult } from '../../services/api/maps'
import { useSession } from '../auth/useSession'

const MIN_REQUEST_INTERVAL_MS = 1_000

function getMapLink(result: LocationResult): string | null {
  const latitude = Number(result.lat)
  const longitude = Number(result.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`
}

export function LocationsPage() {
  const { session } = useSession()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[] | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const lastRequestAt = useRef(0)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const searchTerm = query.trim()
    if (!session || searchTerm.length < 2 || isLoading) return

    setError('')
    setResults(null)
    setIsLoading(true)

    try {
      const waitTime = Math.max(
        0,
        MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt.current),
      )
      if (waitTime > 0) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, waitTime))
      }
      lastRequestAt.current = Date.now()

      const response = await searchLocations(searchTerm, session.token)
      setResults(response.resultados)
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'No fue posible conectar con el servicio. Comprueba tu conexión e inténtalo de nuevo.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="page-section">
      <div className="container narrow-container">
        <p className="eyebrow">Búsqueda de lugares</p>
        <h1 className="page-title">Encuentra una <span>ubicación.</span></h1>
        <p className="page-lead">
          Busca una dirección o un lugar. Los resultados provienen de OpenStreetMap y pueden abrirse allí para consultar su ubicación.
        </p>

        {!session ? (
          <div className="form-card location-auth-prompt">
            <h2>Inicia sesión para buscar</h2>
            <p>La búsqueda de direcciones requiere una sesión válida de Lumen.</p>
            <Link className="button" to="/login">Iniciar sesión <span aria-hidden="true">→</span></Link>
          </div>
        ) : (
          <>
            <form className="form-card location-search-form" onSubmit={handleSubmit}>
              <FormField
                id="location-query"
                label="Dirección o lugar"
                required
                hint="Escribe al menos dos caracteres. La búsqueda se envía solo al enviar este formulario."
              >
                <Input
                  id="location-query"
                  name="q"
                  type="search"
                  autoComplete="street-address"
                  placeholder="Ej. Universidad de la Costa, Barranquilla"
                  minLength={2}
                  required
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </FormField>
              <Button type="submit" loading={isLoading} loadingLabel="Buscando…">
                Buscar ubicación <span aria-hidden="true">→</span>
              </Button>
              {error && <FormError>{error}</FormError>}
            </form>

            <section
              className="location-results"
              aria-labelledby="location-results-title"
              aria-live="polite"
              aria-busy={isLoading}
            >
              {results !== null && (
                <>
                  <h2 id="location-results-title">Resultados</h2>
                  {results.length === 0 ? (
                    <p className="location-empty">No se encontraron lugares para esta búsqueda.</p>
                  ) : (
                    <ul className="location-result-list">
                      {results.map((result) => {
                        const mapLink = getMapLink(result)
                        return (
                          <li className="location-result" key={result.place_id}>
                            <h3>{result.name || result.display_name}</h3>
                            <p>{result.display_name}</p>
                            {(result.category || result.type) && (
                              <p className="location-result-category">
                                {[result.category, result.type].filter(Boolean).join(' · ')}
                              </p>
                            )}
                            <p className="location-coordinates">
                              Ubicación: {result.lat}, {result.lon}
                            </p>
                            {mapLink && (
                              <a href={mapLink} target="_blank" rel="noreferrer">
                                Ver en OpenStreetMap
                              </a>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </>
              )}
            </section>
          </>
        )}

        <p className="location-attribution">
          Datos cartográficos © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors.
        </p>
      </div>
    </section>
  )
}
