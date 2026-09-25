import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import {
  ArrowForward,
  ChevronDown,
  Close,
  Menu,
} from '@mui/icons-material'
import { ROUTES } from '../../routes/routes'
import { useRouter } from '../../routes/Router'
import Logo from '../brand/Logo'

export default function InterviewHeader() {
  const { path, navigate } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)

  const scrollTo = (id) => {
    setMenuOpen(false)
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
    navigate(route)
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
            <button className="nav-link" onClick={() => setResourcesOpen((value) => !value)}>
              Resources <ChevronDown sx={{ fontSize: 16, transition: 'transform .2s', transform: resourcesOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {resourcesOpen && (
              <div className="resource-menu">
                <button onClick={() => scrollTo('how-it-works')}>How it works</button>
                <button onClick={() => scrollTo('features')}>Interview features</button>
                <button onClick={() => scrollTo('stories')}>Learner stories</button>
              </div>
            )}
          </div>
        </nav>

        <div className="header-actions flex items-center">
          <button className="login-btn" onClick={() => openRoute(ROUTES.LOGIN)}>Login</button>
          <button className="gradient-btn small" onClick={() => openRoute(ROUTES.INTERVIEW_SETUP)}>
            Get Started Free <ArrowForward />
          </button>
          <IconButton className="mobile-menu-btn" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <Close /> : <Menu />}
          </IconButton>
        </div>
      </div>
    </header>
  )
}
