"use client";

import Link from "next/link";
import Header from "@/components/Header";
import ChatWidget from "@/components/ChatWidget";
import { useLang } from "@/lib/translations/context";

export default function Home() {
  const { t, lang } = useLang();
  return (
    <>
      <Header />
      <main className="relative min-h-[calc(100vh-65px)]">
        <div className="pointer-events-none fixed inset-0 glow-bg" />
        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-6 inline-block border border-c-accent/30 bg-c-accent/10 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-c-accent">
            AI-Powered
          </div>
          <h1 className="mb-4 text-5xl font-black uppercase leading-tight text-c-white md:text-7xl">
            {t.hero.title}
          </h1>
          <p className="mb-10 max-w-xl text-lg text-c-muted">
            {t.hero.subtitle}
          </p>
          <div className="flex gap-4">
            <Link href="/book" className="btn-primary !px-10 !py-4 !text-base">
              {t.hero.cta}
            </Link>
            <Link href="/admin/login" className="btn-secondary !px-10 !py-4 !text-base">
              {t.nav.admin}
            </Link>
          </div>
          <div className="mt-20 grid w-full max-w-3xl grid-cols-3 gap-px bg-c-border">
            <div className="bg-c-surface p-6 text-center">
              <div className="text-3xl font-black text-c-accent">◈</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-c-muted">Smart Booking</div>
            </div>
            <div className="bg-c-surface p-6 text-center">
              <div className="text-3xl font-black text-c-teal">◉</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-c-muted">AI Assistant</div>
            </div>
            <div className="bg-c-surface p-6 text-center">
              <div className="text-3xl font-black text-c-gold">▣</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-c-muted">Full Records</div>
            </div>
          </div>
        </div>
      </main>
      <ChatWidget />
    </>
  );
}