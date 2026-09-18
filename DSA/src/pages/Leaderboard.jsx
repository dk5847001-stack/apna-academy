import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Medal, Trophy, Zap } from "lucide-react";
import { listDsaLeaderboard } from "../services/dsa.service.js";

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    listDsaLeaderboard({ page, limit: 50 }).then((result) => {
      if (active) setData(result);
    }).catch((err) => {
      if (active) setError(err.message || "Unable to load leaderboard.");
    });
    return () => { active = false; };
  }, [page]);

  if (error) return <section className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm font-semibold text-rose-700">{error}</section>;
  if (!data) return <section className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading leaderboard...</section>;

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">DSA leaderboard</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Solved problems & XP</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Rankings use unique solved problems first, then XP, best streak and activity time as tie-breakers.</p>
        <div className="mt-5 inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><span className="text-2xl font-black">{data.participantCount}</span><span className="ml-2 self-end pb-0.5 text-xs font-bold text-slate-400">participants</span></div>
      </div>

      {data.me ? <div className="grid gap-3 sm:grid-cols-4">
        <Mini icon={Medal} label="My rank" value={data.me.rank ? "#" + data.me.rank : "—"} />
        <Mini icon={Trophy} label="Solved" value={data.me.totalSolved} />
        <Mini icon={Zap} label="XP" value={data.me.xp} />
        <Mini icon={Flame} label="Streak" value={data.me.currentStreak + "d"} />
      </div> : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {data.items.length ? data.items.map((item) => (
            <article key={item.userId} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex w-14 items-center gap-3"><span className="text-lg font-black text-slate-400">#{item.rank}</span>{item.rank <= 3 ? <Medal className="h-5 w-5 text-slate-700" /> : null}</div>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {item.avatar ? <img src={item.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-sm font-black text-slate-600">{item.name?.charAt(0)?.toUpperCase() || "A"}</div>}
                <div className="min-w-0"><p className="truncate font-black text-slate-950">{item.name}</p><p className="text-xs text-slate-500">{item.totalSolved} solved · {item.totalAttempted} attempted</p></div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700">{item.xp} XP</span><span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700">{item.currentStreak}d streak</span><span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700">{item.longestStreak}d best</span></div>
            </article>
          )) : <div className="p-12 text-center text-sm text-slate-500">No solved problems yet. Solve a problem to enter the leaderboard.</div>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4"><span className="text-xs font-semibold text-slate-500">Page {data.pagination.page} of {Math.max(1, data.pagination.pages)}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-xl border border-slate-200 p-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><button type="button" disabled={page >= data.pagination.pages} onClick={() => setPage((value) => value + 1)} className="rounded-xl border border-slate-200 p-2 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
      </div>
    </section>
  );
}

function Mini({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><Icon className="h-4 w-4 text-slate-500" /><p className="mt-3 text-xl font-black text-slate-950">{value}</p><p className="mt-1 text-xs font-bold text-slate-400">{label}</p></div>;
}
