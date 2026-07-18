// ─────────────────────────────────────────────────────────────────────────────
// CAPA 3: CUSTOM HOOK — historial GENERAL de rendiciones, paginado.
// Para el historial de UN chofer en particular, ver useRendicionesChofer.js.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { getRendiciones } from '@/api/rendiciones'

export function useRendiciones() {
  const [page, setPage] = useState(1)
  const [pagina, setPagina] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getRendiciones(page)
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
    rendiciones: pagina?.items ?? [],
    total: pagina?.total ?? 0,
    page,
    totalPages: pagina?.total_pages ?? 1,
    setPage,
    loading,
    error,
    refetch,
  }
}
