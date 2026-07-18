// ─────────────────────────────────────────────────────────────────────────────
// CAPA 4: LA PÁGINA — kardex de movimientos de inventario, solo lectura.
// ─────────────────────────────────────────────────────────────────────────────

import { useMovimientos } from '@/hooks/useMovimientos'
import { formatoCLP, formatoFecha } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Pagination from '@/components/Pagination'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Cada tipo de movimiento tiene un color propio para que el kardex se lea
// de un vistazo (entra stock vs. sale stock).
const VARIANTE_POR_TIPO = {
  INGRESO_FACTURA: 'default',
  RECEPCION_CHOFER: 'secondary',
  VENTA: 'destructive',
  DEVOLUCION: 'outline',
}

function MovimientosPage() {
  const { movimientos, page, totalPages, setPage, loading, error, refetch } = useMovimientos()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Movimientos de inventario</CardTitle>
            <CardDescription>Kardex completo, más recientes primero</CardDescription>
          </div>
          <Button variant="outline" onClick={refetch} disabled={loading}>
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="py-8 text-center text-muted-foreground">Cargando movimientos…</p>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-8">
            <p className="text-destructive">⚠ {error.message}</p>
            <Button variant="secondary" onClick={refetch}>Reintentar</Button>
          </div>
        )}

        {!loading && !error && movimientos.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No hay movimientos registrados todavía.</p>
        )}

        {!loading && !error && movimientos.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio unitario</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{formatoFecha(m.fecha)}</TableCell>
                    <TableCell>
                      <Badge variant={VARIANTE_POR_TIPO[m.tipo] ?? 'outline'}>{m.tipo}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{m.producto_id}</TableCell>
                    <TableCell className="text-right">{m.cantidad}</TableCell>
                    <TableCell className="text-right">{formatoCLP(m.precio_unitario)}</TableCell>
                    <TableCell className="text-right">{formatoCLP(m.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} disabled={loading} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default MovimientosPage
