"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/translations/context";
import ToothIcon from "@/components/ToothIcon";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { t, lang } = useLang();

  const NAV = [
    { href: "/admin", label: lang === "ar" ? "الرئيسية" : "Overview", icon: "check" as const },
    { href: "/admin/visits", label: lang === "ar" ? "الزيارات" : "Visits", icon: "tooth" as const },
    { href: "/admin/patients", label: lang === "ar" ? "المرضى" : "Patients", icon: "smile" as const },
    { href: "/admin/invoices", label: lang === "ar" ? "الفواتير" : "Invoices", icon: "shield" as const },
    { href: "/admin/doctors", label: lang === "ar" ? "الأطباء" : "Doctors", icon: "sparkle" as const },
    { href: "/admin/tools", label: lang === "ar" ? "الأدوات الإكلينيكية" : "Clinical Tools", icon: "plus" as const },
    { href: "/admin/settings", label: lang === "ar" ? "الإعدادات" : "Settings", icon: "check" as const },
  ];

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={`flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider transition-all ${
            pathname === n.href || (n.href !== "/admin" && pathname.startsWith(`${n.href}/`))
              ? "border-b-2 border-c-accent text-c-accent"
              : "text-c-muted hover:text-c-white"
          }`}
        >
          <ToothIcon variant={n.icon} className="h-4 w-4" />
          <span>{n.label}</span>
        </Link>
      ))}
      <div className="mr-auto flex items-center gap-1">
        <a href="/" className="px-2 py-1 text-xs text-c-muted hover:text-c-white">↩</a>
        <a href="/api/admin/logout" className="px-2 py-1 text-xs text-c-danger">{t.nav.logout}</a>
      </div>
    </nav>
  );
}