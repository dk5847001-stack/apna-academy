import './App.css'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Quizzes', href: '/quizzes' },
  { label: 'Leaderboard', href: '/leaderboard' },
]

function App() {
  return (
    <div className="quiz-app">
      <header className="site-header">
        <div className="shell-container nav-inner">
          <a className="brand" href="/" aria-label="Apna Academy Quiz home">
            <span className="brand-mark" aria-hidden="true">A</span>
            <span className="brand-copy">
              <strong>Apna Academy</strong>
              <span>Quiz</span>
            </span>
          </a>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a className="nav-link" href={item.href} key={item.label}>{item.label}</a>
            ))}
          </nav>
          <div className="nav-actions">
            <a className="button button-ghost nav-profile" href="/profile">Profile</a>
            <a className="button button-primary" href="/quizzes">Explore quizzes <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </header>

      <main className="shell-container app-main">
        <section className="system-preview" aria-labelledby="system-title">
          <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />Quiz platform</div>
          <div className="preview-grid">
            <div className="preview-copy">
              <p className="kicker">Learn · Test · Compete · Improve</p>
              <h1 id="system-title">A focused quiz experience built for students.</h1>
              <p className="intro">
                A clean, fast foundation for discovering quizzes, taking timed tests,
                reviewing performance, and competing fairly.
              </p>
              <div className="action-row">
                <a className="button button-primary button-large" href="/quizzes">Browse quizzes <span aria-hidden="true">→</span></a>
                <a className="button button-secondary button-large" href="/leaderboard">View leaderboard</a>
              </div>
            </div>

            <aside className="status-card" aria-label="Platform design principles">
              <div className="status-card-top">
                <span className="status-label">Experience principles</span>
                <span className="status-live">Ready</span>
              </div>
              <div className="principle-list">
                <div className="principle">
                  <span className="principle-number">01</span>
                  <div><strong>Clear by default</strong><p>Simple hierarchy and obvious next actions.</p></div>
                </div>
                <div className="principle">
                  <span className="principle-number">02</span>
                  <div><strong>Calm while testing</strong><p>Less distraction when accuracy matters.</p></div>
                </div>
                <div className="principle">
                  <span className="principle-number">03</span>
                  <div><strong>Useful after every attempt</strong><p>Results are designed to support improvement.</p></div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell-container footer-inner">
          <div><strong>Apna Academy Quiz</strong><p>Practice with purpose. Measure your progress.</p></div>
          <div className="footer-links"><a href="/about">About</a><a href="/help">Help</a><a href="/privacy">Privacy</a></div>
          <p className="copyright">© 2026 Apna Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
