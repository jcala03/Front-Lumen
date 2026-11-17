export const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' })

export const formatoFechaHora = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  currencyDisplay: 'code',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

export const modalidadLabel = { presencial: 'Presencial', virtual: 'Virtual' }

export const ofertaEstadoLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  expirada: 'Expirada',
  cancelada: 'Cancelada',
}
