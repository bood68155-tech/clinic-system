"use client";

import Link from "next/link";
import { useLang } from "@/lib/translations/context";

export default function Header({ back = false }: { back?: boolean }) {
  const { t, toggle, lang } = useLang();
  return (
    <header className="relative z-10 flex items-center justify-between border-b border-c-border px-6 py-4">
      <Link href="/" className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center bg-c-accent text-sm font-black text-c-bg">
          +
        </span>
        <span className="text-lg font-black uppercase tracking-wider text-c-white">
          {t.nav.home === "Home" ? "ClinicAI" : "عيادتي"}
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="btn-secondary !py-1.5 !px-3 !text-xs"
        >
          {t.lang.switch}
        </button>
        {back ? (
          <Link href="/" className="btn-secondary !py-1.5 !text-xs">
            ← {t.nav.back}
          </Link>
        ) : (
          <>
            <Link href="/admin/login" className="btn-secondary !py-1.5 !text-xs">
              {t.nav.admin}
            </Link>
            <Link href="/book" className="btn-primary !py-1.5 !text-xs">
              {t.nav.book}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}