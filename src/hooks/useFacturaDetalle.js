// ─────────────────────────────────────────────────────────────────────────────
// CAPA 3: CUSTOM HOOK — detalle de UNA factura, cargado bajo demanda
// (ej: al abrir un diálogo). Si `id` es null/undefined, no hace fetch.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { getFactura } from '@/api/inventario'

export function useFacturaDetalle(id) {
  const [factura, setFactura] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (id == null) {
      setFactura(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getFactura(id)
      setFactura(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { factura, loading, error, refetch }
}
