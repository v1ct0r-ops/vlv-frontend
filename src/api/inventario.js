
// CAPA 2: SERVICIO DEL RECURSO "FACTURAS" (ingreso de stock por proveedor)


import { api, download } from './client'

// POST /inventario/facturas → registra la factura y sube stock.
// Transacción todo-o-nada: si un producto_id es inválido, la API responde 400
// y no ingresa nada (el hook no necesita revertir nada en el frontend).
export function createFactura(datos) {
  return api.post('/inventario/facturas', datos)
}

// GET /inventario/facturas?page=N → Pagina<FacturaResumen>
export function getFacturas(page = 1) {
  return api.get(`/inventario/facturas?page=${page}`)
}

// GET /inventario/facturas/{id} → detalle completo (mismo shape que el POST)
export function getFactura(id) {
  return api.get(`/inventario/facturas/${id}`)
}


export function descargarFacturaPdf(id) {
  return download(`/inventario/facturas/${id}/pdf`,`factura_${id}.pdf`)
}
