"use client";

import Link from "next/link";
import ToothIcon from "@/components/ToothIcon";
import { useLang } from "@/lib/translations/context";

export default function Header({ back = false }: { back?: boolean }) {
  const { t, toggle, lang } = useLang();
  const isAr = lang === "ar";

  return (
    <header className="relative z-10 flex items-center justify-between border-b border-c-border px-6 py-4">
      <Link href="/" className="flex items-center gap-3">
        <ToothIcon className="h-8 w-8 text-c-accent" />
        <span className="text-base font-black uppercase tracking-[0.15em] text-c-white">
          {isAr ? "عيادة الأسنان" : "DentalAI"}
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <button onClick={toggle} className="btn-secondary !px-3 !py-1.5 !text-xs">
          {t.lang.switch}
        </button>
        {back ? (
          <Link href="/" className="btn-secondary !px-3 !py-1.5 !text-xs">
            {t.nav.back}
          </Link>
        ) : (
          <>
            <Link href="/admin/login" className="btn-secondary !px-3 !py-1.5 !text-xs">
              {isAr ? "لوحة الطبيب" : "Doctor Panel"}
            </Link>
            <Link href="/book" className="btn-primary !px-4 !py-1.5 !text-xs">
              {isAr ? "حجز موعد" : "Book Visit"}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}