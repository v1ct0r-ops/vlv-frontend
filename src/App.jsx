import { Navigate, Route, Routes } from 'react-router-dom'
import Header from '@/components/Header'
import ProductosPage from '@/pages/ProductosPage'
import FacturasPage from '@/pages/FacturasPage'
import RendicionesPage from '@/pages/RendicionesPage'
import MovimientosPage from '@/pages/MovimientosPage'
import LoginPage from '@/pages/LoginPage'
import ProtectedRoute from '@/auth/ProtectedRoute'

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
function AppPrivada() {
  return (
    <LayoutPrivado>
      <Routes>
        <Route path="/" element={<Navigate to="/productos" replace />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/facturas" element={<FacturasPage />} />
        <Route path="/rendiciones" element={<RendicionesPage />} />
        <Route path="/movimientos" element={<MovimientosPage />} />
        <Route path="*" element={<Navigate to="/productos" replace />} />
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
