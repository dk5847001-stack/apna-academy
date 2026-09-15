import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock3, Target } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getDsaStudyPlan } from "../services/dsa.service.js";

export default function StudyPlanDetails() {
  const { slug } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { getDsaStudyPlan(slug).then(setPlan).catch((err) => setError(err.message || "Unable to load this plan.")).finally(() => setLoading(false)); }, [slug]);
  if (loading) return <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading plan…</div>;
  if (error || !plan) return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm font-bold text-rose-700">{error || "Study plan not found."}</div>;

  return <section className="space-y-6">
    <Link to="/study-plans" className="inline-flex items-center gap-2 text-xs font-black text-slate-500"><ArrowLeft size={15}/> All study plans</Link>
    <header className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-xl sm:p-10">
      <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-300">{plan.level}</span><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-300">{plan.durationDays} Days</span></div>
      <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{plan.title}</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{plan.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">{(plan.focus || []).map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">{item}</span>)}</div>
    </header>
    <div className="space-y-4">{(plan.days || []).map((day) => <article key={day.day} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-950 text-xs font-black text-white">{day.day}</div><div className="min-w-0 flex-1"><h2 className="text-lg font-black text-slate-950">{day.title}</h2><p className="mt-1 text-xs font-bold text-slate-400">{day.problemIds?.length || 0} problems</p></div><Target className="text-slate-300" size={20}/></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">{(day.problemIds || []).map((problem) => <Link key={problem._id || problem.slug} to={`/practice/${problem.slug}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"><span><span className="block text-sm font-bold text-slate-800">{problem.title}</span><span className="mt-1 flex items-center gap-2 text-[11px] font-bold text-slate-400"><Clock3 size={12}/>{problem.difficulty}{problem.isPremium ? " · Premium" : " · Free"}</span></span><ChevronRight size={16} className="text-slate-400"/></Link>)}</div>
    </article>)}</div>
  </section>;
}
