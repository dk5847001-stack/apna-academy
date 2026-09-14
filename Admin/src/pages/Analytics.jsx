import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Avatar, CircularProgress, IconButton, Tooltip } from "@mui/material";
import {
  AssessmentOutlined,
  AttachMoneyOutlined,
  AutoGraphOutlined,
  EmojiEventsOutlined,
  PeopleOutline,
  Refresh,
  SchoolOutlined,
  ShoppingBagOutlined,
  TrendingUp,
  VerifiedOutlined,
} from "@mui/icons-material";
import { getApiErrorMessage } from "../services/api";
import { getAdminAnalytics } from "../services/adminAnalytics.service";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const statCards = [
  { key: "totalStudents", label: "Total Students", icon: PeopleOutline, tone: "blue" },
  { key: "activeStudents", label: "Active Students", icon: TrendingUp, tone: "emerald" },
  { key: "totalCourses", label: "Total Courses", icon: SchoolOutlined, tone: "violet" },
  { key: "publishedCourses", label: "Published Courses", icon: VerifiedOutlined, tone: "indigo" },
  { key: "paidPurchases", label: "Paid Purchases", icon: ShoppingBagOutlined, tone: "amber" },
  { key: "revenue", label: "Total Revenue", icon: AttachMoneyOutlined, tone: "green", money: true },
  { key: "certificatesIssued", label: "Certificates Issued", icon: EmojiEventsOutlined, tone: "purple" },
  { key: "completedProgress", label: "Completed Courses", icon: AssessmentOutlined, tone: "cyan" },
];

const toneClasses = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  green: "bg-green-50 text-green-600 ring-green-100",
  purple: "bg-purple-50 text-purple-600 ring-purple-100",
  cyan: "bg-cyan-50 text-cyan-600 ring-cyan-100",
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      setError("");
      setData(await getAdminAnalytics());
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load analytics."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const trends = data?.trends || [];
  const maxRevenue = useMemo(() => Math.max(...trends.map((item) => Number(item.revenue || 0)), 1), [trends]);
  const maxUsers = useMemo(() => Math.max(...trends.map((item) => Number(item.users || 0)), 1), [trends]);

  if (loading && !data) {
    return <div className="flex min-h-[70vh] items-center justify-center"><CircularProgress /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
              <AutoGraphOutlined sx={{ fontSize: 15 }} /> Live platform insights
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">Monitor students, sales, learning outcomes and platform growth.</p>
          </div>
          <Tooltip title="Refresh analytics">
            <span>
              <IconButton onClick={() => load(true)} disabled={refreshing} className="!rounded-xl !border !border-slate-200 !bg-white !shadow-sm">
                <Refresh className={refreshing ? "animate-spin" : ""} />
              </IconButton>
            </span>
          </Tooltip>
        </div>

        {error && <Alert severity="error" className="mb-5" onClose={() => setError("")}>{error}</Alert>}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ key, label, icon: Icon, tone, money: isMoney }) => (
            <div key={key} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${toneClasses[tone]}`}><Icon /></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live</span>
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{isMoney ? money(data?.overview?.[key]) : Number(data?.overview?.[key] || 0).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div><h2 className="text-lg font-extrabold text-slate-950">Revenue Trend</h2><p className="text-xs text-slate-500">Paid purchases · last 6 months</p></div>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><TrendingUp sx={{ fontSize: 19 }} /></div>
            </div>
            <div className="flex h-56 items-end gap-2 border-b border-slate-100 pb-0 sm:gap-4">
              {trends.map((item) => {
                const height = Math.max((Number(item.revenue || 0) / maxRevenue) * 100, item.revenue ? 6 : 2);
                return <div key={item.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-bold text-slate-500">{money(item.revenue)}</span>
                  <div className="w-full max-w-12 rounded-t-xl bg-emerald-500/90 transition-all duration-500" style={{ height: `${height}%` }} />
                  <span className="text-[10px] font-semibold text-slate-400">{item.label.split(" ")[0]}</span>
                </div>;
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div><h2 className="text-lg font-extrabold text-slate-950">Student Growth</h2><p className="text-xs text-slate-500">New registrations · last 6 months</p></div>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><PeopleOutline sx={{ fontSize: 19 }} /></div>
            </div>
            <div className="flex h-56 items-end gap-2 border-b border-slate-100 pb-0 sm:gap-4">
              {trends.map((item) => {
                const height = Math.max((Number(item.users || 0) / maxUsers) * 100, item.users ? 6 : 2);
                return <div key={item.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-bold text-slate-500">{Number(item.users || 0)}</span>
                  <div className="w-full max-w-12 rounded-t-xl bg-blue-500/90 transition-all duration-500" style={{ height: `${height}%` }} />
                  <span className="text-[10px] font-semibold text-slate-400">{item.label.split(" ")[0]}</span>
                </div>;
              })}
            </div>
          </section>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.15fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5"><h2 className="text-lg font-extrabold text-slate-950">Top Courses</h2><p className="text-xs text-slate-500">Highest paid purchase volume</p></div>
            <div className="space-y-3">
              {(data?.topCourses || []).map((course, index) => (
                <div key={course.courseId || course.title} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-900 text-xs font-black text-white">#{index + 1}</div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{course.title}</p><p className="text-xs text-slate-400">{course.purchases} purchases</p></div>
                  <span className="shrink-0 text-sm font-black text-emerald-600">{money(course.revenue)}</span>
                </div>
              ))}
              {!data?.topCourses?.length && <p className="py-8 text-center text-sm text-slate-400">No paid course data yet.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5"><h2 className="text-lg font-extrabold text-slate-950">Recent Purchases</h2><p className="text-xs text-slate-500">Latest platform transactions</p></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><th className="pb-3 font-bold">Student</th><th className="pb-3 font-bold">Course</th><th className="pb-3 font-bold">Amount</th><th className="pb-3 font-bold">Date</th></tr></thead>
                <tbody>
                  {(data?.recentPurchases || []).map((purchase) => (
                    <tr key={purchase.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-3"><div className="flex items-center gap-2"><Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>{purchase.user?.name?.[0] || "S"}</Avatar><div><p className="font-bold text-slate-700">{purchase.user?.name || "Unknown"}</p><p className="text-[10px] text-slate-400">{purchase.user?.email || "—"}</p></div></div></td>
                      <td className="max-w-[180px] truncate py-3 font-medium text-slate-600">{purchase.course?.title || "Unknown course"}</td>
                      <td className="py-3 font-black text-slate-800">{money(purchase.amount)}</td>
                      <td className="py-3 text-xs text-slate-500">{date(purchase.purchasedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.recentPurchases?.length && <p className="py-8 text-center text-sm text-slate-400">No purchases yet.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
