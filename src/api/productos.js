// ─────────────────────────────────────────────────────────────────────────────
// CAPA 2: SERVICIO DEL RECURSO "PRODUCTOS"
// Una función por endpoint. Sin estado, sin React, sin try/catch:
// los errores ya vienen normalizados como ApiError desde client.js y
// es el HOOK quien decide qué hacer con ellos.
//
// v2: los 5 productos ya vienen creados por el backend (seed). No exponemos
// crear/eliminar en la UI — solo listar y editar (parcial).
// ─────────────────────────────────────────────────────────────────────────────

import { api } from './client'

// GET /productos/ → ProductoRead[] (máximo 5, sin paginación)
// { id, nombre, formato, precio_unitario, stock_actual, kg_por_unidad, comision_unitaria }
export function getProductos() {
  return api.get('/productos/')
}

// GET /productos/{id} → ProductoRead (404 si no existe)
export function getProducto(id) {
  return api.get(`/productos/${id}`)
}

// PUT /productos/{id} → actualización PARCIAL. Envía solo los campos a cambiar
// (nombre, precio_unitario, stock_actual, comision_unitaria). El `formato`
// no se puede cambiar y no se manda.
export function updateProducto(id, datosParciales) {
  return api.put(`/productos/${id}`, datosParciales)
}
