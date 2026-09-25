import { useCallback, useEffect, useState } from "react";
import { Alert, CircularProgress, Refresh } from "@mui/material";
import { getAdminAIUsage } from "../services/adminAIUsage.service";
import { getApiErrorMessage } from "../services/api";

const number = (value) => Number(value || 0).toLocaleString("en-IN");
const ms = (value) => Number(value || 0).toFixed(0) + " ms";

export default function AIUsagePanel({ preset = "30d" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData(await getAdminAIUsage({ preset }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load AI usage analytics."));
    } finally {
      setLoading(false);
    }
  }, [preset]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) {
    return <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><div className="flex items-center justify-center"><CircularProgress size={26} /></div></section>;
  }

  const totals = data?.totals || {};
  const successRate = totals.requests ? (totals.successfulRequests / totals.requests) * 100 : 0;

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-violet-700">AI operations</div>
          <h2 className="text-lg font-extrabold text-slate-950">AI Usage & Health</h2>
          <p className="text-xs text-slate-500">Requests, tokens, latency and feature usage. No prompt content is stored.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50 sm:self-auto"><Refresh fontSize="small" /> Refresh</button>
      </div>

      {error && <Alert severity="error" className="mt-4">{error}</Alert>}

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {[
          ["Requests", number(totals.requests)],
          ["Success", number(totals.successfulRequests)],
          ["Failed", number(totals.failedRequests)],
          ["Input tokens", number(totals.inputTokens)],
          ["Output tokens", number(totals.outputTokens)],
          ["Total tokens", number(totals.totalTokens)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-100 p-4">
          <p className="text-xs font-extrabold text-slate-700">Request health</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">{successRate.toFixed(1)}%</p>
          <p className="text-xs text-slate-400">successful AI requests</p>
        </div>
        <div className="rounded-xl border border-slate-100 p-4">
          <p className="text-xs font-extrabold text-slate-700">Average latency</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{ms(totals.averageLatencyMs)}</p>
          <p className="text-xs text-slate-400">provider round-trip</p>
        </div>
        <div className="rounded-xl border border-slate-100 p-4">
          <p className="text-xs font-extrabold text-slate-700">Model</p>
          <p className="mt-2 truncate text-sm font-black text-slate-900">{data?.byModel?.[0]?.model || "—"}</p>
          <p className="text-xs text-slate-400">{data?.byModel?.[0]?.provider || "Provider not recorded"}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Feature usage</h3>
          <div className="mt-3 space-y-2">
            {(data?.byFeature || []).map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <div><p className="text-sm font-bold text-slate-700">{item.key}</p><p className="text-xs text-slate-400">{number(item.totalTokens)} tokens</p></div>
                <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-black text-violet-700">{number(item.requests)}</span>
              </div>
            ))}
            {!data?.byFeature?.length && <p className="rounded-xl bg-slate-50 p-4 text-xs font-semibold text-slate-400">No AI activity in this period.</p>}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Course AI usage</h3>
          <div className="mt-3 space-y-2">
            {(data?.byCourse || []).slice(0, 8).map((item) => (
              <div key={item.courseId || item.title} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-700">{item.title}</p><p className="text-xs text-slate-400">{number(item.totalTokens)} tokens</p></div>
                <span className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{number(item.requests)}</span>
              </div>
            ))}
            {!data?.byCourse?.length && <p className="rounded-xl bg-slate-50 p-4 text-xs font-semibold text-slate-400">No course-specific AI activity in this period.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
