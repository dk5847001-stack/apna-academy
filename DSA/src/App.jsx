import { useMemo, useState } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  Bookmark,
  BrainCircuit,
  Building2,
  ChevronDown,
  Code2,
  Flame,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Practice', to: '/problems', icon: Code2 },
  { label: 'Topics', to: '/topics', icon: BrainCircuit },
  { label: 'Companies', to: '/companies', icon: Building2 },
  { label: 'Daily Challenge', to: '/daily-challenge', icon: Target },
  { label: 'Study Plans', to: '/study-plans', icon: Sparkles },
  { label: 'My Progress', to: '/progress', icon: BarChart3 },
  { label: 'Bookmarks', to: '/bookmarks', icon: Bookmark },
  { label: 'Leaderboard', to: '/leaderboard', icon: Trophy },
]

const stats = [
  { label: 'Problems Solved', value: '0', meta: 'Start your first problem', icon: Code2 },
  { label: 'Current Streak', value: '0 days', meta: 'Solve today to begin', icon: Flame },
  { label: 'Accuracy', value: '—', meta: 'No submissions yet', icon: Target },
  { label: 'Global Rank', value: '—', meta: 'Unlock after activity', icon: Trophy },
]

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onMenu={() => setSidebarOpen((value) => !value)}
        onSearch={() => setSearchOpen((value) => !value)}
      />
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1 lg:pl-72">
          {searchOpen && (
            <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
              <SearchBox value={search} onChange={setSearch} />
            </div>
          )}
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="*" element={<PageRouter search={search} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

function Header({ onMenu, onSearch }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button onClick={onMenu} className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden" aria-label="Toggle navigation">
          <Menu size={21} />
        </button>
        <NavLink to="/" className="flex min-w-fit items-center gap-2.5 no-underline">
          <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
            <Code2 size={21} />
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-extrabold tracking-tight text-slate-950">ApnaAcademy</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">DSA</span>
          </span>
        </NavLink>

        <div className="mx-auto hidden w-full max-w-xl lg:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={onSearch} className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 lg:hidden" aria-label="Search">
            <Search size={19} />
          </button>
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 sm:flex">
            <Flame size={17} className="text-orange-500" /> 0
          </div>
          <button className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100" aria-label="Notifications">
            <Bell size={19} />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-blue-600" />
          </button>
          <button className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-slate-100">
            <span className="grid size-9 place-items-center rounded-lg bg-blue-600 text-sm font-extrabold text-white">D</span>
            <ChevronDown size={15} className="hidden text-slate-500 sm:block" />
          </button>
        </div>
      </div>
    </header>
  )
}

function SearchBox({ value = '', onChange }) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
      <Search size={17} className="shrink-0 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="Search problems, topics, companies..."
        className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
      />
      <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 md:block">⌘ K</kbd>
    </label>
  )
}

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <button onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white pt-16 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col p-4">
          <div className="mb-4 flex items-center justify-between px-2 lg:hidden">
            <span className="text-sm font-extrabold text-slate-950">DSA Navigation</span>
            <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close navigation"><X size={18} /></button>
          </div>
          <div className="mb-4 rounded-2xl bg-slate-950 p-4 text-white shadow-xl shadow-slate-950/10">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-lg bg-white/10 p-2"><Zap size={17} /></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Phase 1</span>
            </div>
            <p className="text-sm font-extrabold">Build your coding habit</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">Practice consistently and track every milestone.</p>
          </div>
          <nav className="space-y-1 overflow-y-auto">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold no-underline transition ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-slate-100 pt-3">
            <NavLink to="/unlock" onClick={onClose} className="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-extrabold text-blue-700 no-underline transition hover:bg-blue-50">
              <Sparkles size={18} /> Unlock All DSA
            </NavLink>
            <NavLink to="/settings" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold text-slate-600 no-underline transition hover:bg-slate-50 hover:text-slate-950">
              <Settings size={18} /> Settings
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  )
}

function PageRouter({ search }) {
  const location = useLocation()
  const title = useMemo(() => navItems.find((item) => item.to === location.pathname)?.label, [location.pathname])

  if (location.pathname === '/') return <Overview />
  return <Placeholder title={title || 'DSA Practice'} search={search} />
}

function Overview() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-blue-200"><Sparkles size={14} /> DSA Practice Workspace</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Master DSA. Build consistency. Crack interviews.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">A structured workspace for topic-wise practice, company preparation, coding, progress and long-term interview readiness.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <NavLink to="/problems" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-slate-950 no-underline transition hover:bg-blue-50"><Code2 size={17} /> Start Practice</NavLink>
              <NavLink to="/topics" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-extrabold text-white no-underline transition hover:bg-white/10"><BrainCircuit size={17} /> Explore Topics</NavLink>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[430px] lg:grid-cols-2">
            {stats.slice(0, 2).map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><Icon size={18} className="text-blue-300" /><p className="mt-5 text-2xl font-black">{value}</p><p className="mt-1 text-xs font-semibold text-slate-400">{label}</p></div>)}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, meta, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.02]">
            <div className="flex items-start justify-between"><span className="rounded-xl bg-slate-100 p-2.5 text-slate-700"><Icon size={18} /></span><span className="text-xs font-bold text-slate-400">Live</span></div>
            <p className="mt-5 text-2xl font-black tracking-tight text-slate-950">{value}</p>
            <p className="mt-1 text-sm font-extrabold text-slate-700">{label}</p>
            <p className="mt-1 text-xs font-medium text-slate-400">{meta}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-950">Continue solving</h2><p className="mt-1 text-sm text-slate-500">Your recent practice will appear here.</p></div><Code2 size={21} className="text-blue-600" /></div>
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center"><p className="text-sm font-bold text-slate-700">No problems attempted yet</p><p className="mt-1 text-xs text-slate-400">Choose a difficulty or topic and make your first submission.</p><NavLink to="/problems" className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-extrabold text-white no-underline transition hover:bg-slate-800">Browse Problems</NavLink></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-950">Daily challenge</h2><p className="mt-1 text-sm text-slate-500">One problem. Every day.</p></div><Target size={21} className="text-blue-600" /></div>
          <div className="mt-6 rounded-2xl bg-blue-50 p-5"><p className="text-xs font-extrabold uppercase tracking-wider text-blue-700">Coming next</p><p className="mt-2 text-sm font-bold leading-6 text-slate-800">Daily Challenge, streaks and submissions will connect to the DSA backend in the next phases.</p></div>
        </div>
      </section>
    </div>
  )
}

function Placeholder({ title, search }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Code2 size={25} /></span>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">Phase 1 foundation</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">The route and responsive application shell are ready. Feature modules will be implemented according to the DSA roadmap without changing this foundation.</p>
        {search && <p className="mt-5 text-xs font-bold text-slate-400">Search: “{search}”</p>}
      </div>
    </section>
  )
}

export default App
