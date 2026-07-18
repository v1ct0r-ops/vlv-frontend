// ─────────────────────────────────────────────────────────────────────────────
// CAPA 3: CUSTOM HOOK — detalle de UNA rendición, cargado bajo demanda.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { getRendicion } from '@/api/rendiciones'

export function useRendicionDetalle(id) {
  const [rendicion, setRendicion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (id == null) {
      setRendicion(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getRendicion(id)
      setRendicion(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { rendicion, loading, error, refetch }
}
