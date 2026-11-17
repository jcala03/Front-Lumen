import { apiRequest } from './client'
import type { Id, Oferta, OfertaRequest, Tutoria } from '../../types/tutorias'

export type OfertasResponse = {
  ok: true
  total: number
  ofertas: Oferta[]
}

export type OfertaResponse = {
  ok: true
  mensaje: string
  oferta: Oferta
}

type AceptarOfertaResponse = {
  ok: true
  mensaje: string
  tutoria: Tutoria
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
  ofertaId: Id,
  token: string,
): Promise<AceptarOfertaResponse> {
  return apiRequest<AceptarOfertaResponse>(`/api/ofertas/${encodeURIComponent(ofertaId)}/aceptar`, {
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
