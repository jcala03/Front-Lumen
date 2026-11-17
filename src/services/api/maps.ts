import { apiRequest } from './client'
import type { NearbyUser } from '../../types/tutorias'

export type NearbySearchParams = {
  lat: number
  lng: number
  radio?: number
  rol?: 'tutor' | 'estudiante'
}

export type NearbySearchResponse = {
  resultados: NearbyUser[]
}

export function searchNearby(
  params: NearbySearchParams,
  token: string,
): Promise<NearbySearchResponse> {
  const query = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    radio: String(params.radio ?? 10),
    rol: params.rol ?? 'tutor',
  })
  return apiRequest<NearbySearchResponse>(`/api/mapas/buscar?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
