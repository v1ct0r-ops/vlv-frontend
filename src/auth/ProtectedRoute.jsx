// Gate de rutas: envuelve las páginas privadas. Casos:
//   1. cargando        → rehidratando la sesión (F5 con token) → spinner, no decidir aún
//   2. sin sesión      → redirige a /login
//   3. rol no permitido → autenticado pero sin el rol requerido → a la home de SU
//                         rol (no a /login: sí tiene sesión, solo no le toca esta ruta)
//   4. ok              → renderiza la ruta protegida
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { rutaInicial } from '@/auth/roles'

function ProtectedRoute({ children, rolesPermitidos }) {
  const { usuario, estaAutenticado, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Verificando sesión…</span>
      </div>
    )
  }

  if (!estaAutenticado) return <Navigate to="/login" replace />

  // rolesPermitidos es opcional: sin él, basta con estar autenticado.
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to={rutaInicial(usuario.rol)} replace />
  }

  return children
}

export default ProtectedRoute
