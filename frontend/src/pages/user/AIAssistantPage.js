/**
 * TrustBridge — AI Assistant Page
 * Groq · Llama 3 · Persistent conversation per user (localStorage keyed by user._id)
 * Context sent fully on every message so Groq remembers the whole thread.
 * Conversation cleared on logout via localStorage key removal.
 */
import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { aiAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

/* ─────────────────────────────────────────────────────────────────────────────
   TOKENS
───────────────────────────────────────────────────────────────────────────── */
const T = {
  jade: "#2dce7a",
  emerald: "#0ea55e",
  forest: "#076b3c",
  deep: "#043d22",
  muted: "#5a7d6a",
  glass: "rgba(255,255,255,0.74)",
  glassBorder: "rgba(255,255,255,0.58)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   CONVERSATION PERSISTENCE
   Key: tb_ai_chat_{userId}  — survives page refresh, cleared on logout
───────────────────────────────────────────────────────────────────────────── */
const getChatKey = (userId) => `tb_ai_chat_${userId}`;

const loadHistory = (userId) => {
  try {
    const raw = localStorage.getItem(getChatKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveHistory = (userId, messages) => {
  try {
    // Keep last 100 messages max to avoid hitting localStorage limits
    const trimmed = messages.slice(-100);
    localStorage.setItem(getChatKey(userId), JSON.stringify(trimmed));
  } catch { /* storage full — fail silently */ }
};

/* ─────────────────────────────────────────────────────────────────────────────
   SUGGESTED QUESTIONS
───────────────────────────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  { emoji: "🔍", text: "How do I verify a credential?" },
  { emoji: "📱", text: "How do I sync to DigiLocker?" },
  { emoji: "⭐", text: "What is a trust score?" },
  { emoji: "🛡️", text: "How does fraud detection work?" },
  { emoji: "📤", text: "What happens after I upload?" },
  { emoji: "🏛️", text: "How do issuers approve credentials?" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────────────────────────── */
function Bubble({ msg, isNew }) {
  const isBot = msg.role === "assistant";
  const time = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div style={{
      display: "flex",
      flexDirection: isBot ? "row" : "row-reverse",
      gap: 10, alignItems: "flex-end",
      animation: isNew ? "msgIn 0.3s cubic-bezier(.16,1,.3,1) both" : "none",
      marginBottom: 4,
    }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: 12, flexShrink: 0,
        background: isBot
          ? "linear-gradient(135deg,#2dce7a,#0ea55e)"
          : "linear-gradient(135deg,#6366f1,#4f46e5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, boxShadow: isBot
          ? "0 4px 12px rgba(45,206,122,0.3)"
          : "0 4px 12px rgba(99,102,241,0.3)",
      }}>
        {isBot ? "🤖" : "👤"}
      </div>

      <div style={{
        maxWidth: "78%", display: "flex", flexDirection: "column",
        alignItems: isBot ? "flex-start" : "flex-end", gap: 4
      }}>

        {/* Bubble */}
        <div style={{
          padding: "12px 16px",
          borderRadius: isBot ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
          background: isBot
            ? "rgba(255,255,255,0.85)"
            : "linear-gradient(135deg,#2dce7a,#0ea55e)",
          border: isBot ? `1.5px solid rgba(255,255,255,0.7)` : "none",
          backdropFilter: isBot ? "blur(12px)" : "none",
          boxShadow: isBot
            ? "4px 6px 20px rgba(7,107,60,0.09), inset 0 1px 0 rgba(255,255,255,0.8)"
            : "4px 6px 20px rgba(45,206,122,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 14, lineHeight: 1.65,
          color: isBot ? T.deep : "white",
          fontWeight: 400,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {msg.content}
        </div>

        {/* Timestamp */}
        {time && (
          <span style={{ fontSize: 11, color: "rgba(90,125,106,0.6)", fontWeight: 500, paddingLeft: 4, paddingRight: 4 }}>
            {time}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 10, alignItems: "flex-end", marginBottom: 4 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 12, flexShrink: 0,
        background: "linear-gradient(135deg,#2dce7a,#0ea55e)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        boxShadow: "0 4px 12px rgba(45,206,122,0.3)"
      }}>🤖</div>
      <div style={{
        padding: "14px 18px", borderRadius: "18px 18px 18px 4px",
        background: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        boxShadow: "4px 6px 20px rgba(7,107,60,0.09)",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: T.jade,
            animation: `typingDot 1.2s ${i * 0.18}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function AIAssistantPage() {
  const { user } = useAuth();
  const userId = user?._id;

  /* ── Build initial messages — called once on mount ────────────────────── */
  const getInitialMessages = () => {
    const greeting = {
      role: "assistant",
      content: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your TrustBridge AI assistant, powered by Groq · Llama 3.\n\nI can help you with credential verification, DigiLocker sync, trust scores, fraud detection, and anything else about TrustBridge. What would you like to know?`,
      timestamp: Date.now(),
    };
    const saved = loadHistory(userId);
    // Restore if saved history has more than just the greeting
    if (saved && saved.length > 1) return saved;
    return [greeting];
  };

  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [newMsgIdx, setNewMsgIdx] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const chatBoxRef = useRef(null);
  // Keep a ref to latest messages so the unmount cleanup can access current value
  const messagesRef = useRef(messages);

  /* ── Auto scroll to bottom ─────────────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ── Keep ref in sync with latest messages ──────────────────────────────── */
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /* ── Save to localStorage on every message change ──────────────────────── */
  useEffect(() => {
    if (userId && messages.length > 0) saveHistory(userId, messages);
  }, [messages, userId]);

  /* ── Save on unmount (navigation away) — uses ref for latest value ─────── */
  useEffect(() => {
    return () => {
      if (userId && messagesRef.current.length > 0) {
        saveHistory(userId, messagesRef.current);
      }
    };
  }, [userId]); // only userId dep — runs cleanup on unmount

  /* ── Auto-resize textarea ──────────────────────────────────────────────── */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  /* ── Send message ──────────────────────────────────────────────────────── */
  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMsg = { role: "user", content, timestamp: Date.now() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    setNewMsgIdx(newMsgs.length - 1);

    try {
      // Send full history for context memory
      const apiMessages = newMsgs
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role, content: m.content }));

      const { data } = await aiAPI.chat(apiMessages);
      const botMsg = { role: "assistant", content: data.reply, timestamp: Date.now() };
      setMessages(prev => {
        const updated = [...prev, botMsg];
        setNewMsgIdx(updated.length - 1);
        return updated;
      });
    } catch {
      const errMsg = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* ── Clear conversation ────────────────────────────────────────────────── */
  const clearChat = () => {
    if (!window.confirm("Clear the entire conversation history?")) return;
    localStorage.removeItem(getChatKey(userId));
    setMessages([{
      role: "assistant",
      content: `Conversation cleared! Hi again, ${user?.name?.split(" ")[0] || "there"}! 👋 How can I help you?`,
      timestamp: Date.now(),
    }]);
  };

  const showSuggestions = messages.length <= 1;
  const msgCount = messages.filter(m => m.role === "user").length;

  return (
    <DashboardLayout>
      <div style={{
        fontFamily: "'DM Sans',system-ui,sans-serif", width: "100%",
        display: "flex", flexDirection: "column", height: "calc(100vh - 72px)", maxHeight: 880
      }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing:border-box; }

          @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
          @keyframes msgIn    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
          @keyframes typingDot{ 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-5px);opacity:1} }
          @keyframes spin     { to{transform:rotate(360deg)} }
          @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
          @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.5} }

          .shimmer-text {
            background:linear-gradient(90deg,#0ea55e 0%,#2dce7a 30%,#a8edca 50%,#2dce7a 70%,#0ea55e 100%);
            background-size:200% auto;
            -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
            animation:shimmer 4s linear infinite;
          }

          .chat-box::-webkit-scrollbar       { width:4px; }
          .chat-box::-webkit-scrollbar-track  { background:transparent; }
          .chat-box::-webkit-scrollbar-thumb  { background:rgba(45,206,122,0.3); border-radius:99px; }

          .sugg-btn {
            display:inline-flex; align-items:center; gap:7px;
            padding:8px 14px; border-radius:100px; cursor:pointer;
            border:1.5px solid rgba(45,206,122,0.22);
            background:rgba(255,255,255,0.7); backdrop-filter:blur(8px);
            font-family:'DM Sans',sans-serif; font-weight:600; font-size:12.5px;
            color:#5a7d6a; transition:all 0.18s ease; white-space:nowrap;
          }
          .sugg-btn:hover {
            background:rgba(212,245,226,0.8); border-color:rgba(45,206,122,0.45);
            color:#076b3c; transform:translateY(-2px);
            box-shadow:0 4px 14px rgba(45,206,122,0.15);
          }

          .send-btn {
            width:44px; height:44px; border-radius:14px; border:none; cursor:pointer;
            display:flex; align-items:center; justify-content:center; flex-shrink:0;
            transition:all 0.18s ease; font-size:18px;
          }
          .send-btn:disabled { cursor:not-allowed; opacity:0.5; }

          .clear-btn {
            padding:6px 14px; border-radius:100px; border:1.5px solid rgba(239,68,68,0.2);
            background:rgba(239,68,68,0.06); color:#991b1b;
            font-family:'DM Sans',sans-serif; font-weight:600; font-size:12px;
            cursor:pointer; transition:all 0.18s;
          }
          .clear-btn:hover { background:rgba(239,68,68,0.12); border-color:rgba(239,68,68,0.4); }
        `}</style>

        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 24, padding: "18px 24px", marginBottom: 16, flexShrink: 0,
          background: "linear-gradient(135deg,#076b3c 0%,#0ea55e 45%,#2dce7a 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "relative", overflow: "hidden",
          boxShadow: "0 12px 36px rgba(7,107,60,0.2)",
        }}>
          {/* Decorative rings */}
          <div style={{
            position: "absolute", top: -40, right: -40, width: 160, height: 160,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", top: -20, right: -20, width: 100, height: 100,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.18)", pointerEvents: "none"
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Bot icon */}
            <div style={{
              width: 46, height: 46, borderRadius: 16,
              background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(255,255,255,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            }}>🤖</div>

            <div>
              <h1 style={{
                fontWeight: 800, fontSize: 17, color: "white",
                letterSpacing: "-0.02em", marginBottom: 2
              }}>
                TrustBridge AI Assistant
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%", background: "#a8edca",
                  animation: "pulse 2s ease-in-out infinite"
                }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
                  Powered by Groq · Llama 3
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Message count badge */}
            {msgCount > 0 && (
              <div style={{
                padding: "5px 12px", borderRadius: 100,
                background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)",
                fontSize: 12, fontWeight: 700, color: "white",
              }}>
                {msgCount} message{msgCount !== 1 ? "s" : ""}
              </div>
            )}
            {/* Memory badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 100,
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
              fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)",
            }}>
              💾 Session memory
            </div>
            {/* Clear button */}
            {messages.length > 1 && (
              <button className="clear-btn" onClick={clearChat}>
                🗑️ Clear
              </button>
            )}
          </div>
        </div>

        {/* ── CHAT AREA ────────────────────────────────────────────────── */}
        <div style={{
          flex: 1, minHeight: 0,
          background: T.glass, border: `1.5px solid ${T.glassBorder}`,
          borderRadius: 24, backdropFilter: "blur(20px)",
          boxShadow: "6px 8px 24px rgba(7,107,60,0.08)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>

          {/* Top accent bar */}
          <div style={{
            height: 3, flexShrink: 0, borderRadius: "24px 24px 0 0",
            background: "linear-gradient(90deg,#2dce7a,#0ea55e,#076b3c)"
          }} />

          {/* Messages scroll area */}
          <div ref={chatBoxRef} className="chat-box" style={{
            flex: 1, overflowY: "auto", padding: "20px 20px 8px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>

            {/* Restored session notice */}
            {messages.length > 1 && (
              <div style={{
                textAlign: "center", padding: "6px 16px",
                background: "rgba(212,245,226,0.5)", borderRadius: 100,
                border: "1px solid rgba(45,206,122,0.18)",
                fontSize: 12, fontWeight: 600, color: T.forest,
                alignSelf: "center", marginBottom: 4,
              }}>
                💾 Conversation restored from your last session
              </div>
            )}

            {messages.map((msg, i) => (
              <Bubble key={i} msg={msg} isNew={i === newMsgIdx} />
            ))}

            {loading && <TypingDots />}

            <div ref={bottomRef} />
          </div>

          {/* Suggested questions — only on fresh chat */}
          {showSuggestions && !loading && (
            <div style={{
              padding: "10px 20px 8px",
              borderTop: "1px solid rgba(45,206,122,0.1)",
              flexShrink: 0,
            }}>
              <p style={{
                fontSize: 11.5, fontWeight: 700, color: T.muted,
                letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8
              }}>
                Quick questions
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SUGGESTIONS.map(({ emoji, text }) => (
                  <button key={text} className="sugg-btn"
                    onClick={() => sendMessage(text)}>
                    <span style={{ fontSize: 14 }}>{emoji}</span>{text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── INPUT BAR ──────────────────────────────────────────────── */}
          <div style={{
            padding: "12px 16px", flexShrink: 0,
            borderTop: "1px solid rgba(45,206,122,0.1)",
            background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)",
            borderRadius: "0 0 22px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask me anything about TrustBridge… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  style={{
                    width: "100%",
                    padding: "11px 16px",
                    border: `2px solid ${input.trim() ? "rgba(45,206,122,0.45)" : "rgba(45,206,122,0.2)"}`,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.9)",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 14, fontWeight: 400, color: T.deep,
                    outline: "none", resize: "none",
                    lineHeight: 1.5,
                    minHeight: 44, maxHeight: 120,
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: input.trim()
                      ? "0 0 0 3px rgba(45,206,122,0.1), inset 0 2px 4px rgba(7,107,60,0.04)"
                      : "inset 0 2px 4px rgba(7,107,60,0.03)",
                    caretColor: T.emerald,
                    overflowY: "auto",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "rgba(45,206,122,0.6)";
                    e.target.style.boxShadow = "0 0 0 4px rgba(45,206,122,0.12), inset 0 2px 4px rgba(7,107,60,0.04)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = input.trim() ? "rgba(45,206,122,0.45)" : "rgba(45,206,122,0.2)";
                    e.target.style.boxShadow = "inset 0 2px 4px rgba(7,107,60,0.03)";
                  }}
                />
              </div>

              {/* Send button */}
              <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{
                  background: loading || !input.trim()
                    ? "rgba(45,206,122,0.3)"
                    : "linear-gradient(135deg,#2dce7a,#0ea55e)",
                  boxShadow: !loading && input.trim()
                    ? "0 6px 20px rgba(45,206,122,0.35), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "none",
                  transform: !loading && input.trim() ? "scale(1)" : "scale(0.96)",
                }}>
                {loading
                  ? <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "white",
                    animation: "spin 0.8s linear infinite"
                  }} />
                  : <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>↑</span>
                }
              </button>
            </div>

            {/* Hint row */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginTop: 8, paddingLeft: 4
            }}>
              <p style={{ fontSize: 11.5, color: "rgba(90,125,106,0.55)", fontWeight: 500 }}>
                Enter to send · Shift+Enter for new line
              </p>
              <p style={{ fontSize: 11.5, color: "rgba(90,125,106,0.55)", fontWeight: 500 }}>
                💾 Your conversation is saved until you log out
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
