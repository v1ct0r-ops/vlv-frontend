// ─────────────────────────────────────────────────────────────────────────────
// CAPA 3: CUSTOM HOOK — listado paginado de facturas + creación.
// El backend pagina de a 10 (page_size fijo). El hook guarda solo `page`
// como estado propio; el resto (total, total_pages) llega en la respuesta.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { getFacturas, createFactura } from '@/api/inventario'

export function useFacturas() {
  const [page, setPage] = useState(1)
  const [pagina, setPagina] = useState(null) // Pagina<FacturaResumen> completa
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getFacturas(page)
      setPagina(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [page])

  // Se re-ejecuta solo cuando cambia `page` (refetch depende de él).
  useEffect(() => {
    refetch()
  }, [refetch])

  const crear = useCallback(
    async (datos) => {
      const factura = await createFactura(datos)
      if (page === 1) {
        await refetch() // ya estamos en la página que va a mostrar la nueva factura
      } else {
        setPage(1) // el useEffect de arriba dispara el refetch solo
      }
      return factura
    },
    [page, refetch]
  )

  return {
    facturas: pagina?.items ?? [],
    total: pagina?.total ?? 0,
    page,
    totalPages: pagina?.total_pages ?? 1,
    setPage,
    loading,
    error,
    refetch,
    crear,
  }
}
