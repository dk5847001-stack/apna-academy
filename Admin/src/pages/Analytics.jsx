import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Avatar, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { AssessmentOutlined, AttachMoneyOutlined, AutoGraphOutlined, DownloadOutlined, EmojiEventsOutlined, PeopleOutline, Refresh, SchoolOutlined, ShoppingBagOutlined, TrendingUp, VerifiedOutlined } from "@mui/icons-material";
import { getApiErrorMessage } from "../services/api";
import { getAdminAnalytics } from "../services/adminAnalytics.service";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const presets = [["7d", "7 Days"], ["30d", "30 Days"], ["90d", "3 Months"], ["180d", "6 Months"], ["1y", "1 Year"]];
const statCards = [
  ["totalStudents", "Total Students", PeopleOutline, "blue"], ["activeStudents", "Active Students", TrendingUp, "emerald"],
  ["totalCourses", "Total Courses", SchoolOutlined, "violet"], ["publishedCourses", "Published Courses", VerifiedOutlined, "indigo"],
  ["paidPurchases", "Paid Purchases", ShoppingBagOutlined, "amber"], ["revenue", "Revenue", AttachMoneyOutlined, "green", true],
  ["certificatesIssued", "Certificates Issued", EmojiEventsOutlined, "purple"], ["completedProgress", "Completed Courses", AssessmentOutlined, "cyan"],
];
const tones = { blue: "bg-blue-50 text-blue-600 ring-blue-100", emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100", violet: "bg-violet-50 text-violet-600 ring-violet-100", indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100", amber: "bg-amber-50 text-amber-600 ring-amber-100", green: "bg-green-50 text-green-600 ring-green-100", purple: "bg-purple-50 text-purple-600 ring-purple-100", cyan: "bg-cyan-50 text-cyan-600 ring-cyan-100" };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [preset, setPreset] = useState("180d");
  const [custom, setCustom] = useState({ from: "", to: "" });

  const load = useCallback(async (silent = false, params = null) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      setError("");
      const selected = params || (custom.from && custom.to ? custom : { preset });
      setData(await getAdminAnalytics(selected));
    } catch (err) { setError(getApiErrorMessage(err, "Unable to load analytics.")); }
    finally { setLoading(false); setRefreshing(false); }
  }, [custom, preset]);
  useEffect(() => { load(); }, [load]);

  const trends = data?.trends || [];
  const maxRevenue = useMemo(() => Math.max(...trends.map((x) => Number(x.revenue || 0)), 1), [trends]);
  const maxUsers = useMemo(() => Math.max(...trends.map((x) => Number(x.users || 0)), 1), [trends]);
  const periodRevenue = useMemo(() => trends.reduce((sum, x) => sum + Number(x.revenue || 0), 0), [trends]);
  const periodPurchases = useMemo(() => trends.reduce((sum, x) => sum + Number(x.purchases || 0), 0), [trends]);
  const averageOrder = periodPurchases ? periodRevenue / periodPurchases : 0;

  const exportCsv = () => {
    const rows = [["Metric", "Value"], ["Period", `${data?.range?.from || ""} to ${data?.range?.to || ""}`], ["Total Students", data?.overview?.totalStudents || 0], ["Active Students", data?.overview?.activeStudents || 0], ["Paid Purchases", data?.overview?.paidPurchases || 0], ["Revenue", data?.overview?.revenue || 0], ["Certificates Issued", data?.overview?.certificatesIssued || 0], ["Completed Courses", data?.overview?.completedProgress || 0], [], ["Trend", "Users", "Purchases", "Revenue"], ...trends.map((x) => [x.label, x.users, x.purchases, x.revenue])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `apnaacademy-analytics-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  if (loading && !data) return <div className="flex min-h-[70vh] items-center justify-center"><CircularProgress /></div>;

  return <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8"><div className="mx-auto max-w-7xl">
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-700 shadow-sm"><AutoGraphOutlined sx={{ fontSize: 15 }} /> Live platform insights</div><h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Analytics Dashboard</h1><p className="mt-1 text-sm text-slate-500 sm:text-base">Monitor students, sales, learning outcomes and platform growth.</p></div>
      <div className="flex items-center gap-2"><Tooltip title="Export CSV"><IconButton onClick={exportCsv} disabled={!data} className="!rounded-xl !border !border-slate-200 !bg-white !shadow-sm"><DownloadOutlined /></IconButton></Tooltip><Tooltip title="Refresh analytics"><span><IconButton onClick={() => load(true)} disabled={refreshing} className="!rounded-xl !border !border-slate-200 !bg-white !shadow-sm"><Refresh className={refreshing ? "animate-spin" : ""} /></IconButton></span></Tooltip></div>
    </header>

    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Analytics period</p><p className="mt-1 text-sm font-bold text-slate-800">{data?.range ? `${date(data.range.from)} — ${date(data.range.to)}` : "Select a period"}</p></div><div className="flex flex-wrap gap-2">{presets.map(([value, label]) => <button key={value} type="button" onClick={() => { setCustom({ from: "", to: "" }); setPreset(value); load(false, { preset: value }); }} className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${preset === value && !custom.from ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"}`}>{label}</button>)}</div></div><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]"><label className="text-xs font-bold text-slate-500">From<input type="date" value={custom.from} onChange={(e) => setCustom((v) => ({ ...v, from: e.target.value }))} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500" /></label><label className="text-xs font-bold text-slate-500">To<input type="date" value={custom.to} onChange={(e) => setCustom((v) => ({ ...v, to: e.target.value }))} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500" /></label><button type="button" disabled={!custom.from || !custom.to} onClick={() => load(false, custom)} className="self-end rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">Apply range</button></div></section>

    {error && <Alert severity="error" className="mb-5" onClose={() => setError("")}>{error}</Alert>}
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{statCards.map(([key, label, Icon, tone, isMoney]) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-start justify-between"><div className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${tones[tone]}`}><Icon /></div><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live</span></div><p className="mt-5 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{isMoney ? money(data?.overview?.[key]) : Number(data?.overview?.[key] || 0).toLocaleString("en-IN")}</p></div>)}</div>

    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-sm"><p className="text-xs font-bold text-slate-400">Period Revenue</p><p className="mt-2 text-2xl font-black">{money(periodRevenue)}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold text-slate-400">Period Purchases</p><p className="mt-2 text-2xl font-black text-slate-950">{periodPurchases.toLocaleString("en-IN")}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold text-slate-400">Average Paid Order</p><p className="mt-2 text-2xl font-black text-emerald-600">{money(averageOrder)}</p></div></div>

    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">{[["Revenue Trend", "Paid revenue", "revenue", maxRevenue, money, "bg-emerald-500/90"], ["Student Growth", "New registrations", "users", maxUsers, (v) => Number(v || 0).toLocaleString("en-IN"), "bg-blue-500/90"]].map(([title, subtitle, key, max, formatter, bar]) => <section key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-slate-950">{title}</h2><p className="text-xs text-slate-500">{subtitle} · selected period</p></div><div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-50 text-slate-600"><TrendingUp sx={{ fontSize: 19 }} /></div></div><div className="flex h-56 items-end gap-1 border-b border-slate-100 sm:gap-3">{trends.map((item) => { const value = Number(item[key] || 0); const height = Math.max((value / max) * 100, value ? 6 : 2); return <div key={item.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-[9px] font-bold text-slate-500 sm:text-[10px]">{formatter(value)}</span><div className={`w-full max-w-12 rounded-t-xl ${bar} transition-all duration-500`} style={{ height: `${height}%` }} /><span className="max-w-full truncate text-[9px] font-semibold text-slate-400 sm:text-[10px]">{item.label}</span></div>; })}</div></section>)}</div>

    <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.15fr]"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><h2 className="text-lg font-extrabold text-slate-950">Top Courses</h2><p className="text-xs text-slate-500">Highest paid purchase volume in selected period</p></div><div className="space-y-3">{(data?.topCourses || []).map((course, index) => <div key={course.courseId || course.title} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-900 text-xs font-black text-white">#{index + 1}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{course.title}</p><p className="text-xs text-slate-400">{course.purchases} purchases</p></div><span className="shrink-0 text-sm font-black text-emerald-600">{money(course.revenue)}</span></div>)}{!data?.topCourses?.length && <p className="py-8 text-center text-sm text-slate-400">No paid course data in this period.</p>}</div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><h2 className="text-lg font-extrabold text-slate-950">Recent Purchases</h2><p className="text-xs text-slate-500">Latest transactions in selected period</p></div><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><th className="pb-3 font-bold">Student</th><th className="pb-3 font-bold">Course</th><th className="pb-3 font-bold">Amount</th><th className="pb-3 font-bold">Date</th></tr></thead><tbody>{(data?.recentPurchases || []).map((purchase) => <tr key={purchase.id} className="border-b border-slate-50 last:border-0"><td className="py-3"><div className="flex items-center gap-2"><Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>{purchase.user?.name?.[0] || "S"}</Avatar><div><p className="font-bold text-slate-700">{purchase.user?.name || "Unknown"}</p><p className="text-[10px] text-slate-400">{purchase.user?.email || "—"}</p></div></div></td><td className="max-w-[180px] truncate py-3 font-medium text-slate-600">{purchase.course?.title || "Unknown course"}</td><td className="py-3 font-black text-slate-800">{money(purchase.amount)}</td><td className="py-3 text-xs text-slate-500">{date(purchase.purchasedAt)}</td></tr>)}</tbody></table>{!data?.recentPurchases?.length && <p className="py-8 text-center text-sm text-slate-400">No purchases in this period.</p>}</div></section></div>
  </div></div>;
}
