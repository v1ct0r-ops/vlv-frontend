// Lista de largo libre (0..N) para "tarjetas" y "descuentos" de la rendición.
// Cada fila es un `Ajuste`: { monto, descripcion? }. El padre es dueño del
// arreglo (patrón controlado) — este componente solo pinta filas y avisa
// los cambios con onChange(nuevoArreglo).

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusIcon, XIcon } from 'lucide-react'

function AjustesDinamicos({ titulo, items, onChange, placeholderDescripcion }) {
  function actualizarFila(index, campo, valor) {
    const copia = [...items]
    copia[index] = { ...copia[index], [campo]: valor }
    onChange(copia)
  }

  function agregarFila() {
    onChange([...items, { monto: '', descripcion: '' }])
  }

  function quitarFila(index) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{titulo}</span>
        <Button type="button" variant="outline" size="xs" onClick={agregarFila}>
          <PlusIcon /> Agregar
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">Sin filas — agrega si corresponde.</p>
      )}

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            placeholder="Monto"
            value={item.monto}
            onChange={(e) => actualizarFila(index, 'monto', e.target.value)}
            required
            className="w-32"
          />
          <Input
            placeholder={placeholderDescripcion ?? 'Descripción (opcional)'}
            value={item.descripcion}
            onChange={(e) => actualizarFila(index, 'descripcion', e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => quitarFila(index)}
            aria-label="Quitar fila"
          >
            <XIcon />
          </Button>
        </div>
      ))}
    </div>
  )
}

export default AjustesDinamicos
