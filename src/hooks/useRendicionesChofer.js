// ─────────────────────────────────────────────────────────────────────────────
// CAPA 3: CUSTOM HOOK — historial paginado de rendiciones de UN chofer
// (seguimiento de ventas). Si `nombre` viene vacío, no hace fetch.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { getRendicionesChofer } from '@/api/rendiciones'

export function useRendicionesChofer(nombre) {
  const [page, setPage] = useState(1)
  const [pagina, setPagina] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    const nombreLimpio = nombre?.trim()
    if (!nombreLimpio) {
      setPagina(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getRendicionesChofer(nombreLimpio, page)
      setPagina(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [nombre, page])

  useEffect(() => {
    refetch()
  }, [refetch])

  // Cada vez que cambia el chofer buscado, volvemos a la página 1.
  useEffect(() => {
    setPage(1)
  }, [nombre])

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
