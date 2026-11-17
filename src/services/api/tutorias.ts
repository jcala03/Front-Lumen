import { apiRequest } from './client'
import type { Id, Tutoria, TutoriaEstado } from '../../types/tutorias'

export type TutoriasResponse = {
  ok: true
  total: number
  tutorias: Tutoria[]
}

export type TutoriaResponse = {
  ok: true
  mensaje: string
  tutoria: Tutoria
}

/** Ambos roles: lista las sesiones confirmadas del usuario autenticado */
export function getMisTutorias(token: string): Promise<TutoriasResponse> {
  return apiRequest<TutoriasResponse>('/api/tutorias/mis-tutorias', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Tutor: agrega o actualiza el enlace de sala virtual */
export function actualizarEnlaceSala(
  tutoriaId: Id,
  enlace_sala: string,
  token: string,
): Promise<TutoriaResponse> {
  return apiRequest<TutoriaResponse>(`/api/tutorias/${encodeURIComponent(tutoriaId)}/enlace`, {
    method: 'PATCH',
    body: JSON.stringify({ enlace_sala }),
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Ambos roles: actualiza el estado de la tutoría */
export function actualizarEstadoTutoria(
  tutoriaId: Id,
  estado: TutoriaEstado,
  token: string,
): Promise<TutoriaResponse> {
  return apiRequest<TutoriaResponse>(`/api/tutorias/${encodeURIComponent(tutoriaId)}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
    headers: { Authorization: `Bearer ${token}` },
  })
}
