import { useEffect, useMemo, useRef, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import {
  ArrowForward,
  AutoAwesome,
  BarChartRounded,
  BusinessCenterRounded,
  CheckCircleRounded,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Close,
  GroupsRounded,
  Menu,
  MicNoneRounded,
  PlayArrowRounded,
  PsychologyRounded,
  RocketLaunchRounded,
  SchoolRounded,
  StarRounded,
  TrackChangesRounded,
  TrendingUpRounded,
  VideoCameraFrontRounded,
} from '@mui/icons-material'
import './App.css'

const testimonials = [
  {
    quote: 'The AI interviews felt so real! The feedback helped me improve my answers and I got my dream job in just 2 weeks!',
    name: 'Rohan Verma',
    role: 'Software Engineer at Google',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    mark: 'G',
  },
  {
    quote: 'The personalized learning path and instant feedback really boosted my confidence. Highly recommended!',
    name: 'Priya Sharma',
    role: 'Data Analyst at Amazon',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    mark: 'a',
  },
  {
    quote: 'Wide range of questions and detailed analysis helped me crack multiple interviews. Amazing platform!',
    name: 'Aman Khan',
    role: 'Product Manager at Microsoft',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    mark: '▦',
  },
]

const stats = [
  [GroupsRounded, '100K+', 'Active Learners'],
  [SchoolRounded, '5000+', 'Interview Questions'],
  [TrackChangesRounded, '95%', 'Success Rate'],
  [BusinessCenterRounded, '200+', 'Job Roles'],
  [StarRounded, '4.8/5', 'User Rating'],
]

const features = [
  [PsychologyRounded, 'Realistic AI Interviewer', 'Experience real interview conversations.'],
  [BarChartRounded, 'Instant Feedback', 'Get detailed AI analysis after every answer.'],
  [SchoolRounded, 'Personalized Learning Path', 'Practice as per your job role and skill level.'],
  [BusinessCenterRounded, 'Wide Range of Roles', 'From tech to non-tech, we\'ve got you covered.'],
  [TrendingUpRounded, 'Track Your Progress', 'See improvement with detailed reports.'],
]

const steps = [
  ['01', GroupsRounded, 'Create Your Account', 'Sign up and set up your profile.'],
  ['02', TrackChangesRounded, 'Choose Your Role', 'Select your target job role and experience level.'],
  ['03', PlayArrowRounded, 'Start AI Interview', 'Practice with realistic AI-powered interviews.'],
  ['04', BarChartRounded, 'Get Instant Feedback', 'Receive detailed analysis and improve your skills.'],
]

function CanvasGlow() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    let frame = 0
    let raf = 0
    let width = 0
    let height = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const points = Array.from({ length: 42 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 1.8,
      p: index * 0.13,
    }))

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const time = frame * 0.005
      points.forEach((point, index) => {
        const x = point.x * width + Math.sin(time + point.p) * 18
        const y = point.y * height + Math.cos(time * 0.8 + point.p) * 12
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 38)
        glow.addColorStop(0, index % 3 === 0 ? 'rgba(101,73,255,.22)' : 'rgba(24,144,255,.16)')
        glow.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = glow
        ctx.fillRect(x - 38, y - 38, 76, 76)
        ctx.beginPath()
        ctx.arc(x, y, point.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(83,70,229,.24)'
        ctx.fill()
      })
      if (!reduced) frame += 1
      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="canvas-glow" aria-hidden="true" />
}

function Logo() {
  return (
    <a href="#home" className="brand" aria-label="ApnaAcademy Interview AI home">
      <span className="brand-mark">
        <span className="brand-stroke brand-stroke-a" />
        <span className="brand-stroke brand-stroke-b" />
        <span className="brand-stroke brand-stroke-c" />
      </span>
      <span>
        <strong>ApnaAcademy</strong>
        <small>Interview AI</small>
      </span>
    </a>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [testimonial, setTestimonial] = useState(0)

  const currentTestimonial = useMemo(() => testimonials[testimonial], [testimonial])

  const goTo = (id) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <nav className={`desktop-nav ${menuOpen ? 'mobile-open' : ''}`} aria-label="Primary navigation">
            <button className="nav-link active" onClick={() => goTo('home')}>Home</button>
            <button className="nav-link" onClick={() => goTo('features')}>Features</button>
            <button className="nav-link" onClick={() => goTo('why-us')}>Why Us</button>
            <button className="nav-link" onClick={() => goTo('pricing')}>Pricing</button>
            <button className="nav-link" onClick={() => goTo('stories')}>Success Stories</button>
            <div className="resource-wrap">
              <button className="nav-link" onClick={() => setResourcesOpen((v) => !v)}>
                Resources <ChevronDown sx={{ fontSize: 16, transition: 'transform .2s', transform: resourcesOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              {resourcesOpen && (
                <div className="resource-menu">
                  <button onClick={() => goTo('how-it-works')}>How it works</button>
                  <button onClick={() => goTo('features')}>Interview features</button>
                  <button onClick={() => goTo('stories')}>Learner stories</button>
                </div>
              )}
            </div>
          </nav>
          <div className="header-actions">
            <button className="login-btn" onClick={() => goTo('login')}>Login</button>
            <button className="gradient-btn small" onClick={() => goTo('start')}>Get Started Free <ArrowForward /></button>
            <IconButton className="mobile-menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
              {menuOpen ? <Close /> : <Menu />}
            </IconButton>
          </div>
        </div>
      </header>

      <section id="home" className="hero-section">
        <CanvasGlow />
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><AutoAwesome /> AI-Powered Interview Practice</div>
            <h1>Practice Today<br /><span>Get Hired</span><br />Tomorrow</h1>
            <p className="hero-subtitle">
              Real interview questions. Instant AI feedback.<br className="desktop-only" />
              Personalized learning. Everything you need to<br className="desktop-only" />
              crack your dream job — only with ApnaAcademy<br className="desktop-only" />
              Interview AI.
            </p>
            <div className="hero-buttons">
              <button className="gradient-btn" onClick={() => goTo('start')}>Start Practicing Free <ArrowForward /></button>
              <button className="outline-btn" onClick={() => goTo('demo')}><span className="play-circle"><PlayArrowRounded /></span> Watch Demo</button>
            </div>
            <div className="trust-row">
              <div className="avatar-stack">
                {['1500648767791-00dcc994a43e', '1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d', '1535713875002-d1d0cf377fde'].map((id) => (
                  <img key={id} src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=80&q=75`} alt="" />
                ))}
              </div>
              <div className="stars"><StarRounded /><StarRounded /><StarRounded /><StarRounded /><StarRounded /></div>
              <span>Trusted by 100,000+ job seekers<br /><b>4.8/5</b> (2,500+ reviews)</span>
            </div>
          </div>

          <div className="hero-art" aria-label="AI interview preview">
            <div className="art-halo" />
            <div className="practice-note">Practice with AI<br /><em>anytime, anywhere</em> <ArrowForward /></div>
            <div className="ai-card glass-card">
              <div className="card-title"><PsychologyRounded /> AI Interviewer</div>
              <p>Tell me about yourself<br />and your background?</p>
              <div className="wave-bars">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ height: `${10 + ((i * 13) % 25)}px` }} />)}</div>
            </div>
            <div className="hero-person">
              <div className="person-placeholder woman">
                <div className="hair" /><div className="face" /><div className="body-shape" />
              </div>
            </div>
            <div className="live-card glass-card">
              <div className="live-label"><span /> Live Interview</div>
              <div className="person-placeholder man small-man">
                <div className="hair" /><div className="face" /><div className="suit" />
              </div>
              <div className="video-controls"><span><MicNoneRounded /></span><span><VideoCameraFrontRounded /></span><span className="end"><Close /></span></div>
            </div>
            <div className="progress-card glass-card">
              <span className="progress-icon"><TrendingUpRounded /></span>
              <b>Your Progress</b>
              <div className="progress-ring">85%</div>
              <TrendingUpRounded className="up-arrow" />
            </div>
            <div className="feedback-card glass-card">
              <b>Real-time Feedback</b>
              {['Communication', 'Confidence', 'Clarity', 'Relevance'].map((label, i) => (
                <div className="feedback-row" key={label}>
                  <span>{label}</span><div><i style={{ width: `${70 + i * 7}%` }} /></div><strong>{[8.5, 8.0, 9.0, 8.5][i]}/10</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        {stats.map(([Icon, value, label], i) => (
          <div className="stat-item" key={label}>
            <span className={`stat-icon stat-${i}`}><Icon /></span>
            <div><b>{value}</b><small>{label}</small></div>
          </div>
        ))}
      </section>

      <section id="features" className="features-section page-section">
        <div className="feature-grid">
          {features.map(([Icon, title, copy], i) => (
            <article className="feature-card" key={title}>
              <span className={`feature-icon feature-icon-${i}`}><Icon /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="steps-section page-section">
        <div className="section-heading">
          <span className="section-pill">Just 4 Simple Steps</span>
          <h2>How ApnaAcademy Interview AI Works</h2>
          <p>Start your journey to a successful career in minutes.</p>
        </div>
        <div className="steps-grid">
          {steps.map(([number, Icon, title, copy], i) => (
            <div className="step-wrap" key={number}>
              <article className="step-card">
                <span className={`step-number step-${i}`}>{number}</span>
                <span className="step-icon"><Icon /></span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
              {i < steps.length - 1 && <ArrowForward className="step-arrow" />}
            </div>
          ))}
        </div>
      </section>

      <section id="why-us" className="proof-section page-section">
        <div className="mock-interview">
          <div className="mock-top"><span><AutoAwesome /> ApnaAcademy<br /><small>Interview AI</small></span><b>00:12 🔴</b></div>
          <div className="mock-person">
            <div className="person-placeholder mock-man"><div className="hair" /><div className="face" /><div className="suit" /></div>
          </div>
          <div className="question-bubble">Explain a challenging<br />project you worked on.</div>
          <div className="mock-interviewer"><PsychologyRounded /> AI Interviewer<br /><small>Asking Question...</small></div>
          <div className="mock-feedback glass-card">
            <b>AI Feedback</b>
            {['Clarity', 'Confidence', 'Structure', 'Relevance'].map((x, i) => <div className="mini-bar" key={x}><span>{x}</span><i><em style={{ width: `${72 + i * 6}%` }} /></i><strong>{[8.5,8,9,8.5][i]}</strong></div>)}
          </div>
          <div className="mock-controls"><span><MicNoneRounded /></span><span><VideoCameraFrontRounded /></span><span className="end"><Close /></span></div>
        </div>
        <div className="proof-copy">
          <span className="section-pill">Experience the Difference</span>
          <h2>Real Interview. Real Feedback.<br /><span>Real Results.</span></h2>
          <p>Our AI simulates real interview scenarios, analyzes your responses, and gives personalized feedback to help you improve faster.</p>
          <ul>
            <li><CheckCircleRounded /> Industry-specific questions</li>
            <li><CheckCircleRounded /> Detailed performance analysis</li>
            <li><CheckCircleRounded /> Personalized improvement tips</li>
            <li><CheckCircleRounded /> Practice anytime, anywhere</li>
          </ul>
          <button className="gradient-btn" onClick={() => goTo('start')}>Try a Free Mock Interview <ArrowForward /></button>
        </div>
      </section>

      <section id="stories" className="stories-section page-section">
        <div className="section-heading">
          <span className="section-pill">Success Stories</span>
          <h2>Loved by Job Seekers Across India</h2>
          <p>See how ApnaAcademy Interview AI is helping thousands land their dream jobs.</p>
        </div>
        <div className="testimonial-stage">
          <Tooltip title="Previous story"><IconButton onClick={() => setTestimonial((testimonial - 1 + testimonials.length) % testimonials.length)}><ChevronLeft /></IconButton></Tooltip>
          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article className={`testimonial-card ${item === currentTestimonial ? 'selected' : ''}`} key={item.name}>
                <p>“{item.quote}”</p>
                <div className="testimonial-person">
                  <img src={item.image} alt="" />
                  <div><b>{item.name}</b><small>{item.role}</small><span className="gold-stars">★★★★★</span></div>
                  <strong className="company-mark">{item.mark}</strong>
                </div>
              </article>
            ))}
          </div>
          <Tooltip title="Next story"><IconButton onClick={() => setTestimonial((testimonial + 1) % testimonials.length)}><ChevronRight /></IconButton></Tooltip>
        </div>
      </section>

      <section id="pricing" className="cta-section page-section">
        <div className="cta-inner" id="start">
          <div className="cta-art"><span><PsychologyRounded /></span><span><AutoAwesome /></span><span><MicNoneRounded /></span></div>
          <div><h2>Ready to Ace Your Next Interview?</h2><p>Join thousands of learners who are already one step ahead in their career journey.</p></div>
          <button className="white-btn" onClick={() => goTo('login')}>Get Started Free <ArrowForward /></button>
        </div>
      </section>

      <footer id="login" className="footer">
        <Logo />
        <p>Practice smarter. Interview better. Get hired.</p>
        <small>© 2026 ApnaAcademy. All rights reserved.</small>
      </footer>

      <div id="demo" className="sr-only">Demo section is ready for the AI interview flow.</div>
    </main>
  )
}

export default App
