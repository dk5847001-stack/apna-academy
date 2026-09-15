import { useEffect, useState } from "react";
import { Activity, Flame, Target, Trophy, Zap } from "lucide-react";
import { getDsaProgressDashboard } from "../services/dsa.service.js";

const StatCard = ({ icon: Icon, label, value, hint }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <div className="rounded-2xl bg-slate-100 p-3"><Icon className="h-5 w-5 text-slate-700" /></div>
      <span className="text-right text-2xl font-black text-slate-950">{value}</span>
    </div>
    <p className="mt-4 text-sm font-bold text-slate-900">{label}</p>
    <p className="mt-1 text-xs text-slate-500">{hint}</p>
  </div>
);

export default function Progress() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getDsaProgressDashboard().then((result) => {
      if (active) setData(result);
    }).catch((err) => {
      if (active) setError(err.message || "Unable to load progress.");
    });
    return () => { active = false; };
  }, []);

  if (error) return <section className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm font-semibold text-rose-700">{error}</section>;
  if (!data) return <section className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading your progress...</section>;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">DSA analytics</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">My Progress</h1>
        <p className="mt-2 text-sm text-slate-500">Track solved problems, attempts, accuracy, streaks and XP.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Target} label="Solved" value={data.totalSolved} hint={`${data.remaining} published problems remaining`} />
        <StatCard icon={Activity} label="Attempts" value={data.totalAttempted} hint="Problems you have attempted" />
        <StatCard icon={Target} label="Accuracy" value={`${data.accuracy}%`} hint="Solved / attempted" />
        <StatCard icon={Flame} label="Current streak" value={data.currentStreak} hint="Consecutive practice days" />
        <StatCard icon={Zap} label="XP" value={data.xp} hint={`Longest streak: ${data.longestStreak}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3"><Trophy className="h-5 w-5" /><h2 className="font-black text-slate-950">Solved by difficulty</h2></div>
          <div className="mt-5 space-y-3">
            {data.solvedBreakdown.difficulty.length ? data.solvedBreakdown.difficulty.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span className="font-semibold text-slate-700">{item.name}</span><span className="font-black text-slate-950">{item.count}</span></div>
            )) : <p className="text-sm text-slate-500">Solve your first problem to see the breakdown.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3"><Zap className="h-5 w-5" /><h2 className="font-black text-slate-950">Submission results</h2></div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {data.submissionStats.length ? data.submissionStats.map((item) => (
              <div key={item.status} className="rounded-2xl bg-slate-50 px-4 py-3"><p className="text-xs font-semibold text-slate-500">{item.status}</p><p className="mt-1 text-xl font-black text-slate-950">{item.count}</p></div>
            )) : <p className="col-span-2 text-sm text-slate-500">No submissions yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-black text-slate-950">Top topics</h2><div className="mt-4 flex flex-wrap gap-2">{data.solvedBreakdown.topics.length ? data.solvedBreakdown.topics.map((item) => <span key={item.name} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">{item.name} · {item.count}</span>) : <span className="text-sm text-slate-500">No topic data yet.</span>}</div></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-black text-slate-950">Top companies</h2><div className="mt-4 flex flex-wrap gap-2">{data.solvedBreakdown.companies.length ? data.solvedBreakdown.companies.map((item) => <span key={item.name} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">{item.name} · {item.count}</span>) : <span className="text-sm text-slate-500">No company data yet.</span>}</div></div>
      </div>
    </section>
  );
}
