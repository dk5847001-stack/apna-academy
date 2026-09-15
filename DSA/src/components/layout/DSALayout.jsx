import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  Bookmark,
  BrainCircuit,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  LayoutDashboard,
  ListChecks,
  Menu,
  Search,
  Settings,
  Sparkles,
  Trophy,
  UserRound,
  X,
  Zap,
} from 'lucide-react'

const practiceItems = [
  { label: 'All Problems', to: '/dsa/practice' },
  { label: 'Easy', to: '/dsa/practice/easy' },
  { label: 'Medium', to: '/dsa/practice/medium' },
  { label: 'Hard', to: '/dsa/practice/hard' },
]

const primaryItems = [
  { label: 'Overview', to: '/dsa', icon: LayoutDashboard, end: true },
  { label: 'Topics', to: '/dsa/topics', icon: BrainCircuit },
  { label: 'Companies', to: '/dsa/companies', icon: Building2 },
  { label: 'Daily Challenge', to: '/dsa/daily-challenge', icon: Zap },
  { label: 'Study Plans', to: '/dsa/study-plans', icon: ListChecks },
  { label: 'My Progress', to: '/dsa/progress', icon: BarChart3 },
  { label: 'Submissions', to: '/dsa/submissions', icon: ListChecks },
  { label: 'Bookmarks', to: '/dsa/bookmarks', icon: Bookmark },
  { label: 'Leaderboard', to: '/dsa/leaderboard', icon: Trophy },
]

function Sidebar({ open, collapsed, onClose, onToggle }) {
  const location = useLocation()
  const practiceActive = location.pathname.startsWith('/dsa/practice')

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-all duration-300 lg:static lg:z-auto lg:shadow-none ${
          collapsed ? 'lg:w-20' : 'lg:w-72'
        } ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <Link to="/dsa" className="flex min-w-0 items-center gap-3 no-underline">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white shadow-sm">
              <BrainCircuit size={21} />
            </span>
            {!collapsed && (
              <span className="truncate text-base font-black tracking-tight text-slate-950">
                ApnaAcademy <span className="text-blue-600">DSA</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:block"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
          )}
          {primaryItems.slice(0, 1).map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} onNavigate={onClose} />
          ))}

          <div className="pt-2">
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Practice</p>
            )}
            <div className={`rounded-xl ${practiceActive ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center">
                <Link
                  to="/dsa/practice"
                  onClick={onClose}
                  className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold no-underline transition-colors ${practiceActive ? 'text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
                >
                  <ListChecks size={19} />
                  {!collapsed && <span>Practice</span>}
                </Link>
              </div>
              {!collapsed && practiceActive && (
                <div className="space-y-0.5 px-3 pb-2 pl-11">
                  {practiceItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/dsa/practice'}
                      onClick={onClose}
                      className={({ isActive }) => `block rounded-lg px-3 py-2 text-xs font-semibold no-underline transition-colors ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!collapsed && (
            <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Explore</p>
          )}
          {primaryItems.slice(1).map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} onNavigate={onClose} />
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <Link
            to="/dsa/unlock"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl bg-slate-950 px-3 py-3 text-white no-underline transition hover:bg-blue-700 ${collapsed ? 'justify-center' : ''}`}
          >
            <Sparkles size={18} />
            {!collapsed && (
              <span className="min-w-0">
                <span className="block text-xs font-bold">Unlock All DSA</span>
                <span className="block text-[10px] text-slate-300">Premium access</span>
              </span>
            )}
          </Link>
        </div>
      </aside>
    </>
  )
}

function SidebarLink({ item, collapsed, onNavigate }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold no-underline transition-colors ${collapsed ? 'justify-center' : ''} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
    >
      <Icon size={19} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}

function Topbar({ onOpenSidebar }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const location = useLocation()

  const pageTitle = useMemo(() => {
    if (location.pathname === '/dsa') return 'DSA Overview'
    if (location.pathname.includes('practice')) return 'Practice Problems'
    if (location.pathname.includes('topics')) return 'DSA Topics'
    if (location.pathname.includes('companies')) return 'Company Questions'
    if (location.pathname.includes('progress')) return 'My Progress'
    if (location.pathname.includes('leaderboard')) return 'Leaderboard'
    return 'DSA Workspace'
  }, [location.pathname])

  useEffect(() => {
    const close = () => setProfileOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button type="button" onClick={onOpenSidebar} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open sidebar">
          <Menu size={21} />
        </button>

        <div className="hidden min-w-0 md:block">
          <p className="truncate text-sm font-bold text-slate-950">{pageTitle}</p>
          <p className="text-[11px] text-slate-400">Keep learning. Keep solving.</p>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className={`${searchOpen ? 'w-44 sm:w-72' : 'w-10'} flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all duration-200`}>
            <button type="button" onClick={() => setSearchOpen((value) => !value)} className="grid h-10 w-10 shrink-0 place-items-center text-slate-500 hover:text-slate-950" aria-label="Toggle search">
              <Search size={18} />
            </button>
            {searchOpen && (
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search problems..."
                className="min-w-0 flex-1 bg-transparent pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            )}
          </div>

          <div className="hidden items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-600 sm:flex">
            <Flame size={17} /> 7 day streak
          </div>

          <button type="button" className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-950" aria-label="Notifications">
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setProfileOpen((value) => !value)
              }}
              className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100"
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-sm font-black text-white">DK</span>
              <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
            </button>
            {profileOpen && (
              <div onClick={(event) => event.stopPropagation()} className="absolute right-0 top-12 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <div className="border-b border-slate-100 px-3 py-3">
                  <p className="text-sm font-bold text-slate-950">Student Account</p>
                  <p className="text-xs text-slate-500">ApnaAcademy learner</p>
                </div>
                <Link to="/dsa/profile" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 no-underline hover:bg-slate-50 hover:text-slate-950"><UserRound size={17} /> Profile</Link>
                <Link to="/dsa/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 no-underline hover:bg-slate-50 hover:text-slate-950"><Settings size={17} /> Settings</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default function DSALayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarCollapsed((value) => !value)}
        />
        <div className="min-w-0 flex-1">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
