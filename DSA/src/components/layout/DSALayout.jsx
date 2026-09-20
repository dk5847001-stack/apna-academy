import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, BarChart3, BookOpen, Bookmark, CalendarDays, Code2, GraduationCap, LayoutDashboard, Menu, Settings, Trophy, Users, X } from 'lucide-react'
import CodingPractice from '../../pages/CodingPractice.jsx'
import { FRONTEND_URL, DASHBOARD_URL, COURSE_URL } from '../../constants/config.js'

const navItems = [
  ['Overview', '/', LayoutDashboard], ['Practice', '/practice', Code2], ['Topics', '/topics', BookOpen], ['Companies', '/companies', Users],
  ['Daily Challenge', '/daily-challenge', CalendarDays], ['Study Plans', '/study-plans', GraduationCap], ['Progress', '/progress', BarChart3],
  ['Submissions', '/submissions', Activity], ['Bookmarks', '/bookmarks', Bookmark], ['Leaderboard', '/leaderboard', Trophy],
]

export default function DSALayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const codingWorkspace = location.pathname === '/practice/code'

  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="flex h-16 items-center justify-between px-4 sm:px-6"><div className="flex items-center gap-3"><button type="button" onClick={() => setOpen(true)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button><NavLink to="/" className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white"><Code2 className="h-5 w-5" /></span><span className="text-sm font-black tracking-tight sm:text-base">ApnaAcademy <span className="text-blue-600">DSA</span></span></NavLink></div><div className="flex items-center gap-1.5 sm:gap-2"><nav className="hidden items-center gap-1 lg:flex" aria-label="ApnaAcademy apps"><a href={FRONTEND_URL} className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Website</a><a href={COURSE_URL} className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Courses</a><a href={DASHBOARD_URL} className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Dashboard</a></nav><NavLink to="/unlock" className="hidden rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white hover:bg-slate-800 sm:inline-flex">Unlock All DSA</NavLink><NavLink to="/settings" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Settings"><Settings className="h-4 w-4" /></NavLink></div></div></header>
    <div className="flex">
      <aside className={`fixed inset-y-16 left-0 z-40 w-72 border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex h-full flex-col p-3"><div className="mb-2 flex justify-end lg:hidden"><button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Close navigation"><X className="h-5 w-5" /></button></div><div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-2"><p className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">ApnaAcademy</p><a href={FRONTEND_URL} onClick={() => setOpen(false)} className="flex items-center rounded-xl px-2.5 py-2 text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-950">Website</a><a href={COURSE_URL} onClick={() => setOpen(false)} className="flex items-center rounded-xl px-2.5 py-2 text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-950">Courses</a><a href={DASHBOARD_URL} onClick={() => setOpen(false)} className="flex items-center rounded-xl px-2.5 py-2 text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-950">Dashboard</a></div><nav className="space-y-1 overflow-y-auto">{navItems.map(([label, to, Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-black transition ${isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}><Icon className="h-4 w-4" />{label}</NavLink>)}</nav><div className="mt-auto rounded-2xl bg-slate-950 p-4 text-white"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-300">Premium</p><p className="mt-2 text-xs font-bold leading-5 text-slate-300">20% free access. Unlock the full DSA library for interview preparation.</p><NavLink to="/unlock" onClick={() => setOpen(false)} className="mt-3 inline-flex text-xs font-black text-white">Unlock now →</NavLink></div></div></aside>
      {open && <button type="button" aria-label="Close navigation overlay" onClick={() => setOpen(false)} className="fixed inset-0 top-16 z-30 bg-slate-950/40 lg:hidden" />}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{codingWorkspace ? <CodingPractice /> : <Outlet />}</main>
    </div>
  </div>
}
