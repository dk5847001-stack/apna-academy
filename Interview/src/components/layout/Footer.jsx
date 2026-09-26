import { ArrowForwardRounded, AutoAwesomeRounded, ArrowUpwardRounded, BoltRounded, GridViewRounded, HeadsetMicRounded, MailOutlineRounded } from '@mui/icons-material'
import { useRouter } from '../../routes/Router'
import { ROUTES } from '../../routes/routes'
import CosmicField from '../common/CosmicField'
import Logo from '../brand/Logo'

const APPS = {
  academy: 'https://apnaacademy.me',
  courses: 'https://course.apnaacademy.me',
  dsa: 'https://dsa.apnaacademy.me',
  dashboard: 'https://dashboard.apnaacademy.me',
}

export default function Footer() {
  const { navigate } = useRouter()

  const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="footer cosmic-footer cosmic-footer-v2">
      <CosmicField density="nav" />

      <div className="cosmic-footer-panel">
        <div className="footer-v2-main">
          <section className="footer-v2-brand">
            <Logo />
            <strong>Practice. Improve. Get Hired.</strong>
            <p>AI-powered interview preparation built to help you practice realistic conversations, improve your confidence and prepare with purpose.</p>

            <button className="footer-lab-button" type="button" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}>
              <span className="footer-lab-icon"><AutoAwesomeRounded /></span>
              <span><strong>AI Interview Lab</strong><small>Live &amp; Ready</small></span>
              <ArrowForwardRounded />
            </button>
          </section>

          <nav className="footer-v2-column" aria-label="Interview navigation">
            <h3><BoltRounded /> Quick Links</h3>
            <a href={ROUTES.HOME} onClick={(e) => { e.preventDefault(); navigate(ROUTES.HOME) }}>Home</a>
            <a href={ROUTES.INTERVIEW_SETUP} onClick={(e) => { e.preventDefault(); navigate(ROUTES.INTERVIEW_SETUP) }}>Interview</a>
            <a href={ROUTES.HISTORY} onClick={(e) => { e.preventDefault(); navigate(ROUTES.HISTORY) }}>History</a>
            <a href={ROUTES.LOGIN} onClick={(e) => { e.preventDefault(); navigate(ROUTES.LOGIN) }}>Login</a>
            <a href={ROUTES.INTERVIEW_SETUP} onClick={(e) => { e.preventDefault(); navigate(ROUTES.INTERVIEW_SETUP) }}>Get Started <ArrowForwardRounded /></a>
          </nav>

          <nav className="footer-v2-column" aria-label="ApnaAcademy apps">
            <h3><GridViewRounded /> Platform</h3>
            <a href={APPS.academy}>ApnaAcademy</a>
            <a href={APPS.courses}>Courses</a>
            <a href={APPS.dsa}>DSA</a>
            <a href={APPS.dashboard}>Student Dashboard</a>
          </nav>

          <section className="footer-v2-connected">
            <h3><HeadsetMicRounded /> Stay Connected</h3>
            <p>Explore the ApnaAcademy ecosystem and continue your learning journey.</p>

            <a className="footer-mail-button" href="mailto:info@apnaacademy.me">
              <MailOutlineRounded />
              <span>info@apnaacademy.me</span>
              <ArrowForwardRounded />
            </a>

            <div className="footer-socials">
              <a href="https://github.com/dk5847001-stack/apna-academy" target="_blank" rel="noreferrer" aria-label="GitHub">GH</a>
              <a href="https://www.linkedin.com/in/dilkhush-kumar-43a426372" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
              <a href="https://apnaacademy.me" aria-label="ApnaAcademy">AA</a>
            </div>
          </section>
        </div>

        <div className="footer-v2-bottom">
          <div className="footer-address">
            <span className="footer-address-icon"><GridViewRounded /></span>
            <span>ApnaAcademy · India</span>
          </div>

          <small>© 2026 ApnaAcademy. All rights reserved.</small>

          <div className="footer-bottom-actions">
            <span className="footer-live"><span /> AI Interview Lab</span>
            <button type="button" className="footer-top-button" onClick={goTop}>
              <ArrowUpwardRounded />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
