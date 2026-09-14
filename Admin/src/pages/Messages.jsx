import { useEffect, useState } from "react";
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField } from "@mui/material";
import { EmailOutlined, Refresh, ReplyOutlined, Search } from "@mui/icons-material";
import { getApiErrorMessage } from "../services/api";
import { getAdminMessage, listAdminMessages, updateAdminMessage } from "../services/adminMessage.service";

const formatDate = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
const statusMeta = { new: "New", read: "Read", replied: "Replied", closed: "Closed" };

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState({ total: 0, new: 0, replied: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);
  const [notice, setNotice] = useState("");

  const load = async (page = 1) => {
    try {
      setLoading(true); setError("");
      const data = await listAdminMessages({ page, limit: 20, search: search.trim(), status });
      setMessages(data?.messages || []); setSummary(data?.summary || {}); setPagination(data?.pagination || { page, totalPages: 1, total: 0 });
    } catch (err) { setError(getApiErrorMessage(err, "Unable to load messages.")); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [status]);

  const open = async (id) => {
    try { const item = await getAdminMessage(id); setSelected(item); setReply(""); } catch (err) { setError(getApiErrorMessage(err, "Unable to open message.")); }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    try { setReplying(true); const item = await updateAdminMessage(selected.id, { adminReply: reply.trim() }); setSelected(item); setReply(""); setNotice("Reply saved. The message is marked as replied."); await load(pagination.page); }
    catch (err) { setNotice(getApiErrorMessage(err, "Unable to save reply.")); }
    finally { setReplying(false); }
  };

  const changeStatus = async (value) => {
    if (!selected) return;
    try { const item = await updateAdminMessage(selected.id, { status: value }); setSelected(item); setNotice("Message status updated."); await load(pagination.page); }
    catch (err) { setNotice(getApiErrorMessage(err, "Unable to update status.")); }
  };

  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-5">
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><EmailOutlined/></div><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">Inbox</p><h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Website Messages</h1><p className="mt-2 text-sm text-slate-500">Messages submitted from the public Contact Us page.</p></div></div><button type="button" onClick={()=>load(pagination.page)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><Refresh fontSize="small"/> Refresh</button></div></section>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-slate-500">Total</p><p className="mt-1 text-2xl font-black text-slate-950">{summary.total||0}</p></div><div className="rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="text-xs font-bold text-blue-700">New</p><p className="mt-1 text-2xl font-black text-blue-950">{summary.new||0}</p></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-xs font-bold text-emerald-700">Replied</p><p className="mt-1 text-2xl font-black text-emerald-950">{summary.replied||0}</p></div></div>
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row"><div className="flex min-w-0 flex-1 items-center rounded-xl border border-slate-200 px-3"><Search className="mr-2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load(1)} placeholder="Search name, email, subject or message" className="w-full bg-transparent py-3 text-sm outline-none"/></div><Select size="small" value={status} onChange={e=>setStatus(e.target.value)} displayEmpty sx={{minWidth:150,borderRadius:"12px"}}><MenuItem value="">All statuses</MenuItem>{Object.entries(statusMeta).map(([v,l])=><MenuItem key={v} value={v}>{l}</MenuItem>)}</Select><button type="button" onClick={()=>load(1)} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-blue-700">Search</button></div>
      {loading?<div className="flex min-h-64 items-center justify-center"><CircularProgress/></div>:error?<div className="p-6 text-sm font-semibold text-red-700">{error}</div>:messages.length===0?<div className="flex min-h-64 items-center justify-center p-8 text-center text-sm text-slate-500">No website messages found.</div>:<div className="divide-y divide-slate-100">{messages.map(item=><button type="button" key={item.id} onClick={()=>open(item.id)} className="block w-full p-4 text-left transition hover:bg-slate-50 sm:p-5"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${item.status==="new"?"bg-blue-50 text-blue-700":item.status==="replied"?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{statusMeta[item.status]||item.status}</span><span className="truncate text-sm font-extrabold text-slate-900">{item.subject}</span></div><p className="mt-1 truncate text-xs text-slate-500">{item.name} · {item.email} · {item.message}</p></div><span className="shrink-0 text-xs font-semibold text-slate-400">{formatDate(item.createdAt)}</span></div></button>)}</div>}
      <div className="flex items-center justify-between border-t border-slate-100 p-4"><span className="text-xs font-semibold text-slate-500">Page {pagination.page||1} of {pagination.totalPages||1}</span><div className="flex gap-2"><button disabled={loading||(pagination.page||1)<=1} onClick={()=>load(pagination.page-1)} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">Previous</button><button disabled={loading||(pagination.page||1)>=(pagination.totalPages||1)} onClick={()=>load(pagination.page+1)} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">Next</button></div></div>
    </section>
    {notice&&<div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl">{notice}</div>}
    <Dialog open={Boolean(selected)} onClose={()=>!replying&&setSelected(null)} fullWidth maxWidth="md"><DialogTitle sx={{fontWeight:900}}>Message Conversation</DialogTitle><DialogContent dividers>{selected&&<div className="space-y-5"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">From</p><p className="mt-1 font-extrabold text-slate-900">{selected.name}</p><p className="text-sm text-blue-600">{selected.email}</p><p className="mt-3 text-xs text-slate-400">{formatDate(selected.createdAt)}</p></div><div><p className="text-sm font-black text-slate-900">{selected.subject}</p><p className="mt-3 whitespace-pre-wrap rounded-2xl border border-slate-200 p-4 text-sm leading-7 text-slate-700">{selected.message}</p></div>{selected.adminReply&&<div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Admin Reply</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-emerald-950">{selected.adminReply}</p><p className="mt-2 text-xs text-emerald-700">{formatDate(selected.repliedAt)}</p></div>}<Select fullWidth size="small" value={selected.status} onChange={e=>changeStatus(e.target.value)}>{Object.entries(statusMeta).map(([v,l])=><MenuItem key={v} value={v}>{l}</MenuItem>)}</Select><TextField fullWidth multiline minRows={4} label="Reply" value={reply} onChange={e=>setReply(e.target.value)} placeholder="Write a response..."/><button type="button" onClick={sendReply} disabled={replying||!reply.trim()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50"><ReplyOutlined fontSize="small"/>{replying?"Saving...":"Save Reply"}</button></div>}</DialogContent><DialogActions><button type="button" onClick={()=>setSelected(null)} className="px-4 py-2 text-sm font-bold">Close</button></DialogActions></Dialog>
  </div></main>;
}
