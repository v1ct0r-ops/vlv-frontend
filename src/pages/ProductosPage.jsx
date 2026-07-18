// ─────────────────────────────────────────────────────────────────────────────
// CAPA 4: LA PÁGINA
// v2: los 5 productos vienen creados por seed. Esta pantalla es de solo
// lectura + edición parcial (precio, comisión, stock) — no hay crear/eliminar.
//   1. loading  → feedback de carga
//   2. error    → mensaje + botón de reintento
//   3. empty    → lista vacía NO es un error, merece su propio mensaje
//   4. success  → los datos
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useProductos } from '@/hooks/useProductos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { formatoCLP } from '@/lib/format'

function ProductosPage() {
  const { productos, loading, error, refetch, actualizar } = useProductos()

  const [productoEditando, setProductoEditando] = useState(null)
  const [formulario, setFormulario] = useState({
    nombre: '',
    precio_unitario: '',
    stock_actual: '',
    comision_unitaria: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState(null)

  function abrirEdicion(producto) {
    setProductoEditando(producto)
    setFormulario({
      nombre: producto.nombre,
      precio_unitario: producto.precio_unitario,
      stock_actual: producto.stock_actual,
      comision_unitaria: producto.comision_unitaria,
    })
    setErrorFormulario(null)
  }

  function handleChange(e) {
    setFormulario({ ...formulario, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)
    setErrorFormulario(null)
    try {
      await actualizar(productoEditando.id, {
        nombre: formulario.nombre,
        precio_unitario: Number(formulario.precio_unitario),
        stock_actual: Number(formulario.stock_actual),
        comision_unitaria: Number(formulario.comision_unitaria),
      })
      setProductoEditando(null)
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
              <CardTitle>Productos</CardTitle>
              <CardDescription>
                Los 5 formatos de gas GLP — stock, precio y comisión por unidad
              </CardDescription>
            </div>
            <Button variant="outline" onClick={refetch} disabled={loading}>
              Actualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* 1. LOADING */}
          {loading && (
            <p className="py-8 text-center text-muted-foreground">Cargando productos…</p>
          )}

          {/* 2. ERROR — el mensaje viene del `detail` de FastAPI vía ApiError */}
          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-8">
              <p className="text-destructive">⚠ {error.message}</p>
              <Button variant="secondary" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          )}

          {/* 3. EMPTY — sin datos no es lo mismo que error */}
          {!loading && !error && productos.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No hay productos registrados todavía.
            </p>
          )}

          {/* 4. SUCCESS */}
          {!loading && !error && productos.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Formato</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Kg por unidad</TableHead>
                  <TableHead className="text-right">Precio unitario</TableHead>
                  <TableHead className="text-right">Comisión unitaria</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((p) => (
                  // key: React la necesita para saber qué fila cambió sin
                  // repintar toda la lista. Siempre el id del dato, nunca el índice.
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.formato}</TableCell>
                    <TableCell>{p.nombre}</TableCell>
                    <TableCell className="text-right">{p.kg_por_unidad}</TableCell>
                    <TableCell className="text-right">
                      {formatoCLP(p.precio_unitario)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatoCLP(p.comision_unitaria)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={p.stock_actual === 0 ? 'text-destructive font-semibold' : ''}>
                        {p.stock_actual}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => abrirEdicion(p)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!productoEditando}
        onOpenChange={(abierto) => { if (!abierto) setProductoEditando(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {productoEditando?.formato}</DialogTitle>
            <DialogDescription>
              El formato no se puede cambiar. Solo se envían los campos editados.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
                required
                minLength={3}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="precio_unitario">Precio unitario</Label>
              <Input
                id="precio_unitario"
                name="precio_unitario"
                type="number"
                min="1"
                value={formulario.precio_unitario}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="comision_unitaria">Comisión unitaria</Label>
              <Input
                id="comision_unitaria"
                name="comision_unitaria"
                type="number"
                min="0"
                value={formulario.comision_unitaria}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="stock_actual">Stock actual</Label>
              <Input
                id="stock_actual"
                name="stock_actual"
                type="number"
                min="0"
                value={formulario.stock_actual}
                onChange={handleChange}
                required
              />
            </div>
            {errorFormulario && (
              <p className="text-sm text-destructive">{errorFormulario}</p>
            )}
            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button" />}>
                Cancelar
              </DialogClose>
              <Button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProductosPage
