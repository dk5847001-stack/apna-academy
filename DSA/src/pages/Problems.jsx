import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Filter, LockKeyhole, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { listDsaProblems } from "../services/dsa.service.js";

const difficulties = ["", "Easy", "Medium", "Hard"];

const difficultyClass = {
  Easy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Hard: "border-rose-200 bg-rose-50 text-rose-700",
};

const normaliseError = (error) => {
  if (error?.status === 401) return "Your login session is missing or expired. Please log in to ApnaAcademy first.";
  return error?.message || "Unable to load DSA problems.";
};

function ProblemCard({ problem }) {
  const locked = Boolean(problem.locked || problem.isPremium);
  return (
    <article className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition ${locked ? "border-slate-200" : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${difficultyClass[problem.difficulty] || "border-slate-200 bg-slate-50 text-slate-600"}`}>
              {problem.difficulty || "Unknown"}
            </span>
            {locked ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white"><LockKeyhole size={11} /> Premium</span>
            ) : (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">Free</span>
            )}
          </div>
          <h2 className="mt-3 truncate text-base font-black text-slate-950">{problem.title}</h2>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{problem.description || "Practice this interview-focused DSA problem."}</p>
        </div>
        <span className="shrink-0 text-xs font-black text-slate-300">#{problem.order ?? "—"}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {(problem.topics || []).slice(0, 4).map((topic) => <span key={topic} className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">{topic}</span>)}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        {locked ? (
          <Link to="/unlock" className="inline-flex items-center gap-2 text-xs font-black text-slate-800 hover:text-slate-950">Unlock full library <ChevronRight size={14} /></Link>
        ) : (
          <Link to={`/practice/${problem.slug}`} className="inline-flex items-center gap-2 text-xs font-black text-slate-800 hover:text-slate-950">Open problem <ChevronRight size={14} /></Link>
        )}
        <span className="text-[10px] font-bold text-slate-400">{(problem.companies || []).slice(0, 2).join(" · ") || "Interview prep"}</span>
      </div>
    </article>
  );
}

export default function Problems() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "");
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [company, setCompany] = useState(searchParams.get("company") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [data, setData] = useState({ items: [], pagination: { page: 1, pages: 0, total: 0 }, access: { freePercent: 20, lockedPercent: 80, premium: false } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = { page, limit: 12, search, difficulty, topic, company };
      setSearchParams(params, { replace: true });
      setLoading(true);
      setError("");
      listDsaProblems(params)
        .then((result) => setData(result || { items: [], pagination: { page, pages: 0, total: 0 }, access: {} }))
        .catch((requestError) => setError(normaliseError(requestError)))
        .finally(() => setLoading(false));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, difficulty, topic, company, page, setSearchParams]);

  const stats = useMemo(() => {
    const items = data.items || [];
    return {
      freeOnPage: items.filter((item) => !item.isPremium).length,
      premiumOnPage: items.filter((item) => item.isPremium || item.locked).length,
    };
  }, [data.items]);

  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-200"><Sparkles size={12} /> DSA Library</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Practice problems that prepare you for interviews.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">Search by problem, topic or company. 20% is free and 80% stays protected behind DSA Premium.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <Metric label="Total" value={data.pagination?.total ?? 0} />
            <Metric label="Free" value={data.access?.freeTotal ?? stats.freeOnPage} />
            <Metric label="Premium" value={data.access?.premiumTotal ?? stats.premiumOnPage} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_170px_170px_170px_auto]">
          <label className="relative block">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search title, topic or company..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-slate-400 focus:bg-white" />
          </label>
          <Select label="Difficulty" value={difficulty} onChange={updateFilter(setDifficulty)} options={difficulties} />
          <input value={topic} onChange={(event) => { setTopic(event.target.value); setPage(1); }} placeholder="Topic" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold outline-none focus:border-slate-400 focus:bg-white" />
          <input value={company} onChange={(event) => { setCompany(event.target.value); setPage(1); }} placeholder="Company" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold outline-none focus:border-slate-400 focus:bg-white" />
          <button type="button" onClick={() => { setSearch(""); setDifficulty(""); setTopic(""); setCompany(""); setPage(1); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50"><Filter size={15} /> Reset</button>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>
      ) : data.items?.length ? (
        <>
          <div className="flex items-center justify-between gap-3 px-1"><div className="flex items-center gap-2 text-xs font-bold text-slate-500"><SlidersHorizontal size={14} /> Showing {data.items.length} of {data.pagination.total}</div><div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Page {data.pagination.page} / {Math.max(data.pagination.pages, 1)}</div></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.items.map((problem) => <ProblemCard key={problem.slug} problem={problem} />)}</div>
          <Pagination page={page} pages={data.pagination.pages} onChange={setPage} />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 text-base font-black text-slate-800">No published problems found</h2><p className="mt-1 text-sm text-slate-400">Create and publish DSA problems from the Admin panel, then refresh this page.</p></div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Premium protection</p><h2 className="mt-1 text-lg font-black text-slate-950">20% free • 80% premium</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">The backend decides whether an account can access premium content. Locked problem details, editorials, solutions and starter code are never exposed to a free account.</p></div><Link to="/unlock" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white hover:bg-slate-800"><LockKeyhole size={15} /> Unlock all DSA</Link></div></section>
    </div>
  );
}

function Metric({ label, value }) { return <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>; }
function Select({ label, value, onChange, options }) { return <label className="relative"><span className="sr-only">{label}</span><select value={value} onChange={onChange} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold outline-none focus:border-slate-400 focus:bg-white">{options.map((option) => <option key={option} value={option}>{option || `All ${label}`}</option>)}</select></label>; }
function Pagination({ page, pages, onChange }) { if (!pages || pages <= 1) return null; return <div className="flex items-center justify-center gap-2 pt-2"><button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={17} /></button>{Array.from({ length: Math.min(pages, 7) }, (_, index) => { const current = index + 1; return <button type="button" key={current} onClick={() => onChange(current)} className={`h-9 min-w-9 rounded-xl px-3 text-xs font-black ${current === page ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{current}</button>; })}<button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={17} /></button></div>; }
