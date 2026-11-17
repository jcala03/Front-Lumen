import { apiRequest } from './client'
import type { Oferta, OfertaRequest } from '../../types/tutorias'

export type OfertasResponse = {
  ofertas: Oferta[]
}

export type OfertaResponse = {
  mensaje: string
  oferta: Oferta
}

/** Tutor: envía una oferta para una solicitud */
export function crearOferta(
  payload: OfertaRequest,
  token: string,
): Promise<OfertaResponse> {
  return apiRequest<OfertaResponse>('/api/ofertas', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Estudiante: acepta una oferta específica */
export function aceptarOferta(
  ofertaId: number,
  token: string,
): Promise<{ mensaje: string }> {
  return apiRequest<{ mensaje: string }>(`/api/ofertas/${ofertaId}/aceptar`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Tutor: lista todas sus ofertas enviadas */
export function getMisOfertas(token: string): Promise<OfertasResponse> {
  return apiRequest<OfertasResponse>('/api/ofertas/tutor/mis-ofertas', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Tutor: lista sus sesiones confirmadas */
export function getOfertasConfirmadasTutor(token: string): Promise<OfertasResponse> {
  return apiRequest<OfertasResponse>('/api/ofertas/confirmadas/tutor', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Lista ofertas de una solicitud (cualquier rol autenticado) */
export function getOfertasDeSolicitud(
  solicitudId: number,
  token: string,
): Promise<OfertasResponse> {
  return apiRequest<OfertasResponse>(`/api/ofertas/solicitud/${solicitudId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
