import { apiRequest } from './client'

export type Direccion = {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

type DireccionesResponse = {
  mensaje: string
  resultados: Direccion[]
}

export function buscarDirecciones(direccion: string, token: string): Promise<DireccionesResponse> {
  const query = new URLSearchParams({ q: direccion })
  return apiRequest<DireccionesResponse>(`/api/mapas/buscar?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
