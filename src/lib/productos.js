// ─────────────────────────────────────────────────────────────────────────────
// Los 5 formatos son la regla central del negocio, pero sus `id` son de BD
// y NO se pueden fijar en el código (cambian si se recrea la base). Esta
// utilidad construye un mapa formato → producto a partir de un
// `GET /productos/` ya cargado, para que los formularios (factura, recepción,
// venta) siempre resuelvan el id correcto.
// ─────────────────────────────────────────────────────────────────────────────

// Orden fijo en el que se muestran los formatos en tablas y formularios.
export const ORDEN_FORMATOS = ['5kg', '11kg', '15kg', '45kg', 'gruas']

export function mapaPorFormato(productos) {
  const mapa = new Map()
  for (const p of productos) mapa.set(p.formato, p)
  return mapa
}

// Devuelve los productos ordenados según ORDEN_FORMATOS (si faltara alguno
// en la respuesta del backend, simplemente no aparece en la lista).
export function productosOrdenados(productos) {
  const mapa = mapaPorFormato(productos)
  return ORDEN_FORMATOS.map((formato) => mapa.get(formato)).filter(Boolean)
}
