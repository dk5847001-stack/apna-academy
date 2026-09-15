import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, CheckCircle2, Flame, LockKeyhole, Target, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { getDsaProgress } from "../services/dsa.service.js";

export default function Overview() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    getDsaProgress().then(setProgress).catch(() => setProgress(null));
  }, []);

  const solved = progress?.totalSolved ?? 0;
  const attempted = progress?.totalAttempted ?? 0;
  const streak = progress?.currentStreak ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-200">ApnaAcademy DSA</span><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Master DSA. Build consistency. Crack interviews.</h1><p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">A structured workspace for topic-wise practice, company preparation, coding and long-term interview readiness.</p><div className="mt-6 flex flex-wrap gap-3"><Link to="/practice" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-slate-100">Start practicing <ArrowRight size={16} /></Link><Link to="/unlock" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-white hover:bg-white/10">Unlock premium</Link></div></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[390px]"><HeroMetric icon={CheckCircle2} label="Solved" value={solved} /><HeroMetric icon={Zap} label="Attempted" value={attempted} /><HeroMetric icon={Flame} label="Streak" value={`${streak} days`} /></div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={CheckCircle2} label="Problems Solved" value={solved} meta="Accepted solutions" /><Stat icon={Zap} label="Problems Attempted" value={attempted} meta="Your coding activity" /><Stat icon={Target} label="XP" value={progress?.xp ?? 0} meta="Earned through practice" /><Stat icon={Flame} label="Current Streak" value={`${streak} days`} meta="Keep solving daily" /></div>
      <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-slate-400">Your progress</p><h2 className="mt-1 text-lg font-black text-slate-950">Keep building momentum</h2></div><BarChart3 size={20} className="text-slate-400" /></div><div className="mt-6 grid grid-cols-3 gap-3 text-center"><ProgressBox label="Solved" value={solved} /><ProgressBox label="Attempted" value={attempted} /><ProgressBox label="Longest streak" value={`${progress?.longestStreak ?? 0}d`} /></div></section><section className="rounded-2xl bg-slate-950 p-6 text-white shadow-lg"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><LockKeyhole size={20} /></div><p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-blue-200">Premium DSA</p><h2 className="mt-2 text-xl font-black">20% free • 80% premium</h2><p className="mt-2 text-sm leading-6 text-slate-300">Explore the free library first, then unlock the complete interview-prep collection.</p><Link to="/unlock" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950">Unlock all DSA <ArrowRight size={14} /></Link></section></div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-base font-black text-slate-950">Ready for your next problem?</h2><p className="mt-1 text-xs text-slate-500">Use search, difficulty, topic and company filters to build your practice set.</p></div><Link to="/practice" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white">Browse problems <ArrowRight size={14} /></Link></div></section>
    </div>
  );
}

function HeroMetric({ icon: Icon, label, value }) { return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Icon size={16} className="text-slate-400" /><p className="mt-3 text-2xl font-black">{value}</p><p className="mt-1 text-xs font-semibold text-slate-400">{label}</p></div>; }
function Stat({ icon: Icon, label, value, meta }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon size={18} /></div><p className="mt-5 text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-sm font-black text-slate-700">{label}</p><p className="mt-1 text-xs text-slate-400">{meta}</p></div>; }
function ProgressBox({ label, value }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-lg font-black text-slate-950">{value}</p><p className="mt-1 text-[11px] font-bold text-slate-400">{label}</p></div>; }
