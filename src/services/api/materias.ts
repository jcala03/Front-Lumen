import type { Id } from '../../types/tutorias'
import { apiRequest } from './client'

export type Materia = {
  id: Id
  nombre: string
}

type MateriasResponse = {
  ok: true
  total: number
  materias: Materia[]
}

export function getMaterias(token: string): Promise<MateriasResponse> {
  return apiRequest<MateriasResponse>('/api/materias', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
