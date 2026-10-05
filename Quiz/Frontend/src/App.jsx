import './App.css'

const categories = [
  { label: 'Engineering', detail: 'B.Tech & technical subjects', icon: '01' },
  { label: 'Computer Applications', detail: 'BCA, MCA & programming', icon: '02' },
  { label: 'Business & Management', detail: 'BBA, MBA & commerce', icon: '03' },
  { label: 'Aptitude & Placement', detail: 'Reasoning, aptitude & mocks', icon: '04' },
]

const featuredQuizzes = [
  { type: 'Practice Quiz', title: 'Java Fundamentals', meta: '20 questions · 20 min', level: 'Easy → Medium' },
  { type: 'Subject Test', title: 'Data Structures & Algorithms', meta: '30 questions · 30 min', level: 'Mixed' },
  { type: 'Placement Test', title: 'Aptitude & Reasoning', meta: '25 questions · 25 min', level: 'Mixed' },
]

const steps = [
  ['01', 'Choose a quiz', 'Find a test by your course, subject, skill or goal.'],
  ['02', 'Take the test', 'Answer focused questions with a clear timer and progress view.'],
  ['03', 'Understand your result', 'See your score, accuracy and areas to improve after every attempt.'],
]

function App() {
  return (
    <div className="quiz-app">
      <header className="site-header">
        <div className="shell-container nav-inner">
          <a className="brand" href="/" aria-label="Apna Academy Quiz home">
            <span className="brand-mark" aria-hidden="true">A</span>
            <span className="brand-copy"><strong>Apna Academy</strong><span>Quiz</span></span>
          </a>
          <nav className="desktop-nav" aria-label="Primary navigation">
            <a className="nav-link nav-link-active" href="/">Home</a>
            <a className="nav-link" href="/quizzes">Quizzes</a>
            <a className="nav-link" href="/leaderboard">Leaderboard</a>
          </nav>
          <div className="nav-actions">
            <a className="button button-ghost nav-profile" href="/profile">Profile</a>
            <a className="button button-primary" href="/quizzes">Explore quizzes <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="shell-container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />Built for student learning</div>
              <p className="kicker">Learn · Test · Compete · Improve</p>
              <h1 id="hero-title">Turn every quiz into a <span>better next attempt.</span></h1>
              <p className="hero-intro">Practice your subjects, test your preparation and understand your performance — all in one focused quiz platform.</p>
              <div className="action-row">
                <a className="button button-primary button-large" href="/quizzes">Explore quizzes <span aria-hidden="true">→</span></a>
                <a className="button button-secondary button-large" href="/leaderboard">See leaderboard</a>
              </div>
              <div className="hero-trust" aria-label="Platform benefits">
                <span>✓ Timed tests</span><span>✓ Instant results</span><span>✓ Performance insights</span>
              </div>
            </div>

            <div className="hero-visual" aria-label="Quiz experience preview">
              <div className="hero-orb hero-orb-one" aria-hidden="true" />
              <div className="hero-orb hero-orb-two" aria-hidden="true" />
              <div className="quiz-preview-card">
                <div className="preview-top"><span>Java Fundamentals</span><span className="preview-live">Practice</span></div>
                <div className="preview-progress"><span style={{ width: '62%' }} /></div>
                <div className="preview-meta"><span>Question 12 of 20</span><strong>08:42</strong></div>
                <p className="preview-question">Which keyword is used to inherit a class in Java?</p>
                <div className="preview-options">
                  <div>A. implements</div>
                  <div className="preview-option-selected">B. extends <span>✓</span></div>
                  <div>C. inherits</div>
                  <div>D. super</div>
                </div>
                <div className="preview-footer"><span>6 answered · 2 marked</span><span>Next →</span></div>
              </div>
              <div className="score-float"><span>Latest result</span><strong>84%</strong><small>+12% improvement</small></div>
            </div>
          </div>
        </section>

        <section className="section-block" aria-labelledby="categories-title">
          <div className="shell-container">
            <div className="section-heading"><div><p className="section-label">Find your path</p><h2 id="categories-title">Quizzes for where you are learning.</h2></div><a className="text-link" href="/quizzes">View all quizzes →</a></div>
            <div className="category-grid">
              {categories.map((category) => (
                <a className="category-card" href="/quizzes" key={category.label}>
                  <span className="category-index">{category.icon}</span>
                  <span><strong>{category.label}</strong><small>{category.detail}</small></span>
                  <span className="card-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block featured-section" aria-labelledby="featured-title">
          <div className="shell-container">
            <div className="section-heading"><div><p className="section-label">Start practicing</p><h2 id="featured-title">Popular quiz formats, ready when you are.</h2></div><a className="text-link" href="/quizzes">Browse catalogue →</a></div>
            <div className="featured-grid">
              {featuredQuizzes.map((quiz) => (
                <article className="quiz-card" key={quiz.title}>
                  <div className="quiz-card-top"><span className="soft-badge">{quiz.type}</span><span className="quiz-level">{quiz.level}</span></div>
                  <h3>{quiz.title}</h3>
                  <p>{quiz.meta}</p>
                  <a href="/quizzes" className="quiz-card-link">View quiz details <span aria-hidden="true">→</span></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process-section" aria-labelledby="process-title">
          <div className="shell-container">
            <div className="process-intro"><p className="section-label">Simple by design</p><h2 id="process-title">Three steps from practice to progress.</h2><p>No complicated setup. Pick a quiz, focus on the questions, then use your result to decide what to do next.</p></div>
            <div className="steps-list">
              {steps.map(([number, title, description]) => (
                <div className="step" key={number}><span className="step-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div></div>
              ))}
            </div>
          </div>
        </section>

        <section className="benefits-section" aria-labelledby="benefits-title">
          <div className="shell-container benefits-grid">
            <div><p className="section-label">Built around improvement</p><h2 id="benefits-title">A quiz should tell you more than a score.</h2><p className="benefits-copy">Every attempt is designed to help you understand accuracy, strengths and gaps so your next study session has a clear direction.</p></div>
            <div className="benefit-points">
              <div><strong>Focused attempts</strong><span>Clear questions, progress and timing without unnecessary distraction.</span></div>
              <div><strong>Useful results</strong><span>See correct, incorrect, skipped and accuracy signals after submission.</span></div>
              <div><strong>Fair competition</strong><span>Compare performance through privacy-conscious leaderboards.</span></div>
            </div>
          </div>
        </section>

        <section className="leaderboard-preview" aria-labelledby="leaderboard-title">
          <div className="shell-container leaderboard-inner">
            <div><p className="section-label">Compete fairly</p><h2 id="leaderboard-title">Ready to see where you stand?</h2><p>Track your performance and compare results without exposing private contact details.</p></div>
            <a className="button button-light" href="/leaderboard">Open leaderboard <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <section className="final-cta" aria-labelledby="cta-title">
          <div className="shell-container cta-card">
            <p className="section-label">Your next attempt starts here</p>
            <h2 id="cta-title">Choose a quiz. Test yourself. Improve.</h2>
            <p>Start with a subject you know, or challenge yourself with something new.</p>
            <a className="button button-primary button-large" href="/quizzes">Explore all quizzes <span aria-hidden="true">→</span></a>
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
