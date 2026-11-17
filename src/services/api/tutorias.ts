import { apiRequest } from './client'
import type { Tutoria, TutoriaEstado, TutoriaRequest } from '../../types/tutorias'

export type TutoriasResponse = {
  tutorias: Tutoria[]
}

export type TutoriaResponse = {
  mensaje: string
  tutoria: Tutoria
}

/** Ambos roles: lista las sesiones confirmadas del usuario autenticado */
export function getMisTutorias(token: string): Promise<TutoriasResponse> {
  return apiRequest<TutoriasResponse>('/api/tutorias/mis-tutorias', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Estudiante: confirma una tutoría directamente */
export function confirmarTutoria(
  payload: TutoriaRequest,
  token: string,
): Promise<TutoriaResponse> {
  return apiRequest<TutoriaResponse>('/api/tutorias', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Tutor: agrega o actualiza el enlace de sala virtual */
export function actualizarEnlaceSala(
  tutoriaId: number,
  enlace_sala: string,
  token: string,
): Promise<TutoriaResponse> {
  return apiRequest<TutoriaResponse>(`/api/tutorias/${tutoriaId}/enlace`, {
    method: 'PATCH',
    body: JSON.stringify({ enlace_sala }),
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Ambos roles: actualiza el estado de la tutoría */
export function actualizarEstadoTutoria(
  tutoriaId: number,
  estado: TutoriaEstado,
  token: string,
): Promise<TutoriaResponse> {
  return apiRequest<TutoriaResponse>(`/api/tutorias/${tutoriaId}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
    headers: { Authorization: `Bearer ${token}` },
  })
}
