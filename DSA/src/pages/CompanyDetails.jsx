import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, ChevronRight, LockKeyhole, Search } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getDsaCompany } from "../services/dsa.service.js";

const difficultyClass = { Easy: "border-emerald-200 bg-emerald-50 text-emerald-700", Medium: "border-amber-200 bg-amber-50 text-amber-700", Hard: "border-rose-200 bg-rose-50 text-rose-700" };
const errorMessage = (error) => error?.status === 401 ? "Please log in to access company questions." : error?.status === 404 ? "Company preparation page not found." : error?.message || "Unable to load company preparation.";

export default function CompanyDetails() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true); setError("");
    getDsaCompany(slug).then(setData).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  }, [slug]);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return data?.items || [];
    return (data?.items || []).filter((item) => [item.title, item.description, ...(item.topics || [])].join(" ").toLowerCase().includes(value));
  }, [data, search]);
  const pageSize = 12;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="mx-auto max-w-6xl space-y-5"><div className="h-56 animate-pulse rounded-3xl bg-slate-200" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div></div>;
  if (error) return <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center"><h1 className="text-xl font-black text-rose-800">Unable to load company practice</h1><p className="mt-2 text-sm font-medium text-rose-700">{error}</p><Link to="/companies" className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white">Back to companies</Link></div>;

  const company = data?.company;
  return <div className="mx-auto max-w-6xl space-y-5">
    <Link to="/companies" className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-950"><ArrowLeft size={14} /> All companies</Link>
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8"><div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" /><div className="relative"><div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-200"><Building2 size={12} /> Company preparation</div><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{company.name} DSA Interview Questions</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Practice published DSA problems mapped to {company.name}, organized by difficulty and interview-focused topics.</p><div className="mt-6 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="Problems" value={company.total} /><Metric label="Easy" value={company.easy} /><Metric label="Medium" value={company.medium} /><Metric label="Hard" value={company.hard} /></div><div className="mt-3 text-xs font-bold text-slate-300">{data?.progress?.solved || 0} solved · {data?.progress?.attempted || 0} attempted</div></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><label className="relative block"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={"Search " + company.name + " problems..."} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-slate-400 focus:bg-white" /></label></section>
    {visible.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((problem) => <ProblemCard key={problem.slug} problem={problem} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 text-base font-black text-slate-800">No matching problems</h2><p className="mt-1 text-sm text-slate-400">Try a different search term.</p></div>}
    {pages > 1 && <div className="flex flex-wrap justify-center gap-2">{Array.from({ length: pages }, (_, i) => i + 1).map((item) => <button key={item} type="button" onClick={() => setPage(item)} className={"h-9 min-w-9 rounded-xl px-3 text-xs font-black " + (item === page ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600")}>{item}</button>)}</div>}
  </div>;
}

function ProblemCard({ problem }) {
  const locked = problem.locked === true;
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><span className={"rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide " + (difficultyClass[problem.difficulty] || "border-slate-200 bg-slate-50 text-slate-600")}>{problem.difficulty}</span>{locked && <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-black text-white"><LockKeyhole size={11} /> Premium</span>}</div><h2 className="mt-4 line-clamp-2 text-base font-black text-slate-950">{problem.title}</h2><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{problem.description || "Interview-focused DSA problem."}</p><div className="mt-4 flex flex-wrap gap-1.5">{(problem.topics || []).slice(0, 4).map((topic) => <span key={topic} className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">{topic}</span>)}</div><div className="mt-5 border-t border-slate-100 pt-4">{locked ? <Link to="/unlock" className="inline-flex items-center gap-2 text-xs font-black text-slate-800">Unlock full library <ChevronRight size={14} /></Link> : <Link to={"/practice/" + problem.slug} className="inline-flex items-center gap-2 text-xs font-black text-slate-800">Open problem <ChevronRight size={14} /></Link>}</div></article>;
}
function Metric({ label, value }) { return <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>; }