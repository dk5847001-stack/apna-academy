import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'apnaAcademyQuiz.studentProfile'

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

const degreeOptions = ['B.Tech', 'BCA', 'BBA', 'MBA', 'MCA', 'Diploma', 'Other UG/PG']

const branchOptions = {
  'B.Tech': ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical / EEE', 'Mechanical', 'Civil', 'Chemical', 'Artificial Intelligence & Machine Learning', 'Data Science', 'Other'],
  BCA: ['Computer Applications', 'Software Development', 'Data Analytics', 'Other'],
  BBA: ['General Management', 'Finance', 'Marketing', 'Human Resources', 'Other'],
  MBA: ['Finance', 'Marketing', 'Human Resources', 'Operations', 'Business Analytics', 'Other'],
  MCA: ['Computer Applications', 'Software Engineering', 'Data Science', 'AI & ML', 'Other'],
  Diploma: ['Computer Science', 'IT', 'Electronics', 'Mechanical', 'Civil', 'Other'],
  'Other UG/PG': ['Other'],
}


const quizCatalogue = [
  { id: 'java-fundamentals', type: 'Practice Quiz', title: 'Java Fundamentals', description: 'Build confidence with core Java syntax, operators, conditions, loops and object-oriented basics.', degree: 'B.Tech', branch: 'Computer Science & Engineering', subject: 'Java', difficulty: 'Easy', duration: 20, questions: 20, marks: 20, negativeMarking: 'No', attempts: '3 attempts', level: 'Beginner friendly', tags: ['Java', 'Programming', 'Fundamentals'] },
  { id: 'dsa-java', type: 'Subject Test', title: 'Data Structures & Algorithms with Java', description: 'Test arrays, strings, searching, sorting, stacks, queues and core algorithmic thinking.', degree: 'B.Tech', branch: 'Computer Science & Engineering', subject: 'DSA', difficulty: 'Mixed', duration: 30, questions: 30, marks: 30, negativeMarking: '0.25 per wrong answer', attempts: '2 attempts', level: 'Intermediate', tags: ['DSA', 'Java', 'Placement'] },
  { id: 'dbms-core', type: 'Subject Test', title: 'DBMS Core Concepts', description: 'Check your understanding of databases, keys, normalization, SQL and transactions.', degree: 'B.Tech', branch: 'Computer Science & Engineering', subject: 'DBMS', difficulty: 'Medium', duration: 25, questions: 25, marks: 25, negativeMarking: 'No', attempts: '3 attempts', level: 'Intermediate', tags: ['DBMS', 'SQL', 'Databases'] },
  { id: 'os-fundamentals', type: 'Subject Test', title: 'Operating Systems Fundamentals', description: 'Practice processes, threads, scheduling, memory management, deadlocks and file systems.', degree: 'B.Tech', branch: 'Computer Science & Engineering', subject: 'Operating Systems', difficulty: 'Medium', duration: 25, questions: 25, marks: 25, negativeMarking: '0.25 per wrong answer', attempts: '2 attempts', level: 'Intermediate', tags: ['OS', 'Systems', 'Core CS'] },
  { id: 'web-development', type: 'Practice Quiz', title: 'Web Development Essentials', description: 'Revise HTML, CSS, JavaScript, HTTP and modern web development fundamentals.', degree: 'BCA', branch: 'Software Development', subject: 'Web Development', difficulty: 'Easy', duration: 20, questions: 20, marks: 20, negativeMarking: 'No', attempts: '3 attempts', level: 'Beginner friendly', tags: ['HTML', 'CSS', 'JavaScript'] },
  { id: 'aptitude-placement', type: 'Placement Test', title: 'Aptitude & Reasoning', description: 'Prepare for placement tests with quantitative aptitude, logical reasoning and pattern questions.', degree: 'Other UG/PG', branch: 'Other', subject: 'Aptitude', difficulty: 'Mixed', duration: 25, questions: 25, marks: 25, negativeMarking: '0.25 per wrong answer', attempts: '2 attempts', level: 'Placement focused', tags: ['Aptitude', 'Reasoning', 'Placement'] },
  { id: 'business-management', type: 'Practice Quiz', title: 'Business & Management Basics', description: 'Test fundamentals of management, marketing, finance and organizational concepts.', degree: 'BBA', branch: 'General Management', subject: 'Business', difficulty: 'Easy', duration: 20, questions: 20, marks: 20, negativeMarking: 'No', attempts: '3 attempts', level: 'Beginner friendly', tags: ['Business', 'Management', 'BBA'] },
  { id: 'ai-ml-foundations', type: 'Competitive Quiz', title: 'AI & ML Foundations', description: 'Challenge yourself with machine learning concepts, data preparation and model fundamentals.', degree: 'B.Tech', branch: 'Artificial Intelligence & Machine Learning', subject: 'AI & ML', difficulty: 'Hard', duration: 30, questions: 30, marks: 30, negativeMarking: '0.25 per wrong answer', attempts: '1 attempt', level: 'Advanced', tags: ['AI', 'ML', 'Data Science'] },
]

const catalogueFilters = {
  degree: ['All degrees', ...degreeOptions],
  type: ['All types', 'Practice Quiz', 'Subject Test', 'Placement Test', 'Competitive Quiz'],
  subject: ['All subjects', 'Java', 'DSA', 'DBMS', 'Operating Systems', 'Web Development', 'Aptitude', 'Business', 'AI & ML'],
  difficulty: ['All levels', 'Easy', 'Medium', 'Hard', 'Mixed'],
  duration: ['Any duration', 'Under 20 min', '20–25 min', '26–30 min'],
}


const quizQuestions = {
  'java-fundamentals': [
    { id: 'q1', text: 'Which keyword is used to inherit a class in Java?', options: ['implements', 'extends', 'inherits', 'super'] },
    { id: 'q2', text: 'Which data type stores a single 16-bit Unicode character?', options: ['byte', 'char', 'short', 'String'] },
    { id: 'q3', text: 'Which loop is guaranteed to execute its body at least once?', options: ['for', 'while', 'do-while', 'enhanced for'] },
    { id: 'q4', text: 'Which method is the entry point of a standard Java application?', options: ['start()', 'run()', 'main()', 'execute()'] },
    { id: 'q5', text: 'Which collection does not allow duplicate elements?', options: ['List', 'Set', 'Queue', 'ArrayList'] },
  ],
  'dsa-java': [
    { id: 'q1', text: 'Which data structure follows LIFO order?', options: ['Queue', 'Stack', 'Linked List', 'Heap'] },
    { id: 'q2', text: 'What is the average time complexity of binary search on a sorted array?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'] },
    { id: 'q3', text: 'Which traversal visits a binary search tree in sorted order?', options: ['Preorder', 'Postorder', 'Inorder', 'Level order'] },
    { id: 'q4', text: 'Which sorting algorithm is stable in its standard implementation?', options: ['Selection sort', 'Merge sort', 'Heap sort', 'Quick sort'] },
    { id: 'q5', text: 'Which structure is commonly used for breadth-first search?', options: ['Stack', 'Queue', 'Set only', 'Recursion stack'] },
  ],
  'dbms-core': [
    { id: 'q1', text: 'Which key uniquely identifies a row in a relational table?', options: ['Foreign key', 'Primary key', 'Candidate value', 'Index only'] },
    { id: 'q2', text: 'Which normal form removes partial dependency?', options: ['1NF', '2NF', '3NF', 'BCNF'] },
    { id: 'q3', text: 'Which SQL command is used to retrieve data?', options: ['GET', 'SELECT', 'FETCHROW', 'READ'] },
    { id: 'q4', text: 'A foreign key primarily establishes what?', options: ['Sorting', 'A relationship between tables', 'Encryption', 'Compression'] },
    { id: 'q5', text: 'Which property means a transaction is treated as an indivisible unit?', options: ['Consistency', 'Isolation', 'Atomicity', 'Durability'] },
  ],
}

const initialProfile = {
  name: '',
  rollNumber: '',
  mobile: '',
  email: '',
  college: '',
  degree: '',
  branch: '',
  semesterYear: '',
  city: '',
  state: '',
  bio: '',
}

function readProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...initialProfile, ...JSON.parse(stored) } : null
  } catch {
    return null
  }
}

function getPath() {
  return window.location.pathname.replace(/\/+$/, '') || '/'
}

function App() {
  const [path] = useState(getPath)
  const profile = readProfile()

  if (path === '/register') return <RegistrationPage existingProfile={profile} />
  if (path === '/profile') return <ProfilePage profile={profile} />
  if (path === '/quizzes') return <QuizCataloguePage />
  if (path.startsWith('/quizzes/')) return <QuizDetailsPage quizId={path.split('/')[2]} profile={profile} />
  if (path.startsWith('/quiz/')) return <QuizEnginePage attemptId={path.split('/')[2]} profile={profile} />
  return <LandingPage />
}

function SiteHeader({ profile }) {
  return (
    <header className="site-header">
      <div className="shell-container nav-inner">
        <a className="brand" href="/" aria-label="Apna Academy Quiz home">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span className="brand-copy"><strong>Apna Academy</strong><span>Quiz</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a className="nav-link" href="/">Home</a>
          <a className="nav-link" href="/quizzes">Quizzes</a>
          <a className="nav-link" href="/leaderboard">Leaderboard</a>
        </nav>
        <div className="nav-actions">
          <a className="button button-ghost nav-profile" href={profile ? '/profile' : '/register'}>
            {profile ? 'Profile' : 'Register'}
          </a>
          <a className="button button-primary" href="/quizzes">Explore quizzes <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell-container footer-inner">
        <div><strong>Apna Academy Quiz</strong><p>Practice with purpose. Measure your progress.</p></div>
        <div className="footer-links"><a href="/about">About</a><a href="/help">Help</a><a href="/privacy">Privacy</a></div>
        <p className="copyright">© 2026 Apna Academy. All rights reserved.</p>
      </div>
    </footer>
  )
}

function LandingPage() {
  const profile = readProfile()

  return (
    <div className="quiz-app">
      <SiteHeader profile={profile} />
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
                <a className="button button-secondary button-large" href={profile ? '/profile' : '/register'}>{profile ? 'View profile' : 'Create student profile'}</a>
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
      <SiteFooter />
    </div>
  )
}


function QuizCataloguePage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ degree: 'All degrees', type: 'All types', subject: 'All subjects', difficulty: 'All levels', duration: 'Any duration' })

  const filteredQuizzes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return quizCatalogue.filter((quiz) => {
      const matchesQuery = !normalizedQuery || [quiz.title, quiz.description, quiz.subject, quiz.type, ...quiz.tags].join(' ').toLowerCase().includes(normalizedQuery)
      const matchesDegree = filters.degree === 'All degrees' || quiz.degree === filters.degree
      const matchesType = filters.type === 'All types' || quiz.type === filters.type
      const matchesSubject = filters.subject === 'All subjects' || quiz.subject === filters.subject
      const matchesDifficulty = filters.difficulty === 'All levels' || quiz.difficulty === filters.difficulty
      const matchesDuration = filters.duration === 'Any duration'
        || (filters.duration === 'Under 20 min' && quiz.duration < 20)
        || (filters.duration === '20–25 min' && quiz.duration >= 20 && quiz.duration <= 25)
        || (filters.duration === '26–30 min' && quiz.duration >= 26 && quiz.duration <= 30)
      return matchesQuery && matchesDegree && matchesType && matchesSubject && matchesDifficulty && matchesDuration
    })
  }, [filters, query])

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function resetFilters() {
    setQuery('')
    setFilters({ degree: 'All degrees', type: 'All types', subject: 'All subjects', difficulty: 'All levels', duration: 'Any duration' })
  }

  return (
    <div className="quiz-app">
      <SiteHeader profile={readProfile()} />
      <main className="catalogue-main">
        <section className="catalogue-hero">
          <div className="shell-container">
            <p className="section-label">Quiz catalogue</p>
            <h1>Find the right quiz for your next goal.</h1>
            <p>Search by subject, filter by your academic path and choose a focused test that matches your preparation level.</p>
            <label className="catalogue-search">
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Java, DSA, aptitude, DBMS..." aria-label="Search quizzes" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
            </label>
          </div>
        </section>

        <section className="catalogue-content" aria-labelledby="catalogue-results-title">
          <div className="shell-container catalogue-layout">
            <aside className="filter-panel" aria-label="Quiz filters">
              <div className="filter-heading"><div><strong>Filter quizzes</strong><span>Refine your search</span></div><button type="button" onClick={resetFilters}>Reset</button></div>
              {Object.entries(catalogueFilters).map(([name, options]) => (
                <label className="filter-field" key={name}>
                  <span>{name === 'degree' ? 'Degree' : name === 'type' ? 'Quiz type' : name === 'subject' ? 'Subject' : name === 'difficulty' ? 'Difficulty' : 'Duration'}</span>
                  <select value={filters[name]} onChange={(event) => updateFilter(name, event.target.value)}>
                    {options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              ))}
            </aside>

            <div className="catalogue-results">
              <div className="results-heading">
                <div><p className="section-label">Explore</p><h2 id="catalogue-results-title">{filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'} available</h2></div>
                <span>{query ? 'Search results' : 'Curated for students'}</span>
              </div>
              {filteredQuizzes.length > 0 ? (
                <div className="catalogue-grid">
                  {filteredQuizzes.map((quiz) => <QuizCard quiz={quiz} key={quiz.id} />)}
                </div>
              ) : (
                <div className="catalogue-empty">
                  <span>⌕</span><h3>No quizzes match these filters.</h3><p>Try a different subject, degree or difficulty, or reset the filters.</p><button className="button button-secondary" type="button" onClick={resetFilters}>Clear filters</button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function QuizCard({ quiz }) {
  return (
    <article className="catalogue-card">
      <div className="catalogue-card-top"><span className="soft-badge">{quiz.type}</span><span className="quiz-level">{quiz.difficulty}</span></div>
      <h3>{quiz.title}</h3>
      <p className="catalogue-description">{quiz.description}</p>
      <div className="quiz-meta-grid">
        <span><b>{quiz.questions}</b> Questions</span><span><b>{quiz.duration}</b> Minutes</span><span><b>{quiz.marks}</b> Marks</span>
      </div>
      <div className="catalogue-tags">{quiz.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
      <a className="button button-primary catalogue-card-button" href={`/quizzes/${quiz.id}`}>View details <span aria-hidden="true">→</span></a>
    </article>
  )
}

function QuizDetailsPage({ quizId, profile }) {
  const quiz = quizCatalogue.find((item) => item.id === quizId)

  if (!quiz) {
    return (
      <div className="quiz-app">
        <SiteHeader profile={profile} />
        <main className="account-main"><section className="account-shell"><div className="empty-account"><p className="section-label">Quiz not found</p><h1>This quiz is no longer available.</h1><p>Return to the catalogue to explore the currently available tests.</p><a className="button button-primary button-large" href="/quizzes">Browse quizzes <span aria-hidden="true">→</span></a></div></section></main>
        <SiteFooter />
      </div>
    )
  }

  const startHref = profile ? `/quiz/${quiz.id}` : '/register'

  return (
    <div className="quiz-app">
      <SiteHeader profile={profile} />
      <main className="quiz-details-main">
        <section className="details-hero">
          <div className="shell-container details-hero-grid">
            <div>
              <a className="back-link" href="/quizzes">← Back to quizzes</a>
              <div className="details-badges"><span className="soft-badge">{quiz.type}</span><span>{quiz.difficulty}</span></div>
              <h1>{quiz.title}</h1>
              <p>{quiz.description}</p>
              <div className="details-tags">{quiz.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            <div className="details-start-card">
              <div className="start-stat"><span>Questions</span><strong>{quiz.questions}</strong></div>
              <div className="start-stat"><span>Duration</span><strong>{quiz.duration} min</strong></div>
              <div className="start-stat"><span>Total marks</span><strong>{quiz.marks}</strong></div>
              <a className="button button-primary button-large" href={startHref}>{profile ? 'Continue to quiz' : 'Register to continue'} <span aria-hidden="true">→</span></a>
              {!profile && <small>Create your student profile before starting your first attempt.</small>}
            </div>
          </div>
        </section>

        <section className="details-body">
          <div className="shell-container details-body-grid">
            <article className="details-main-card">
              <p className="section-label">About this quiz</p>
              <h2>Know what to expect before you start.</h2>
              <p>This {quiz.type.toLowerCase()} is designed around focused questions and a clear time limit. Your final score will be calculated by the quiz system after submission in a later phase.</p>
              <div className="details-rule-grid">
                <div><span>Difficulty</span><strong>{quiz.difficulty}</strong></div>
                <div><span>Negative marking</span><strong>{quiz.negativeMarking}</strong></div>
                <div><span>Attempts</span><strong>{quiz.attempts}</strong></div>
                <div><span>Level</span><strong>{quiz.level}</strong></div>
              </div>
            </article>
            <aside className="details-side-card">
              <p className="section-label">Best for</p>
              <h3>{quiz.degree}</h3>
              <p>{quiz.branch}</p>
              <div><span>Subject</span><strong>{quiz.subject}</strong></div>
              <div><span>Result</span><strong>Shown after submission</strong></div>
              <a className="text-link" href="/quizzes">Explore similar quizzes →</a>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function QuizEnginePage({ attemptId, profile }) {
  const quiz = quizCatalogue.find((item) => item.id === attemptId)
  const questions = quizQuestions[attemptId]

  if (!profile) {
    return (
      <div className="quiz-app">
        <SiteHeader profile={null} />
        <main className="account-main"><section className="account-shell"><div className="empty-account"><p className="section-label">Registration required</p><h1>Create your student profile first.</h1><p>Your profile is used to identify the attempt. The secure server-backed attempt flow will be connected in the backend phase.</p><a className="button button-primary button-large" href="/register">Create profile <span aria-hidden="true">→</span></a></div></section></main>
        <SiteFooter />
      </div>
    )
  }

  if (!quiz || !questions) {
    return (
      <div className="quiz-app">
        <SiteHeader profile={profile} />
        <main className="account-main"><section className="account-shell"><div className="empty-account"><p className="section-label">Quiz unavailable</p><h1>This quiz cannot be started yet.</h1><p>The selected quiz does not have an active question set in this frontend phase.</p><a className="button button-primary button-large" href="/quizzes">Back to quizzes</a></div></section></main>
        <SiteFooter />
      </div>
    )
  }

  const storageKey = `apnaAcademyQuiz.attempt.${attemptId}`
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [marked, setMarked] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(quiz.duration * 60)
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null')
      if (saved) {
        setCurrentIndex(Math.min(saved.currentIndex || 0, questions.length - 1))
        setAnswers(saved.answers || {})
        setMarked(saved.marked || {})
        setSecondsLeft(typeof saved.secondsLeft === 'number' ? saved.secondsLeft : quiz.duration * 60)
      }
    } catch {}
  }, [storageKey, questions.length, quiz.duration])

  useEffect(() => {
    if (submitted) return undefined
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setShowSubmit(true)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [submitted])

  useEffect(() => {
    if (submitted) return
    sessionStorage.setItem(storageKey, JSON.stringify({ currentIndex, answers, marked, secondsLeft }))
  }, [storageKey, currentIndex, answers, marked, secondsLeft, submitted])

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const markedCount = Object.values(marked).filter(Boolean).length
  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  function chooseAnswer(optionIndex) {
    setAnswers((current) => ({ ...current, [currentQuestion.id]: optionIndex }))
  }

  function goNext() {
    setCurrentIndex((current) => Math.min(current + 1, questions.length - 1))
  }

  function goPrevious() {
    setCurrentIndex((current) => Math.max(current - 1, 0))
  }

  function toggleMarked() {
    setMarked((current) => ({ ...current, [currentQuestion.id]: !current[currentQuestion.id] }))
  }

  function submitAttempt() {
    setShowSubmit(false)
    setSubmitted(true)
    sessionStorage.removeItem(storageKey)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (submitted) {
    return (
      <div className="quiz-app">
        <SiteHeader profile={profile} />
        <main className="quiz-room-main">
          <section className="quiz-result-shell shell-container">
            <div className="quiz-result-card">
              <span className="success-icon" aria-hidden="true">✓</span>
              <p className="section-label">Attempt submitted</p>
              <h1>Your answers are saved for the next phase.</h1>
              <p>The quiz engine UI is complete. Secure server scoring, final result calculation and leaderboard ranking will be connected in the backend phase.</p>
              <div className="result-summary-grid">
                <div><span>Answered</span><strong>{answeredCount}</strong></div>
                <div><span>Unanswered</span><strong>{questions.length - answeredCount}</strong></div>
                <div><span>Marked</span><strong>{markedCount}</strong></div>
                <div><span>Time used</span><strong>{formatTime(quiz.duration * 60 - secondsLeft)}</strong></div>
              </div>
              <div className="action-row center-actions"><a className="button button-primary button-large" href="/quizzes">Back to quizzes</a><a className="button button-secondary button-large" href="/profile">View profile</a></div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="quiz-app quiz-room-app">
      <SiteHeader profile={profile} />
      <main className="quiz-room-main">
        <section className="quiz-room-header">
          <div className="shell-container">
            <div className="quiz-room-title"><div><p className="section-label">Live attempt</p><h1>{quiz.title}</h1></div><div className={secondsLeft <= 60 ? 'timer timer-warning' : 'timer'} aria-label={`Time remaining ${formatTime(secondsLeft)}`}><span>Time left</span><strong>{formatTime(secondsLeft)}</strong></div></div>
            <div className="quiz-room-progress"><span style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div>
            <div className="quiz-room-progress-meta"><span>Question {currentIndex + 1} of {questions.length}</span><span>{answeredCount} answered · {markedCount} marked</span></div>
          </div>
        </section>

        <section className="quiz-room-content">
          <div className="shell-container quiz-room-grid">
            <aside className="question-palette" aria-label="Question navigation">
              <div className="palette-heading"><strong>Questions</strong><span>{answeredCount}/{questions.length}</span></div>
              <div className="palette-grid">
                {questions.map((question, index) => {
                  const answered = answers[question.id] !== undefined
                  const isMarked = Boolean(marked[question.id])
                  const active = index === currentIndex
                  return <button key={question.id} type="button" className={`palette-button${active ? ' is-active' : ''}${answered ? ' is-answered' : ''}${isMarked ? ' is-marked' : ''}`} onClick={() => setCurrentIndex(index)} aria-label={`Question ${index + 1}${answered ? ', answered' : ''}${isMarked ? ', marked for review' : ''}`}>{index + 1}</button>
                })}
              </div>
              <div className="palette-legend"><span><i className="legend-current" />Current</span><span><i className="legend-answered" />Answered</span><span><i className="legend-marked" />Review</span></div>
            </aside>

            <article className="question-card" aria-labelledby={`question-${currentQuestion.id}`}>
              <div className="question-card-top"><span>Question {currentIndex + 1}</span>{marked[currentQuestion.id] && <span className="review-badge">Marked for review</span>}</div>
              <h2 id={`question-${currentQuestion.id}`}>{currentQuestion.text}</h2>
              <div className="answer-list">
                {currentQuestion.options.map((option, index) => {
                  const selected = answers[currentQuestion.id] === index
                  return <button key={option} type="button" className={`answer-option${selected ? ' is-selected' : ''}`} onClick={() => chooseAnswer(index)} aria-pressed={selected}><span className="option-key">{String.fromCharCode(65 + index)}</span><span>{option}</span>{selected && <span className="answer-check" aria-hidden="true">✓</span>}</button>
                })}
              </div>
              <div className="question-actions">
                <button type="button" className="button button-secondary" onClick={toggleMarked}>{marked[currentQuestion.id] ? 'Remove review mark' : 'Mark for review'}</button>
                <div><button type="button" className="button button-secondary" onClick={goPrevious} disabled={currentIndex === 0}>Previous</button>{currentIndex < questions.length - 1 ? <button type="button" className="button button-primary" onClick={goNext}>Save & next <span aria-hidden="true">→</span></button> : <button type="button" className="button button-primary" onClick={() => setShowSubmit(true)}>Submit quiz</button>}</div>
              </div>
            </article>
          </div>
        </section>
      </main>
      {showSubmit && <div className="submit-overlay" role="dialog" aria-modal="true" aria-labelledby="submit-title"><div className="submit-dialog"><p className="section-label">Finish attempt</p><h2 id="submit-title">Submit this quiz?</h2><p>You have answered {answeredCount} of {questions.length} questions. You can still go back and review your answers.</p><div className="action-row"><button className="button button-secondary" type="button" onClick={() => setShowSubmit(false)}>Continue quiz</button><button className="button button-primary" type="button" onClick={submitAttempt}>Submit attempt</button></div></div></div>}
      <SiteFooter />
    </div>
  )
}

function RegistrationPage({ existingProfile }) {
  const [form, setForm] = useState(existingProfile || initialProfile)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const branches = useMemo(() => branchOptions[form.degree] || [], [form.degree])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value, ...(name === 'degree' ? { branch: '' } : {}) }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function validate() {
    const next = {}
    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
    const mobilePattern = /^[6-9]\\d{9}$/

    if (!form.name.trim()) next.name = 'Enter your full name.'
    if (!form.rollNumber.trim()) next.rollNumber = 'Enter your PRN or roll number.'
    if (!mobilePattern.test(form.mobile.trim())) next.mobile = 'Enter a valid 10-digit mobile number.'
    if (!emailPattern.test(form.email.trim())) next.email = 'Enter a valid email address.'
    if (!form.college.trim()) next.college = 'Enter your college or university.'
    if (!form.degree) next.degree = 'Select your degree.'
    if (!form.branch) next.branch = 'Select your branch or specialization.'
    if (!form.semesterYear) next.semesterYear = 'Select your semester or year.'
    if (!form.city.trim()) next.city = 'Enter your city.'
    if (!form.state.trim()) next.state = 'Enter your state.'
    return next
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setSubmitted(false)
      return
    }

    const cleanProfile = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanProfile))
    setForm(cleanProfile)
    setErrors({})
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (submitted) {
    return (
      <div className="quiz-app">
        <SiteHeader profile={form} />
        <main className="account-main">
          <section className="account-shell">
            <div className="success-card" aria-labelledby="registration-success-title">
              <span className="success-icon" aria-hidden="true">✓</span>
              <p className="section-label">Profile ready</p>
              <h1 id="registration-success-title">You’re ready for your first quiz.</h1>
              <p>Your student profile has been saved on this device. You can review or edit it anytime before the quiz engine is connected.</p>
              <div className="profile-mini">
                <strong>{form.name}</strong>
                <span>{form.degree} · {form.branch}</span>
                <span>{form.college}</span>
              </div>
              <div className="action-row center-actions">
                <a className="button button-primary button-large" href="/quizzes">Continue to quizzes <span aria-hidden="true">→</span></a>
                <a className="button button-secondary button-large" href="/profile">View profile</a>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="quiz-app">
      <SiteHeader profile={existingProfile} />
      <main className="account-main">
        <section className="account-shell" aria-labelledby="registration-title">
          <div className="account-heading">
            <p className="section-label">Student registration</p>
            <h1 id="registration-title">{existingProfile ? 'Update your student profile.' : 'Create your student profile.'}</h1>
            <p>Tell us enough about your academic background to make future quiz discovery and results more relevant.</p>
          </div>
          <form className="profile-form" onSubmit={handleSubmit} noValidate>
            <fieldset>
              <legend>Personal details</legend>
              <div className="form-grid">
                <FormField label="Full name" name="name" value={form.name} onChange={updateField} error={errors.name} placeholder="e.g. Rahul Kumar" required />
                <FormField label="PRN / Roll number" name="rollNumber" value={form.rollNumber} onChange={updateField} error={errors.rollNumber} placeholder="e.g. 23CSE1042" required />
                <FormField label="Mobile number" name="mobile" type="tel" inputMode="numeric" maxLength="10" value={form.mobile} onChange={updateField} error={errors.mobile} placeholder="10-digit mobile number" required />
                <FormField label="Email address" name="email" type="email" value={form.email} onChange={updateField} error={errors.email} placeholder="you@example.com" required />
              </div>
            </fieldset>

            <fieldset>
              <legend>Academic details</legend>
              <div className="form-grid">
                <FormField label="College / University" name="college" value={form.college} onChange={updateField} error={errors.college} placeholder="e.g. Apna University" required />
                <SelectField label="Degree / program" name="degree" value={form.degree} onChange={updateField} error={errors.degree} options={degreeOptions} placeholder="Select degree" required />
                <SelectField label="Branch / specialization" name="branch" value={form.branch} onChange={updateField} error={errors.branch} options={branches} placeholder={form.degree ? 'Select branch' : 'Select degree first'} disabled={!form.degree} required />
                <SelectField label="Semester / year" name="semesterYear" value={form.semesterYear} onChange={updateField} error={errors.semesterYear} options={['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Passed Out']} placeholder="Select current level" required />
              </div>
            </fieldset>

            <fieldset>
              <legend>Location</legend>
              <div className="form-grid">
                <FormField label="City" name="city" value={form.city} onChange={updateField} error={errors.city} placeholder="e.g. Delhi" required />
                <FormField label="State" name="state" value={form.state} onChange={updateField} error={errors.state} placeholder="e.g. Bihar" required />
              </div>
            </fieldset>

            <fieldset>
              <legend>Optional profile</legend>
              <label className="field full-field">
                <span>Short bio <em>Optional</em></span>
                <textarea name="bio" value={form.bio} onChange={updateField} maxLength="240" placeholder="Tell us a little about your learning or career goal." />
                <small>{form.bio.length}/240</small>
              </label>
            </fieldset>

            <div className="form-actions">
              <div><strong>Private by design.</strong><span>Your contact details are not shown on public leaderboards.</span></div>
              <button className="button button-primary button-large" type="submit">{existingProfile ? 'Save changes' : 'Create profile'} <span aria-hidden="true">→</span></button>
            </div>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function FormField({ label, name, value, onChange, error, type = 'text', placeholder, required, inputMode, maxLength }) {
  return (
    <label className="field">
      <span>{label} {required && <b aria-hidden="true">*</b>}</span>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} inputMode={inputMode} maxLength={maxLength} aria-invalid={Boolean(error)} aria-describedby={error ? name + '-error' : undefined} autoComplete={name === 'email' ? 'email' : name === 'mobile' ? 'tel' : 'off'} />
      {error && <small id={name + '-error'} className="field-error">{error}</small>}
    </label>
  )
}

function SelectField({ label, name, value, onChange, error, options, placeholder, disabled, required }) {
  return (
    <label className="field">
      <span>{label} {required && <b aria-hidden="true">*</b>}</span>
      <select name={name} value={value} onChange={onChange} disabled={disabled} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? name + '-error' : undefined}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {error && <small id={name + '-error'} className="field-error">{error}</small>}
    </label>
  )
}

function ProfilePage({ profile }) {
  if (!profile) {
    return (
      <div className="quiz-app">
        <SiteHeader profile={null} />
        <main className="account-main">
          <section className="account-shell">
            <div className="empty-account">
              <p className="section-label">Student profile</p>
              <h1>Your profile is not set up yet.</h1>
              <p>Create your profile once and use it as your identity for future quiz attempts.</p>
              <a className="button button-primary button-large" href="/register">Create student profile <span aria-hidden="true">→</span></a>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="quiz-app">
      <SiteHeader profile={profile} />
      <main className="account-main">
        <section className="account-shell" aria-labelledby="profile-title">
          <div className="profile-header-card">
            <div className="profile-avatar" aria-hidden="true">{profile.name.charAt(0).toUpperCase()}</div>
            <div><p className="section-label">Student profile</p><h1 id="profile-title">{profile.name}</h1><p>{profile.degree} · {profile.branch}</p></div>
            <a className="button button-secondary" href="/register">Edit profile</a>
          </div>
          <div className="profile-detail-grid">
            <ProfileDetail label="PRN / Roll number" value={profile.rollNumber} />
            <ProfileDetail label="Email" value={profile.email} />
            <ProfileDetail label="Mobile" value={profile.mobile} />
            <ProfileDetail label="College / University" value={profile.college} />
            <ProfileDetail label="Semester / year" value={profile.semesterYear} />
            <ProfileDetail label="City / State" value={profile.city + ', ' + profile.state} />
            {profile.bio && <ProfileDetail label="About" value={profile.bio} wide />}
          </div>
          <div className="profile-next-card">
            <div><p className="section-label">Next step</p><h2>Ready to find a quiz?</h2><p>Your profile is prepared for the upcoming quiz discovery and attempt flow.</p></div>
            <a className="button button-primary" href="/quizzes">Explore quizzes <span aria-hidden="true">→</span></a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function ProfileDetail({ label, value, wide = false }) {
  return <div className={wide ? 'profile-detail wide' : 'profile-detail'}><span>{label}</span><strong>{value}</strong></div>
}

export default App
