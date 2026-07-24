import { Navigate, Route, Routes } from 'react-router-dom'
import Header from '@/components/Header'
import ProductosPage from '@/pages/ProductosPage'
import FacturasPage from '@/pages/FacturasPage'
import RendicionesPage from '@/pages/RendicionesPage'
import MovimientosPage from '@/pages/MovimientosPage'
import ChoferPreciosPage from '@/pages/ChoferPreciosPage'
import LoginPage from '@/pages/LoginPage'
import ProtectedRoute from '@/auth/ProtectedRoute'
import { useAuth } from '@/auth/AuthContext'
import { ROLES, ROLES_BACKOFFICE, rutaInicial } from '@/auth/roles'

// Layout privado para las páginas protegidas: header con nav responsive + main.
function LayoutPrivado({ children }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  )
}

// Las rutas privadas comparten layout y van todas detrás del gate de sesión.
// Cada ruta declara qué roles la pueden ver; "/" y "*" mandan a la home del rol.
function AppPrivada() {
  const { usuario } = useAuth() // garantizado no-null: estamos dentro del gate de auth

  return (
    <LayoutPrivado>
      <Routes>
        <Route path="/" element={<Navigate to={rutaInicial(usuario.rol)} replace />} />

        {/* Back-office: admin + operador */}
        <Route path="/productos" element={<ProtectedRoute rolesPermitidos={ROLES_BACKOFFICE}><ProductosPage /></ProtectedRoute>} />
        <Route path="/facturas" element={<ProtectedRoute rolesPermitidos={ROLES_BACKOFFICE}><FacturasPage /></ProtectedRoute>} />
        <Route path="/rendiciones" element={<ProtectedRoute rolesPermitidos={ROLES_BACKOFFICE}><RendicionesPage /></ProtectedRoute>} />
        <Route path="/movimientos" element={<ProtectedRoute rolesPermitidos={ROLES_BACKOFFICE}><MovimientosPage /></ProtectedRoute>} />

        {/* Chofer (admin también, útil para soporte) */}
        <Route path="/chofer/precios" element={<ProtectedRoute rolesPermitidos={[ROLES.CHOFER, ROLES.ADMIN]}><ChoferPreciosPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={rutaInicial(usuario.rol)} replace />} />
      </Routes>
    </LayoutPrivado>
  )
}

function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />
      {/* Todo lo demás: protegido */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppPrivada />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
