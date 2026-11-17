export type Modalidad = 'presencial' | 'virtual'

export type SolicitudEstado = 'abierta' | 'aceptada' | 'cancelada' | 'cerrada'

export type Solicitud = {
  id: number
  estudiante_id: number
  materia: string
  nivel_educativo?: string
  modalidad: Modalidad
  duracion_horas: number
  tema_especifico?: string
  descripcion?: string
  latitud?: number
  longitud?: number
  direccion_texto?: string
  estado: SolicitudEstado
  fecha_creacion: string
  total_ofertas?: number
  // info del estudiante (vista tutor)
  nombre?: string
  apellido?: string
  avatar_url?: string | null
  institucion?: string
  ciudad?: string
}

export type SolicitudRequest = {
  materia: string
  nivel_educativo?: string
  modalidad: Modalidad
  duracion_horas: number
  materia_id?: number
  tema_especifico?: string
  descripcion?: string
  latitud?: number
  longitud?: number
  direccion_texto?: string
}

export type OfertaEstado = 'pendiente' | 'aceptada' | 'rechazada'

export type Oferta = {
  id: number
  solicitud_id: number
  tutor_id: number
  precio_ofrecido: number
  mensaje?: string
  estado: OfertaEstado
  fecha_oferta: string
  // info del tutor
  nombre?: string
  apellido?: string
  avatar_url?: string | null
  biografia?: string
  tarifa_hora_base?: number
  calificacion_promedio?: number
}

export type OfertaRequest = {
  solicitud_id: number
  precio_ofrecido: number
  mensaje?: string
}

export type TutoriaEstado = 'programada' | 'en_curso' | 'finalizada' | 'cancelada'

export type Tutoria = {
  id: number
  solicitud_id?: number
  oferta_id?: number
  tutor_id: number
  estudiante_id: number
  estado: TutoriaEstado
  enlace_sala?: string
  fecha_confirmacion: string
  // participantes
  nombre_tutor?: string
  apellido_tutor?: string
  nombre_estudiante?: string
  apellido_estudiante?: string
  materia?: string
  duracion_horas?: number
  modalidad?: string
}

export type TutoriaRequest = {
  solicitud_id: number
  oferta_id: number
  tutor_id: number
}

export type NearbyUser = {
  id: number
  nombre: string
  apellido: string
  avatar_url?: string | null
  ciudad?: string
  distancia_km: number
  // tutor
  biografia?: string
  tarifa_hora_base?: number
  calificacion_promedio?: number
  // estudiante
  nivel_educativo?: string
  institucion?: string
}
