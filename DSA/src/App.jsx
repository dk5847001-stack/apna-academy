import { useMemo, useState } from 'react'
import { NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Code2,
  Flame,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Practice', to: '/practice', icon: Code2 },
  { label: 'Topics', to: '/topics', icon: BookOpen },
  { label: 'Companies', to: '/companies', icon: Users },
  { label: 'Daily Challenge', to: '/daily-challenge', icon: CalendarDays },
  { label: 'Study Plans', to: '/study-plans', icon: GraduationCap },
  { label: 'Progress', to: '/progress', icon: BarChart3 },
  { label: 'Submissions', to: '/submissions', icon: Activity },
  { label: 'Bookmarks', to: '/bookmarks', icon: Bookmark },
  { label: 'Leaderboard', to: '/leaderboard', icon: Trophy },
]

const difficulty = [
  { label: 'Easy', value: 0, total: 0, icon: 'E' },
  { label: 'Medium', value: 0, total: 0, icon: 'M' },
  { label: 'Hard', value: 0, total: 0, icon: 'H' },
]

const topics = ['Arrays', 'Strings', 'Linked List', 'Stack & Queue', 'Trees', 'Graphs']

function StatCard({ icon: Icon, label, value, meta, progress }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={19} />
        </div>
        {progress !== undefined && <span className="text-xs font-extrabold text-slate-400">{progress}%</span>}
      </div>
      <p className="mt-5 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-700">{label}</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{meta}</p>
      {progress !== undefined && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}

function Panel({ title, description, action, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-950 sm:text-lg">{title}</h2>
          {description && <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function EmptyState({ icon: Icon = CircleHelp, title, text, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-7 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm"><Icon size={20} /></div>
      <p className="mt-3 text-sm font-extrabold text-slate-700">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">{text}</p>
      {action}
    </div>
  )
}

function Overview() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-blue-200"><Sparkles size={13} /> DSA Practice Workspace</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Master DSA. Build consistency. Crack interviews.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">A structured workspace for topic-wise practice, company preparation, coding, progress and long-term interview readiness.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <NavLink to="/practice" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-950 transition hover:bg-slate-100">Start practicing <ArrowRight size={16} /></NavLink>
              <NavLink to="/study-plans" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-white/10">View study plans</NavLink>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[430px] lg:grid-cols-2">
            <HeroMetric icon={CheckCircle2} label="Solved" value="0" />
            <HeroMetric icon={Flame} label="Streak" value="0 days" />
            <HeroMetric icon={Target} label="Accuracy" value="—" />
            <HeroMetric icon={Trophy} label="Rank" value="—" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CheckCircle2} label="Problems Solved" value="0" meta="Start your first problem" />
        <StatCard icon={Zap} label="Problems Attempted" value="0" meta="No submissions yet" />
        <StatCard icon={Gauge} label="Accuracy" value="—" meta="Calculated from submissions" />
        <StatCard icon={Flame} label="Current Streak" value="0 days" meta="Solve today to begin" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel title="Progress overview" description="Your overall DSA progress will update automatically as you practice.">
          <div className="grid gap-5 md:grid-cols-[1fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-end justify-between gap-3">
                <div><p className="text-xs font-bold text-slate-400">Overall completion</p><p className="mt-1 text-3xl font-black text-slate-950">0%</p></div>
                <span className="text-xs font-bold text-slate-400">0 / 0 problems</span>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-0 rounded-full bg-slate-900" /></div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {difficulty.map((item) => <div key={item.label} className="rounded-xl bg-slate-50 p-3"><p className="text-lg font-black text-slate-900">{item.value}</p><p className="text-[11px] font-bold text-slate-400">{item.label}</p></div>)}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-bold text-slate-400">Difficulty distribution</p>
              <div className="mt-5 space-y-4">
                {difficulty.map((item) => <DifficultyRow key={item.label} {...item} />)}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Daily challenge" description="One focused problem every day.">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><CalendarDays size={19} /></div>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">Coming next</p>
            <p className="mt-2 text-sm font-bold leading-6">Daily Challenge, streak tracking and submissions will connect to the DSA backend in upcoming phases.</p>
            <NavLink to="/daily-challenge" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-white">Open challenge <ChevronRight size={15} /></NavLink>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Topic progress" description="Build fundamentals topic by topic." action={<NavLink to="/topics" className="text-xs font-extrabold text-slate-700 hover:text-slate-950">View all</NavLink>}>
          <div className="space-y-3">{topics.map((topic) => <TopicRow key={topic} topic={topic} />)}</div>
        </Panel>
        <Panel title="Continue solving" description="Pick up where you left off." action={<NavLink to="/practice" className="text-xs font-extrabold text-slate-700 hover:text-slate-950">Practice</NavLink>}>
          <EmptyState title="No problems attempted yet" text="Choose a difficulty, topic or company and make your first submission." action={<NavLink to="/practice" className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2 text-xs font-extrabold text-white">Explore problems</NavLink>} />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_0.85fr]">
        <Panel title="Recent submissions" description="Your latest coding activity will appear here."><EmptyState icon={Activity} title="No submissions yet" text="Run and submit your first solution to start building your coding history." /></Panel>
        <Panel title="Activity" description="Your practice consistency across recent days."><ActivityCalendar /></Panel>
        <Panel title="Premium access" description="Unlock the full DSA library.">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white"><LockKeyhole size={18} /></div>
            <p className="mt-4 text-sm font-black text-slate-950">20% free • 80% premium</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Start with free questions and unlock the complete interview-prep library when you are ready.</p>
            <NavLink to="/unlock" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-extrabold text-white">Unlock all <ArrowRight size={14} /></NavLink>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function HeroMetric({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Icon size={16} className="text-slate-400" /><p className="mt-3 text-2xl font-black">{value}</p><p className="mt-1 text-xs font-semibold text-slate-400">{label}</p></div>
}

function DifficultyRow({ label, value, total, icon }) {
  const percent = total ? Math.round((value / total) * 100) : 0
  return <div><div className="flex items-center justify-between text-xs"><span className="font-extrabold text-slate-700">{icon} {label}</span><span className="font-bold text-slate-400">{value}/{total}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900" style={{ width: `${percent}%` }} /></div></div>
}

function TopicRow({ topic }) {
  return <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">0%</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-extrabold text-slate-700">{topic}</p><span className="text-[11px] font-bold text-slate-400">0 / 0</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-0 rounded-full bg-slate-900" /></div></div></div>
}

function ActivityCalendar() {
  const cells = useMemo(() => Array.from({ length: 35 }, (_, index) => ({ id: index, active: false })), [])
  return <div><div className="grid grid-cols-7 gap-1.5">{cells.map((cell) => <div key={cell.id} className={`aspect-square rounded-md border ${cell.active ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50'}`} />)}</div><div className="mt-4 flex items-center justify-between text-[10px] font-bold text-slate-400"><span>Less</span><div className="flex gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-slate-100" /><i className="h-2.5 w-2.5 rounded-sm bg-slate-300" /><i className="h-2.5 w-2.5 rounded-sm bg-slate-500" /><i className="h-2.5 w-2.5 rounded-sm bg-slate-900" /></div><span>More</span></div></div>
}

function Placeholder({ title }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Phase 2 dashboard foundation</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-500">The shared DSA shell and dashboard foundation are ready. This feature module will be connected to the backend in its implementation phase.</p></div></section>
}

function Sidebar({ open, onClose }) {
  const location = useLocation()
  return <>
    {open && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:z-0 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5"><NavLink to="/" onClick={onClose} className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white"><Code2 size={18} /></div><div><p className="text-sm font-black text-slate-950">ApnaAcademy</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DSA Workspace</p></div></NavLink><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"><X size={18} /></button></div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">{navItems.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${isActive ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}><Icon size={17} />{label}</NavLink>)}<div className="my-3 border-t border-slate-100" /><NavLink to="/unlock" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-extrabold transition ${isActive ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}><LockKeyhole size={17} />Unlock All DSA</NavLink></nav>
      <div className="border-t border-slate-100 p-3"><NavLink to="/profile" onClick={onClose} className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-700">AK</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-slate-800">Student</p><p className="truncate text-[10px] font-semibold text-slate-400">Free plan</p></div><ChevronRight size={15} className="text-slate-400" /></NavLink></div>
      {location.pathname && null}
    </aside>
  </>
}

function Header({ onMenu }) {
  const [query, setQuery] = useState('')
  return <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6"><button onClick={onMenu} aria-label="Open navigation" className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu size={20} /></button><div className="relative hidden max-w-xl flex-1 md:block"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search problems, topics, companies..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white" /></div><div className="ml-auto flex items-center gap-1.5"><NavLink to="/daily-challenge" className="hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-100 sm:flex"><Flame size={16} /> 0 day streak</NavLink><button aria-label="Notifications" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><Bell size={18} /></button><NavLink to="/settings" aria-label="Settings" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><Settings size={18} /></NavLink><NavLink to="/profile" className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">AK</NavLink></div></header>
}

function DSALayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return <div className="min-h-screen bg-slate-50 text-slate-950"><div className="flex min-h-screen"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="min-w-0 flex-1"><Header onMenu={() => setSidebarOpen(true)} /><main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8"><Outlet /></main></div></div></div>
}

export default function App() {
  return <Routes><Route path="/" element={<DSALayout />}><Route index element={<Overview />} /><Route path="practice" element={<Placeholder title="Practice Problems" />} /><Route path="topics" element={<Placeholder title="DSA Topics" />} /><Route path="companies" element={<Placeholder title="Company Questions" />} /><Route path="daily-challenge" element={<Placeholder title="Daily Challenge" />} /><Route path="study-plans" element={<Placeholder title="Study Plans" />} /><Route path="progress" element={<Placeholder title="My Progress" />} /><Route path="submissions" element={<Placeholder title="Submissions" />} /><Route path="bookmarks" element={<Placeholder title="Bookmarks" />} /><Route path="leaderboard" element={<Placeholder title="Leaderboard" />} /><Route path="unlock" element={<Placeholder title="Unlock All DSA" />} /><Route path="profile" element={<Placeholder title="Profile" />} /><Route path="settings" element={<Placeholder title="Settings" />} /><Route path="*" element={<Placeholder title="Page Not Found" />} /></Route></Routes>
}
