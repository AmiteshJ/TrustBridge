/**
 * AI Assistant Page – Groq-powered chat
 */
import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { aiAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Send, Loader2, Bot, User as UserIcon, Sparkles } from "lucide-react";

const suggestedQuestions = [
  "How do I verify my certificate?",
  "How do I sync credentials to DigiLocker?",
  "What is a trust score?",
  "How does fraud detection work?",
  "What happens after I upload a credential?",
];

function Message({ msg }) {
  const isBot = msg.role === "assistant";
  return (
    <div className={`flex gap-3 ${isBot ? "flex-row" : "flex-row-reverse"}`}>
      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-clay-sm ${
        isBot ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-gradient-to-br from-gray-400 to-gray-500"
      }`}>
        {isBot ? <Bot className="w-4 h-4 text-white" /> : <UserIcon className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isBot
          ? "bg-white/80 border border-white/50 shadow-glass text-emerald-900"
          : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
      }`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const { user }    = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi ${user?.name?.split(" ")[0]}! 👋 I'm your TrustBridge AI assistant. I can help you with credential verification, DigiLocker sync, trust scores, and more. What would you like to know?` }
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content) return;

    const userMsg  = { role: "user", content };
    const newMsgs  = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMsgs
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role, content: m.content }));

      const { data } = await aiAPI.chat(apiMessages);
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
        {/* Header */}
        <div className="clay-card p-4 mb-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-white">TrustBridge AI Assistant</h1>
            <p className="text-emerald-100 text-xs">Powered by Groq · Llama 3</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-1">
          {messages.map((m, i) => <Message key={i} msg={m} />)}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/80 border border-white/50 shadow-glass rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        {messages.length <= 2 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {suggestedQuestions.map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/70 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="clay-card p-2 flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask me anything about TrustBridge..."
            rows={1}
            className="clay-input flex-1 resize-none py-2.5 text-sm"
            style={{ minHeight: "42px", maxHeight: "120px" }}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            className="clay-button px-4 py-2 flex items-center gap-1 self-end">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
