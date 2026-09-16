"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/translations/context";

const NAV_ICONS: Record<string, string> = {
  "/admin": "◈",
  "/admin/visits": "◉",
  "/admin/patients": "◎",
  "/admin/invoices": "▣",
  "/admin/doctors": "◇",
  "/admin/settings": "⬡",
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const { t, lang, toggle } = useLang();

  const NAV = [
    { href: "/admin", label: t.admin.dashboard },
    { href: "/admin/visits", label: t.admin.visitsLog },
    { href: "/admin/patients", label: t.admin.patients },
    { href: "/admin/invoices", label: t.admin.invoices },
    { href: "/admin/doctors", label: t.admin.doctors },
    { href: "/admin/settings", label: t.admin.settings },
  ];

  return (
    <nav className="flex flex-col gap-0.5 md:flex-row md:items-center md:gap-1">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={`flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider transition-all ${
            pathname === n.href
              ? "border-b-2 border-c-accent text-c-accent"
              : "text-c-muted hover:text-c-white"
          }`}
        >
          <span className="text-c-accent/60">{NAV_ICONS[n.href] || "•"}</span>
          <span>{n.label}</span>
        </Link>
      ))}
      <div className="mr-auto flex items-center gap-2">
        <button onClick={toggle} className="px-2 py-1 text-xs text-c-muted hover:text-c-white transition-all">
          {t.lang.switch}
        </button>
        <a href="/" className="px-2 py-1 text-xs text-c-muted hover:text-c-white transition-all hidden md:block">↩</a>
        <a href="/api/admin/logout" className="px-2 py-1 text-xs text-c-danger hover:text-red-300 transition-all hidden md:block">
          {t.nav.logout}
        </a>
      </div>
    </nav>
  );
}