import Logo from '../brand/Logo'

export default function Footer() {
  return (
    <footer className="footer cosmic-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Logo />
          <p>Practice smarter. Interview better. Get hired.</p>
        </div>

        <div className="footer-status">
          <span className="footer-status-dot" />
          <span>AI Interview Lab</span>
        </div>
      </div>

      <div className="footer-bottom">
        <small>© 2026 ApnaAcademy. All rights reserved.</small>
        <span className="footer-divider" />
        <small>Built for focused interview practice.</small>
      </div>
    </footer>
  )
}
