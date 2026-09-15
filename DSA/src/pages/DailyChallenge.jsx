import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, LockKeyhole, RefreshCw, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { getDsaDailyChallenge } from "../services/dsa.service.js";

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setChallenge(await getDsaDailyChallenge()); }
    catch (err) { setError(err.message || "Unable to load today's challenge."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading today's challenge…</div>;
  if (error) return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center"><p className="font-bold text-rose-700">{error}</p><button onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"><RefreshCw size={15}/>Retry</button></div>;
  if (!challenge) return null;

  const problem = challenge.problem;
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300"><Sparkles size={13}/> Daily Challenge</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{challenge.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{challenge.description}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-right"><CalendarDays className="ml-auto" size={20}/><p className="mt-2 text-xs font-bold text-slate-300">{challenge.date}</p></div>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Today's problem</p><h2 className="mt-1 text-2xl font-black text-slate-950">{problem.title}</h2></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{problem.difficulty}</span>
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">{problem.description || "Complete the selected problem and build your daily solving streak."}</p>
        <div className="mt-5 flex flex-wrap gap-2">{(problem.topics || []).map((topic) => <span key={topic} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{topic}</span>)}</div>
        {problem.locked ? (
          <Link to="/unlock" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"><LockKeyhole size={16}/> Unlock to solve <ArrowRight size={16}/></Link>
        ) : (
          <Link to={`/practice/${problem.slug}`} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"><Target size={16}/> Solve challenge <ArrowRight size={16}/></Link>
        )}
      </div>
    </section>
  );
}
