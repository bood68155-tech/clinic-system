"use client";

import Link from "next/link";
import { useLang } from "@/lib/translations/context";

export default function ChatWidget() {
  const { t, lang } = useLang();
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById("chatbox");
          if (el) el.classList.toggle("hidden");
        }}
        className="group flex h-14 w-14 items-center justify-center bg-c-accent text-xl font-bold text-c-bg transition-all hover:bg-c-accentLight"
        style={{ boxShadow: "0 0 30px rgba(255,87,34,0.4)" }}
      >
        ✦
      </a>
      <div
        id="chatbox"
        className="hidden"
        style={{ position: "fixed", bottom: 80, left: 24, width: 380, maxHeight: 520, zIndex: 999 }}
      >
        <ChatBox />
      </div>
    </div>
  );
}

function ChatBox() {
  const { t } = useLang();
  return (
    <div className="flex flex-col border border-c-border bg-c-bg shadow-2xl" style={{ height: 480 }}>
      <div className="flex items-center justify-between border-b border-c-border bg-c-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center bg-c-accent text-xs font-black text-c-bg">✦</span>
          <div>
            <span className="text-sm font-bold text-c-white">Rana</span>
            <span className="mr-2 inline-block h-2 w-2 bg-c-teal" />
          </div>
        </div>
        <button
          onClick={() => document.getElementById("chatbox")?.classList.add("hidden")}
          className="text-c-muted hover:text-c-white text-lg"
        >
          ×
        </button>
      </div>
      <div id="chat-messages" className="flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-c-accent text-[10px] text-c-bg">✦</span>
          <div className="border border-c-border bg-c-surface px-3 py-2 text-sm text-c-light">
            {t.chat.greeting}
          </div>
        </div>
      </div>
      <div className="flex border-t border-c-border">
        <input
          id="chat-input"
          className="flex-1 bg-transparent px-4 py-3 text-sm text-c-white placeholder-c-muted outline-none"
          placeholder={t.chat.placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendChat();
          }}
        />
        <button onClick={sendChat} className="bg-c-accent px-5 text-sm font-bold text-c-bg hover:bg-c-accentLight transition-all">
          →
        </button>
      </div>
    </div>
  );
}

async function sendChat() {
  const input = document.getElementById("chat-input") as HTMLInputElement;
  const msg = input?.value?.trim();
  if (!msg) return;
  input.value = "";

  const box = document.getElementById("chat-messages");
  if (!box) return;

  box.innerHTML += `<div class="mb-3 flex gap-2 justify-end"><div class="border border-c-accent/30 bg-c-accent/10 px-3 py-2 text-sm text-c-white">${esc(msg)}</div></div>`;

  const loadingId = "loading-" + Date.now();
  box.innerHTML += `<div id="${loadingId}" class="mb-3 flex gap-2"><span class="flex h-6 w-6 shrink-0 items-center justify-center bg-c-accent text-[10px] text-c-bg">✦</span><div class="border border-c-border bg-c-surface px-3 py-2 text-sm text-c-muted flex gap-1"><span class="typing-dot"/><span class="typing-dot" style="animation-delay:0.2s"/><span class="typing-dot" style="animation-delay:0.4s"/></div></div>`;
  box.scrollTop = box.scrollHeight;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();
    const el = document.getElementById(loadingId);
    if (el) el.remove();
    box.innerHTML += `<div class="mb-3 flex gap-2"><span class="flex h-6 w-6 shrink-0 items-center justify-center bg-c-accent text-[10px] text-c-bg">✦</span><div class="border border-c-border bg-c-surface px-3 py-2 text-sm text-c-light">${esc(data.reply || "...")}</div></div>`;
  } catch {
    const el = document.getElementById(loadingId);
    if (el) el.remove();
    box.innerHTML += `<div class="mb-3 flex gap-2"><span class="flex h-6 w-6 shrink-0 items-center justify-center bg-c-accent text-[10px] text-c-bg">✦</span><div class="border border-c-danger/30 bg-c-danger/10 px-3 py-2 text-sm text-c-danger">Connection error</div></div>`;
  }
  box.scrollTop = box.scrollHeight;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}