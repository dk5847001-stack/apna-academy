import { useMemo, useState } from 'react'
import {
  AccessTimeRounded, ArrowBackRounded, ArrowForwardRounded, AutoAwesomeRounded,
  CodeRounded, GroupsRounded, PsychologyRounded, RestartAltRounded,
  SecurityRounded, TerminalRounded,
} from '@mui/icons-material'
import {
  DIFFICULTIES, EXPERIENCE_LEVELS, INTERVIEW_DURATIONS, INTERVIEW_TYPES,
  POPULAR_ROLES, QUESTION_COUNTS, DEFAULT_INTERVIEW_SETUP, validateInterviewSetup,
} from '../data/interviewConfig'
import { useInterviewFlow } from '../context/InterviewFlowContext'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'
import SetupOptionCard from '../components/interview/SetupOptionCard'
import SetupProgress from '../components/interview/SetupProgress'

const typeIcons = { technical: CodeRounded, dsa: TerminalRounded, behavioral: GroupsRounded }
const difficultyColors = { easy: 'green', medium: 'purple', hard: 'orange' }

export default function InterviewSetupPage() {
  const { setup, setSetup } = useInterviewFlow()
  const { navigate } = useRouter()
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState(false)

  const selectedType = useMemo(() => INTERVIEW_TYPES.find((item) => item.value === setup.interviewType), [setup.interviewType])
  const selectedExperience = useMemo(() => EXPERIENCE_LEVELS.find((item) => item.value === setup.experience), [setup.experience])
  const selectedDifficulty = useMemo(() => DIFFICULTIES.find((item) => item.value === setup.difficulty), [setup.difficulty])

  const update = (field, value) => {
    const next = { ...setup, [field]: value }
    setSetup({ [field]: value })
    if (touched) setErrors(validateInterviewSetup(next))
  }

  const handleContinue = () => {
    const nextErrors = validateInterviewSetup(setup)
    setTouched(true)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus()
      return
    }
    navigate(ROUTES.INTERVIEW_PREPARATION)
  }

  const reset = () => {
    setSetup(DEFAULT_INTERVIEW_SETUP)
    setErrors({})
    setTouched(false)
  }

  return (
    <main className="setup-page">
      <div className="setup-background setup-background-one" />
      <div className="setup-background setup-background-two" />
      <section className="setup-container">
        <button type="button" className="setup-back-link" onClick={() => navigate(ROUTES.HOME)}>
          <ArrowBackRounded /> Back to Home
        </button>
        <SetupProgress />

        <header className="setup-heading">
          <span className="setup-eyebrow"><AutoAwesomeRounded /> AI Interview Studio</span>
          <h1>Build your <span>perfect interview.</span></h1>
          <p>Tell us what you want to practice. We'll shape the interview around your target role and experience.</p>
        </header>

        <div className="setup-layout">
          <form className="setup-form" onSubmit={(event) => { event.preventDefault(); handleContinue() }} noValidate>
            <section className="setup-panel">
              <div className="setup-panel-heading">
                <div className="setup-heading-group"><span className="setup-step-badge">01</span><div><h2>What role are you preparing for?</h2><p>Use a specific job title for more relevant questions.</p></div></div>
                <span className="setup-required">Required</span>
              </div>
              <label className="setup-field-label" htmlFor="role">Target role</label>
              <div className={`setup-input-wrap ${errors.role ? 'has-error' : ''}`}>
                <PsychologyRounded />
                <input id="role" name="role" value={setup.role} onChange={(event) => update('role', event.target.value)} placeholder="e.g. Backend Developer" autoComplete="organization-title" maxLength={80} aria-invalid={Boolean(errors.role)} aria-describedby={errors.role ? 'role-error' : undefined} />
                {setup.role ? <span className="setup-input-count">{setup.role.length}/80</span> : null}
              </div>
              {errors.role ? <p id="role-error" className="setup-error">{errors.role}</p> : null}
              <div className="role-chips" aria-label="Popular roles">
                {POPULAR_ROLES.map((role) => <button type="button" key={role} className={setup.role === role ? 'active' : ''} onClick={() => update('role', role)}>{role}</button>)}
              </div>
            </section>

            <section className="setup-panel">
              <div className="setup-panel-heading"><div className="setup-heading-group"><span className="setup-step-badge">02</span><div><h2>Choose your interview type</h2><p>Pick the kind of conversation you want to simulate.</p></div></div></div>
              <div className="setup-option-grid setup-option-grid-three">
                {INTERVIEW_TYPES.map((item) => {
                  const Icon = typeIcons[item.value]
                  return <SetupOptionCard key={item.value} value={item.value} selected={setup.interviewType === item.value} label={item.label} description={item.description} icon={Icon} onClick={(value) => update('interviewType', value)} />
                })}
              </div>
            </section>

            <section className="setup-panel">
              <div className="setup-panel-heading"><div className="setup-heading-group"><span className="setup-step-badge">03</span><div><h2>What's your experience level?</h2><p>We'll adjust question depth and follow-ups accordingly.</p></div></div></div>
              <div className="setup-option-grid setup-option-grid-four">
                {EXPERIENCE_LEVELS.map((item) => <SetupOptionCard key={item.value} value={item.value} selected={setup.experience === item.value} label={item.shortLabel} description={item.description} onClick={(value) => update('experience', value)} compact />)}
              </div>
              {selectedExperience ? <div className="setup-selection-note"><SecurityRounded /> Interview depth: <strong>{selectedExperience.label}</strong></div> : null}
            </section>

            <section className="setup-panel">
              <div className="setup-panel-heading"><div className="setup-heading-group"><span className="setup-step-badge">04</span><div><h2>Set the difficulty</h2><p>Choose how challenging you want the practice to feel.</p></div></div></div>
              <div className="difficulty-grid">
                {DIFFICULTIES.map((item) => (
                  <button type="button" key={item.value} className={`difficulty-option ${selectedDifficulty?.value === item.value ? 'selected' : ''} ${difficultyColors[item.value]}`} onClick={() => update('difficulty', item.value)} aria-pressed={setup.difficulty === item.value}>
                    <span className="difficulty-dot" /><span><strong>{item.label}</strong><small>{item.description}</small></span>
                  </button>
                ))}
              </div>
            </section>

            <section className="setup-panel">
              <div className="setup-panel-heading"><div className="setup-heading-group"><span className="setup-step-badge">05</span><div><h2>Choose your session length</h2><p>Set the time and number of questions for this practice.</p></div></div></div>
              <div className="setup-subheading"><AccessTimeRounded /> Duration</div>
              <div className="duration-grid">
                {INTERVIEW_DURATIONS.map((item) => <button type="button" key={item.value} className={`duration-option ${setup.durationMinutes === item.value ? 'selected' : ''}`} onClick={() => update('durationMinutes', item.value)}><strong>{item.label}</strong><small>{item.description}</small></button>)}
              </div>
              <div className="setup-subheading question-heading"><TerminalRounded /> Questions</div>
              <div className="question-count-row" role="group" aria-label="Number of questions">
                {QUESTION_COUNTS.map((count) => <button type="button" key={count} className={setup.questionCount === count ? 'selected' : ''} onClick={() => update('questionCount', count)}>{count}</button>)}
              </div>
            </section>

            <div className="setup-form-actions">
              <button type="button" className="setup-reset-btn" onClick={reset}><RestartAltRounded /> Reset</button>
              <button type="submit" className="gradient-btn setup-continue-btn">Continue to Preparation <ArrowForwardRounded /></button>
            </div>
          </form>

          <aside className="setup-summary" aria-label="Interview summary">
            <div className="summary-card">
              <div className="summary-top"><span className="summary-label">YOUR INTERVIEW</span><span className="summary-live"><span /> Ready</span></div>
              <div className="summary-role"><span className="summary-role-icon"><AutoAwesomeRounded /></span><div><small>Target role</small><strong>{setup.role || 'Your target role'}</strong></div></div>
              <div className="summary-divider" />
              <div className="summary-type"><strong>{selectedType?.label || 'Technical Interview'}</strong><span>{selectedDifficulty?.label || 'Medium'} difficulty</span></div>
              <div className="summary-stats">
                <div><small>Experience</small><strong>{selectedExperience?.shortLabel || 'Fresher'}</strong></div>
                <div><small>Duration</small><strong>{setup.durationMinutes} min</strong></div>
                <div><small>Questions</small><strong>{setup.questionCount}</strong></div>
              </div>
              <div className="summary-note"><AutoAwesomeRounded /><p>AI will personalize follow-up questions based on your answers.</p></div>
              <div className="summary-checks"><span><SecurityRounded /> Private session</span><span><AutoAwesomeRounded /> AI-powered flow</span></div>
            </div>
            <div className="setup-help-card">
              <span className="help-icon"><AccessTimeRounded /></span>
              <div><strong>Need a quick practice?</strong><p>Try a 15-minute interview with 5 questions.</p></div>
              <button type="button" onClick={() => { update('durationMinutes', 15); update('questionCount', 5) }}>Use it</button>
            </div>
            <div className="setup-trust"><SecurityRounded /><span><strong>Your choices stay private.</strong> We'll only use them to configure this interview.</span></div>
          </aside>
        </div>
      </section>
    </main>
  )
}
