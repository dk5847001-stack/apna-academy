import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import {
  ArrowForward,
  KeyboardArrowDownRounded,
  Close,
  Menu,
  AutoAwesomeRounded,
  OpenInNewRounded,
  LogoutRounded,
} from '@mui/icons-material'
import { ROUTES } from '../../routes/routes'
import { useRouter } from '../../routes/Router'
import { useAuth } from '../../context/AuthContext'
import Logo from '../brand/Logo'
import CosmicField from '../common/CosmicField'

const APP_LINKS = [
  { label: 'ApnaAcademy', href: 'https://apnaacademy.me', description: 'Learning platform' },
  { label: 'Courses', href: 'https://course.apnaacademy.me', description: 'Explore courses' },
  { label: 'DSA', href: 'https://dsa.apnaacademy.me', description: 'Practice DSA' },
  { label: 'Student Dashboard', href: 'https://dashboard.apnaacademy.me', description: 'Track your learning' },
]

export default function InterviewHeader() {
  const { path, navigate } = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [interviewOpen, setInterviewOpen] = useState(false)
  const [appsOpen, setAppsOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const openRoute = (route) => {
    setMenuOpen(false)
    setInterviewOpen(false)
    setAppsOpen(false)
    navigate(route)
  }

  const closeMenus = () => {
    setMenuOpen(false)
    setInterviewOpen(false)
    setAppsOpen(false)
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    closeMenus()
    try {
      await logout()
      navigate(ROUTES.HOME, { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="site-header">
      <div className="header-cosmic-layer" aria-hidden="true">
        <CosmicField density="nav" />
      </div>

      <div className="announcement-bar">
        <div className="announcement-inner">
          <span className="announcement-badge"><AutoAwesomeRounded /> AI Interview Lab</span>
          <span className="announcement-message">Practice realistic interviews with adaptive AI feedback.</span>
          <button type="button" onClick={() => openRoute(ROUTES.INTERVIEW_SETUP)}>
            Start free <ArrowForward />
          </button>
        </div>
      </div>

      <div className="header-inner">
        <Logo />

        <nav className={`desktop-nav ${menuOpen ? 'mobile-open' : ''}`} aria-label="Primary navigation">
          <button className={`nav-link ${path === ROUTES.HOME ? 'active' : ''}`} onClick={() => openRoute(ROUTES.HOME)}>Home</button>

          <div className="nav-popover-wrap">
            <button
              className={`nav-link ${path.startsWith('/interview') && path !== ROUTES.HISTORY ? 'active' : ''}`}
              onClick={() => setInterviewOpen((value) => !value)}
              aria-expanded={interviewOpen}
            >
              Interview
              <KeyboardArrowDownRounded sx={{ fontSize: 16, transition: 'transform .2s', transform: interviewOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {interviewOpen && (
              <div className="nav-popover">
                <button type="button" onClick={() => openRoute(ROUTES.INTERVIEW_SETUP)}>
                  <span><strong>Start Interview</strong><small>Launch a new AI session</small></span><ArrowForward />
                </button>
                <button type="button" onClick={() => openRoute(ROUTES.HISTORY)}>
                  <span><strong>Interview History</strong><small>Review your previous sessions</small></span><ArrowForward />
                </button>
              </div>
            )}
          </div>

          <button className={`nav-link ${path === ROUTES.HISTORY ? 'active' : ''}`} onClick={() => openRoute(ROUTES.HISTORY)}>History</button>

          <div className="nav-popover-wrap">
            <button className="nav-link" onClick={() => setAppsOpen((value) => !value)} aria-expanded={appsOpen}>
              Apps
              <KeyboardArrowDownRounded sx={{ fontSize: 16, transition: 'transform .2s', transform: appsOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {appsOpen && (
              <div className="nav-popover apps-popover">
                <div className="apps-popover-label">ApnaAcademy ecosystem</div>
                {APP_LINKS.map((app) => (
                  <a key={app.href} href={app.href} onClick={closeMenus}>
                    <span><strong>{app.label}</strong><small>{app.description}</small></span><OpenInNewRounded />
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="header-actions">
          {!authLoading && !user ? (
            <>
              <button className="login-btn" onClick={() => openRoute(ROUTES.LOGIN)}>Login</button>
              <button className="signup-nav-btn" onClick={() => openRoute(ROUTES.SIGNUP)}>Sign up <ArrowForward /></button>
            </>
          ) : null}

          {!authLoading && user ? (
            <>
              <span className="header-user-name" title={user.email || ''}>
                <span className="header-user-dot" />
                {user.name || 'Account'}
              </span>
              <button className="logout-btn" onClick={handleLogout} disabled={loggingOut}>
                <LogoutRounded /> {loggingOut ? 'Logging out…' : 'Logout'}
              </button>
            </>
          ) : null}

          <button className="gradient-btn small header-start-btn" onClick={() => openRoute(ROUTES.INTERVIEW_SETUP)}>
            Get Started <ArrowForward />
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
