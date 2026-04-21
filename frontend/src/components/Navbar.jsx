import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { getAssetUrl } from '../api/axios'
import ThemeToggle from './ThemeToggle'
import './Navbar.css'

export default function Navbar() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
    setMenuOpen(false)
  }

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/elections', label: 'Elections' },
    { to: '/admin/candidates', label: 'Candidates' },
    { to: '/admin/results', label: 'Results' },
    { to: '/admin/profile', label: 'Profile' },
  ]

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'My Profile' },
  ]

  const links = role === 'admin' ? adminLinks : userLinks

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <nav className="navbar">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="navbar-inner">
        <div className="brand-group">
          <Link to={role === 'admin' ? '/admin/dashboard' : user ? '/dashboard' : '/'} className="navbar-brand">
            <div className="brand-icon">🗳️</div>
            <span className="brand-name">Vote<span className="gradient-text">Chain</span></span>
          </Link>
          <ThemeToggle />
        </div>

        {user && (
          <>
            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="navbar-right">
              <div className="nav-user-info">
                <div className="nav-user-badge">
                  {role === 'admin' ? (
                    <span className="badge badge-primary">Admin</span>
                  ) : (
                    <span className="badge badge-info">Voter</span>
                  )}
                </div>
                <div className="avatar-placeholder nav-avatar-placeholder">
                  {user?.profilePhoto ? (
                    <img src={getAssetUrl(user.profilePhoto)} alt="avatar" className="avatar nav-avatar" />
                  ) : initials}
                </div>
                <span className="nav-user-name">{user?.name?.split(' ')[0]}</span>
              </div>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm logout-btn">
                Logout
              </button>

              <button
                className="hamburger"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <span /><span /><span />
              </button>
            </div>
          </>
        )}

        {!user && (
          <div className="navbar-right">
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
