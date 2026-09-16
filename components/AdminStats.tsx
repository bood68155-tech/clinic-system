"use client";

import { useLang } from "@/lib/translations/context";

export default function AdminStats({
  todayCount, patientCount, visitCount, totalRevenue, pendingAmount, today,
}: {
  todayCount: number;
  patientCount: number;
  visitCount: number;
  totalRevenue: number;
  pendingAmount: number;
  today: string;
}) {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  return (
    <div className="mb-8 grid gap-px bg-c-border md:grid-cols-4">
      <div className="bg-c-card p-5">
        <div className="text-[10px] uppercase tracking-wider text-c-muted">{t.admin.todayAppts}</div>
        <div className="mt-2 text-4xl font-black text-c-accent">{todayCount}</div>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-c-muted">{today}</div>
      </div>
      <div className="bg-c-card p-5">
        <div className="text-[10px] uppercase tracking-wider text-c-muted">{t.admin.totalPatients}</div>
        <div className="mt-2 text-4xl font-black text-c-cyan">{patientCount}</div>
      </div>
      <div className="bg-c-card p-5">
        <div className="text-[10px] uppercase tracking-wider text-c-muted">{t.admin.visits}</div>
        <div className="mt-2 text-4xl font-black text-c-gold">{visitCount}</div>
      </div>
      <div className="bg-c-card p-5">
        <div className="text-[10px] uppercase tracking-wider text-c-muted">{t.admin.revenue}</div>
        <div className="mt-2 text-3xl font-black text-c-success">{totalRevenue.toLocaleString()}</div>
        <div className="mt-1 text-xs text-c-gold">{pendingAmount.toLocaleString()} {isAr ? "معلق" : "pending"}</div>
      </div>
    </div>
  );
}