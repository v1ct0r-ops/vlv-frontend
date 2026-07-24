// ─────────────────────────────────────────────────────────────────────────────
// CAPA 4: LA PÁGINA — PLANILLA DE PRECIOS (ADMIN)
// v2: los 5 productos vienen por seed. Solo lectura + edición parcial. El admin
// edita EN LÍNEA (tipo planilla), sin modal:
//   - precio_compra (costo) y ganancia (margen) → el back guarda ambos.
//   - precio_venta se calcula EN VIVO = compra + ganancia, pero es editable:
//     si el admin lo pisa a mano, ese valor manda (override).
//   - Guardar por fila = un PUT parcial. Al refetch, el chofer (mismo GET
//     /productos/) ve el precio nuevo: consistencia gratis.
//
// RESPONSIVE: la planilla tiene 9 columnas con inputs — inservible en un
// teléfono aun con scroll. Por eso hay DOS layouts del mismo dato:
//   - móvil  (< md): cada producto es una CARD apilada, inputs grandes.
//   - desktop (md+): la tabla/planilla clásica.
// La lógica de edición NO se duplica: vive en el hook useEdicionProducto y
// tanto la card como la fila la consumen.
//
// El operador entra en modo consulta (ve todo, sin inputs). La seguridad real
// la impone el backend (403 al PUT); acá solo ocultamos lo que no aplica.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useProductos } from '@/hooks/useProductos'
import { useAuth } from '@/auth/AuthContext'
import { ROLES } from '@/auth/roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import FadeIn from '@/components/motion/FadeIn'
import { StaggerList, StaggerItem, StaggerTableBody, StaggerTableRow } from '@/components/motion/StaggerList'
import { formatoCLP } from '@/lib/format'
import { calcularPrecioVenta } from '@/lib/productos'

// ─────────────────────────────────────────────────────────────────────────────
// HOOK DE EDICIÓN — el "cerebro" de una fila/card, sin nada de UI.
// Cada instancia maneja el borrador de UN producto: estado local aislado, así
// escribir en una fila no re-renderiza ni ensucia a las demás. Card y fila de
// tabla comparten este hook para no duplicar la fórmula ni el payload.
// ─────────────────────────────────────────────────────────────────────────────
function useEdicionProducto(producto, onGuardar) {
  // Los inputs manejan strings; seedeamos con String() y convertimos a Number
  // solo al calcular/enviar.
  const [form, setForm] = useState({
    precio_compra: String(producto.precio_compra ?? ''),
    ganancia: String(producto.ganancia ?? ''),
    precio_venta: String(producto.precio_venta ?? ''),
    comision_unitaria: String(producto.comision_unitaria ?? ''),
    stock_actual: String(producto.stock_actual ?? ''),
  })
  // ¿El admin pisó la venta a mano? Decide el payload:
  //   false → mandamos compra + ganancia, el back calcula la venta.
  //   true  → mandamos precio_venta explícito, el back respeta el override.
  const [ventaManual, setVentaManual] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  // Cálculo EN VIVO: una suma, se recalcula en cada tecla mientras esté en auto.
  const ventaAuto = calcularPrecioVenta(form.precio_compra, form.ganancia)
  const ventaMostrada = ventaManual ? form.precio_venta : ventaAuto

  // Tocar los ingredientes de la fórmula recalcula el resultado (vuelve a auto).
  function cambiarCalculado(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
    setVentaManual(false)
  }
  // Editar la venta directamente = override manual.
  function cambiarVenta(valor) {
    setForm((f) => ({ ...f, precio_venta: valor }))
    setVentaManual(true)
  }
  function cambiarSimple(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }
  // Descarta el override y deja que la fórmula mande otra vez.
  function volverAuto() {
    setVentaManual(false)
    setForm((f) => ({ ...f, precio_venta: String(ventaAuto) }))
  }

  // Solo habilitamos Guardar si algo cambió: evita PUTs vacíos.
  const modificado =
    Number(form.precio_compra) !== producto.precio_compra ||
    Number(form.ganancia) !== producto.ganancia ||
    Number(form.comision_unitaria) !== producto.comision_unitaria ||
    Number(form.stock_actual) !== producto.stock_actual ||
    (ventaManual && Number(form.precio_venta) !== producto.precio_venta)

  async function guardar() {
    setGuardando(true)
    setError(null)
    // PUT PARCIAL: costo, margen, comisión y stock siempre; precio_venta SOLO
    // si hubo override (si no, el back lo calcula).
    const payload = {
      precio_compra: Number(form.precio_compra),
      ganancia: Number(form.ganancia),
      comision_unitaria: Number(form.comision_unitaria),
      stock_actual: Number(form.stock_actual),
    }
    if (ventaManual) payload.precio_venta = Number(form.precio_venta)
    try {
      await onGuardar(producto.id, payload)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return {
    form, ventaMostrada, ventaManual, guardando, error, modificado,
    cambiarCalculado, cambiarVenta, cambiarSimple, volverAuto, guardar,
  }
}

// Pista bajo el input de venta: modo auto o botón para revertir el override.
function PistaVenta({ ventaManual, onVolverAuto }) {
  return ventaManual ? (
    <button type="button" onClick={onVolverAuto} className="text-amber-600 underline">
      manual · volver a auto
    </button>
  ) : (
    <span className="text-muted-foreground">= compra + ganancia</span>
  )
}

// ── MÓVIL: card editable (admin) ─────────────────────────────────────────────
function CardEditable({ producto, onGuardar }) {
  const ed = useEdicionProducto(producto, onGuardar)
  // Campo con label arriba. inputMode numeric → teclado numérico en el teléfono.
  // El Input de shadcn ya usa text-base en móvil (evita el zoom de iOS al foco).
  const campo = (label, node) => (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      {label}
      {node}
    </label>
  )
  return (
    <StaggerItem className="flex flex-col gap-4 rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold leading-none">{producto.formato}</p>
          <p className="mt-1 text-sm text-muted-foreground">{producto.nombre}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Venta</p>
          <p className="text-xl font-bold tabular-nums text-primary">
            {formatoCLP(Number(ed.ventaMostrada) || 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {campo('Precio compra',
          <Input type="number" inputMode="numeric" min="0" value={ed.form.precio_compra}
            onChange={(e) => ed.cambiarCalculado('precio_compra', e.target.value)}
            className="text-right tabular-nums" />,
        )}
        {campo('Ganancia',
          <Input type="number" inputMode="numeric" min="0" value={ed.form.ganancia}
            onChange={(e) => ed.cambiarCalculado('ganancia', e.target.value)}
            className="text-right tabular-nums" />,
        )}
        <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Precio venta
          <Input type="number" inputMode="numeric" min="1" value={ed.ventaMostrada}
            onChange={(e) => ed.cambiarVenta(e.target.value)}
            className={`text-right tabular-nums font-semibold ${ed.ventaManual ? 'border-amber-500' : ''}`} />
          <span className="text-xs">
            <PistaVenta ventaManual={ed.ventaManual} onVolverAuto={ed.volverAuto} />
          </span>
        </label>
        {campo('Comisión',
          <Input type="number" inputMode="numeric" min="0" value={ed.form.comision_unitaria}
            onChange={(e) => ed.cambiarSimple('comision_unitaria', e.target.value)}
            className="text-right tabular-nums" />,
        )}
        {campo('Stock',
          <Input type="number" inputMode="numeric" min="0" value={ed.form.stock_actual}
            onChange={(e) => ed.cambiarSimple('stock_actual', e.target.value)}
            className="text-right tabular-nums" />,
        )}
      </div>

      <Button size="lg" className="w-full" onClick={ed.guardar} disabled={!ed.modificado || ed.guardando}>
        {ed.guardando ? 'Guardando…' : 'Guardar'}
      </Button>
      {ed.error && <p className="text-sm text-destructive">{ed.error}</p>}
    </StaggerItem>
  )
}

// ── MÓVIL: card de solo lectura (operador) ───────────────────────────────────
function CardLectura({ producto }) {
  const fila = (label, valor) => (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{valor}</span>
    </div>
  )
  return (
    <StaggerItem className="flex flex-col gap-2 rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold leading-none">{producto.formato}</p>
          <p className="mt-1 text-sm text-muted-foreground">{producto.nombre}</p>
        </div>
        <p className="text-xl font-bold tabular-nums text-primary">{formatoCLP(producto.precio_venta)}</p>
      </div>
      <div className="flex flex-col gap-1 text-sm">
        {fila('Precio compra', formatoCLP(producto.precio_compra))}
        {fila('Ganancia', formatoCLP(producto.ganancia))}
        {fila('Comisión', formatoCLP(producto.comision_unitaria))}
        {fila('Stock', <span className={producto.stock_actual === 0 ? 'text-destructive font-semibold' : ''}>{producto.stock_actual}</span>)}
      </div>
    </StaggerItem>
  )
}

// ── DESKTOP: fila editable (admin) ───────────────────────────────────────────
function FilaEditable({ producto, onGuardar }) {
  const ed = useEdicionProducto(producto, onGuardar)
  const inputNum = (value, onChange, width, extra = '') => (
    <Input type="number" inputMode="numeric" min="0" value={value} onChange={onChange}
      className={`${width} text-right tabular-nums ml-auto ${extra}`} />
  )
  return (
    <StaggerTableRow>
      <TableCell className="font-medium">{producto.formato}</TableCell>
      <TableCell className="text-muted-foreground">{producto.nombre}</TableCell>
      <TableCell className="text-right tabular-nums">{producto.kg_por_unidad}</TableCell>
      <TableCell className="text-right">
        {inputNum(ed.form.precio_compra, (e) => ed.cambiarCalculado('precio_compra', e.target.value), 'w-28')}
      </TableCell>
      <TableCell className="text-right">
        {inputNum(ed.form.ganancia, (e) => ed.cambiarCalculado('ganancia', e.target.value), 'w-28')}
      </TableCell>
      <TableCell className="text-right">
        <Input type="number" inputMode="numeric" min="1" value={ed.ventaMostrada}
          onChange={(e) => ed.cambiarVenta(e.target.value)}
          className={`w-28 text-right tabular-nums ml-auto font-semibold ${ed.ventaManual ? 'border-amber-500' : ''}`} />
        <p className="mt-1 text-xs">
          <PistaVenta ventaManual={ed.ventaManual} onVolverAuto={ed.volverAuto} />
        </p>
      </TableCell>
      <TableCell className="text-right">
        {inputNum(ed.form.comision_unitaria, (e) => ed.cambiarSimple('comision_unitaria', e.target.value), 'w-24')}
      </TableCell>
      <TableCell className="text-right">
        {inputNum(ed.form.stock_actual, (e) => ed.cambiarSimple('stock_actual', e.target.value), 'w-20')}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col items-end gap-1">
          <Button size="sm" onClick={ed.guardar} disabled={!ed.modificado || ed.guardando}>
            {ed.guardando ? 'Guardando…' : 'Guardar'}
          </Button>
          {ed.error && <span className="text-xs text-destructive">{ed.error}</span>}
        </div>
      </TableCell>
    </StaggerTableRow>
  )
}

// ── DESKTOP: fila de solo lectura (operador) ─────────────────────────────────
function FilaLectura({ producto }) {
  return (
    <StaggerTableRow>
      <TableCell className="font-medium">{producto.formato}</TableCell>
      <TableCell>{producto.nombre}</TableCell>
      <TableCell className="text-right tabular-nums">{producto.kg_por_unidad}</TableCell>
      <TableCell className="text-right tabular-nums">{formatoCLP(producto.precio_compra)}</TableCell>
      <TableCell className="text-right tabular-nums">{formatoCLP(producto.ganancia)}</TableCell>
      <TableCell className="text-right font-semibold tabular-nums">{formatoCLP(producto.precio_venta)}</TableCell>
      <TableCell className="text-right tabular-nums">{formatoCLP(producto.comision_unitaria)}</TableCell>
      <TableCell className="text-right">
        <span className={producto.stock_actual === 0 ? 'text-destructive font-semibold' : 'tabular-nums'}>
          {producto.stock_actual}
        </span>
      </TableCell>
    </StaggerTableRow>
  )
}

function ProductosPage() {
  const { productos, loading, error, refetch, actualizar } = useProductos()
  const { usuario } = useAuth()
  // Solo admin muta precios. El operador ve la planilla en modo consulta.
  const esAdmin = usuario.rol === ROLES.ADMIN

  return (
    <FadeIn>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Precios de productos</CardTitle>
              <CardDescription>
                {esAdmin
                  ? 'Editá costo y ganancia; el precio de venta se calcula solo. Guardá cada fila.'
                  : 'Los 5 formatos de gas GLP — costo, margen, venta, comisión y stock'}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={refetch} disabled={loading} className="w-full sm:w-auto">
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

          {/* 4. SUCCESS — dos layouts del mismo dato, alternados por breakpoint. */}
          {!loading && !error && productos.length > 0 && (
            <>
              {/* MÓVIL: cards apiladas (< md) */}
              <StaggerList className="flex flex-col gap-3 md:hidden">
                {productos.map((p) =>
                  esAdmin ? (
                    <CardEditable key={p.id} producto={p} onGuardar={actualizar} />
                  ) : (
                    <CardLectura key={p.id} producto={p} />
                  )
                )}
              </StaggerList>

              {/* DESKTOP: planilla (md+). overflow-x-auto por si quedara justa. */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Formato</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-right">Kg</TableHead>
                      <TableHead className="text-right">Precio compra</TableHead>
                      <TableHead className="text-right">Ganancia</TableHead>
                      <TableHead className="text-right">Precio venta</TableHead>
                      <TableHead className="text-right">Comisión por galon</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      {esAdmin && <TableHead className="text-right">Acción</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <StaggerTableBody>
                    {productos.map((p) =>
                      // key: SIEMPRE el id del dato, nunca el índice.
                      esAdmin ? (
                        <FilaEditable key={p.id} producto={p} onGuardar={actualizar} />
                      ) : (
                        <FilaLectura key={p.id} producto={p} />
                      )
                    )}
                  </StaggerTableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  )
}

export default ProductosPage
