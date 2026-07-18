// ─────────────────────────────────────────────────────────────────────────────
// Formateo compartido entre pantallas. Antes vivía repetido dentro de cada
// página (ver ProductosPage) — se centraliza acá para no duplicar el Intl.
// ─────────────────────────────────────────────────────────────────────────────

const monedaCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
})

export function formatoCLP(valor) {
  return monedaCLP.format(valor ?? 0)
}

const fechaHoraCL = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'short',
  timeStyle: 'short',
})

// El backend manda fechas ISO sin zona horaria (hora local del servidor).
// new Date() las interpreta igual como hora local del navegador, que es
// justo lo que queremos mostrar acá.
export function formatoFecha(iso) {
  if (!iso) return '—'
  return fechaHoraCL.format(new Date(iso))
}
