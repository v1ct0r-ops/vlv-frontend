import { useCallback, useEffect, useMemo, useState } from 'react'
import { getRendicionesChoferCerradas } from '@/api/rendiciones'
import { formatoFecha } from '@/lib/format'

export function useDashboardChofer(nombre, mes, anio) {
  const [rendiciones, setRendiciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getRendicionesChoferCerradas(nombre, mes, anio)
      setRendiciones(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [nombre, mes, anio])

  useEffect(() => {
    refetch()
  }, [refetch])

  const kpis = useMemo(() => {
    const totales = rendiciones.reduce(
        (acc, r) => ({
            totalVentas: acc.totalVentas + r.total_ventas,
            totalKg: acc.totalKg + r.total_kg,
            totalComision: acc.totalComision + r.total_comision,
            totalEfectivo: acc.totalEfectivo + r.efectivo_a_rendir,
        }),
        {totalVentas: 0, totalKg: 0, totalComision: 0, totalEfectivo: 0}
    )

    const cantidadRendiciones = rendiciones.length
    const promedioPorRendicion = cantidadRendiciones > 0 ? totales.totalVentas / cantidadRendiciones : 0

    return { ...totales, cantidadRendiciones, promedioPorRendicion}
  }, [rendiciones])

  const datosGrafico = useMemo(() => {
    return rendiciones.map((r) => ({
      fecha: formatoFecha(r.fecha),
      total_ventas: r.total_ventas,
    }))
  }, [rendiciones])

  return { rendiciones, loading, error, refetch, kpis, datosGrafico }
}