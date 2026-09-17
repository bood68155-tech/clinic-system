"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/lib/translations/context";
import { clinicalI18n } from "@/lib/clinical-i18n";
import {
  MED_CATEGORIES,
  MED_TEMPLATES,
  RX_KITS,
  formatRxText,
  lineFromTemplate,
  rxWarnings,
  type MedCategory,
  type RxLine,
} from "@/lib/prescriptions";
import { POSTOP_TEMPLATES, POSTOP_BY_ID, buildPostOpMessage } from "@/lib/postop";
import { copyText } from "@/lib/whatsapp-client";
import { loadLocal, saveLocal } from "@/lib/local-store";
import { printText } from "@/lib/print";
import WhatsAppButton from "@/components/WhatsAppButton";

const rxKey = (patientId: string) => `rx:${patientId}`;

export default function PrescriptionStudio({
  patientId,
  patientName,
  patientPhone,
  clinicName,
  clinicPhone,
  doctorName,
}: {
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  clinicName?: string;
  clinicPhone?: string;
  doctorName?: string;
}) {
  const { lang } = useLang();
  const L = clinicalI18n[lang];
  const isAr = lang === "ar";

  const [lines, setLines] = useState<RxLine[]>([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [medQuery, setMedQuery] = useState("");
  const [medCategory, setMedCategory] = useState<"all" | MedCategory>("all");
  const [customName, setCustomName] = useState("");
  const [phone, setPhone] = useState(patientPhone || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [offline, setOffline] = useState(false);
  const [copied, setCopied] = useState(false);

  const [templateId, setTemplateId] = useState("extraction");
  const [postopOverride, setPostopOverride] = useState<string | null>(null);
  const [postopPhone, setPostopPhone] = useState(patientPhone || "");
  const [postopCopied, setPostopCopied] = useState(false);

  const template = POSTOP_BY_ID[templateId] || POSTOP_TEMPLATES[0];

  const postopMessage = useMemo(() => {
    if (postopOverride !== null) return postopOverride;
    return buildPostOpMessage(
      template,
      {
        clinicName: clinicName || (isAr ? "عيادتي" : "Clinic"),
        clinicPhone,
        patientName,
        doctorName,
        nextVisit: followUp || undefined,
      },
      lang
    );
  }, [postopOverride, template, clinicName, clinicPhone, patientName, doctorName, followUp, lang, isAr]);

  const warnings = useMemo(() => rxWarnings(lines, lang), [lines, lang]);

  const rxText = useMemo(
    () =>
      formatRxText(
        {
          clinicName: clinicName || (isAr ? "عيادتي" : "Clinic"),
          doctorName,
          patientName: patientName || (isAr ? "مريض" : "Patient"),
          diagnosis,
          followUp,
        },
        lines,
        lang
      ),
    [clinicName, doctorName, patientName, diagnosis, followUp, lines, lang, isAr]
  );

  const filteredMeds = useMemo(() => {
    const q = medQuery.trim().toLowerCase();
    return MED_TEMPLATES.filter((m) => {
      if (medCategory !== "all" && m.category !== medCategory) return false;
      if (!q) return true;
      return m.ar.toLowerCase().includes(q) || m.en.toLowerCase().includes(q);
    });
  }, [medQuery, medCategory]);

  const selectedIds = new Set(lines.map((l) => l.med_id));

  function toggleMed(medId: string) {
    setMsg("");
    const med = MED_TEMPLATES.find((m) => m.id === medId);
    if (!med) return;
    setLines((prev) => {
      if (prev.some((l) => l.med_id === medId)) return prev.filter((l) => l.med_id !== medId);
      return [...prev, lineFromTemplate(med, lang)];
    });
  }

  function applyKit(meds: string[]) {
    setMsg("");
    setLines((prev) => {
      const names = new Set(prev.map((l) => l.med_id));
      const additions = meds
        .filter((id) => !names.has(id))
        .map((id) => MED_TEMPLATES.find((m) => m.id === id))
        .filter((m): m is (typeof MED_TEMPLATES)[number] => Boolean(m))
        .map((m) => lineFromTemplate(m, lang));
      return [...prev, ...additions];
    });
  }

  function patchLine(id: string, patch: Partial<RxLine>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addCustom() {
    const name = customName.trim();
    if (!name) return;
    setLines((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, med_id: "custom", medication: name, dosage: "", frequency: "", duration: "", instructions: "", category: "other" },
    ]);
    setCustomName("");
  }

  async function save() {
    if (!patientId || lines.length === 0) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, lines }),
      });
      if (!res.ok) throw new Error("failed");
      setOffline(false);
      setMsg(L.rx.saved);
    } catch {
      const local = loadLocal<RxLine[]>(rxKey(patientId), []);
      saveLocal(rxKey(patientId), [...lines, ...local].slice(0, 60));
      setOffline(true);
      setMsg(L.rx.savedLocal);
    } finally {
      setBusy(false);
    }
  }

  async function copyRx() {
    const ok = await copyText(rxText);
    setCopied(ok);
    if (ok) {
      setMsg(L.rx.copied);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function copyPostop() {
    const ok = await copyText(postopMessage);
    setPostopCopied(ok);
    if (ok) setTimeout(() => setPostopCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      {msg && <div className="border border-c-accent/30 bg-c-accent/10 px-4 py-2 text-xs text-c-accent">{msg}</div>}
      {offline && <div className="border border-c-gold/30 bg-c-gold/10 px-4 py-2 text-xs text-c-gold">{L.tools.offline}</div>}

      {/* ---------------- prescription ---------------- */}
      <section>
        <div className="mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-c-white">{L.rx.title}</h3>
          <p className="mt-1 text-xs text-c-muted">{L.rx.subtitle}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-[11px] text-c-muted">
                <span className="mb-1 block uppercase tracking-wider">{L.rx.diagnosis}</span>
                <input className="form-input" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
              </label>
              <label className="text-[11px] text-c-muted">
                <span className="mb-1 block uppercase tracking-wider">{L.rx.followUp}</span>
                <input type="date" className="form-input" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
              </label>
            </div>

            {/* quick kits */}
            <div className="card !p-4">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-c-muted">{L.rx.kits}</div>
              <div className="flex flex-wrap gap-2">
                {RX_KITS.map((kit) => (
                  <button key={kit.id} type="button" onClick={() => applyKit(kit.meds)} className="btn-secondary !px-3 !py-1.5 !text-[11px]" title={kit.description[lang]}>
                    + {kit[lang]}
                  </button>
                ))}
              </div>
            </div>

            {/* medication picker */}
            <div className="card !p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <input className="form-input !w-auto flex-1 !py-2 text-sm" placeholder={L.rx.search} value={medQuery} onChange={(e) => setMedQuery(e.target.value)} />
                <select className="form-input !w-auto !py-2 text-sm" value={medCategory} onChange={(e) => setMedCategory(e.target.value as "all" | MedCategory)}>
                  <option value="all">{L.plan.allCategories}</option>
                  {MED_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c[lang]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid max-h-[280px] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredMeds.map((med) => {
                  const isOn = selectedIds.has(med.id);
                  return (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => toggleMed(med.id)}
                      className={`border px-3 py-2 text-start text-[11px] transition-colors ${
                        isOn ? "border-c-accent bg-white/5 text-c-white" : "border-c-border text-c-muted hover:border-c-accent/40 hover:text-c-light"
                      }`}
                    >
                      <span className="block font-bold">
                        {isOn ? "✓ " : ""}
                        {med[lang]}
                      </span>
                      <span className="block text-[10px] text-c-muted">
                        {med.dosage} · {med.frequency[lang]} · {med.duration[lang]}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-c-border pt-3">
                <input
                  className="form-input !w-auto flex-1 !py-2 text-sm"
                  placeholder={L.rx.customName}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustom();
                    }
                  }}
                />
                <button type="button" onClick={addCustom} disabled={!customName.trim()} className="btn-secondary !px-3 !py-2 !text-[11px] disabled:opacity-40">
                  + {L.rx.addCustom}
                </button>
              </div>
            </div>

            {/* selected lines */}
            <div className="card !p-4">
              <div className="mb-3 text-[10px] uppercase tracking-wider text-c-muted">
                {L.rx.selected} ({lines.length})
              </div>
              {lines.length === 0 ? (
                <p className="text-xs text-c-muted">{L.rx.noSelected}</p>
              ) : (
                <div className="space-y-2">
                  {lines.map((line) => (
                    <div key={line.id} className="grid gap-2 border border-c-border bg-c-surface p-3 md:grid-cols-5">
                      <input className="form-input text-sm" value={line.medication} onChange={(e) => patchLine(line.id, { medication: e.target.value })} />
                      <input className="form-input text-sm" placeholder={isAr ? "الجرعة" : "Dose"} value={line.dosage} onChange={(e) => patchLine(line.id, { dosage: e.target.value })} />
                      <input className="form-input text-sm" placeholder={isAr ? "التكرار" : "Frequency"} value={line.frequency} onChange={(e) => patchLine(line.id, { frequency: e.target.value })} />
                      <input className="form-input text-sm" placeholder={isAr ? "المدة" : "Duration"} value={line.duration} onChange={(e) => patchLine(line.id, { duration: e.target.value })} />
                      <div className="flex gap-1">
                        <input className="form-input flex-1 text-sm" placeholder={isAr ? "ملاحظات" : "Notes"} value={line.instructions} onChange={(e) => patchLine(line.id, { instructions: e.target.value })} />
                        <button type="button" onClick={() => setLines((prev) => prev.filter((l) => l.id !== line.id))} className="px-2 text-c-danger">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {warnings.length > 0 && (
              <div className="card !p-4">
                <div className="mb-2 text-[10px] uppercase tracking-wider text-c-gold">⚠ {L.rx.warnings}</div>
                <ul className="space-y-1">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-[11px] leading-relaxed text-c-light">
                      • {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* preview */}
          <div className="space-y-3">
            <div className="card !p-4">
              <div className="mb-3 text-[10px] uppercase tracking-wider text-c-muted">{L.rx.preview}</div>
              <pre className="max-h-[440px] overflow-auto whitespace-pre-wrap break-words font-sans text-[11px] leading-relaxed text-c-light">{rxText}</pre>
            </div>
            <div className="card !p-4">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={copyRx} disabled={!lines.length} className="btn-secondary !px-3 !py-2 !text-[11px] disabled:opacity-40">
                  {copied ? L.rx.copied : L.rx.copy}
                </button>
                <button type="button" onClick={() => printText(L.rx.preview, rxText)} disabled={!lines.length} className="btn-secondary !px-3 !py-2 !text-[11px] disabled:opacity-40">
                  {L.rx.print}
                </button>
                <button type="button" onClick={() => setLines([])} disabled={!lines.length} className="btn-secondary !px-3 !py-2 !text-[11px] disabled:opacity-40">
                  {L.rx.clear}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-c-border pt-3">
                <input className="form-input !w-auto max-w-[180px] !py-2 text-xs" dir="ltr" placeholder="9665XXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <WhatsAppButton phone={phone} message={rxText} className="btn-secondary !px-3 !py-2 !text-[11px]" disabled={!lines.length} />
              </div>
              {patientId && (
                <button type="button" onClick={save} disabled={busy || !lines.length} className="btn-primary mt-3 w-full !py-2 !text-xs disabled:opacity-40">
                  {busy ? L.common.loading : L.rx.save}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- post-op whatsapp ---------------- */}
      <section>
        <div className="mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-c-white">{L.rx.postopTitle}</h3>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="card !p-4">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-c-muted">{L.rx.template}</div>
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {POSTOP_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTemplateId(t.id);
                      setPostopOverride(null);
                    }}
                    className={`border px-3 py-2 text-start text-[11px] transition-colors ${
                      templateId === t.id ? "border-c-accent bg-white/5 text-c-white" : "border-c-border text-c-muted hover:border-c-accent/40 hover:text-c-light"
                    }`}
                  >
                    <span className="mr-1">{t.icon}</span>
                    {t[lang]}
                  </button>
                ))}
              </div>
              {template.meds && (
                <p className="mt-3 border-t border-c-border pt-3 text-[11px] text-c-muted">
                  💊 {isAr ? "الوصفة المقترحة: " : "Suggested medication: "}
                  {template.meds.map((m) => MED_TEMPLATES.find((x) => x.id === m)?.[lang]).filter(Boolean).join(" · ")}
                </p>
              )}
            </div>

            <div className="card !p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-c-muted">{L.rx.message}</span>
                <button type="button" onClick={() => setPostopOverride(null)} className="text-[10px] uppercase tracking-wider text-c-accent hover:text-c-accentLight">
                  ↻ {L.rx.regenerate}
                </button>
              </div>
              <textarea
                className="form-input h-64 !text-[11px] leading-relaxed"
                dir="rtl"
                value={postopMessage}
                onChange={(e) => setPostopOverride(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="card !p-4">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-c-muted">{L.rx.phone}</div>
              <input className="form-input text-sm" dir="ltr" placeholder="9665XXXXXXX" value={postopPhone} onChange={(e) => setPostopPhone(e.target.value)} />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <WhatsAppButton phone={postopPhone} message={postopMessage} className="btn-primary !px-4 !py-2 !text-xs" />
                <button type="button" onClick={copyPostop} className="btn-secondary !px-3 !py-2 !text-[11px]">
                  {postopCopied ? L.common.copied : L.common.copy}
                </button>
                <button type="button" onClick={() => printText(template[lang], postopMessage)} className="btn-secondary !px-3 !py-2 !text-[11px]">
                  {L.common.print}
                </button>
              </div>
            </div>

            <div className="card !p-4">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-c-muted">
                {isAr ? "التوصيات المختصرة" : "Quick instructions"}
              </div>
              <ul className="space-y-1.5">
                {template.dos.slice(0, 3).map((d, i) => (
                  <li key={i} className="text-[11px] leading-relaxed text-c-light">
                    ✅ {d[lang]}
                  </li>
                ))}
                {template.donts.slice(0, 2).map((d, i) => (
                  <li key={`d${i}`} className="text-[11px] leading-relaxed text-c-muted">
                    ❌ {d[lang]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
