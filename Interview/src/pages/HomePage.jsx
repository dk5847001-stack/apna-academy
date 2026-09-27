import { useMemo, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import {
  ArrowForward,
  AutoAwesome,
  BarChartRounded,
  BusinessCenterRounded,
  CheckCircleRounded,
  ChevronLeft,
  ChevronRight,
  GroupsRounded,
  MicNoneRounded,
  PlayArrowRounded,
  PsychologyRounded,
  SchoolRounded,
  StarRounded,
  TrackChangesRounded,
  TrendingUpRounded,
  VideoCameraFrontRounded,
} from '@mui/icons-material'
import '../App.css'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'

const testimonials = [
  { quote: 'The AI interviews felt so real! The feedback helped me improve my answers and I got my dream job in just 2 weeks!', name: 'Rohan Verma', role: 'Software Engineer at Google', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80', mark: 'G' },
  { quote: 'The personalized learning path and instant feedback really boosted my confidence. Highly recommended!', name: 'Priya Sharma', role: 'Data Analyst at Amazon', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80', mark: 'a' },
  { quote: 'Wide range of questions and detailed analysis helped me crack multiple interviews. Amazing platform!', name: 'Aman Khan', role: 'Product Manager at Microsoft', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80', mark: '▦' },
]

const stats = [
  [GroupsRounded, '100K+', 'Active Learners'],
  [SchoolRounded, '5000+', 'Interview Questions'],
  [TrackChangesRounded, '95%', 'Success Rate'],
  [BusinessCenterRounded, '200+', 'Job Roles'],
  [StarRounded, '4.8/5', 'User Rating'],
]

const features = [
  [PsychologyRounded, 'Realistic AI Interviewer', 'Practice natural interview conversations that feel like the real thing.'],
  [BarChartRounded, 'Instant Feedback', 'Understand your strengths and get clear feedback after every answer.'],
  [SchoolRounded, 'Personalized Learning', 'Practice according to your target role, experience and skill level.'],
  [BusinessCenterRounded, 'Many Job Roles', 'Prepare for technical, business and other common interview roles.'],
  [TrendingUpRounded, 'Track Your Progress', 'See your improvement with simple performance reports.'],
]

const steps = [
  ['01', GroupsRounded, 'Create your profile', 'Sign up and tell us what role you are preparing for.'],
  ['02', TrackChangesRounded, 'Choose your interview', 'Pick your role and start a practice session.'],
  ['03', PlayArrowRounded, 'Talk to the AI', 'Answer realistic questions just like a real interview.'],
  ['04', BarChartRounded, 'Learn and improve', 'Review feedback and practice again with confidence.'],
]

function HomePage() {
  const { navigate } = useRouter()
  const [testimonial, setTestimonial] = useState(0)
  const currentTestimonial = useMemo(() => testimonials[testimonial], [testimonial])

  const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <main className="home-page home-page-ref home-page-rebuild">
      <section id="home" className="hp-hero">
        <div className="hp-glow hp-glow-one" />
        <div className="hp-glow hp-glow-two" />
        <div className="hp-container hp-hero-grid">
          <div className="hp-hero-copy">
            <span className="hp-eyebrow"><AutoAwesome /> AI-powered interview practice</span>
            <h1>Practice with confidence.<br /><span>Interview with clarity.</span></h1>
            <p>Prepare for your next interview with realistic AI conversations, instant feedback and a simple practice path built for beginners.</p>
            <div className="hp-actions">
              <button className="hp-primary" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}>Start Practicing Free <ArrowForward /></button>
              <button className="hp-secondary" onClick={() => navigate(ROUTES.DEMO)}><span><PlayArrowRounded /></span> See How It Works</button>
            </div>
            <div className="hp-trust">
              <div className="hp-avatar-stack">
                {['1500648767791-00dcc994a43e','1494790108377-be9c29b29330','1507003211169-0a1dd7228f2d','1535713875002-d1d0cf377fde'].map((id) => (
                  <img key={id} src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=80&q=75`} alt="" width="32" height="32" />
                ))}
              </div>
              <div><div className="hp-stars">★★★★★</div><strong>4.8/5</strong> from 2,500+ reviews</div>
            </div>
          </div>

          <div className="hp-visual" aria-label="AI interview preview">
            <div className="hp-visual-halo" />
            <div className="hp-main-person">
              <div className="hp-head" />
              <div className="hp-body" />
            </div>
            <div className="hp-floating hp-ai-card">
              <small><PsychologyRounded /> AI Interviewer</small>
              <strong>Tell me about yourself.</strong>
              <div className="hp-wave">{Array.from({ length: 17 }, (_, i) => <i key={i} style={{ height: `${10 + ((i * 13) % 22)}px` }} />)}</div>
            </div>
            <div className="hp-floating hp-live-card">
              <span className="hp-live-dot" /> Live practice
              <div className="hp-mini-screen"><div className="hp-mini-face" /></div>
              <div className="hp-controls"><span><MicNoneRounded /></span><span><VideoCameraFrontRounded /></span><span className="hp-end">×</span></div>
            </div>
            <div className="hp-floating hp-score-card">
              <small>Your progress</small><strong>85%</strong><div><span style={{ width: '85%' }} /></div><b>Good progress</b>
            </div>
            <div className="hp-note"><AutoAwesome /> Practice anytime, anywhere</div>
          </div>
        </div>
      </section>

      <section className="hp-stats hp-container">
        {stats.map(([Icon, value, label]) => <div className="hp-stat" key={label}><span><Icon /></span><div><strong>{value}</strong><small>{label}</small></div></div>)}
      </section>

      <section id="features" className="hp-section hp-container">
        <div className="hp-heading"><span>WHY PRACTICE WITH US?</span><h2>Everything you need to feel interview-ready</h2><p>Simple tools, useful feedback and a calm place to practice.</p></div>
        <div className="hp-feature-grid">
          {features.map(([Icon, title, copy]) => <article className="hp-feature" key={title}><span><Icon /></span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section id="how-it-works" className="hp-section hp-container hp-steps-section">
        <div className="hp-heading"><span>HOW IT WORKS</span><h2>Start practicing in four simple steps</h2><p>No complicated setup. Just choose, practice and improve.</p></div>
        <div className="hp-step-grid">
          {steps.map(([number, Icon, title, copy]) => <article className="hp-step" key={number}><div className="hp-step-top"><b>{number}</b><span><Icon /></span></div><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section id="why-us" className="hp-proof hp-container">
        <div className="hp-demo-card">
          <div className="hp-demo-top"><strong><PsychologyRounded /> AI Interview</strong><span>● 08:42</span></div>
          <div className="hp-demo-person"><div className="hp-demo-face" /><div className="hp-demo-shirt" /></div>
          <div className="hp-question">“Tell me about a challenge you solved.”</div>
          <div className="hp-feedback"><strong>AI feedback</strong>{['Clarity','Confidence','Structure'].map((x,i)=><div key={x}><small>{x}</small><span><i style={{width:`${74+i*7}%`}} /></span><b>{[8.5,8,9][i]}</b></div>)}</div>
        </div>
        <div className="hp-proof-copy"><span>WHY APNAACADEMY INTERVIEW AI?</span><h2>Practice first.<br /><em>Improve faster.</em></h2><p>You do not need interview experience to start. The AI guides you through realistic questions and gives useful feedback in easy-to-understand language.</p><ul><li><CheckCircleRounded /> Beginner-friendly practice</li><li><CheckCircleRounded /> Role-specific questions</li><li><CheckCircleRounded /> Clear performance feedback</li><li><CheckCircleRounded /> Practice whenever you want</li></ul><button className="hp-primary" onClick={() => goTo('start')}>Try a Free Mock Interview <ArrowForward /></button></div>
      </section>

      <section id="stories" className="hp-section hp-container hp-stories">
        <div className="hp-heading"><span>SUCCESS STORIES</span><h2>Learners are practicing with confidence</h2><p>Real feedback from people using AI practice to prepare for interviews.</p></div>
        <div className="hp-testimonial-stage">
          <Tooltip title="Previous"><IconButton onClick={() => setTestimonial((testimonial - 1 + testimonials.length) % testimonials.length)}><ChevronLeft /></IconButton></Tooltip>
          <div className="hp-testimonials">
            {testimonials.map((item) => <article className={`hp-testimonial ${item === currentTestimonial ? 'selected' : ''}`} key={item.name}><div className="hp-stars">★★★★★</div><p>“{item.quote}”</p><div className="hp-person"><img src={item.image} alt="" width="40" height="40" loading="lazy" /><div><strong>{item.name}</strong><small>{item.role}</small></div><b>{item.mark}</b></div></article>)}
          </div>
          <Tooltip title="Next"><IconButton onClick={() => setTestimonial((testimonial + 1) % testimonials.length)}><ChevronRight /></IconButton></Tooltip>
        </div>
      </section>

      <section id="pricing" className="hp-final-wrap hp-container">
        <div id="start" className="hp-final"><div><span className="hp-final-icon"><AutoAwesome /></span><h2>Ready for your next interview?</h2><p>Start practicing today. It is simple, guided and beginner-friendly.</p></div><button onClick={() => navigate(ROUTES.LOGIN)}>Get Started Free <ArrowForward /></button></div>
      </section>
    </main>
  )
}

export default HomePage
