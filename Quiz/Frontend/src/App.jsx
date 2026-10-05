import { useMemo, useState } from 'react'
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
