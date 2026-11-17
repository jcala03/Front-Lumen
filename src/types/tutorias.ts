// PostgreSQL puede serializar los identificadores y los campos numéricos como cadenas.
export type Id = number | string
type Numeric = number | string

export type Modalidad = 'presencial' | 'virtual'
export type SolicitudTipo = 'inmediata' | 'programada'

export type SolicitudRequest = {
  materia_id: Id
  nivel_educativo: string
  modalidad: Modalidad
  tipo: SolicitudTipo
  duracion_horas: number
  tema_especifico?: string
  fecha_programada?: string
  presupuesto_hora?: number
  ciudad?: string
}

export type Solicitud = {
  id: Id
  estudiante_id: Id
  materia_id: Id
  materia_nombre?: string | null
  nivel_educativo: string
  modalidad: Modalidad
  tipo: SolicitudTipo
  duracion_horas: Numeric
  tema_especifico: string | null
  fecha_programada: string | null
  presupuesto_hora: Numeric | null
  ciudad: string | null
  estado: string
  creada_en: string
}

export type Oferta = {
  id: Id
  solicitud_id: Id
  tutor_id: Id
  precio_hora: Numeric
  mensaje: string | null
  estado: string
  creada_en: string
  expira_en: string | null
  tarifa_tutor?: Numeric | null
  nombre_tutor?: string | null
  apellido_tutor?: string | null
  tema_especifico?: string | null
  nivel_educativo?: string | null
}

export type OfertaRequest = {
  solicitud_id: Id
  precio_ofrecido: number
  mensaje?: string
}

export type TutoriaEstado = 'confirmada' | 'en_curso' | 'finalizada' | 'cancelada'
export type Tutoria = {
  id: Id
  solicitud_id: Id
  oferta_id: Id
  tutor_id: Id
  estudiante_id: Id
  estado: TutoriaEstado
  fecha_inicio: string | null
  duracion_horas: Numeric
  precio_hora: Numeric
  precio_total: Numeric | null
  modalidad: Modalidad
  enlace_sala: string | null
  creada_en: string
  tema_especifico?: string | null
}
