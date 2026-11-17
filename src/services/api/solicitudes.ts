import { apiRequest } from './client'
import type { Solicitud, SolicitudRequest, Oferta } from '../../types/tutorias'

export type SolicitudesResponse = {
  solicitudes: Solicitud[]
}

export type SolicitudResponse = {
  mensaje: string
  solicitud: Solicitud
}

export type OfertasDeSolicitudResponse = {
  ofertas: Oferta[]
}

/** Tutor: lista todas las solicitudes abiertas */
export function getSolicitudesAbiertas(token: string): Promise<SolicitudesResponse> {
  return apiRequest<SolicitudesResponse>('/api/solicitudes', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Estudiante: lista sus propias solicitudes */
export function getMisSolicitudes(token: string): Promise<SolicitudesResponse> {
  return apiRequest<SolicitudesResponse>('/api/solicitudes/mis-solicitudes', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Estudiante: crea una nueva solicitud */
export function crearSolicitud(
  payload: SolicitudRequest,
  token: string,
): Promise<SolicitudResponse> {
  return apiRequest<SolicitudResponse>('/api/solicitudes', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Estudiante: lista las ofertas recibidas para una solicitud */
export function getOfertasDeSolicitud(
  solicitudId: number,
  token: string,
): Promise<OfertasDeSolicitudResponse> {
  return apiRequest<OfertasDeSolicitudResponse>(
    `/api/solicitudes/${solicitudId}/ofertas`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
}
