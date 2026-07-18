// ─────────────────────────────────────────────────────────────────────────────
// CAPA 3: CUSTOM HOOK — mutación "rendir chofer" (POST /rendiciones/chofer/{nombre}).
// No mantiene listas: solo el estado de la operación en curso y su resultado,
// para que la página muestre el resumen calculado por el backend + botón PDF.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useState } from 'react'
import { rendirChofer } from '@/api/rendiciones'

export function useRendir() {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [resultado, setResultado] = useState(null)

  const rendir = useCallback(async (nombre, datos) => {
    setEnviando(true)
    setError(null)
    try {
      const data = await rendirChofer(nombre, datos)
      setResultado(data)
      return data
    } catch (err) {
      setError(err)
      throw err // la página necesita el catch para no cerrar el formulario
    } finally {
      setEnviando(false)
    }
  }, [])

  const limpiarResultado = useCallback(() => setResultado(null), [])

  return { rendir, enviando, error, resultado, limpiarResultado }
}
