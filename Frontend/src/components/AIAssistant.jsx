import { useEffect, useRef, useState } from "react";
import api from "../services/api";

const GUEST_STORAGE_KEY = "apnaacademy_ai_guest_chat_v1";
const MAX_GUEST_MESSAGES = 40;

const starterPrompts = [
  "Explain Java arrays with a simple example.",
  "Help me understand REST APIs.",
  "Give me a DSA practice question.",
];

const loadGuestMessages = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GUEST_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string" && m.content.trim())
      .slice(-MAX_GUEST_MESSAGES);
  } catch {
    return [];
  }
};

function MessageContent({ content }) {
  return (
    <div className="space-y-2 whitespace-pre-wrap text-sm leading-6">
      {String(content).split(/(```[\s\S]*?```)/g).map((part, index) => {
        if (part.startsWith("```")) {
          const code = part.replace(/^```[^\n]*\n?/, "").replace(/```$/, "");
          return (
            <pre key={index} className="overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs leading-5 text-slate-100">
              <code>{code}</code>
            </pre>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}

async function getCurrentUser() {
  try {
    const response = await api.get("/auth/me");
    return response.data?.data || null;
  } catch {
    return null;
  }
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(undefined);
  const [messages, setMessages] = useState(loadGuestMessages);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [retryText, setRetryText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const endRef = useRef(null);
  const abortRef = useRef(null);

  const verified = Boolean(user?.isEmailVerified && user?.status === "active");
  const authenticated = Boolean(user);

  const loadServerConversations = async () => {
    setHistoryLoading(true);
    try {
      const response = await api.get("/ai/conversations");
      const list = response.data?.data || [];
      setConversations(Array.isArray(list) ? list : []);
      return Array.isArray(list) ? list : [];
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadServerMessages = async (id) => {
    const response = await api.get(`/ai/conversations/${id}/messages`);
    const data = response.data?.data;
    const loaded = Array.isArray(data?.messages)
      ? data.messages
          .filter((m) => ["user", "assistant"].includes(m.role) && typeof m.content === "string")
          .map((m) => ({ id: m._id, role: m.role, content: m.content }))
      : [];
    setConversationId(id);
    setMessages(loaded);
    setError("");
    setRetryText("");
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getCurrentUser(),
      api.get("/ai/public/status").catch(() => ({ data: { data: { enabled: false } } })),
    ]).then(async ([currentUser, status]) => {
      if (cancelled) return;
      setUser(currentUser);
      setEnabled(Boolean(status?.data?.data?.enabled));

      if (currentUser?.isEmailVerified && currentUser?.status === "active") {
        try {
          const response = await api.get("/ai/conversations");
          if (cancelled) return;
          const list = Array.isArray(response.data?.data) ? response.data.data : [];
          setConversations(list);
          if (list[0]?._id) {
            const messageResponse = await api.get(`/ai/conversations/${list[0]._id}/messages`);
            const serverMessages = messageResponse.data?.data?.messages || [];
            if (!cancelled) {
              setConversationId(list[0]._id);
              setMessages(serverMessages.map((m) => ({ id: m._id, role: m.role, content: m.content })));
            }
          } else {
            setMessages([]);
          }
        } catch (requestError) {
          if (!cancelled && requestError?.response?.status === 401) setUser(null);
        }
      }
    }).catch(() => {
      if (!cancelled) setEnabled(false);
    });

    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!verified) {
      try {
        window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(messages.slice(-MAX_GUEST_MESSAGES)));
      } catch {}
    }
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading, verified]);

  const createServerConversation = async (firstMessage) => {
    const response = await api.post("/ai/conversations", {
      title: firstMessage.slice(0, 120),
    });
    const conversation = response.data?.data;
    if (!conversation?._id) throw new Error("Unable to create an AI conversation.");
    setConversationId(conversation._id);
    setConversations((current) => [conversation, ...current]);
    return conversation._id;
  };

  const sendMessage = async (value = input) => {
    const text = String(value || "").trim();
    if (!text || loading || !enabled) return;

    setInput("");
    setError("");
    setRetryText("");
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!verified) {
        const next = [...messages, { role: "user", content: text }].slice(-MAX_GUEST_MESSAGES);
        setMessages(next);
        const response = await api.post("/ai/public/chat", {
          messages: next.slice(-4),
          maxTokens: 512,
          temperature: 0.2,
        }, { signal: controller.signal });
        const reply = response.data?.data?.text;
        if (!reply) throw new Error("The AI returned an empty response.");
        setMessages((current) => [...current, { role: "assistant", content: reply }].slice(-MAX_GUEST_MESSAGES));
        return;
      }

      let activeId = conversationId;
      if (!activeId) activeId = await createServerConversation(text);

      const response = await api.post(
        `/ai/conversations/${activeId}/messages`,
        { content: text, maxTokens: 1024, temperature: 0.2 },
        { signal: controller.signal }
      );

      const data = response.data?.data;
      if (!data?.assistantMessage?.content) throw new Error("The AI returned an empty response.");

      setMessages((current) => [
        ...current,
        { id: data.userMessage?.id, role: "user", content: data.userMessage?.content || text },
        { id: data.assistantMessage?.id, role: "assistant", content: data.assistantMessage.content },
      ]);

      if (data.conversation) {
        setConversations((current) => {
          const without = current.filter((item) => item._id !== data.conversation._id);
          return [data.conversation, ...without];
        });
      }
    } catch (requestError) {
      if (requestError?.code === "ERR_CANCELED") return;
      const status = requestError?.response?.status;
      setError(
        requestError?.response?.data?.message ||
          (status === 429 ? "AI request limit reached. Please wait and try again." :
           status === 403 ? "Please verify your email before using personal AI." :
           "AI is temporarily unavailable. Please try again.")
      );
      setRetryText(text);
      if (status === 401) setUser(await getCurrentUser());
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  };

  const newChat = () => {
    if (loading) return;
    setConversationId(null);
    setMessages([]);
    setInput("");
    setError("");
    setRetryText("");
    setShowHistory(false);
  };

  const clearChat = () => {
    if (verified) {
      newChat();
      return;
    }
    setMessages([]);
    setError("");
    setRetryText("");
    try { window.localStorage.removeItem(GUEST_STORAGE_KEY); } catch {}
  };

  const renameConversation = async (id) => {
    const title = renameValue.trim();
    if (!title) return;
    try {
      const response = await api.patch(`/ai/conversations/${id}`, { title });
      const updated = response.data?.data;
      setConversations((current) => current.map((item) => item._id === id ? { ...item, ...updated } : item));
      setRenamingId(null);
      setRenameValue("");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to rename this chat.");
    }
  };

  const deleteConversation = async (id) => {
    if (loading) return;
    try {
      await api.delete(`/ai/conversations/${id}`);
      setConversations((current) => current.filter((item) => item._id !== id));
      if (conversationId === id) newChat();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to delete this chat.");
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  };

  const selectConversation = async (id) => {
    if (loading || id === conversationId) {
      setShowHistory(false);
      return;
    }
    try {
      await loadServerMessages(id);
      setShowHistory(false);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to load this conversation.");
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-20 z-[100] mx-auto flex h-[min(720px,calc(100vh-105px))] w-auto max-w-[430px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:right-6 sm:left-auto sm:w-[430px]">
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-4 py-4 text-white">
            <div className="min-w-0">
              <div className="font-bold">✦ ApnaAcademy AI</div>
              <div className="truncate text-[11px] text-slate-300">{verified ? "Personal AI Assistant · Memory enabled" : "Public AI Assistant"}</div>
            </div>
            <div className="flex gap-1">
              {verified && <button type="button" onClick={() => setShowHistory((v) => !v)} className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Open chat history">History</button>}
              <button type="button" onClick={newChat} className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white">New</button>
              <button type="button" onClick={clearChat} className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white">Clear</button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 text-lg text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Close AI">×</button>
            </div>
          </div>

          {showHistory && verified ? (
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">Your conversations</h3>
                <button type="button" onClick={() => loadServerConversations().catch(() => {})} className="text-xs font-bold text-blue-600">Refresh</button>
              </div>
              {historyLoading ? <p className="p-4 text-center text-xs text-slate-500">Loading history…</p> :
                conversations.length === 0 ? <p className="p-4 text-center text-xs text-slate-500">No saved chats yet.</p> :
                <div className="space-y-2">{conversations.map((item) => (
                  <div key={item._id} className={"rounded-2xl border p-3 " + (item._id === conversationId ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white")}>
                    {renamingId === item._id ? (
                      <div className="flex gap-2">
                        <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} maxLength={120} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-400" />
                        <button type="button" onClick={() => renameConversation(item._id)} className="text-xs font-bold text-blue-600">Save</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => selectConversation(item._id)} className="w-full text-left">
                        <div className="truncate text-sm font-bold text-slate-800">{item.title}</div>
                        <div className="mt-1 text-[10px] text-slate-400">{item.messageCount} messages</div>
                      </button>
                    )}
                    <div className="mt-2 flex gap-3 text-[10px] font-semibold text-slate-400">
                      <button type="button" onClick={() => { setRenamingId(item._id); setRenameValue(item.title); }}>Rename</button>
                      <button type="button" onClick={() => deleteConversation(item._id)} className="text-rose-500">Delete</button>
                    </div>
                  </div>
                ))}</div>}
            </div>
          ) : !enabled ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <div><div className="text-lg font-bold text-slate-900">AI is temporarily unavailable</div><p className="mt-1 text-sm text-slate-500">Please try again later.</p></div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4">
                {messages.length === 0 ? (
                  <div className="flex min-h-full flex-col justify-center">
                    <div className="mx-auto max-w-sm text-center">
                      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl text-white shadow-lg">✦</div>
                      <h3 className="text-lg font-extrabold text-slate-950">Learn faster with AI</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">Ask programming, DSA, web development, interview-preparation, or learning questions.</p>
                    </div>
                    <div className="mx-auto mt-6 grid w-full max-w-sm gap-2">
                      {starterPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => sendMessage(prompt)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">{prompt}</button>)}
                    </div>
                    {!authenticated && <p className="mx-auto mt-5 max-w-sm text-center text-[11px] leading-5 text-slate-400">Public AI has limited access. Sign in and verify your email for persistent conversation memory.</p>}
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div key={message.id || index} className={"mb-4 flex " + (message.role === "user" ? "justify-end" : "justify-start")}>
                        <div className={"max-w-[88%] rounded-2xl px-4 py-3 shadow-sm " + (message.role === "user" ? "rounded-br-md bg-slate-950 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700")}>
                          <MessageContent content={message.content} />
                        </div>
                      </div>
                    ))}
                    {loading && <div className="mb-4 flex justify-start"><div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><div className="flex gap-1.5" aria-label="AI is thinking"><span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" /><span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:100ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:200ms]" /></div></div></div>}
                    <div ref={endRef} />
                  </>
                )}
              </div>

              {error && <div className="border-t border-rose-100 bg-rose-50 px-4 py-3"><p className="text-xs font-medium leading-5 text-rose-700">{error}</p>{retryText && <button type="button" onClick={() => sendMessage(retryText)} className="mt-2 text-xs font-bold text-rose-800 underline">Retry</button>}</div>}

              <div className="border-t border-slate-200 bg-white p-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
                  <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} maxLength={verified ? 6000 : 2500} rows={2} placeholder="Ask ApnaAcademy AI…" className="w-full resize-none bg-transparent px-2 py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-400" disabled={loading || !enabled} aria-label="Message ApnaAcademy AI" />
                  <div className="flex items-center justify-between px-1 pt-1">
                    <span className="text-[10px] text-slate-400">{input.length}/{verified ? 6000 : 2500}</span>
                    {loading ? <button type="button" onClick={stop} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">Stop</button> : <button type="button" onClick={() => sendMessage()} disabled={!input.trim()} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Send</button>}
                  </div>
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-400">AI can make mistakes. Verify important information.</p>
              </div>
            </>
          )}
        </div>
      )}

      <button type="button" onClick={() => setOpen((v) => !v)} className="fixed bottom-4 right-4 z-[99] flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-700" aria-label={open ? "Close ApnaAcademy AI" : "Open ApnaAcademy AI"} aria-expanded={open}>
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10">✦</span><span className="hidden sm:inline">Ask AI</span>
      </button>
    </>
  );
}
