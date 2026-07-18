// ─────────────────────────────────────────────────────────────────────────────
// CAPA 2: SERVICIO DEL RECURSO "MOVIMIENTOS" (kardex de inventario, solo lectura)
// ─────────────────────────────────────────────────────────────────────────────

import { api } from './client'

// GET /movimientos/?page=N → Pagina<Movimiento>, recientes primero
// tipo: "INGRESO_FACTURA" | "VENTA" | "DEVOLUCION" — "RECEPCION_CHOFER" ya no
// se genera (se eliminó la cuenta del chofer, v3) pero puede seguir
// apareciendo en filas antiguas.
export function getMovimientos(page = 1) {
  return api.get(`/movimientos/?page=${page}`)
}
