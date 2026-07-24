// ─────────────────────────────────────────────────────────────────────────────
// VISTA DEL CHOFER: PRECIOS DE VENTA
// Mobile-first. El chofer la abre en la calle, con una mano: cada formato es una
// card grande, precio destacado, cero ruido. Solo lectura — reusa useProductos
// (mismo GET /productos/ que el back-office) y productosOrdenados para el orden
// de negocio (5kg → gruas). Cuatro estados: loading / error / empty / success.
// ─────────────────────────────────────────────────────────────────────────────

import { useProductos } from '@/hooks/useProductos'
import { productosOrdenados } from '@/lib/productos'
import { formatoCLP } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import FadeIn from '@/components/motion/FadeIn'

function ChoferPreciosPage() {
  const { productos, loading, error, refetch } = useProductos()
  const ordenados = productosOrdenados(productos)

  return (
    <FadeIn>
      <div className="flex flex-col gap-4">
        {/* Cabecera: título + actualizar. El botón es ancho en móvil (dedo-friendly). */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Precios de venta</h2>
            <p className="text-sm text-muted-foreground">Formatos de gas GLP — precio por unidad</p>
          </div>
          <Button variant="outline" onClick={refetch} disabled={loading} className="w-full sm:w-auto">
            Actualizar
          </Button>
        </div>

        {/* 1. LOADING */}
        {loading && (
          <p className="py-12 text-center text-muted-foreground">Cargando precios…</p>
        )}

        {/* 2. ERROR — mensaje del ApiError + reintento */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-12">
            <p className="text-destructive">⚠ {error.message}</p>
            <Button variant="secondary" onClick={refetch}>
              Reintentar
            </Button>
          </div>
        )}

        {/* 3. EMPTY */}
        {!loading && !error && ordenados.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            No hay precios cargados todavía.
          </p>
        )}

        {/* 4. SUCCESS — cards apiladas (1 columna en móvil, 2 en pantallas anchas) */}
        {!loading && !error && ordenados.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ordenados.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between gap-4 py-5">
                  {/* El chofer recibe SOLO { id, formato, precio_venta }: el back
                      le oculta costo, margen y comisión. Por eso acá no hay
                      p.nombre ni nada del back-office, aunque quisiéramos mostrarlo. */}
                  <p className="text-2xl font-bold leading-none">{p.formato}</p>
                  <p className="text-2xl font-bold tabular-nums text-primary">
                    {formatoCLP(p.precio_venta)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  )
}

export default ChoferPreciosPage
