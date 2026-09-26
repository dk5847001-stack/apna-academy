import Logo from '../brand/Logo'

const APP_LINKS = [
  { label: 'ApnaAcademy', href: 'https://apnaacademy.me' },
  { label: 'Courses', href: 'https://course.apnaacademy.me' },
  { label: 'DSA', href: 'https://dsa.apnaacademy.me' },
  { label: 'Student Dashboard', href: 'https://dashboard.apnaacademy.me' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <Logo />
        <p>Practice smarter. Interview better. Get hired.</p>
      </div>

      <nav className="footer-apps" aria-label="ApnaAcademy applications">
        <span>Explore ApnaAcademy</span>
        <div>
          {APP_LINKS.map((app) => (
            <a key={app.href} href={app.href}>
              {app.label}
            </a>
          ))}
          <span className="footer-current">Interview</span>
        </div>
      </nav>

      <small className="footer-copyright">© 2026 ApnaAcademy. All rights reserved.</small>
    </footer>
  )
}
