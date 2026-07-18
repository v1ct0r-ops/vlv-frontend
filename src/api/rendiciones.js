// ─────────────────────────────────────────────────────────────────────────────
// CAPA 2: SERVICIO DEL RECURSO "RENDICIONES" (el formulario principal)
// La rendición es un documento independiente (v3, ya no depende de una
// "cuenta" previa): el chofer se identifica solo por nombre y el backend
// calcula todo el desglose (comisión, efectivo a rendir) — el frontend
// nunca recalcula.
// ─────────────────────────────────────────────────────────────────────────────

import { api, buildUrl } from './client'

// POST /rendiciones/chofer/{nombre} → registra la rendición directamente.
// Si cualquier línea falla (ej: stock insuficiente), la API hace rollback
// total: nada se guarda.
export function rendirChofer(nombre, datos) {
  return api.post(`/rendiciones/chofer/${encodeURIComponent(nombre)}`, datos)
}

// GET /rendiciones/?page=N → Pagina<RendicionResumen>, todas, recientes primero
export function getRendiciones(page = 1) {
  return api.get(`/rendiciones/?page=${page}`)
}

// GET /rendiciones/chofer/{nombre}?page=N → historial paginado de un chofer
export function getRendicionesChofer(nombre, page = 1) {
  return api.get(`/rendiciones/chofer/${encodeURIComponent(nombre)}?page=${page}`)
}

// GET /rendiciones/chofer/{nombre}/cerradas?mes=N&anio=N → cierres del mes (sin paginar).
// mes/anio opcionales: sin ellos trae todo el histórico. Pensado para dashboard.
export function getRendicionesChoferCerradas(nombre, mes, anio) {
  const params = new URLSearchParams()
  if (mes) params.set('mes', mes)
  if (anio) params.set('anio', anio)
  const query = params.toString() ? `?${params}` : ''
  return api.get(`/rendiciones/chofer/${encodeURIComponent(nombre)}/cerradas${query}`)
}

// GET /rendiciones/{id} → detalle completo (mismo shape que el POST)
export function getRendicion(id) {
  return api.get(`/rendiciones/${id}`)
}

export function pdfRendicionUrl(id) {
  return buildUrl(`/rendiciones/${id}/pdf`)
}
