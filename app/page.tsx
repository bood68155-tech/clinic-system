"use client";

import Link from "next/link";
import Header from "@/components/Header";
import ChatWidget from "@/components/ChatWidget";
import ToothIcon from "@/components/ToothIcon";
import { useLang } from "@/lib/translations/context";
import { useClinicSettings } from "@/lib/use-clinic-settings";

export default function Home() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const { clinic_logo } = useClinicSettings();

  return (
    <>
      <Header />
      <main className="tooth-grid relative min-h-[calc(100vh-65px)] overflow-hidden">
        {/* Glow background */}
        <div className="pointer-events-none fixed inset-0 glow-bg" />

        {/* ── Floating ambient elements ── */}
        {/* Glowing orb top-left */}
        <div className="ambient-orb pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-white/[0.02] blur-[120px]" />
        {/* Glowing orb bottom-right */}
        <div className="ambient-orb ambient-orb--delayed pointer-events-none fixed -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/[0.015] blur-[100px]" />
        {/* Glowing orb center accent */}
        <div className="ambient-orb ambient-orb--slow pointer-events-none fixed top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/[0.018] blur-[90px]" />

        {/* Floating dental icons */}
        <div className="ambient-float pointer-events-none fixed top-[15%] left-[8%] opacity-[0.04]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-16 w-16 text-white">
            <path d="M12 3.5c-1.5-1-3.6-.8-4.8.8-2 2.7-3 6-2 9.3.8 2.7.6 6 .6 6s2 .3 3.2-1c.7-.8 1.4-1.2 3-1.2s2.3.4 3 1.2c1.2 1.3 3.2 1 3.2 1s-.2-3.3.6-6c1-3.3 0-6.6-2-9.3C15.6 2.7 13.5 2.5 12 3.5z" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="ambient-float ambient-float--delayed pointer-events-none fixed top-[60%] right-[6%] opacity-[0.03]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-12 w-12 text-white">
            <path d="M12 3l1.8 4.8L18 9.6l-4.2 1.8L12 16l-1.8-4.6L6 9.6l4.2-1.8L12 3z" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="ambient-float ambient-float--slow pointer-events-none fixed top-[40%] left-[85%] opacity-[0.03]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-10 w-10 text-white">
            <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" strokeLinejoin="round" />
            <path d="M9 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="ambient-float pointer-events-none fixed bottom-[20%] left-[15%] opacity-[0.035]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-14 w-14 text-white">
            <path d="M4 13a8 8 0 0 1 16 0" />
            <path d="M6 13c0 4 2.5 6 6 6s6-2 6-6" />
          </svg>
        </div>

        {/* Grid accent glow lines */}
        <div className="pointer-events-none fixed top-0 left-1/4 h-full w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />
        <div className="pointer-events-none fixed top-0 left-2/4 h-full w-px bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
        <div className="pointer-events-none fixed top-0 left-3/4 h-full w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />
        <div className="pointer-events-none fixed top-1/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="pointer-events-none fixed top-2/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 text-center">
          {/* ── Premium framed hero image ── */}
          <div className="hero-frame relative mb-8">
            {/* Outer ambient glow pulse */}
            <div className="pointer-events-none absolute -inset-6 rounded-full bg-white/[0.06] blur-2xl hero-frame-glow" />

            {/* Gradient border ring (outer) */}
            <div className="hero-frame-border relative rounded-full p-[2px]">
              {/* Glassmorphism inner rim */}
              <div className="relative rounded-full bg-black/60 p-[1px] backdrop-blur-sm">
                {/* Metallic inner border */}
                <div className="rounded-full bg-gradient-to-br from-white/20 via-white/5 to-white/15 p-[1px]">
                  {/* Image container */}
                  <div className="relative h-44 w-44 overflow-hidden rounded-full bg-c-surface sm:h-48 sm:w-48 md:h-52 md:w-52">
                    {clinic_logo ? (
                      <img
                        src={clinic_logo}
                        alt="Clinic Logo"
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ToothIcon className="h-24 w-24 text-c-accent sm:h-28 sm:w-28 md:h-32 md:w-32" />
                      </div>
                    )}
                    {/* Inner rim shine overlay */}
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-10 bg-c-accent/50" />
            <span className="text-xs uppercase tracking-[0.35em] text-c-accent">
              {isAr ? "ابتسامتك تبدأ من هنا" : "YOUR SMILE STARTS HERE"}
            </span>
            <div className="h-px w-10 bg-c-accent/50" />
          </div>

          <h1 className="mb-5 max-w-3xl text-5xl font-black uppercase leading-[1.1] text-c-white md:text-7xl">
            <span className="text-c-accent">{isAr ? "عيادة أسنان" : "DENTAL"}</span>{" "}
            {isAr ? "بذكاء اصطناعي" : "BY AI"}
          </h1>

          <p className="mb-10 max-w-xl text-lg text-c-muted">
            {isAr
              ? "احجز موعدك بثانية، تابع سجلك الطبي، ووصلت وصفتك مع الشيك على واتساب."
              : "Book in seconds, track your records, get prescriptions with your checkup on WhatsApp."}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/book" className="btn-primary !px-12 !py-4 !text-base">
              {t.hero.cta}
            </Link>
            <Link href="/admin/login" className="btn-secondary !px-10 !py-4 !text-base">
              {t.nav.admin}
            </Link>
          </div>

          <div className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-px border border-c-border bg-c-border md:grid-cols-4">
            <div className="group bg-c-surface p-6 text-center transition-all hover:bg-c-accent/10">
              <ToothIcon variant="tooth" className="mx-auto h-8 w-8 text-c-accent transition-transform group-hover:scale-110" />
              <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-c-muted">
                {isAr ? "حجز ذكي" : "Smart Booking"}
              </div>
            </div>
            <div className="group bg-c-surface p-6 text-center transition-all hover:bg-c-cyan/10">
              <ToothIcon variant="sparkle" className="mx-auto h-8 w-8 text-c-cyan transition-transform group-hover:scale-110" />
              <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-c-muted">
                {isAr ? "مساعد واتساب" : "WhatsApp AI"}
              </div>
            </div>
            <div className="group bg-c-surface p-6 text-center transition-all hover:bg-c-gold/10">
              <ToothIcon variant="shield" className="mx-auto h-8 w-8 text-c-gold transition-transform group-hover:scale-110" />
              <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-c-muted">
                {isAr ? "ملف صحي" : "Health Records"}
              </div>
            </div>
            <div className="group bg-c-surface p-6 text-center transition-all hover:bg-c-accent/10">
              <ToothIcon variant="smile" className="mx-auto h-8 w-8 text-c-accent transition-transform group-hover:scale-110" />
              <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-c-muted">
                {isAr ? "متابعة كاملة" : "Full Follow-up"}
              </div>
            </div>
          </div>
        </div>
      </main>
      <ChatWidget />
    </>
  );
}
