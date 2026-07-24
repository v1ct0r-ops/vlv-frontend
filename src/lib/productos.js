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

// ─────────────────────────────────────────────────────────────────────────────
// FÓRMULA DE PRECIO — fuente única de verdad en el front.
// El backend aplica exactamente la misma regla (venta = compra + ganancia), pero
// el admin necesita ver el resultado EN VIVO mientras escribe, antes de guardar.
// Por eso la fórmula vive acá: función pura (sin React, sin estado, sin efectos),
// así se puede testear sola y cualquier pantalla la reusa sin duplicar la regla.
//
// `Number(x) || 0`: los inputs de un formulario siempre son strings, y un campo
// vacío ('') o a medio escribir ('-') da NaN. NaN contamina toda suma. Lo
// colapsamos a 0 para que el precio mostrado nunca sea "NaN".
// ─────────────────────────────────────────────────────────────────────────────
export function calcularPrecioVenta(precioCompra, ganancia) {
  return (Number(precioCompra) || 0) + (Number(ganancia) || 0)
}
