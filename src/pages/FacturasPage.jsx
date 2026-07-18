// ─────────────────────────────────────────────────────────────────────────────
// CAPA 4: LA PÁGINA — ingreso de stock por factura de proveedor.
// Flujo: elegir cantidades por formato → POST → el backend sube el stock y
// devuelve el detalle calculado (subtotales, total_kg, total_costo) + PDF.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import { useFacturas } from '@/hooks/useFacturas'
import { useFacturaDetalle } from '@/hooks/useFacturaDetalle'
import { useProductos } from '@/hooks/useProductos'
import { productosOrdenados } from '@/lib/productos'
import { pdfFacturaUrl } from '@/api/inventario'
import { formatoCLP, formatoFecha } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Pagination from '@/components/Pagination'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

function filaVacia(producto) {
  return { producto_id: producto.id, formato: producto.formato, cantidad: '', costo_unitario: '' }
}

function FacturasPage() {
  const { facturas, page, totalPages, setPage, loading, error, refetch, crear } = useFacturas()
  const { productos } = useProductos()
  const ordenados = useMemo(() => productosOrdenados(productos), [productos])

  const [modalAbierto, setModalAbierto] = useState(false)
  const [numeroFactura, setNumeroFactura] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [filas, setFilas] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState(null)
  const [facturaCreada, setFacturaCreada] = useState(null)

  const [idSeleccionado, setIdSeleccionado] = useState(null)
  const { factura: detalle, loading: cargandoDetalle } = useFacturaDetalle(idSeleccionado)

  function abrirModalNuevo() {
    setFilas(ordenados.map(filaVacia))
    setNumeroFactura('')
    setProveedor('')
    setObservaciones('')
    setErrorFormulario(null)
    setModalAbierto(true)
  }

  function actualizarFila(index, campo, valor) {
    const copia = [...filas]
    copia[index] = { ...copia[index], [campo]: valor }
    setFilas(copia)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const items = filas
      .filter((f) => Number(f.cantidad) > 0)
      .map((f) => {
        const item = { producto_id: f.producto_id, cantidad: Number(f.cantidad) }
        if (f.costo_unitario !== '') item.costo_unitario = Number(f.costo_unitario)
        return item
      })

    if (items.length === 0) {
      setErrorFormulario('Ingresa la cantidad recibida de al menos un formato.')
      return
    }

    setGuardando(true)
    setErrorFormulario(null)
    try {
      const factura = await crear({
        numero_factura: numeroFactura,
        proveedor,
        observaciones: observaciones || undefined,
        items,
      })
      setModalAbierto(false)
      setFacturaCreada(factura)
    } catch (err) {
      setErrorFormulario(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Facturas de proveedor</CardTitle>
              <CardDescription>Ingresos de stock registrados</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={refetch} disabled={loading}>
                Actualizar
              </Button>
              <Button onClick={abrirModalNuevo} disabled={ordenados.length === 0}>
                Nueva factura
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && (
            <p className="py-8 text-center text-muted-foreground">Cargando facturas…</p>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-8">
              <p className="text-destructive">⚠ {error.message}</p>
              <Button variant="secondary" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && facturas.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No hay facturas registradas todavía.
            </p>
          )}

          {!loading && !error && facturas.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° factura</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total unidades</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facturas.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.numero_factura}</TableCell>
                      <TableCell>{f.proveedor}</TableCell>
                      <TableCell>{formatoFecha(f.fecha)}</TableCell>
                      <TableCell className="text-right">{f.total_unidades}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setIdSeleccionado(f.id)}>
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} disabled={loading} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Formulario de nueva factura */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva factura de ingreso</DialogTitle>
            <DialogDescription>
              Deja en 0 (o vacío) los formatos que no vinieron en esta carga.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="numero_factura">N° factura</Label>
                <Input
                  id="numero_factura"
                  value={numeroFactura}
                  onChange={(e) => setNumeroFactura(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input
                  id="proveedor"
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Items por formato</span>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Formato</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Costo unitario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filas.map((fila, index) => (
                    <TableRow key={fila.producto_id}>
                      <TableCell className="font-medium">{fila.formato}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={fila.cantidad}
                          onChange={(e) => actualizarFila(index, 'cantidad', e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          placeholder="opcional"
                          value={fila.costo_unitario}
                          onChange={(e) => actualizarFila(index, 'costo_unitario', e.target.value)}
                          className="w-28"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
              />
            </div>

            {errorFormulario && <p className="text-sm text-destructive">{errorFormulario}</p>}

            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button" />}>Cancelar</DialogClose>
              <Button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Registrar factura'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resumen tras crear (incluye link al PDF que genera el backend) */}
      <Dialog open={!!facturaCreada} onOpenChange={(abierto) => { if (!abierto) setFacturaCreada(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Factura {facturaCreada?.numero_factura} registrada</DialogTitle>
            <DialogDescription>
              Stock actualizado. Total: {formatoCLP(facturaCreada?.total_costo)} · {facturaCreada?.total_kg} kg
            </DialogDescription>
          </DialogHeader>
          <ul className="flex flex-col gap-1 text-sm">
            {facturaCreada?.items.map((item) => (
              <li key={item.formato} className="flex justify-between">
                <span>{item.producto} — {item.cantidad} un.</span>
                <span className="text-muted-foreground">stock: {item.stock_resultante}</span>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cerrar</DialogClose>
            <Button
              type="button"
              onClick={() => window.open(pdfFacturaUrl(facturaCreada.id), '_blank')}
            >
              Descargar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detalle al hacer click en una fila del listado */}
      <Dialog open={!!idSeleccionado} onOpenChange={(abierto) => { if (!abierto) setIdSeleccionado(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Factura {detalle?.numero_factura}</DialogTitle>
            <DialogDescription>
              {detalle?.proveedor} · {formatoFecha(detalle?.fecha)}
            </DialogDescription>
          </DialogHeader>

          {cargandoDetalle && <p className="text-sm text-muted-foreground">Cargando…</p>}

          {!cargandoDetalle && detalle && (
            <>
              <ul className="flex flex-col gap-1 text-sm">
                {detalle.items.map((item) => (
                  <li key={item.formato} className="flex justify-between">
                    <span>{item.producto} — {item.cantidad} un.</span>
                    <span className="text-muted-foreground">
                      {item.subtotal != null ? formatoCLP(item.subtotal) : 'sin costo'}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium">
                Total: {formatoCLP(detalle.total_costo)} · {detalle.total_kg} kg
              </p>
            </>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cerrar</DialogClose>
            {idSeleccionado && (
              <Button type="button" onClick={() => window.open(pdfFacturaUrl(idSeleccionado), '_blank')}>
                Descargar PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FacturasPage
