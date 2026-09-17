"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/translations/context";
import { clinicalI18n } from "@/lib/clinical-i18n";
import {
  PROCEDURES,
  PROCEDURE_BY_ID,
  PROCEDURE_CATEGORIES,
  categoryLabel,
  type ProcedureCategory,
} from "@/lib/dental-catalog";
import {
  PLAN_ITEM_STATUSES,
  PLAN_STATUSES,
  buildSchedule,
  computeTotals,
  emptyPlan,
  formatMoney,
  formatPlanText,
  newPlanItem,
  type PlanItem,
  type PlanItemStatus,
  type TreatmentPlan,
} from "@/lib/treatment-plan";
import { TEETH } from "@/lib/dental";
import { copyText } from "@/lib/whatsapp-client";
import { loadLocal, saveLocal } from "@/lib/local-store";
import { printText } from "@/lib/print";
import WhatsAppButton from "@/components/WhatsAppButton";

const plansKey = (patientId: string) => `plans:${patientId}`;

function mergeItems(existing: PlanItem[], incoming: PlanItem[]): PlanItem[] {
  const keys = new Set(existing.map((i) => `${i.procedure_id}:${i.tooth}`));
  const additions = incoming.filter((i) => !keys.has(`${i.procedure_id}:${i.tooth}`));
  return additions.length ? [...existing, ...additions] : existing;
}

export default function TreatmentPlanBuilder({
  patientId,
  patientName,
  patientPhone,
  clinicName,
  doctorName,
  incomingItems,
  onConsumeIncoming,
}: {
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  clinicName?: string;
  doctorName?: string;
  incomingItems?: PlanItem[];
  onConsumeIncoming?: () => void;
}) {
  const { lang } = useLang();
  const L = clinicalI18n[lang];

  const [plan, setPlan] = useState<TreatmentPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<TreatmentPlan[]>([]);
  const [category, setCategory] = useState<"all" | ProcedureCategory>("all");
  const [query, setQuery] = useState("");
  const [procedureId, setProcedureId] = useState("");
  const [tooth, setTooth] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("1");
  const [phone, setPhone] = useState(patientPhone || "");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [imported, setImported] = useState(0);

  useEffect(() => {
    if (!patientId) {
      setPlan(null);
      setSavedPlans([]);
      return;
    }
    setPlan(emptyPlan(patientId));
    setPhone(patientPhone || "");
    setMsg("");
    setImported(0);
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/treatment-plans?patient_id=${encodeURIComponent(patientId)}`);
        if (!res.ok) throw new Error("failed");
        const rows = (await res.json()) as TreatmentPlan[];
        if (cancelled) return;
        setSavedPlans(rows);
        setOffline(false);
      } catch {
        if (cancelled) return;
        setSavedPlans(loadLocal<TreatmentPlan[]>(plansKey(patientId), []));
        setOffline(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId, patientPhone]);

  useEffect(() => {
    if (!incomingItems?.length || !plan) return;
    setPlan((prev) => (prev ? { ...prev, items: mergeItems(prev.items, incomingItems) } : prev));
    setImported((n) => n + incomingItems.length);
    onConsumeIncoming?.();
  }, [incomingItems, plan, onConsumeIncoming]);

  const totals = useMemo(() => (plan ? computeTotals(plan) : null), [plan]);
  const schedule = useMemo(
    () => (plan && totals ? buildSchedule(totals.total, totals.downPayment, plan.installments, plan.start_date, lang) : []),
    [plan, totals, lang]
  );

  const filteredProcedures = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROCEDURES.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return p.ar.toLowerCase().includes(q) || p.en.toLowerCase().includes(q);
    });
  }, [category, query]);

  const selectedProcedure = procedureId ? PROCEDURE_BY_ID[procedureId] : undefined;
  const activeItems = plan?.items.filter((i) => i.status !== "cancelled") || [];

  function patchPlan(patch: Partial<TreatmentPlan>) {
    setPlan((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function addStep() {
    if (!plan || !selectedProcedure) return;
    const item = newPlanItem(selectedProcedure, tooth);
    if (price) item.price = Number(price) || selectedProcedure.price;
    item.qty = Math.max(1, Number(qty) || 1);
    setPlan((prev) => (prev ? { ...prev, items: [...prev.items, item] } : prev));
    setProcedureId("");
    setPrice("");
    setQty("1");
    setTooth("");
    setQuery("");
  }

  function patchItem(id: string, patch: Partial<PlanItem>) {
    setPlan((prev) => (prev ? { ...prev, items: prev.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) } : prev));
  }

  function bumpSessions(item: PlanItem, delta: number) {
    const done = Math.min(Math.max(item.done_sessions + delta, 0), item.sessions);
    const status: PlanItemStatus = done >= item.sessions ? "done" : done > 0 ? "in-progress" : "planned";
    patchItem(item.id, { done_sessions: done, status: item.status === "cancelled" ? "cancelled" : status });
  }

  function removeItem(id: string) {
    setPlan((prev) => (prev ? { ...prev, items: prev.items.filter((i) => i.id !== id) } : prev));
  }

  async function savePlan() {
    if (!plan || !patientId) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/treatment-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      if (!res.ok) throw new Error("failed");
      const row = (await res.json()) as TreatmentPlan;
      const next = { ...plan, id: row?.id || plan.id };
      setPlan(next);
      setSavedPlans((prev) => [next, ...prev.filter((p) => p.id !== next.id)]);
      setOffline(false);
      setMsg(L.plan.saved);
    } catch {
      const local = loadLocal<TreatmentPlan[]>(plansKey(patientId), []);
      saveLocal(plansKey(patientId), [plan, ...local.filter((p) => p.id !== plan.id)]);
      setSavedPlans((prev) => [plan, ...prev.filter((p) => p.id !== plan.id)]);
      setOffline(true);
      setMsg(L.plan.savedLocal);
    } finally {
      setBusy(false);
    }
  }

  async function deletePlan(id: string) {
    if (!patientId) return;
    try {
      await fetch(`/api/admin/treatment-plans?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch {
      setOffline(true);
    }
    const local = loadLocal<TreatmentPlan[]>(plansKey(patientId), []);
    saveLocal(plansKey(patientId), local.filter((p) => p.id !== id));
    setSavedPlans((prev) => prev.filter((p) => p.id !== id));
    if (plan?.id === id) setPlan(emptyPlan(patientId));
    setMsg(L.plan.deleted);
  }

  const summaryText = plan
    ? formatPlanText(plan, {
        patientName: patientName || (lang === "ar" ? "مريض" : "Patient"),
        clinicName: clinicName || (lang === "ar" ? "عيادتي" : "Clinic"),
        doctorName,
        lang,
      })
    : "";

  async function copySummary() {
    const ok = await copyText(summaryText);
    setCopied(ok);
    if (ok) {
      setMsg(L.plan.copied);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!patientId) return <div className="card text-center text-sm text-c-muted">{L.tools.noPatient}</div>;
  if (!plan || !totals) return <div className="card text-center text-sm text-c-muted">{L.common.loading}</div>;

  return (
    <div className="space-y-5">
      {msg && <div className="border border-c-accent/30 bg-c-accent/10 px-4 py-2 text-xs text-c-accent">{msg}</div>}
      {offline && <div className="border border-c-gold/30 bg-c-gold/10 px-4 py-2 text-xs text-c-gold">{L.tools.offline}</div>}
      {imported > 0 && (
        <div className="border border-c-border bg-c-surface px-4 py-2 text-xs text-c-light">
          {L.plan.incoming}: {imported}
        </div>
      )}

      {/* plan meta */}
      <div className="card grid gap-3 md:grid-cols-4">
        <label className="text-[11px] text-c-muted md:col-span-2">
          <span className="mb-1 block uppercase tracking-wider">{L.plan.planName}</span>
          <input className="form-input" placeholder={L.plan.planNamePlaceholder} value={plan.title} onChange={(e) => patchPlan({ title: e.target.value })} />
        </label>
        <label className="text-[11px] text-c-muted">
          <span className="mb-1 block uppercase tracking-wider">{L.plan.startDate}</span>
          <input type="date" className="form-input" value={plan.start_date} onChange={(e) => patchPlan({ start_date: e.target.value })} />
        </label>
        <label className="text-[11px] text-c-muted">
          <span className="mb-1 block uppercase tracking-wider">{L.plan.planStatus}</span>
          <select className="form-input" value={plan.status} onChange={(e) => patchPlan({ status: e.target.value as TreatmentPlan["status"] })}>
            {PLAN_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s[lang]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-2 md:col-span-4">
          <button type="button" onClick={savePlan} disabled={busy} className="btn-primary !px-4 !py-2 !text-xs">
            {busy ? L.common.loading : L.plan.save}
          </button>
          <button type="button" onClick={() => setPlan(emptyPlan(patientId))} className="btn-secondary !px-4 !py-2 !text-xs">
            {L.plan.newPlan}
          </button>
          <button type="button" onClick={copySummary} className="btn-secondary !px-4 !py-2 !text-xs">
            {copied ? L.plan.copied : L.plan.copy}
          </button>
          <button type="button" onClick={() => printText(plan.title || L.plan.title, summaryText)} className="btn-secondary !px-4 !py-2 !text-xs">
            {L.common.print}
          </button>
          <input className="form-input !w-auto max-w-[190px] !py-2 text-xs" dir="ltr" placeholder="9665XXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <WhatsAppButton phone={phone} message={summaryText} label={L.plan.sendWhatsApp} className="btn-secondary !px-4 !py-2 !text-xs" disabled={!activeItems.length} />
        </div>
      </div>

      {/* add step */}
      <div className="card">
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-c-accent">{L.plan.addStep}</div>
        <div className="grid gap-3 md:grid-cols-6">
          <select className="form-input md:col-span-1" value={category} onChange={(e) => setCategory(e.target.value as "all" | ProcedureCategory)}>
            <option value="all">{L.plan.allCategories}</option>
            {PROCEDURE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c[lang]}
              </option>
            ))}
          </select>
          <input className="form-input md:col-span-1 text-sm" placeholder={L.plan.searchProcedure} value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="form-input md:col-span-2 text-sm" value={procedureId} onChange={(e) => setProcedureId(e.target.value)}>
            <option value="">{L.plan.procedure}</option>
            {filteredProcedures.map((p) => (
              <option key={p.id} value={p.id}>
                {p[lang]} — {p.price} SAR
              </option>
            ))}
          </select>
          <select className="form-input md:col-span-1 text-sm" value={tooth} onChange={(e) => setTooth(e.target.value)}>
            <option value="">{L.plan.toothOptional}</option>
            {TEETH.map((t) => (
              <option key={t.fdi} value={t.fdi}>
                {t.fdi} — {t.name[lang]}
              </option>
            ))}
          </select>
          <div className="flex gap-2 md:col-span-1">
            <input className="form-input text-sm" type="number" min={0} placeholder={L.plan.price} value={price} onChange={(e) => setPrice(e.target.value)} />
            <input className="form-input !w-16 text-sm" type="number" min={1} placeholder={L.plan.qty} value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
        </div>
        {selectedProcedure && (
          <p className="mt-2 text-[11px] text-c-muted">
            {categoryLabel(selectedProcedure.category, lang)} · {selectedProcedure.sessions} {L.plan.sessions} · {formatMoney(selectedProcedure.price, lang)}
            {selectedProcedure.note ? ` · ${selectedProcedure.note[lang]}` : ""}
          </p>
        )}
        <button type="button" onClick={addStep} disabled={!selectedProcedure} className="btn-primary mt-3 !px-4 !py-2 !text-xs disabled:opacity-40">
          + {L.plan.add}
        </button>
      </div>

      {/* steps */}
      <div className="card !p-0">
        <div className="border-b border-c-border px-5 py-3 text-xs font-bold uppercase tracking-wider text-c-accent">
          {L.plan.steps} ({activeItems.length})
        </div>
        {activeItems.length === 0 ? (
          <p className="px-5 py-6 text-center text-xs text-c-muted">{L.plan.noSteps}</p>
        ) : (
          <div className="divide-y divide-c-border">
            {activeItems.map((item, index) => (
              <div key={item.id} className="grid gap-3 px-5 py-3 md:grid-cols-12 md:items-center">
                <div className="md:col-span-4">
                  <div className="text-[10px] uppercase tracking-wider text-c-muted">
                    {L.plan.step} {index + 1} · {categoryLabel(item.category, lang)}
                  </div>
                  <div className="text-sm font-bold text-c-white">{item[lang]}</div>
                  {item.tooth && (
                    <div className="text-[11px] text-c-muted">
                      {lang === "ar" ? "سن" : "Tooth"} {item.tooth}
                    </div>
                  )}
                </div>
                <label className="text-[10px] uppercase tracking-wider text-c-muted md:col-span-2">
                  <span className="mb-1 block">{L.plan.price}</span>
                  <input
                    type="number"
                    min={0}
                    className="form-input !py-1.5 text-sm"
                    value={item.price}
                    onChange={(e) => patchItem(item.id, { price: Number(e.target.value) || 0 })}
                  />
                </label>
                <label className="text-[10px] uppercase tracking-wider text-c-muted md:col-span-1">
                  <span className="mb-1 block">{L.plan.qty}</span>
                  <input
                    type="number"
                    min={1}
                    className="form-input !py-1.5 text-sm"
                    value={item.qty}
                    onChange={(e) => patchItem(item.id, { qty: Math.max(1, Number(e.target.value) || 1) })}
                  />
                </label>
                <div className="md:col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-c-muted">
                    {L.plan.sessions} {item.done_sessions}/{item.sessions}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <button type="button" onClick={() => bumpSessions(item, -1)} className="border border-c-border px-2 text-c-muted hover:border-c-accent hover:text-c-accent">
                      −
                    </button>
                    <div className="h-1.5 flex-1 bg-c-surface">
                      <div
                        className="h-full bg-c-accent transition-all"
                        style={{ width: `${item.sessions ? (item.done_sessions / item.sessions) * 100 : 0}%` }}
                      />
                    </div>
                    <button type="button" onClick={() => bumpSessions(item, 1)} className="border border-c-border px-2 text-c-muted hover:border-c-accent hover:text-c-accent">
                      +
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <select
                    className="form-input !py-1.5 text-xs"
                    value={item.status}
                    onChange={(e) => patchItem(item.id, { status: e.target.value as PlanItemStatus })}
                  >
                    {PLAN_ITEM_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s[lang]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-end md:col-span-1">
                  <button type="button" onClick={() => removeItem(item.id)} className="text-xs text-c-danger hover:text-c-danger/70">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* totals */}
        <div className="card space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-c-accent">{L.plan.totals}</div>
          <div className="grid grid-cols-2 gap-px bg-c-border">
            <div className="bg-c-surface px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-c-muted">{L.plan.subtotal}</div>
              <div className="text-sm font-bold text-c-white">{formatMoney(totals.subtotal, lang)}</div>
            </div>
            <div className="bg-c-surface px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-c-muted">{L.plan.total}</div>
              <div className="text-sm font-bold text-c-accent">{formatMoney(totals.total, lang)}</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-[11px] text-c-muted">
              <span className="mb-1 block uppercase tracking-wider">{L.plan.discount}</span>
              <input type="number" min={0} className="form-input !py-2 text-sm" value={plan.discount} onChange={(e) => patchPlan({ discount: Number(e.target.value) || 0 })} />
            </label>
            <label className="text-[11px] text-c-muted">
              <span className="mb-1 block uppercase tracking-wider">{L.plan.downPayment}</span>
              <input type="number" min={0} className="form-input !py-2 text-sm" value={plan.down_payment} onChange={(e) => patchPlan({ down_payment: Number(e.target.value) || 0 })} />
            </label>
            <label className="text-[11px] text-c-muted">
              <span className="mb-1 block uppercase tracking-wider">{L.plan.installments}</span>
              <input
                type="number"
                min={1}
                className="form-input !py-2 text-sm"
                value={plan.installments}
                onChange={(e) => patchPlan({ installments: Math.max(1, Number(e.target.value) || 1), paid_installments: [] })}
              />
            </label>
          </div>

          <div className="space-y-1 border-t border-c-border pt-3 text-xs">
            <div className="flex justify-between text-c-muted">
              <span>{L.plan.perInstallment}</span>
              <span className="font-bold text-c-light">{formatMoney(totals.installmentAmount, lang)}</span>
            </div>
            <div className="flex justify-between text-c-muted">
              <span>{L.plan.remaining}</span>
              <span className="font-bold text-c-gold">{formatMoney(totals.remaining, lang)}</span>
            </div>
            <div className="flex justify-between text-c-muted">
              <span>{L.plan.collected}</span>
              <span className="font-bold text-c-success">{formatMoney(totals.collected, lang)}</span>
            </div>
          </div>
        </div>

        {/* schedule + milestones */}
        <div className="space-y-5">
          <div className="card">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-c-accent">{L.plan.schedule}</div>
            {schedule.length === 0 ? (
              <p className="text-xs text-c-muted">{L.plan.remaining}: {formatMoney(0, lang)}</p>
            ) : (
              <div className="space-y-1.5">
                {schedule.map((entry, index) => {
                  const isPaid = plan.paid_installments.includes(index);
                  return (
                    <button
                      key={entry.index}
                      type="button"
                      onClick={() =>
                        patchPlan({
                          paid_installments: isPaid ? plan.paid_installments.filter((i) => i !== index) : [...plan.paid_installments, index],
                        })
                      }
                      className={`flex w-full items-center justify-between border px-3 py-2 text-xs transition-colors ${
                        isPaid ? "border-c-success/40 bg-c-success/10 text-c-success" : "border-c-border text-c-muted hover:border-c-accent/40"
                      }`}
                    >
                      <span>{L.plan.dueDate}: {entry.dueDate}</span>
                      <span className="font-bold">
                        {formatMoney(entry.amount, lang)} {isPaid ? `✓ ${L.plan.paid}` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-c-accent">{L.plan.milestones}</span>
              <span className="text-[11px] text-c-muted">{totals.doneSessions}/{totals.totalSessions} · {totals.progress}%</span>
            </div>
            <div className="h-2 w-full bg-c-surface">
              <div className="h-full bg-c-accent transition-all" style={{ width: `${totals.progress}%` }} />
            </div>
            <div className="mt-3 space-y-2">
              {activeItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-[11px] text-c-muted">
                  <span className="truncate">{item[lang]}{item.tooth ? ` · ${item.tooth}` : ""}</span>
                  <span className="shrink-0 text-c-light">
                    {item.done_sessions}/{item.sessions} {PLAN_ITEM_STATUSES.find((s) => s.id === item.status)?.[lang]}
                  </span>
                </div>
              ))}
              {!activeItems.length && <p className="text-[11px] text-c-muted">{L.plan.noSteps}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* saved plans */}
      <div className="card">
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-c-accent">{L.plan.savedPlans}</div>
        {savedPlans.length === 0 ? (
          <p className="text-xs text-c-muted">{L.plan.noSavedPlans}</p>
        ) : (
          <div className="space-y-2">
            {savedPlans.map((p) => {
              const t = computeTotals(p);
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border border-c-border px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-c-white">{p.title || L.plan.title}</div>
                    <div className="text-[10px] text-c-muted">
                      {p.start_date} · {p.items.length} {L.plan.steps} · {formatMoney(t.total, lang)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setPlan(p)} className="btn-secondary !px-3 !py-1 !text-[10px]">
                      {L.plan.load}
                    </button>
                    <button type="button" onClick={() => deletePlan(p.id)} className="text-[10px] uppercase text-c-danger hover:text-c-danger/70">
                      {L.plan.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
