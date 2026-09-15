import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, LockKeyhole, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getDsaTopics } from "../services/dsa.service.js";

const errorMessage = (error) => error?.status === 401 ? "Please log in to access DSA topics." : error?.message || "Unable to load topics.";

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDsaTopics().then(setTopics).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  const filtered = topics.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()));
  const total = topics.reduce((sum, item) => sum + item.total, 0);

  return <div className="mx-auto max-w-6xl space-y-5">
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8"><div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" /><div className="relative"><div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-200"><Sparkles size={12} /> Topic mastery</div><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Master DSA topic by topic.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Choose a topic and practice the interview problems mapped to it. Counts are generated from published problems in the DSA library.</p><div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-slate-300"><span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">{topics.length} topics</span><span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">{total} problem mappings</span><span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">20% free · 80% premium</span></div></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><label className="relative block"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search topics..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-slate-400 focus:bg-white" /></label></section>
    {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}
    {loading ? <GridSkeleton /> : filtered.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((topic) => <TopicCard key={topic.name} topic={topic} />)}</div> : <Empty />}
  </div>;
}

function TopicCard({ topic }) {
  return <Link to={`/practice?topic=${encodeURIComponent(topic.name)}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white"><BookOpen size={19} /></div><ArrowRight size={17} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700" /></div><h2 className="mt-5 text-lg font-black text-slate-950">{topic.name}</h2><p className="mt-1 text-xs font-semibold text-slate-400">{topic.total} problems</p><div className="mt-4 grid grid-cols-3 gap-2"><Mini label="Easy" value={topic.easy} /><Mini label="Medium" value={topic.medium} /><Mini label="Hard" value={topic.hard} /></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] font-black uppercase tracking-wide"><span className="text-emerald-600">{topic.free} free</span><span className="text-indigo-600">{topic.premium} premium</span></div></Link>;
}
function Mini({ label, value }) { return <div className="rounded-xl bg-slate-50 p-2 text-center"><p className="text-[9px] font-black uppercase text-slate-400">{label}</p><p className="mt-0.5 text-sm font-black text-slate-800">{value}</p></div>; }
function GridSkeleton() { return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>; }
function Empty() { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><LockKeyhole className="mx-auto h-7 w-7 text-slate-300" /><h2 className="mt-3 text-base font-black text-slate-800">No matching topics</h2><p className="mt-1 text-sm text-slate-400">Try another topic name.</p></div>; }
