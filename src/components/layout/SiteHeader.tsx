import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSession } from '../../features/auth/useSession'

const navigation = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/tutores', label: 'Explorar tutores' },
  { to: '/ubicaciones', label: 'Buscar ubicación' },
]

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { session, sessionExpired, signOut } = useSession()
  const navigate = useNavigate()

  const closeMenu = () => setMenuOpen(false)
  const handleSignOut = () => {
    signOut()
    closeMenu()
    navigate('/', { replace: true })
  }

  return (
    <header className="site-header">
      <div className="header-inner container">
        <Link className="brand" to="/" aria-label="Lumen, ir al inicio" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">L</span>
          <span className="brand-name">lumen</span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`primary-navigation${menuOpen ? ' is-open' : ''}`}
          id="primary-navigation"
          aria-label="Navegación principal"
        >
          {navigation.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
          <div className="nav-actions">
            {session ? (
              <>
                <span className="session-greeting">
                  Hola, <strong>{session.user.nombre}</strong>
                </span>
                <button className="nav-link nav-logout" type="button" onClick={handleSignOut}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                {sessionExpired && (
                  <span className="session-expired-notice" role="status">
                    Tu sesión expiró. Inicia sesión nuevamente.
                  </span>
                )}
                <NavLink className="nav-link nav-login" to="/login" onClick={closeMenu}>
                  Iniciar sesión
                </NavLink>
                <NavLink className="button button-small" to="/registro" onClick={closeMenu}>
                  Crear cuenta
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
