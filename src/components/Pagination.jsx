// Paginador genérico para los listados que devuelven `Pagina<T>`
// ({ page, total_pages }). Todas las pantallas paginadas (facturas,
// rendiciones, movimientos) reutilizan este mismo componente.

import { Button } from '@/components/ui/button'

function Pagination({ page, totalPages, onPageChange, disabled }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-end gap-2 pt-3">
      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </Button>
    </div>
  )
}

export default Pagination
