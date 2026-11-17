import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSession } from '../../features/auth/useSession'

const publicNav = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/tutores', label: 'Tutores' },
  { to: '/ubicaciones', label: 'Ubicaciones' },
]

const authNav = [
  { to: '/solicitudes', label: 'Solicitudes' },
  { to: '/tutorias', label: 'Mis tutorías' },
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
          {publicNav.map(({ to, label, end }) => (
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

          {session && authNav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
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
                  <span className="session-role-chip">
                    {session.user.rol === 'tutor' ? 'Tutor' : 'Estudiante'}
                  </span>
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
