// ─────────────────────────────────────────────────────────────────────────────
// CAPA 3: CUSTOM HOOK — nombres de chofer para autocompletar (evita duplicados
// por tildes/espacios, ej: "Juan Perez" vs "Juan Pérez"). Se arma con
// GET /rendiciones/?page=1: no es un listado exhaustivo, es una sugerencia.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { getRendiciones } from '@/api/rendiciones'

export function useChoferesSugeridos() {
  const [choferes, setChoferes] = useState([])

  useEffect(() => {
    getRendiciones(1)
      .then((data) => {
        const nombres = new Set((data?.items ?? []).map((r) => r.chofer))
        setChoferes([...nombres].sort())
      })
      .catch(() => setChoferes([]))
  }, [])

  return choferes
}
