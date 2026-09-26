import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import {
  ArrowForward,
  KeyboardArrowDownRounded,
  Close,
  Menu,
} from '@mui/icons-material'
import { ROUTES } from '../../routes/routes'
import { useRouter } from '../../routes/Router'
import Logo from '../brand/Logo'

const APP_LINKS = [
  { label: 'ApnaAcademy', href: 'https://apnaacademy.me', description: 'Main learning platform' },
  { label: 'Courses', href: 'https://course.apnaacademy.me', description: 'Explore courses' },
  { label: 'DSA', href: 'https://dsa.apnaacademy.me', description: 'DSA practice & learning' },
  { label: 'Student Dashboard', href: 'https://dashboard.apnaacademy.me', description: 'Track your learning' },
]

export default function InterviewHeader() {
  const { path, navigate } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [appsOpen, setAppsOpen] = useState(false)

  const scrollTo = (id) => {
    setMenuOpen(false)
    setAppsOpen(false)
    if (path !== ROUTES.HOME) {
      navigate(ROUTES.HOME)
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80)
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const openRoute = (route) => {
    setMenuOpen(false)
    setResourcesOpen(false)
    setAppsOpen(false)
    navigate(route)
  }

  const closeMenus = () => {
    setMenuOpen(false)
    setResourcesOpen(false)
    setAppsOpen(false)
  }

  return (
    <header className="site-header">
      <div className="header-inner flex items-center justify-between">
        <Logo />

        <nav className={`desktop-nav ${menuOpen ? 'mobile-open' : ''}`} aria-label="Primary navigation">
          <button className={`nav-link ${path === ROUTES.HOME ? 'active' : ''}`} onClick={() => scrollTo('home')}>Home</button>
          <button className="nav-link" onClick={() => scrollTo('features')}>Features</button>
          <button className="nav-link" onClick={() => scrollTo('why-us')}>Why Us</button>
          <button className="nav-link" onClick={() => scrollTo('pricing')}>Pricing</button>
          <button className="nav-link" onClick={() => scrollTo('stories')}>Success Stories</button>

          <div className="resource-wrap">
            <button
              className="nav-link"
              onClick={() => {
                setResourcesOpen((value) => !value)
                setAppsOpen(false)
              }}
              aria-expanded={resourcesOpen}
            >
              Resources
              <KeyboardArrowDownRounded sx={{ fontSize: 16, transition: 'transform .2s', transform: resourcesOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {resourcesOpen && (
              <div className="resource-menu">
                <button onClick={() => scrollTo('how-it-works')}>How it works</button>
                <button onClick={() => scrollTo('features')}>Interview features</button>
                <button onClick={() => scrollTo('stories')}>Learner stories</button>
              </div>
            )}
          </div>

          <div className="apps-wrap">
            <button
              className="nav-link apps-nav-link"
              onClick={() => {
                setAppsOpen((value) => !value)
                setResourcesOpen(false)
              }}
              aria-expanded={appsOpen}
            >
              Explore Apps
              <KeyboardArrowDownRounded sx={{ fontSize: 16, transition: 'transform .2s', transform: appsOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {appsOpen && (
              <div className="apps-menu" role="menu">
                {APP_LINKS.map((app) => (
                  <a
                    key={app.href}
                    href={app.href}
                    className="app-menu-link"
                    onClick={closeMenus}
                    role="menuitem"
                  >
                    <span>
                      <strong>{app.label}</strong>
                      <small>{app.description}</small>
                    </span>
                    <ArrowForward />
                  </a>
                ))}
                <div className="app-menu-current">
                  <span>
                    <strong>Interview</strong>
                    <small>AI mock interview practice</small>
                  </span>
                  <span className="app-menu-current-badge">Current</span>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="header-actions flex items-center">
          <button className="login-btn" onClick={() => openRoute(ROUTES.LOGIN)}>Login</button>
          <button className="gradient-btn small" onClick={() => openRoute(ROUTES.INTERVIEW_SETUP)}>
            Get Started Free <ArrowForward />
          </button>
          <IconButton
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <Close /> : <Menu />}
          </IconButton>
        </div>
      </div>
    </header>
  )
}
