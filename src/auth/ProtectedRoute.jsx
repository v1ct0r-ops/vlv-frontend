// Gate de rutas: envuelve las páginas privadas. Tres casos:
//   1. cargando  → rehidratando la sesión (F5 con token) → spinner, no decidir aún
//   2. sin sesión → redirige a /login
//   3. con sesión → renderiza la ruta protegida
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

function ProtectedRoute({ children }) {
  const { estaAutenticado, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Verificando sesión…</span>
      </div>
    )
  }

  if (!estaAutenticado) return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute
