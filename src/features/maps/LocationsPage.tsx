import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { ApiError } from '../../services/api/client'
import { buscarDirecciones, type Direccion } from '../../services/api/maps'
import { useSession } from '../auth/useSession'

export function LocationsPage() {
  const { session } = useSession()
  const [direccion, setDireccion] = useState('')
  const [resultados, setResultados] = useState<Direccion[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const buscar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || isLoading) return
    const consulta = direccion.trim()
    if (!consulta) {
      setError('Escribe una dirección para buscar.')
      return
    }
    setError('')
    setResultados(null)
    setIsLoading(true)
    try {
      const { resultados } = await buscarDirecciones(consulta, session.token)
      if (!Array.isArray(resultados)) {
        setError('El servicio de mapas no devolvió direcciones. Inténtalo de nuevo.')
        return
      }
      setResultados(resultados)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo realizar la búsqueda.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="page-section">
      <div className="container narrow-container">
        <h1 className="page-title">Busca una <span>dirección.</span></h1>
        <p className="page-lead">Encuentra la ubicación de un lugar de encuentro para una tutoría presencial.</p>
        {!session ? (
          <div className="form-card location-auth-prompt">
            <h2>Inicia sesión para buscar direcciones</h2>
            <Link className="button" to="/login">Iniciar sesión <span aria-hidden="true">→</span></Link>
          </div>
        ) : (
          <>
            <form className="form-card location-search-form" onSubmit={buscar}>
              <FormField id="direccion-busqueda" label="Dirección o lugar" required>
                <Input
                  id="direccion-busqueda"
                  type="search"
                  placeholder="Ej. Calle 72, Barranquilla"
                  required
                  value={direccion}
                  onChange={(event) => setDireccion(event.target.value)}
                />
              </FormField>
              {error && <FormError>{error}</FormError>}
              <Button type="submit" loading={isLoading} loadingLabel="Buscando…">Buscar dirección</Button>
            </form>

            <div className="location-results" aria-live="polite" aria-busy={isLoading}>
              {resultados?.length === 0 && <p>No se encontraron direcciones.</p>}
              {resultados && resultados.length > 0 && (
                <ul className="solicitud-list" aria-label="Direcciones encontradas">
                  {resultados.map(({ place_id, display_name, lat, lon }) => {
                    const coords = new URLSearchParams({ mlat: lat, mlon: lon })
                    return (
                      <li className="solicitud-card" key={place_id}>
                        <h2 className="solicitud-materia">{display_name}</h2>
                        <a
                          className="text-link"
                          href={`https://www.openstreetmap.org/?${coords}#map=17/${encodeURIComponent(lat)}/${encodeURIComponent(lon)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver en OpenStreetMap <span aria-hidden="true">↗</span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </>
        )}
        <p className="location-attribution">Datos de © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>.</p>
      </div>
    </section>
  )
}
