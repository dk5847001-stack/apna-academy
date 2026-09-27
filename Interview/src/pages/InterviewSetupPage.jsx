import { useState } from 'react'
import {
  AccessTimeRounded,
  ArrowForwardRounded,
  CheckCircleRounded,
  ChevronRightRounded,
  CloudUploadRounded,
  GroupsRounded,
  HeadsetMicRounded,
  PersonRounded,
  PsychologyRounded,
  SearchRounded,
  SmartToyRounded,
  SpeedRounded,
  TimerRounded,
  WorkOutlineRounded,
} from '@mui/icons-material'
import {
  INTERVIEW_DURATIONS,
  INTERVIEW_TYPES,
  EXPERIENCE_LEVELS,
  DEFAULT_INTERVIEW_SETUP,
  validateInterviewSetup,
} from '../data/interviewConfig'
import { useInterviewFlow } from '../context/InterviewFlowContext'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'
import './interview-setup-reference.css'

const typePresentation = {
  technical: {
    title: 'AI Mock Interview',
    description: 'Practice with our AI interviewer, get real-time feedback.',
    icon: SmartToyRounded,
    tone: 'orange',
    badge: 'Recommended',
  },
  dsa: {
    title: 'Role-based Practice',
    description: 'Practice topic-wise questions for your target role.',
    icon: WorkOutlineRounded,
    tone: 'blue',
  },
  behavioral: {
    title: 'Resume Based Interview',
    description: 'Practice interview questions around your profile.',
    icon: CloudUploadRounded,
    tone: 'blue',
  },
}

const experiencePresentation = {
  fresher: { title: 'Beginner', description: "I'm new to this field", icon: PsychologyRounded, tone: 'orange' },
  junior: { title: 'Intermediate', description: 'I have some basic knowledge', icon: GroupsRounded, tone: 'green' },
  mid: { title: 'Experienced', description: 'I have good experience', icon: PersonRounded, tone: 'blue' },
  senior: { title: 'Advanced', description: "I'm highly skilled", icon: SpeedRounded, tone: 'purple' },
}

const durationPresentation = {
  15: { title: '15 mins', description: 'Quick practice' },
  30: { title: '30 mins', description: 'Short session' },
  45: { title: '45 mins', description: 'Standard practice' },
  60: { title: '60 mins', description: 'Deep practice' },
}

function StepIcon({ children, tone = 'orange' }) {
  return <span className={`setup-ref-step-icon setup-ref-step-icon--${tone}`}>{children}</span>
}

function ProgressRail() {
  const steps = ['Profile', 'Prepare', 'Interview', 'Results']
  return (
    <div className="setup-ref-progress" aria-label="Interview progress">
      {steps.map((step, index) => (
        <div className={`setup-ref-progress-item ${index === 0 ? 'is-active' : ''}`} key={step}>
          <span className="setup-ref-progress-number">{index + 1}</span>
          <span className="setup-ref-progress-line" aria-hidden="true" />
          <small>{step}</small>
        </div>
      ))}
    </div>
  )
}

function RobotIllustration() {
  return (
    <div className="setup-ref-robot-wrap" aria-hidden="true">
      <div className="setup-ref-speech">Let's do it!</div>
      <span className="setup-ref-spark spark-one" />
      <span className="setup-ref-spark spark-two" />
      <span className="setup-ref-spark spark-three" />
      <svg className="setup-ref-robot" viewBox="0 0 300 260" role="img">
        <defs>
          <linearGradient id="robotBody" x1="0" x2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#e8eef4" />
          </linearGradient>
          <linearGradient id="robotScreen" x1="0" x2="1">
            <stop offset="0" stopColor="#14243d" />
            <stop offset="1" stopColor="#253c5d" />
          </linearGradient>
        </defs>
        <ellipse cx="150" cy="225" rx="72" ry="18" fill="#f3d5ae" opacity=".35" />
        <path d="M74 92c-20 1-34 14-38 35-3 18 6 37 23 42l21-5V92Z" fill="#f2f6fa" stroke="#dce6ee" strokeWidth="4" />
        <path d="M226 92c20 1 34 14 38 35 3 18-6 37-23 42l-21-5V92Z" fill="#f2f6fa" stroke="#dce6ee" strokeWidth="4" />
        <circle cx="57" cy="127" r="11" fill="#dfe8ef" />
        <circle cx="243" cy="127" r="11" fill="#dfe8ef" />
        <rect x="88" y="50" width="124" height="113" rx="34" fill="url(#robotBody)" stroke="#dbe5ed" strokeWidth="4" />
        <rect x="101" y="69" width="98" height="69" rx="23" fill="url(#robotScreen)" />
        <path d="M122 103c4-11 15-11 19 0M159 103c4-11 15-11 19 0" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
        <circle cx="129" cy="119" r="3.5" fill="#7bc7ff" />
        <circle cx="171" cy="119" r="3.5" fill="#7bc7ff" />
        <path d="M117 163v42c0 13 12 23 25 23h16c13 0 25-10 25-23v-42" fill="url(#robotBody)" stroke="#dbe5ed" strokeWidth="4" />
        <path d="M88 174 55 195c-11 7-13 22-5 31 7 8 20 9 29 2l42-31" fill="#f2f6fa" stroke="#dce6ee" strokeWidth="4" />
        <path d="m212 174 33 21c11 7 13 22 5 31-7 8-20 9-29 2l-42-31" fill="#f2f6fa" stroke="#dce6ee" strokeWidth="4" />
        <circle cx="57" cy="225" r="10" fill="#eef3f7" stroke="#dce6ee" strokeWidth="3" />
        <circle cx="243" cy="225" r="10" fill="#eef3f7" stroke="#dce6ee" strokeWidth="3" />
        <path d="M139 50V28" stroke="#dce6ee" strokeWidth="5" strokeLinecap="round" />
        <circle cx="139" cy="22" r="8" fill="#ff7a18" />
        <path d="M132 205h36v27h-36z" fill="#ff7a18" opacity=".96" />
        <path d="M142 211h16l-8 13Z" fill="#fff" />
      </svg>
    </div>
  )
}

export default function InterviewSetupPage() {
  const { setup, setSetup } = useInterviewFlow()
  const { navigate } = useRouter()
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState(false)

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

  const changeDuration = (direction) => {
    const values = INTERVIEW_DURATIONS.map((item) => item.value)
    const currentIndex = Math.max(0, values.indexOf(Number(setup.durationMinutes)))
    const nextIndex = Math.min(values.length - 1, Math.max(0, currentIndex + direction))
    update('durationMinutes', values[nextIndex])
  }

  return (
    <main className="setup-ref-page">
      <header className="setup-ref-header">
        <button type="button" className="setup-ref-brand" onClick={() => navigate(ROUTES.HOME)} aria-label="Back to ApnaAcademy">
          <span className="setup-ref-brand-mark">A</span>
          <strong>ApnaAcademy</strong>
          <span>Interview AI</span>
        </button>
        <button type="button" className="setup-ref-help" onClick={() => window.location.assign('mailto:support@apnaacademy.me')}>
          <HeadsetMicRounded /> Need Help?
        </button>
      </header>

      <div className="setup-ref-ambient ambient-top" aria-hidden="true" />
      <div className="setup-ref-ambient ambient-bottom" aria-hidden="true" />

      <section className="setup-ref-shell">
        <div className="setup-ref-hero">
          <div className="setup-ref-hero-copy">
            <span className="setup-ref-welcome"><span>✦</span> Welcome to <strong>ApnaAcademy</strong></span>
            <h1>Start your interview journey <span>from scratch</span></h1>
            <p>Don&apos;t worry! You don&apos;t need any prior knowledge. Just tell us a few details and we&apos;ll guide you step-by-step to help you build your confidence and get you interview ready.</p>
          </div>
          <RobotIllustration />
        </div>

        <div className="setup-ref-grid">
          <form
            className="setup-ref-form"
            onSubmit={(event) => {
              event.preventDefault()
              handleContinue()
            }}
            noValidate
          >
            <section className="setup-ref-card">
              <div className="setup-ref-card-heading">
                <div>
                  <StepIcon><PersonRounded /></StepIcon>
                  <div>
                    <h2>What role are you preparing for?</h2>
                    <p>Don&apos;t worry if you don&apos;t have experience. Just tell us what kind of job you want.</p>
                  </div>
                </div>
                <ChevronRightRounded />
              </div>
              <label className="setup-ref-search" htmlFor="role">
                <SearchRounded />
                <input
                  id="role"
                  name="role"
                  value={setup.role}
                  onChange={(event) => update('role', event.target.value)}
                  placeholder="e.g. Frontend Developer, Data Analyst, Customer Support..."
                  autoComplete="organization-title"
                  maxLength={80}
                  aria-invalid={Boolean(errors.role)}
                  aria-describedby={errors.role ? 'role-error' : undefined}
                />
              </label>
              {errors.role ? <p id="role-error" className="setup-ref-error">{errors.role}</p> : null}
              <div className="setup-ref-role-chips">
                {['Software Developer', 'Data Analyst', 'Web Developer', 'UI/UX Designer', 'Digital Marketing', 'Customer Support', 'Sales Executive', 'Other'].map((role) => (
                  <button key={role} type="button" className={setup.role === role ? 'is-selected' : ''} onClick={() => update('role', role)}>
                    {role}
                  </button>
                ))}
              </div>
            </section>

            <section className="setup-ref-card">
              <div className="setup-ref-card-heading">
                <div>
                  <StepIcon tone="blue"><SmartToyRounded /></StepIcon>
                  <div>
                    <h2>Choose your interview type</h2>
                    <p>Select how you want to practice. We&apos;ll set up the right experience for you.</p>
                  </div>
                </div>
                <ChevronRightRounded />
              </div>
              <div className="setup-ref-type-grid">
                {INTERVIEW_TYPES.map((item) => {
                  const view = typePresentation[item.value]
                  const Icon = view.icon
                  return (
                    <button
                      key={item.value}
                      type="button"
                      className={`setup-ref-choice setup-ref-choice--${view.tone} ${setup.interviewType === item.value ? 'is-selected' : ''}`}
                      onClick={() => update('interviewType', item.value)}
                      aria-pressed={setup.interviewType === item.value}
                    >
                      {view.badge ? <span className="setup-ref-recommended">{view.badge}</span> : null}
                      <span className="setup-ref-choice-icon"><Icon /></span>
                      <strong>{view.title}</strong>
                      <small>{view.description}</small>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="setup-ref-card">
              <div className="setup-ref-card-heading">
                <div>
                  <StepIcon tone="green"><SpeedRounded /></StepIcon>
                  <div>
                    <h2>What&apos;s your experience level?</h2>
                    <p>Choose the level that matches your current skills. Don&apos;t worry, you can always change it later.</p>
                  </div>
                </div>
                <ChevronRightRounded />
              </div>
              <div className="setup-ref-experience-grid">
                {EXPERIENCE_LEVELS.map((item) => {
                  const view = experiencePresentation[item.value]
                  const Icon = view.icon
                  return (
                    <button
                      key={item.value}
                      type="button"
                      className={`setup-ref-choice setup-ref-experience setup-ref-choice--${view.tone} ${setup.experience === item.value ? 'is-selected' : ''}`}
                      onClick={() => update('experience', item.value)}
                      aria-pressed={setup.experience === item.value}
                    >
                      <span className="setup-ref-choice-icon"><Icon /></span>
                      <span><strong>{view.title}</strong><small>{view.description}</small></span>
                      {setup.experience === item.value ? <CheckCircleRounded className="setup-ref-selected-check" /> : null}
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="setup-ref-card">
              <div className="setup-ref-card-heading">
                <div>
                  <StepIcon tone="red"><TimerRounded /></StepIcon>
                  <div>
                    <h2>Choose your session length</h2>
                    <p>Select how long you want your practice session to be.</p>
                  </div>
                </div>
                <ChevronRightRounded />
              </div>
              <div className="setup-ref-duration-grid">
                {INTERVIEW_DURATIONS.map((item) => {
                  const view = durationPresentation[item.value] || { title: `${item.value} mins`, description: 'Practice session' }
                  return (
                    <button
                      key={item.value}
                      type="button"
                      className={setup.durationMinutes === item.value ? 'is-selected' : ''}
                      onClick={() => update('durationMinutes', item.value)}
                    >
                      <strong>{view.title}</strong>
                      <small>{view.description}</small>
                    </button>
                  )
                })}
              </div>
              <div className="setup-ref-custom-duration">
                <span><AccessTimeRounded /> Custom Duration</span>
                <button type="button" onClick={() => changeDuration(-1)} aria-label="Shorten duration">−</button>
                <strong>{setup.durationMinutes}</strong>
                <button type="button" onClick={() => changeDuration(1)} aria-label="Increase duration">+</button>
                <small>min</small>
              </div>
            </section>

            <div className="setup-ref-actions">
              <button type="button" className="setup-ref-reset" onClick={reset}>Reset</button>
              <button type="submit" className="setup-ref-continue">Continue to Preparation <ArrowForwardRounded /></button>
            </div>
          </form>

          <aside className="setup-ref-side">
            <div className="setup-ref-side-card">
              <ProgressRail />
              <div className="setup-ref-side-icon"><span><span /></span><span className="setup-ref-target"><CheckCircleRounded /></span></div>
              <h2>You&apos;re just<br />one step away!</h2>
              <p>Complete these simple steps and start your interview practice.</p>
              <div className="setup-ref-doodle">
                <span>Small steps</span>
                <strong>Big dreams!</strong>
                <i>↙</i>
              </div>
            </div>
            <div className="setup-ref-side-note">
              <span><CheckCircleRounded /></span>
              <div><strong>Almost there</strong><p>Your selections are saved automatically.</p></div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
