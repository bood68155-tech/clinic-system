"use client";

import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const WELCOME: Msg = {
  role: "assistant",
  text: "أهلاً بك! 👋 أنا رنا، مساعدة العيادة الذكية. تقدر تحجز موعدك معي مباشرة — قول لي متى بدك تيجي؟",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const history: Msg[] = [...messages, { role: "user", text }];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      setMessages([...history, { role: "assistant", text: data.text || "..." }]);
    } catch {
      setMessages([...history, { role: "assistant", text: "حدث خطأ في الاتصال، حاول مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  }

  setTimeout(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, 50);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-clinic-accent text-2xl text-clinic-dark shadow-lg shadow-clinic-accent/30 transition-transform hover:scale-110"
        aria-label="المساعدة الذكية"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-24 left-5 z-50 flex h-[480px] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-clinic-card shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/10 bg-clinic-deep px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clinic-accent text-lg text-clinic-dark">
              🤖
            </div>
            <div>
              <div className="text-sm font-bold text-white">رنا — المساعدة الذكية</div>
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="h-2 w-2 animate-pulse-slow rounded-full bg-emerald-400" />
                متصلة الآن
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "mr-auto rounded-tr-sm bg-clinic-accent text-clinic-dark"
                    : "ml-auto rounded-tl-sm bg-white/10 text-white/90"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="ml-auto flex items-center gap-1 rounded-2xl bg-white/10 px-3 py-2 text-sm text-white/60">
                <span className="typing-dot" style={{ animationDelay: "0ms" }} />
                <span className="typing-dot" style={{ animationDelay: "150ms" }} />
                <span className="typing-dot" style={{ animationDelay: "300ms" }} />
              </div>
            )}
          </div>

          <form
            className="flex items-center gap-2 border-t border-white/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              className="input flex-1 !py-2 text-sm"
              placeholder="اكتب رسالتك..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn-primary !px-4 !py-2" disabled={loading}>
              إرسال
            </button>
          </form>
        </div>
      )}
    </>
  );
}