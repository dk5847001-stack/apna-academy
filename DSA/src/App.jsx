import { Route, Routes } from 'react-router-dom'
import DSALayout from './components/layout/DSALayout.jsx'

function Overview() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-blue-200">✦ DSA Practice Workspace</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Master DSA. Build consistency. Crack interviews.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">A structured workspace for topic-wise practice, company preparation, coding, progress and long-term interview readiness.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[430px] lg:grid-cols-2">
            <Stat label="Problems Solved" value="0" />
            <Stat label="Current Streak" value="0 days" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Problems Solved" value="0" meta="Start your first problem" />
        <StatCard label="Current Streak" value="0 days" meta="Solve today to begin" />
        <StatCard label="Accuracy" value="—" meta="No submissions yet" />
        <StatCard label="Global Rank" value="—" meta="Unlock after activity" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Continue solving" description="Your recent practice will appear here.">
          <EmptyState text="No problems attempted yet" subtext="Choose a difficulty or topic and make your first submission." />
        </Panel>
        <Panel title="Daily challenge" description="One problem. Every day.">
          <div className="rounded-2xl bg-blue-50 p-5"><p className="text-xs font-extrabold uppercase tracking-wider text-blue-700">Coming next</p><p className="mt-2 text-sm font-bold leading-6 text-slate-800">Daily Challenge, streaks and submissions will connect to the DSA backend in the next phases.</p></div>
        </Panel>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-2xl font-black">{value}</p><p className="mt-1 text-xs font-semibold text-slate-400">{label}</p></div>
}

function StatCard({ label, value, meta }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-2xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-sm font-extrabold text-slate-700">{label}</p><p className="mt-1 text-xs font-medium text-slate-400">{meta}</p></div>
}

function Panel({ title, description, children }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-black text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p><div className="mt-6">{children}</div></section>
}

function EmptyState({ text, subtext }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center"><p className="text-sm font-bold text-slate-700">{text}</p><p className="mt-1 text-xs text-slate-400">{subtext}</p></div>
}

function Placeholder({ title }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">Phase 1 foundation</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-500">The responsive application shell is ready. This feature module will be implemented according to the DSA roadmap.</p></div></section>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DSALayout />}>
        <Route index element={<Overview />} />
        <Route path="practice" element={<Placeholder title="Practice Problems" />} />
        <Route path="practice/easy" element={<Placeholder title="Easy Problems" />} />
        <Route path="practice/medium" element={<Placeholder title="Medium Problems" />} />
        <Route path="practice/hard" element={<Placeholder title="Hard Problems" />} />
        <Route path="topics" element={<Placeholder title="DSA Topics" />} />
        <Route path="companies" element={<Placeholder title="Company Questions" />} />
        <Route path="daily-challenge" element={<Placeholder title="Daily Challenge" />} />
        <Route path="study-plans" element={<Placeholder title="Study Plans" />} />
        <Route path="progress" element={<Placeholder title="My Progress" />} />
        <Route path="submissions" element={<Placeholder title="Submissions" />} />
        <Route path="bookmarks" element={<Placeholder title="Bookmarks" />} />
        <Route path="leaderboard" element={<Placeholder title="Leaderboard" />} />
        <Route path="unlock" element={<Placeholder title="Unlock All DSA" />} />
        <Route path="profile" element={<Placeholder title="Profile" />} />
        <Route path="settings" element={<Placeholder title="Settings" />} />
        <Route path="*" element={<Placeholder title="Page Not Found" />} />
      </Route>
    </Routes>
  )
}
