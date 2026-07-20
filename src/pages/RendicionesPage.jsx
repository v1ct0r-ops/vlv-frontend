// ─────────────────────────────────────────────────────────────────────────────
// CAPA 4: LA PÁGINA — historial de rendiciones + registrar una rendición nueva.
// Desde v3 la rendición es un documento independiente: ya no existe la "cuenta
// del chofer" (recepciones acumuladas). El chofer se identifica solo por
// nombre al rendir, sin ningún paso previo.
// Dos vistas de historial: todas (general) y por chofer (seguimiento de
// ventas), cada una con su propia paginación.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import { useProductos } from '@/hooks/useProductos'
import { useRendiciones } from '@/hooks/useRendiciones'
import { useRendicionesChofer } from '@/hooks/useRendicionesChofer'
import { useRendicionDetalle } from '@/hooks/useRendicionDetalle'
import { useRendir } from '@/hooks/useRendir'
import { useChoferesSugeridos } from '@/hooks/useChoferesSugeridos'
import { useDashboardChofer } from '@/hooks/useDashboardChofer'
import { productosOrdenados } from '@/lib/productos'
import { pdfRendicionUrl } from '@/api/rendiciones'
import { formatoCLP, formatoFecha } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import Pagination from '@/components/Pagination'
import AjustesDinamicos from '@/components/AjustesDinamicos'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts'

function ventaVacia(producto) {
  return {
    producto_id: producto.id,
    formato: producto.formato,
    cantidad: '',
    precio_unitario: producto.precio_unitario,
  }
}

function TablaRendiciones({ rendiciones, onVerDetalle }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Chofer</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Ventas</TableHead>
          <TableHead className="text-right">Kg</TableHead>
          <TableHead className="text-right">Comisión</TableHead>
          <TableHead className="text-right">Efectivo a rendir</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rendiciones.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">{r.chofer}</TableCell>
            <TableCell>{formatoFecha(r.fecha)}</TableCell>
            <TableCell className="text-right">{formatoCLP(r.total_ventas)}</TableCell>
            <TableCell className="text-right">{r.total_kg}</TableCell>
            <TableCell className="text-right">
              {formatoCLP(r.total_comision)}{' '}
              <Badge variant={r.comision_pagada ? 'default' : 'outline'}>
                {r.comision_pagada ? 'pagada' : 'retenida'}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium">{formatoCLP(r.efectivo_a_rendir)}</TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm" onClick={() => onVerDetalle(r.id)}>
                Ver detalle
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function RendicionesPage() {
  const general = useRendiciones()
  const [nombreInput, setNombreInput] = useState('')
  const [nombreBuscado, setNombreBuscado] = useState('')
  const porChofer = useRendicionesChofer(nombreBuscado)

  const [periodo, setPeriodo] = useState(() => new Date().toISOString().slice(0, 7))
  const [nombreInputDashboard, setNombreInputDashboard] = useState('')
  const [nombreDashboard, setNombreDashboard] = useState('')
  const [anioStr, mesStr] = periodo.split('-')
  const dashboard = useDashboardChofer(nombreDashboard, Number(mesStr), Number(anioStr))

  const [idSeleccionado, setIdSeleccionado] = useState(null)
  const { rendicion: detalle, loading: cargandoDetalle } = useRendicionDetalle(idSeleccionado)

  function handleBuscar(e) {
    e.preventDefault()
    setNombreBuscado(nombreInput.trim())
  }

  function handleBuscarDashboard(e) {
    e.preventDefault()
    setNombreDashboard(nombreInputDashboard.trim())
  }

  // ── Nueva rendición ───────────────────────────────────────────────────
  const { productos } = useProductos()
  const ordenados = useMemo(() => productosOrdenados(productos), [productos])
  const choferesSugeridos = useChoferesSugeridos()

  const [modalRendicion, setModalRendicion] = useState(false)
  const [nombreRendicion, setNombreRendicion] = useState('')
  const [ventas, setVentas] = useState([])
  const [tarjetas, setTarjetas] = useState([])
  const [descuentos, setDescuentos] = useState([])
  const [bencina, setBencina] = useState('0')
  const [comisionPagada, setComisionPagada] = useState(true)
  const [observaciones, setObservaciones] = useState('')
  const [errorRendicionForm, setErrorRendicionForm] = useState(null)
  const { rendir, enviando, resultado, limpiarResultado } = useRendir()

  function abrirModalRendicion() {
    setNombreRendicion('')
    setVentas(ordenados.map(ventaVacia))
    setTarjetas([])
    setDescuentos([])
    setBencina('0')
    setComisionPagada(true)
    setObservaciones('')
    setErrorRendicionForm(null)
    setModalRendicion(true)
  }

  function actualizarVenta(index, campo, valor) {
    const copia = [...ventas]
    copia[index] = { ...copia[index], [campo]: valor }
    setVentas(copia)
  }

  async function handleSubmitRendicion(e) {
    e.preventDefault()
    const nombre = nombreRendicion.trim()
    if (!nombre) {
      setErrorRendicionForm('Ingresa el nombre del chofer.')
      return
    }

    const ventasValidas = ventas
      .filter((v) => Number(v.cantidad) > 0)
      .map((v) => ({
        producto_id: v.producto_id,
        cantidad: Number(v.cantidad),
        precio_unitario: Number(v.precio_unitario),
      }))

    if (ventasValidas.length === 0) {
      setErrorRendicionForm('Registra al menos una venta.')
      return
    }

    const ajustesValidos = (lista) =>
      lista
        .filter((a) => a.monto !== '')
        .map((a) => ({ monto: Number(a.monto), descripcion: a.descripcion || undefined }))

    setErrorRendicionForm(null)
    try {
      await rendir(nombre, {
        ventas: ventasValidas,
        tarjetas: ajustesValidos(tarjetas),
        descuentos: ajustesValidos(descuentos),
        bencina: Number(bencina) || 0,
        comision_pagada: comisionPagada,
        observaciones: observaciones || undefined,
      })
      setModalRendicion(false)
      general.refetch()
      if (nombre === nombreBuscado) porChofer.refetch()
    } catch (err) {
      setErrorRendicionForm(err.message)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Rendiciones</CardTitle>
              <CardDescription>Historial de rendiciones de los choferes</CardDescription>
            </div>
            <Button onClick={abrirModalRendicion} className="w-full sm:w-auto">Nueva rendición</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">Todas</TabsTrigger>
              <TabsTrigger value="chofer">Por chofer</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="pt-4">
              {general.loading && (
                <p className="py-8 text-center text-muted-foreground">Cargando rendiciones…</p>
              )}
              {!general.loading && general.error && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <p className="text-destructive">⚠ {general.error.message}</p>
                  <Button variant="secondary" onClick={general.refetch}>Reintentar</Button>
                </div>
              )}
              {!general.loading && !general.error && general.rendiciones.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">No hay rendiciones registradas todavía.</p>
              )}
              {!general.loading && !general.error && general.rendiciones.length > 0 && (
                <>
                  <TablaRendiciones rendiciones={general.rendiciones} onVerDetalle={setIdSeleccionado} />
                  <Pagination
                    page={general.page}
                    totalPages={general.totalPages}
                    onPageChange={general.setPage}
                    disabled={general.loading}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="chofer" className="flex flex-col gap-4 pt-4">
              <form onSubmit={handleBuscar} className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <label htmlFor="nombre-rendicion" className="text-sm font-medium">Nombre del chofer</label>
                  <Input
                    id="nombre-rendicion"
                    value={nombreInput}
                    onChange={(e) => setNombreInput(e.target.value)}
                    placeholder="Ej: Juan Perez"
                    list="choferes-sugeridos"
                    required
                  />
                </div>
                <Button type="submit">Buscar</Button>
              </form>

              {!nombreBuscado && (
                <p className="py-8 text-center text-muted-foreground">Busca un chofer para ver su historial.</p>
              )}

              {nombreBuscado && porChofer.loading && (
                <p className="py-8 text-center text-muted-foreground">Cargando historial…</p>
              )}

              {nombreBuscado && !porChofer.loading && porChofer.error && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <p className="text-destructive">⚠ {porChofer.error.message}</p>
                  <Button variant="secondary" onClick={porChofer.refetch}>Reintentar</Button>
                </div>
              )}

              {nombreBuscado && !porChofer.loading && !porChofer.error && porChofer.rendiciones.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  {nombreBuscado} no tiene rendiciones registradas.
                </p>
              )}

              {nombreBuscado && !porChofer.loading && !porChofer.error && porChofer.rendiciones.length > 0 && (
                <>
                  <TablaRendiciones rendiciones={porChofer.rendiciones} onVerDetalle={setIdSeleccionado} />
                  <Pagination
                    page={porChofer.page}
                    totalPages={porChofer.totalPages}
                    onPageChange={porChofer.setPage}
                    disabled={porChofer.loading}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="dashboard" className="flex flex-col gap-4 pt-4">
              <form onSubmit={handleBuscarDashboard} className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <label htmlFor="nombre-dashboard" className="text-sm font-medium">Nombre del chofer</label>
                  <Input
                    id="nombre-dashboard"
                    value={nombreInputDashboard}
                    onChange={(e) => setNombreInputDashboard(e.target.value)}
                    placeholder="Ej: Juan Perez"
                    list="choferes-sugeridos"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="periodo-dashboard" className="text-sm font-medium">Mes</label>
                  <input
                    id="periodo-dashboard"
                    type="month"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  />
                </div>
                <Button type="submit">Buscar</Button>
              </form>

              {!nombreDashboard && (
                <p className="py-8 text-center text-muted-foreground">Busca un chofer para ver su dashboard.</p>
              )}

              {nombreDashboard && dashboard.loading && (
                <p className="py-8 text-center text-muted-foreground">Cargando dashboard…</p>
              )}

              {nombreDashboard && !dashboard.loading && dashboard.error && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <p className="text-destructive">⚠ {dashboard.error.message}</p>
                  <Button variant="secondary" onClick={dashboard.refetch}>Reintentar</Button>
                </div>
              )}

              {nombreDashboard && !dashboard.loading && !dashboard.error && dashboard.rendiciones.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  {nombreDashboard} no tiene rendiciones ese mes.
                </p>
              )}

              {nombreDashboard && !dashboard.loading && !dashboard.error && dashboard.rendiciones.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Total ventas</CardDescription>
                        <CardTitle className="text-2xl">{formatoCLP(dashboard.kpis.totalVentas)}</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Total kg</CardDescription>
                        <CardTitle className="text-2xl">{dashboard.kpis.totalKg}</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Comisión</CardDescription>
                        <CardTitle className="text-2xl">{formatoCLP(dashboard.kpis.totalComision)}</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Efectivo a rendir</CardDescription>
                        <CardTitle className="text-2xl">{formatoCLP(dashboard.kpis.totalEfectivo)}</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Rendiciones</CardDescription>
                        <CardTitle className="text-2xl">{dashboard.kpis.cantidadRendiciones}</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Promedio por rendición</CardDescription>
                        <CardTitle className="text-2xl">{formatoCLP(dashboard.kpis.promedioPorRendicion)}</CardTitle>
                      </CardHeader>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ventas por rendición</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboard.datosGrafico}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="fecha" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatoCLP(value)} />
                          <Bar dataKey="total_ventas" fill="var(--color-primary, #2563eb)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Datalist compartida por los inputs de nombre de chofer de esta página */}
      <datalist id="choferes-sugeridos">
        {choferesSugeridos.map((nombre) => (
          <option key={nombre} value={nombre} />
        ))}
      </datalist>

      <Dialog open={!!idSeleccionado} onOpenChange={(abierto) => { if (!abierto) setIdSeleccionado(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Rendición de {detalle?.chofer}</DialogTitle>
            <DialogDescription>{formatoFecha(detalle?.fecha)}</DialogDescription>
          </DialogHeader>

          {cargandoDetalle && <p className="text-sm text-muted-foreground">Cargando…</p>}

          {!cargandoDetalle && detalle && (
            <>
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Ventas</span>
                {detalle.ventas.map((v, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{v.producto} — {v.cantidad} un.</span>
                    <span className="text-muted-foreground">{formatoCLP(v.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between"><span>Total ventas</span><span>{formatoCLP(detalle.total_ventas)}</span></div>
                <div className="flex justify-between"><span>Total tarjetas</span><span>{formatoCLP(detalle.total_tarjetas)}</span></div>
                <div className="flex justify-between"><span>Total descuentos</span><span>{formatoCLP(detalle.total_descuentos)}</span></div>
                <div className="flex justify-between"><span>Bencina</span><span>{formatoCLP(detalle.bencina)}</span></div>
                <div className="flex justify-between"><span>Comisión ({detalle.comision_pagada ? 'pagada' : 'retenida'})</span><span>{formatoCLP(detalle.total_comision)}</span></div>
                <div className="flex justify-between border-t pt-1 font-semibold"><span>Efectivo a rendir</span><span>{formatoCLP(detalle.efectivo_a_rendir)}</span></div>
              </div>
            </>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cerrar</DialogClose>
            {idSeleccionado && (
              <Button type="button" onClick={() => window.open(pdfRendicionUrl(idSeleccionado), '_blank')}>
                Descargar PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulario de rendición nueva */}
      <Dialog open={modalRendicion} onOpenChange={setModalRendicion}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Nueva rendición</DialogTitle>
            <DialogDescription>
              El backend calcula comisión, total y efectivo a rendir — no se recalcula acá.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRendicion} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
            <div className="flex flex-col gap-1">
              <Label htmlFor="nombre-nueva-rendicion">Nombre del chofer</Label>
              <Input
                id="nombre-nueva-rendicion"
                value={nombreRendicion}
                onChange={(e) => setNombreRendicion(e.target.value)}
                placeholder="Ej: Juan Perez"
                list="choferes-sugeridos"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Ventas por formato</span>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Formato</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio venta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.map((v, index) => (
                    <TableRow key={v.producto_id}>
                      <TableCell className="font-medium">{v.formato}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={v.cantidad}
                          onChange={(e) => actualizarVenta(index, 'cantidad', e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={v.precio_unitario}
                          onChange={(e) => actualizarVenta(index, 'precio_unitario', e.target.value)}
                          className="w-28"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <AjustesDinamicos
              titulo="Tarjetas"
              items={tarjetas}
              onChange={setTarjetas}
              placeholderDescripcion="Ej: Transbank 12:30"
            />
            <AjustesDinamicos
              titulo="Descuentos"
              items={descuentos}
              onChange={setDescuentos}
              placeholderDescripcion="Ej: cliente frecuente"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="bencina">Bencina</Label>
                <Input
                  id="bencina"
                  type="number"
                  min="0"
                  value={bencina}
                  onChange={(e) => setBencina(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="comision-pagada">¿Comisión pagada hoy?</Label>
                <div className="flex h-8 items-center">
                  <Switch
                    id="comision-pagada"
                    checked={comisionPagada}
                    onCheckedChange={setComisionPagada}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="observaciones-rendicion">Observaciones</Label>
              <Textarea
                id="observaciones-rendicion"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
              />
            </div>

            {errorRendicionForm && (
              <p className="text-sm text-destructive">{errorRendicionForm}</p>
            )}

            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button" />}>Cancelar</DialogClose>
              <Button type="submit" disabled={enviando}>
                {enviando ? 'Rindiendo...' : 'Rendir'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resumen tras rendir (todo calculado por el backend) */}
      <Dialog open={!!resultado} onOpenChange={(abierto) => { if (!abierto) limpiarResultado() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rendición de {resultado?.chofer}</DialogTitle>
            <DialogDescription>{formatoFecha(resultado?.fecha)}</DialogDescription>
          </DialogHeader>
          {resultado && (
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between"><span>Total ventas</span><span>{formatoCLP(resultado.total_ventas)}</span></div>
              <div className="flex justify-between"><span>Total tarjetas</span><span>{formatoCLP(resultado.total_tarjetas)}</span></div>
              <div className="flex justify-between"><span>Total descuentos</span><span>{formatoCLP(resultado.total_descuentos)}</span></div>
              <div className="flex justify-between"><span>Bencina</span><span>{formatoCLP(resultado.bencina)}</span></div>
              <div className="flex justify-between"><span>Comisión ({resultado.comision_pagada ? 'pagada' : 'retenida'})</span><span>{formatoCLP(resultado.total_comision)}</span></div>
              <div className="flex justify-between border-t pt-1 font-semibold"><span>Efectivo a rendir</span><span>{formatoCLP(resultado.efectivo_a_rendir)}</span></div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cerrar</DialogClose>
            <Button type="button" onClick={() => window.open(pdfRendicionUrl(resultado.id), '_blank')}>
              Descargar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RendicionesPage
