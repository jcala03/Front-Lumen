import { apiRequest } from './client'

export type LocationResult = {
  place_id: number
  lat: string
  lon: string
  name?: string
  display_name: string
  category?: string
  type?: string
}

export type LocationSearchResponse = {
  mensaje: string
  resultados: LocationResult[]
}

export function searchLocations(query: string, token: string): Promise<LocationSearchResponse> {
  const params = new URLSearchParams({ q: query })
  return apiRequest<LocationSearchResponse>(`/api/mapas/buscar?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
