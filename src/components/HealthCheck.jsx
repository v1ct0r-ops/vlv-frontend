// Widget de diagnóstico de la Fase 0. Es un caso especial: /health no es un
// recurso de negocio, así que llama al cliente directo sin servicio ni hook
// propio. Las pantallas reales SIEMPRE van por página → hook → servicio.

import { useEffect, useState } from 'react'
import { api } from '@/api/client'

function HealthCheck() {
  const [status, setStatus] = useState('loading') // 'loading' | 'ok' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    api
      .get('/health')
      .then((data) => {
        if (data.status !== 'healthy') throw new Error('Respuesta inesperada')
        setStatus('ok')
      })
      .catch((err) => {
        setStatus('error')
        setErrorMsg(err.message)
      })
  }, [])

  if (status === 'loading')
    return <span className="text-sm text-muted-foreground">Conectando…</span>
  if (status === 'error')
    return <span className="text-sm text-destructive">❌ {errorMsg}</span>
  return <span className="text-sm text-green-600">● Backend conectado</span>
}

export default HealthCheck
