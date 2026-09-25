import { useEffect, useRef, useState } from "react";
import api from "../services/api";

const STORAGE_KEY = "apnaacademy_ai_chat_v1";
const MAX_MESSAGES = 40;
const starterPrompts = [
  "Explain Java arrays with a simple example.",
  "Help me understand REST APIs.",
  "Give me a DSA practice question.",
];

const loadMessages = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string" && m.content.trim()).slice(-MAX_MESSAGES);
  } catch { return []; }
};

function MessageContent({ content }) {
  return (
    <div className="space-y-2 whitespace-pre-wrap text-sm leading-6">
      {String(content).split(/(```[\\s\\S]*?```)/g).map((part, index) => {
        if (part.startsWith("```")) {
          const code = part.replace(/^```[^\\n]*\\n?/, "").replace(/```$/, "");
          return <pre key={index} className="overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs leading-5 text-slate-100"><code>{code}</code></pre>;
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}

async function getCurrentUser() {
  try { const response = await api.get("/auth/me"); return response.data?.data || null; }
  catch { return null; }
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(undefined);
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [retryText, setRetryText] = useState("");
  const endRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCurrentUser(), api.get("/ai/public/status").catch(() => ({ data: { data: { enabled: false } } }))]).then(([currentUser, status]) => {
      if (cancelled) return;
      setUser(currentUser);
      setEnabled(Boolean(status?.data?.data?.enabled));
    });
    return () => { cancelled = true; abortRef.current?.abort(); };
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES))); } catch {}
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const verified = Boolean(user?.isEmailVerified && user?.status === "active");
  const authenticated = Boolean(user);
  const sendMessage = async (value = input) => {
    const text = String(value || "").trim();
    if (!text || loading || !enabled) return;
    const next = [...messages, { role: "user", content: text }].slice(-MAX_MESSAGES);
    setMessages(next); setInput(""); setError(""); setRetryText(""); setLoading(true);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const response = await api.post(verified ? "/ai/chat" : "/ai/public/chat", { messages: next.slice(-20), maxTokens: verified ? 1024 : 512, temperature: 0.2 }, { signal: controller.signal });
      const reply = response.data?.data?.text;
      if (!reply) throw new Error("The AI returned an empty response.");
      setMessages((current) => [...current, { role: "assistant", content: reply }].slice(-MAX_MESSAGES));
    } catch (requestError) {
      if (requestError?.code === "ERR_CANCELED") return;
      const status = requestError?.response?.status;
      setError(requestError?.response?.data?.message || (status === 429 ? "AI request limit reached. Please wait and try again." : status === 403 ? "Please verify your email before using personal AI." : "AI is temporarily unavailable. Please try again."));
      setRetryText(text);
      if (status === 401) setUser(await getCurrentUser());
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  };

  const clearChat = () => { setMessages([]); setError(""); setRetryText(""); try { window.localStorage.removeItem(STORAGE_KEY); } catch {} };
  const stop = () => { abortRef.current?.abort(); abortRef.current = null; setLoading(false); };

  return <>
    {open && <div className="fixed inset-x-3 bottom-20 z-[100] mx-auto flex h-[min(720px,calc(100vh-105px))] w-auto max-w-[430px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:right-6 sm:left-auto sm:w-[430px]">
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-4 py-4 text-white">
        <div><div className="font-bold">✦ ApnaAcademy AI</div><div className="text-[11px] text-slate-300">{verified ? "Personal AI Assistant" : "Public AI Assistant"}</div></div>
        <div className="flex gap-1"><button type="button" onClick={clearChat} className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white">Clear</button><button type="button" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 text-lg text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Close AI">×</button></div>
      </div>
      {!enabled ? <div className="flex flex-1 items-center justify-center p-6 text-center"><div><div className="text-lg font-bold text-slate-900">AI is temporarily unavailable</div><p className="mt-1 text-sm text-slate-500">Please try again later.</p></div></div> : <>
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4">
          {messages.length === 0 ? <div className="flex min-h-full flex-col justify-center"><div className="mx-auto max-w-sm text-center"><div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl text-white shadow-lg">✦</div><h3 className="text-lg font-extrabold text-slate-950">Learn faster with AI</h3><p className="mt-2 text-sm leading-6 text-slate-500">Ask programming, DSA, web development, interview-preparation, or learning questions.</p></div><div className="mx-auto mt-6 grid w-full max-w-sm gap-2">{starterPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => sendMessage(prompt)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">{prompt}</button>)}</div>{!authenticated && <p className="mx-auto mt-5 max-w-sm text-center text-[11px] leading-5 text-slate-400">Public AI has limited access. Sign in and verify your email for authenticated AI access.</p>}</div> : <>{messages.map((message, index) => <div key={index} className={"mb-4 flex " + (message.role === "user" ? "justify-end" : "justify-start")}><div className={"max-w-[88%] rounded-2xl px-4 py-3 shadow-sm " + (message.role === "user" ? "rounded-br-md bg-slate-950 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700")}><MessageContent content={message.content} /></div></div>)}{loading && <div className="mb-4 flex justify-start"><div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><div className="flex gap-1.5" aria-label="AI is thinking"><span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" /><span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:100ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:200ms]" /></div></div></div>}<div ref={endRef} /></>}
        </div>
        {error && <div className="border-t border-rose-100 bg-rose-50 px-4 py-3"><p className="text-xs font-medium leading-5 text-rose-700">{error}</p>{retryText && <button type="button" onClick={() => sendMessage(retryText)} className="mt-2 text-xs font-bold text-rose-800 underline">Retry</button>}</div>}
        <div className="border-t border-slate-200 bg-white p-3"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100"><textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} maxLength={verified ? 6000 : 2500} rows={2} placeholder="Ask ApnaAcademy AI…" className="w-full resize-none bg-transparent px-2 py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-400" disabled={loading || !enabled} aria-label="Message ApnaAcademy AI" /><div className="flex items-center justify-between px-1 pt-1"><span className="text-[10px] text-slate-400">{input.length}/{verified ? 6000 : 2500}</span>{loading ? <button type="button" onClick={stop} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">Stop</button> : <button type="button" onClick={() => sendMessage()} disabled={!input.trim()} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Send</button>}</div></div><p className="mt-2 text-center text-[10px] text-slate-400">AI can make mistakes. Verify important information.</p></div>
      </>}
    </div>}
    <button type="button" onClick={() => setOpen((v) => !v)} className="fixed bottom-4 right-4 z-[99] flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-700" aria-label={open ? "Close ApnaAcademy AI" : "Open ApnaAcademy AI"} aria-expanded={open}><span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10">✦</span><span className="hidden sm:inline">Ask AI</span></button>
  </>;
}