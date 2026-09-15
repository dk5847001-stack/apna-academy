import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3, Search, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { getDsaStudyPlans } from "../services/dsa.service.js";

const durations = ["All", "30", "60", "90"];

export default function StudyPlans() {
  const [plans, setPlans] = useState([]);
  const [duration, setDuration] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDsaStudyPlans().then(setPlans).catch((err) => setError(err.message || "Unable to load study plans.")).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => plans.filter((plan) => {
    const matchesDuration = duration === "All" || String(plan.durationDays) === duration;
    const q = search.trim().toLowerCase();
    return matchesDuration && (!q || `${plan.title} ${plan.description} ${(plan.focus || []).join(" ")}`.toLowerCase().includes(q));
  }), [plans, duration, search]);

  return (
    <section className="space-y-7">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Structured preparation</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">DSA Study Plans</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Choose a focused 30, 60, or 90-day path and build consistent problem-solving habits.</p>
      </header>
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plans, topics or focus…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-400"/></div>
        <div className="flex gap-2 overflow-x-auto">{durations.map((item) => <button key={item} onClick={() => setDuration(item)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-black ${duration === item ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>{item === "All" ? item : `${item} Days`}</button>)}</div>
      </div>
      {loading && <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading study plans…</div>}
      {error && <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No published study plans match your search.</div>}
      <div className="grid gap-5 lg:grid-cols-3">{filtered.map((plan) => (
        <article key={plan.slug} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between"><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">{plan.level}</span><span className="text-xs font-bold text-slate-400">#{plan.order}</span></div>
          <h2 className="mt-5 text-xl font-black text-slate-950">{plan.title}</h2><p className="mt-2 min-h-14 text-sm leading-6 text-slate-500">{plan.description}</p>
          <div className="mt-5 flex items-center gap-4 text-xs font-bold text-slate-500"><span className="inline-flex items-center gap-1"><Clock3 size={14}/>{plan.durationDays} days</span><span className="inline-flex items-center gap-1"><CalendarDays size={14}/>{plan.days?.length || 0} milestones</span></div>
          <div className="mt-5 flex flex-wrap gap-2">{(plan.focus || []).slice(0, 4).map((item) => <span key={item} className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500">{item}</span>)}</div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5"><span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500"><BookOpen size={15}/>{(plan.days || []).reduce((sum, day) => sum + (day.problemIds?.length || 0), 0)} problems</span><Link to={`/study-plans/${plan.slug}`} className="inline-flex items-center gap-1 text-xs font-black text-slate-950">View plan <ArrowRight size={14}/></Link></div>
        </article>
      ))}</div>
    </section>
  );
}
