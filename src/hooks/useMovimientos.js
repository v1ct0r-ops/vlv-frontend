// ─────────────────────────────────────────────────────────────────────────────
// CAPA 3: CUSTOM HOOK — kardex de movimientos de inventario, paginado, solo lectura.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { getMovimientos } from '@/api/movimientos'

export function useMovimientos() {
  const [page, setPage] = useState(1)
  const [pagina, setPagina] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMovimientos(page)
      setPagina(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    movimientos: pagina?.items ?? [],
    total: pagina?.total ?? 0,
    page,
    totalPages: pagina?.total_pages ?? 1,
    setPage,
    loading,
    error,
    refetch,
  }
}
