"use client";

import Link from "next/link";
import Header from "@/components/Header";
import ChatWidget from "@/components/ChatWidget";
import ToothIcon from "@/components/ToothIcon";
import { useLang } from "@/lib/translations/context";

export default function Home() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  return (
    <>
      <Header />
      <main className="tooth-grid relative min-h-[calc(100vh-65px)]">
        <div className="pointer-events-none fixed inset-0 glow-bg" />

        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="animate-shine mb-8">
            <ToothIcon className="h-24 w-24 text-c-accent" />
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