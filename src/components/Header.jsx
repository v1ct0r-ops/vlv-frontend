import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import HealthCheck from '@/components/HealthCheck'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'

const ENLACES_NAV = [
  { to: '/productos', label: 'Productos' },
  { to: '/facturas', label: 'Facturas' },
  { to: '/rendiciones', label: 'Rendiciones' },
  { to: '/movimientos', label: 'Movimientos' },
]

// Header del layout privado. En ≥ md muestra la nav horizontal + info de usuario.
// En < md colapsa la nav y la info detrás de un botón burger que abre un panel.
function Header() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  function handleLogout() {
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  // Al navegar en móvil, cerramos el panel para no dejarlo abierto tapando la vista.
  function cerrarMenu() {
    setMenuAbierto(false)
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto max-w-4xl px-4">
        {/* Barra superior: siempre visible */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold">VLV — Gestión de gas</h1>
            {/* Nav horizontal: solo en ≥ md */}
            <nav className="hidden gap-4 text-sm md:flex">
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

          {/* Info de usuario: solo en ≥ md */}
          <div className="hidden items-center gap-4 md:flex">
            <HealthCheck />
            {usuario && (
              <div className="flex items-center gap-3">
                <div className="text-right leading-tight">
                  <p className="text-sm font-medium">{usuario.nombre}</p>
                  <p className="text-xs text-muted-foreground capitalize">{usuario.rol}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Salir
                </Button>
              </div>
            )}
          </div>

          {/* Botón burger: solo en < md */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            {menuAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Panel desplegable: solo en < md y cuando está abierto */}
        {menuAbierto && (
          <div className="flex flex-col gap-4 border-t py-4 md:hidden">
            <nav className="flex flex-col gap-3 text-sm">
              {ENLACES_NAV.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={cerrarMenu}
                  className={({ isActive }) =>
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center justify-between border-t pt-4">
              <HealthCheck />
              {usuario && (
                <div className="flex items-center gap-3">
                  <div className="text-right leading-tight">
                    <p className="text-sm font-medium">{usuario.nombre}</p>
                    <p className="text-xs text-muted-foreground capitalize">{usuario.rol}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Salir
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
