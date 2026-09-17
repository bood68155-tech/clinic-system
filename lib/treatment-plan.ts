// Treatment plan model, cost estimation and installment / milestone math.

import type { Procedure, ProcedureCategory } from "./dental-catalog";
import { newId } from "./id";

export type PlanItemStatus = "planned" | "in-progress" | "done" | "cancelled";
export type PlanStatus = "draft" | "active" | "completed" | "cancelled";

export type PlanItem = {
  id: string;
  procedure_id: string;
  ar: string;
  en: string;
  category: ProcedureCategory;
  /** FDI tooth code, or "" for a whole-mouth / not tooth specific step. */
  tooth: string;
  price: number;
  qty: number;
  sessions: number;
  done_sessions: number;
  status: PlanItemStatus;
  note: string;
};

export type TreatmentPlan = {
  id: string;
  patient_id: string;
  title: string;
  status: PlanStatus;
  items: PlanItem[];
  discount: number;
  down_payment: number;
  installments: number;
  start_date: string;
  /** Indexes of the schedule entries already collected. */
  paid_installments: number[];
  notes: string;
  created_at?: string;
  updated_at?: string;
};

export type PlanTotals = {
  subtotal: number;
  discount: number;
  total: number;
  downPayment: number;
  remaining: number;
  collected: number;
  installmentAmount: number;
  totalSessions: number;
  doneSessions: number;
  progress: number;
  itemsCount: number;
};

export const PLAN_ITEM_STATUSES: { id: PlanItemStatus; ar: string; en: string }[] = [
  { id: "planned", ar: "مخطط", en: "Planned" },
  { id: "in-progress", ar: "قيد التنفيذ", en: "In progress" },
  { id: "done", ar: "منجز", en: "Completed" },
  { id: "cancelled", ar: "ملغي", en: "Cancelled" },
];

export const PLAN_STATUSES: { id: PlanStatus; ar: string; en: string }[] = [
  { id: "draft", ar: "مسودة", en: "Draft" },
  { id: "active", ar: "نشطة", en: "Active" },
  { id: "completed", ar: "مكتملة", en: "Completed" },
  { id: "cancelled", ar: "ملغاة", en: "Cancelled" },
];

export function newPlanItem(procedure: Procedure, tooth = ""): PlanItem {
  return {
    id: newId(),
    procedure_id: procedure.id,
    ar: procedure.ar,
    en: procedure.en,
    category: procedure.category,
    tooth,
    price: procedure.price,
    qty: 1,
    sessions: procedure.sessions,
    done_sessions: 0,
    status: "planned",
    note: "",
  };
}

export function emptyPlan(patientId: string): TreatmentPlan {
  return {
    id: newId(),
    patient_id: patientId,
    title: "",
    status: "draft",
    items: [],
    discount: 0,
    down_payment: 0,
    installments: 1,
    start_date: new Date().toISOString().slice(0, 10),
    paid_installments: [],
    notes: "",
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const round2 = (value: number) => Math.round(value * 100) / 100;

export function computeTotals(plan: TreatmentPlan): PlanTotals {
  const active = plan.items.filter((i) => i.status !== "cancelled");
  const subtotal = round2(active.reduce((sum, i) => sum + i.price * i.qty, 0));
  const discount = clamp(Number(plan.discount) || 0, 0, subtotal);
  const total = round2(subtotal - discount);
  const downPayment = clamp(Number(plan.down_payment) || 0, 0, total);
  const remaining = round2(total - downPayment);
  const installments = Math.max(1, Math.floor(Number(plan.installments) || 1));
  const installmentAmount = round2(remaining / installments);

  const schedule = buildSchedule(total, downPayment, installments, plan.start_date);
  const collectedInstallments = schedule
    .filter((_, index) => (plan.paid_installments || []).includes(index))
    .reduce((sum, s) => sum + s.amount, 0);

  const totalSessions = active.reduce((sum, i) => sum + i.sessions, 0);
  const doneSessions = active.reduce((sum, i) => sum + Math.min(i.done_sessions, i.sessions), 0);

  return {
    subtotal,
    discount,
    total,
    downPayment,
    remaining,
    collected: round2(downPayment + collectedInstallments),
    installmentAmount,
    totalSessions,
    doneSessions,
    progress: totalSessions ? Math.round((doneSessions / totalSessions) * 100) : 0,
    itemsCount: active.length,
  };
}

export type ScheduleEntry = { index: number; label: string; dueDate: string; amount: number };

/** Equal monthly installments starting one month after the plan start date. */
export function buildSchedule(
  total: number,
  downPayment: number,
  installments: number,
  startDate: string,
  lang: "ar" | "en" = "ar"
): ScheduleEntry[] {
  const remaining = round2(Math.max(0, total - downPayment));
  const count = Math.max(1, Math.floor(installments) || 1);
  if (remaining <= 0) return [];
  const base = round2(remaining / count);
  const start = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
  const entries: ScheduleEntry[] = [];
  let allocated = 0;
  for (let i = 0; i < count; i += 1) {
    const isLast = i === count - 1;
    const amount = isLast ? round2(remaining - allocated) : base;
    allocated = round2(allocated + amount);
    const due = new Date(start.getTime());
    due.setMonth(due.getMonth() + (i === 0 ? 0 : i));
    entries.push({
      index: i,
      label: lang === "ar" ? `القسط ${i + 1}` : `Installment ${i + 1}`,
      dueDate: due.toISOString().slice(0, 10),
      amount,
    });
  }
  return entries;
}

export function formatMoney(value: number, lang: "ar" | "en" = "ar"): string {
  const amount = (Number(value) || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
  return lang === "ar" ? `${amount} ر.س` : `${amount} SAR`;
}

export function formatPlanText(
  plan: TreatmentPlan,
  ctx: { patientName: string; clinicName: string; doctorName?: string; lang: "ar" | "en" }
): string {
  const { lang } = ctx;
  const totals = computeTotals(plan);
  const schedule = buildSchedule(totals.total, totals.downPayment, plan.installments, plan.start_date, lang);
  const lines: string[] = [];

  lines.push(`🏥 ${ctx.clinicName || (lang === "ar" ? "عيادتي" : "Clinic")}`);
  lines.push(lang === "ar" ? `📋 خطة العلاج — ${ctx.patientName}` : `📋 Treatment plan — ${ctx.patientName}`);
  if (plan.title) lines.push(`🗂 ${plan.title}`);
  lines.push("━━━━━━━━━━━━━━━━");

  plan.items
    .filter((i) => i.status !== "cancelled")
    .forEach((item, index) => {
      const name = lang === "ar" ? item.ar : item.en;
      const tooth = item.tooth ? (lang === "ar" ? ` — سن ${item.tooth}` : ` — tooth ${item.tooth}`) : "";
      const qty = item.qty > 1 ? ` ×${item.qty}` : "";
      lines.push(`${index + 1}. ${name}${tooth}${qty} — ${formatMoney(item.price * item.qty, lang)}`);
      if (item.sessions > 1) {
        lines.push(
          lang === "ar"
            ? `   🗓 ${item.sessions} جلسات (أُنجز ${item.done_sessions})`
            : `   🗓 ${item.sessions} sessions (${item.done_sessions} done)`
        );
      }
    });

  lines.push("━━━━━━━━━━━━━━━━");
  lines.push(lang === "ar" ? `المجموع: ${formatMoney(totals.subtotal, lang)}` : `Subtotal: ${formatMoney(totals.subtotal, lang)}`);
  if (totals.discount > 0) lines.push(lang === "ar" ? `الخصم: -${formatMoney(totals.discount, lang)}` : `Discount: -${formatMoney(totals.discount, lang)}`);
  lines.push(lang === "ar" ? `الإجمالي: ${formatMoney(totals.total, lang)}` : `Total: ${formatMoney(totals.total, lang)}`);
  if (totals.downPayment > 0) lines.push(lang === "ar" ? `الدفعة المقدمة: ${formatMoney(totals.downPayment, lang)}` : `Down payment: ${formatMoney(totals.downPayment, lang)}`);
  lines.push(lang === "ar" ? `المتبقي: ${formatMoney(totals.remaining, lang)}` : `Remaining: ${formatMoney(totals.remaining, lang)}`);

  if (schedule.length > 1) {
    lines.push("━━━━━━━━━━━━━━━━");
    lines.push(lang === "ar" ? "📆 جدول الأقساط:" : "📆 Installments:");
    schedule.forEach((entry, index) => {
      const paid = (plan.paid_installments || []).includes(index) ? (lang === "ar" ? " ✅ مدفوع" : " ✅ paid") : "";
      lines.push(`${entry.dueDate} — ${formatMoney(entry.amount, lang)}${paid}`);
    });
  }

  if (totals.totalSessions > 0) {
    lines.push("━━━━━━━━━━━━━━━━");
    lines.push(
      lang === "ar"
        ? `⏳ الجلسات: ${totals.doneSessions}/${totals.totalSessions} (${totals.progress}%)`
        : `⏳ Sessions: ${totals.doneSessions}/${totals.totalSessions} (${totals.progress}%)`
    );
  }

  if (plan.notes) lines.push(`📝 ${plan.notes}`);
  if (ctx.doctorName) lines.push(lang === "ar" ? `👨‍⚕️ د. ${ctx.doctorName}` : `👨‍⚕️ Dr. ${ctx.doctorName}`);
  return lines.join("\n");
}
