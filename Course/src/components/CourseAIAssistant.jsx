import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Drawer, IconButton, Stack, TextField, Typography } from "@mui/material";
import { AutoAwesome, Close, DeleteOutline, History, Send } from "@mui/icons-material";
import api from "../services/api";

const MAX_INPUT = 6000;

const Message = ({ item }) => (
  <Box sx={{ display: "flex", justifyContent: item.role === "user" ? "flex-end" : "flex-start", mb: 1.5 }}>
    <Box sx={{
      maxWidth: "88%",
      px: 1.6,
      py: 1.25,
      borderRadius: 2.5,
      backgroundColor: item.role === "user" ? "#1d4ed8" : "#172033",
      color: "#fff",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      fontSize: "0.82rem",
      lineHeight: 1.6,
    }}>
      {item.content}
    </Box>
  </Box>
);

export default function CourseAIAssistant({ courseId = "", courseTitle = "" }) {
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  const currentTitle = useMemo(() => courseTitle || "This course", [courseTitle]);

  const loadConversations = async () => {
    if (!courseId) return [];
    setHistoryLoading(true);
    try {
      const response = await api.get("/ai/conversations", { params: { courseId } });
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setConversations(list);
      return list;
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadMessages = async (id) => {
    const response = await api.get(`/ai/conversations/${id}/messages`);
    const list = response.data?.data?.messages || [];
    setConversationId(id);
    setMessages(list.filter((item) => ["user", "assistant"].includes(item.role)));
    setError("");
  };

  useEffect(() => {
    if (!open || !courseId) return;
    loadConversations().then((list) => {
      if (list[0]?._id) return loadMessages(list[0]._id);
      setConversationId("");
      setMessages([]);
      return null;
    }).catch((requestError) => {
      setError(requestError?.response?.data?.message || "Unable to load course AI.");
    });
  }, [open, courseId]);

  const startNew = () => {
    setConversationId("");
    setMessages([]);
    setInput("");
    setError("");
    setHistoryOpen(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading || !courseId) return;

    setInput("");
    setError("");
    setLoading(true);

    try {
      let id = conversationId;
      if (!id) {
        const created = await api.post("/ai/conversations", {
          title: text.slice(0, 120),
          courseId,
        });
        id = created.data?.data?._id;
        if (!id) throw new Error("Unable to create course AI conversation.");
        setConversationId(id);
      }

      const response = await api.post(`/ai/conversations/${id}/messages`, {
        content: text,
        maxTokens: 1024,
        temperature: 0.2,
      });

      const data = response.data?.data;
      if (!data?.assistantMessage?.content) throw new Error("The AI returned an empty response.");

      setMessages((current) => [
        ...current,
        data.userMessage,
        data.assistantMessage,
      ]);

      setConversations((current) => {
        const conversation = data.conversation;
        if (!conversation) return current;
        return [conversation, ...current.filter((item) => item._id !== conversation._id)];
      });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
        (requestError?.response?.status === 403
          ? "Course-specific AI requires an active course purchase and verified account."
          : "Course AI is temporarily unavailable.")
      );
    } finally {
      setLoading(false);
    }
  };

  const removeConversation = async (id) => {
    try {
      await api.delete(`/ai/conversations/${id}`);
      setConversations((current) => current.filter((item) => item._id !== id));
      if (conversationId === id) startNew();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to delete the conversation.");
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        startIcon={<AutoAwesome />}
        variant="contained"
        sx={{
          position: "fixed",
          right: { xs: 12, sm: 20, md: 28 },
          bottom: { xs: 14, sm: 20, md: 28 },
          zIndex: 50,
          borderRadius: 999,
          px: 2,
          py: 1.05,
          textTransform: "none",
          fontWeight: 900,
          background: "linear-gradient(135deg,#2563eb,#4f46e5)",
          boxShadow: "0 14px 36px rgba(37,99,235,.35)",
        }}
      >
        Ask Course AI
      </Button>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: { xs: "100%", sm: 430 }, backgroundColor: "#0b1220", color: "#fff" } }}>
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.7, borderBottom: "1px solid #303949", backgroundColor: "#111827" }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900 }}>Course AI</Typography>
              <Typography sx={{ mt: .25, color: "#94a3b8", fontSize: ".68rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentTitle}</Typography>
            </Box>
            <Stack direction="row" spacing={.5}>
              <IconButton onClick={() => setHistoryOpen((value) => !value)} aria-label="Conversation history" sx={{ color: "#cbd5e1" }}><History /></IconButton>
              <IconButton onClick={startNew} aria-label="New conversation" sx={{ color: "#cbd5e1" }}><AutoAwesome /></IconButton>
              <IconButton onClick={() => setOpen(false)} aria-label="Close course AI" sx={{ color: "#cbd5e1" }}><Close /></IconButton>
            </Stack>
          </Stack>

          {historyOpen ? (
            <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontWeight: 900, fontSize: ".9rem" }}>Course conversations</Typography>
                <Button onClick={() => loadConversations().catch(() => {})} size="small" sx={{ textTransform: "none", color: "#93c5fd" }}>Refresh</Button>
              </Stack>
              {historyLoading ? <Typography sx={{ p: 2, color: "#94a3b8", textAlign: "center", fontSize: ".78rem" }}>Loading…</Typography> :
                conversations.length === 0 ? <Typography sx={{ p: 2, color: "#94a3b8", textAlign: "center", fontSize: ".78rem" }}>No saved course chats.</Typography> :
                conversations.map((item) => (
                  <Box key={item._id} sx={{ mb: 1, p: 1.4, border: "1px solid #303949", borderRadius: 2, backgroundColor: "#111827" }}>
                    <Button onClick={() => loadMessages(item._id).then(() => setHistoryOpen(false)).catch(() => setError("Unable to load this conversation."))} fullWidth sx={{ justifyContent: "flex-start", color: "#fff", textTransform: "none", textAlign: "left" }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 800, fontSize: ".8rem" }}>{item.title}</Typography>
                        <Typography sx={{ color: "#64748b", fontSize: ".64rem" }}>{item.messageCount} messages</Typography>
                      </Box>
                    </Button>
                    <Button onClick={() => removeConversation(item._id)} startIcon={<DeleteOutline />} size="small" sx={{ color: "#fda4af", textTransform: "none", fontSize: ".68rem" }}>Delete</Button>
                  </Box>
                ))}
            </Box>
          ) : (
            <>
              <Box sx={{ flex: 1, overflowY: "auto", p: 1.6 }}>
                {messages.length === 0 && (
                  <Box sx={{ py: 5, textAlign: "center" }}>
                    <AutoAwesome sx={{ fontSize: 42, color: "#60a5fa" }} />
                    <Typography sx={{ mt: 1.5, fontWeight: 900 }}>Ask about {currentTitle}</Typography>
                    <Typography sx={{ mt: .7, color: "#94a3b8", fontSize: ".76rem", lineHeight: 1.6 }}>
                      Course AI can answer using the authorized course notes and indexed learning material.
                    </Typography>
                  </Box>
                )}
                {messages.map((item, index) => <Message key={item._id || item.id || index} item={item} />)}
                {loading && <Typography sx={{ color: "#93c5fd", fontSize: ".72rem", py: 1 }}>AI is thinking…</Typography>}
              </Box>

              {error && <Alert severity="error" sx={{ mx: 1.5, mb: 1, borderRadius: 2 }}>{error}</Alert>}

              <Box sx={{ p: 1.4, borderTop: "1px solid #303949", backgroundColor: "#111827" }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={5}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }}
                  inputProps={{ maxLength: MAX_INPUT }}
                  placeholder="Ask something about this course…"
                  disabled={loading}
                  sx={{ "& .MuiInputBase-root": { color: "#fff", backgroundColor: "#172033", borderRadius: 2 }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#303949" }, "& .MuiInputBase-input::placeholder": { color: "#64748b", opacity: 1 } }}
                />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: .7 }}>
                  <Typography sx={{ color: "#64748b", fontSize: ".62rem" }}>{input.length}/{MAX_INPUT}</Typography>
                  <Button onClick={send} disabled={!input.trim() || loading} endIcon={<Send />} variant="contained" size="small" sx={{ textTransform: "none", fontWeight: 900 }}>Send</Button>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}
