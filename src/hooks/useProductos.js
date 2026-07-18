// ─────────────────────────────────────────────────────────────────────────────
// CAPA 3: CUSTOM HOOK
// Conecta el servicio (promesas) con React (estado). Encapsula el trío
// { data, loading, error } + refetch para que las pantallas no repitan
// esta maquinaria. Un custom hook es solo una función que usa otros hooks
// y cuyo nombre empieza con "use" (esa convención es OBLIGATORIA: le permite
// a React y al linter aplicarle las reglas de los hooks).
//
// v2: los 5 productos ya vienen creados (seed). Este hook solo lista y
// permite edición PARCIAL — no hay crear/eliminar.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react'
import { getProductos, updateProducto } from '@/api/productos'
import { getRendicionesChoferCerradas } from '@/api/rendiciones'

export function useProductos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // guardamos el ApiError completo (trae .status)

  // useCallback memoriza la función para que sea LA MISMA entre renders.
  // Sin él, cada render crearía un refetch nuevo y el useEffect de abajo
  // (que depende de refetch) se dispararía en bucle.
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProductos()
      setProductos(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false) // pase lo que pase, dejamos de "cargar"
    }
  }, [])

  // Carga inicial al montar. Exponer refetch permite además recargar
  // manualmente (ej: después de editar un producto).
  useEffect(() => {
    refetch()
  }, [refetch])

  // PUT parcial: solo se mandan los campos que cambian.
  const actualizar = useCallback(async (id, datosParciales) => {
    await updateProducto(id, datosParciales)
    await refetch()
  }, [refetch])

  return { productos, loading, error, refetch, actualizar }
}


