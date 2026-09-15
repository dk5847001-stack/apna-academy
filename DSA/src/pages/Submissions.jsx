import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Code2, XCircle } from "lucide-react";
import { listDsaSubmissions } from "../services/dsa.service.js";

const statusIcon = (status) => {
  if (status === "Accepted") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "Pending") return <Clock3 className="h-4 w-4" />;
  return <XCircle className="h-4 w-4" />;
};

export default function Submissions() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listDsaSubmissions({ page, limit: 20, status }).then((result) => {
      if (active) setData(result);
    }).catch((err) => {
      if (active) setError(err.message || "Unable to load submissions.");
    });
    return () => { active = false; };
  }, [page, status]);

  const changeStatus = (value) => { setStatus(value); setPage(1); };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">DSA activity</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Submission History</h1><p className="mt-2 text-sm text-slate-500">Review your latest code submissions and judge results.</p></div>
        <select value={status} onChange={(e) => changeStatus(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"><option value="">All statuses</option><option>Accepted</option><option>Wrong Answer</option><option>Compilation Error</option><option>Runtime Error</option><option>TLE</option><option>MLE</option><option>Runtime Limit</option><option>Internal Error</option><option>Pending</option></select>
      </div>

      {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">{error}</div> : null}
      {!data && !error ? <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading submissions...</div> : null}
      {data && !data.items.length ? <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No submissions found.</div> : null}

      {data?.items.length ? <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {data.items.map((item) => (
            <article key={item._id || `${item.createdAt}-${item.problemId?.slug}`} className="p-5 transition hover:bg-slate-50/70">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0"><div className="flex items-center gap-2"><Code2 className="h-4 w-4 shrink-0 text-slate-400" /><h2 className="truncate font-black text-slate-950">{item.problemId?.title || "Problem"}</h2></div><p className="mt-1 text-xs text-slate-500">{item.problemId?.difficulty || "—"} · {item.language} · {new Date(item.createdAt).toLocaleString()}</p></div>
                <div className="flex flex-wrap items-center gap-3 text-xs"><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2 font-bold text-slate-700">{statusIcon(item.status)}{item.status}</span><span className="rounded-full bg-slate-100 px-3 py-2 font-bold text-slate-600">{item.passedTests}/{item.totalTests} tests</span>{item.executionTimeMs != null ? <span className="rounded-full bg-slate-100 px-3 py-2 font-bold text-slate-600">{item.executionTimeMs} ms</span> : null}</div>
              </div>
              {item.judgeMessage ? <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">{item.judgeMessage}</p> : null}
            </article>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4"><span className="text-xs font-semibold text-slate-500">Page {data.pagination.page} of {Math.max(1, data.pagination.pages)} · {data.pagination.total} submissions</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-xl border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><button type="button" disabled={page >= data.pagination.pages} onClick={() => setPage((value) => value + 1)} className="rounded-xl border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
      </div> : null}
    </section>
  );
}
