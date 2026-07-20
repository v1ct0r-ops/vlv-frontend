// ─────────────────────────────────────────────────────────────────────────────
// CAPA 3 (global): CONTEXTO DE SESIÓN
// Un custom hook por recurso conecta servicio ↔ React. La sesión es especial:
// la necesita TODO el árbol (header, gate de rutas, páginas), así que en vez de
// un hook local va en un Context. Expone { usuario, cargando, estaAutenticado,
// iniciarSesion, cerrarSesion } vía useAuth().
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { login as loginRequest, getMe } from '@/api/auth'
import { getToken, setToken, clearToken, onSesionExpirada } from '@/api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  // Arranca "cargando" solo si hay un token que rehidratar; si no, no hay nada
  // que esperar y evitamos un parpadeo del spinner en el primer render.
  const [cargando, setCargando] = useState(Boolean(getToken()))

  // Rehidratación: si quedó un token en sessionStorage (F5), lo validamos contra
  // /me. Si el token expiró, /me responde 401 → el cliente ya limpia y dispara
  // el evento de sesión expirada; acá simplemente dejamos usuario en null.
  useEffect(() => {
    if (!getToken()) return
    let vivo = true
    getMe()
      .then((u) => { if (vivo) setUsuario(u) })
      .catch(() => { if (vivo) clearToken() })
      .finally(() => { if (vivo) setCargando(false) })
    return () => { vivo = false }
  }, [])

  // Cuando el cliente detecta un 401 en cualquier request, cierra la sesión en
  // toda la app. El ProtectedRoute se encarga de la redirección a /login.
  useEffect(() => {
    return onSesionExpirada(() => setUsuario(null))
  }, [])

  const iniciarSesion = useCallback(async (email, password) => {
    const token = await loginRequest(email, password)
    setToken(token)
    try {
      const u = await getMe()
      setUsuario(u)
      return u
    } catch (err) {
      // token válido pero /me falló → no dejamos una sesión a medias
      clearToken()
      throw err
    }
  }, [])

  const cerrarSesion = useCallback(() => {
    clearToken()
    setUsuario(null)
  }, [])

  const value = {
    usuario,
    cargando,
    estaAutenticado: Boolean(usuario),
    iniciarSesion,
    cerrarSesion,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook de consumo. Falla ruidoso si se usa fuera del provider: error de
// programación, mejor explotar en desarrollo que devolver undefined silencioso.
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
