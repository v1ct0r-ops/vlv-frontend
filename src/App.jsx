import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import HealthCheck from '@/components/HealthCheck'
import ProductosPage from '@/pages/ProductosPage'
import FacturasPage from '@/pages/FacturasPage'
import RendicionesPage from '@/pages/RendicionesPage'
import MovimientosPage from '@/pages/MovimientosPage'

const ENLACES_NAV = [
  { to: '/productos', label: 'Productos' },
  { to: '/facturas', label: 'Facturas' },
  { to: '/rendiciones', label: 'Rendiciones' },
  { to: '/movimientos', label: 'Movimientos' },
]

// Layout compartido (header + nav) para todas las páginas. Las rutas nuevas
// se agregan como <Route> dentro de <Routes> y su link en el <nav>.
function App() {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold">VLV — Gestión de gas</h1>
            <nav className="flex gap-4 text-sm">
              {ENLACES_NAV.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <HealthCheck />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/productos" replace />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/facturas" element={<FacturasPage />} />
          <Route path="/rendiciones" element={<RendicionesPage />} />
          <Route path="/movimientos" element={<MovimientosPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
