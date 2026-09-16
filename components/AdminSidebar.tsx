"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "لوحة التحكم", icon: "📊" },
  { href: "/admin/visits", label: "الزيارات", icon: "🩺" },
  { href: "/admin/patients", label: "المرضى", icon: "👥" },
  { href: "/admin/invoices", label: "الفواتير", icon: "🧾" },
  { href: "/admin/doctors", label: "الأطباء", icon: "👨‍⚕️" },
  { href: "/admin/settings", label: "الإعدادات", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${
            pathname === n.href
              ? "bg-clinic-accent/20 text-clinic-accent font-semibold"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span>{n.icon}</span>
          <span>{n.label}</span>
        </Link>
      ))}
      <a href="/" className="mr-auto text-sm text-white/40 hover:text-white hidden md:block">↩</a>
      <a href="/api/admin/logout" className="text-sm text-white/40 hover:text-red-400 hidden md:block">🚪</a>
    </nav>
  );
}