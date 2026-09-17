"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/translations/context";
import { clinicalI18n } from "@/lib/clinical-i18n";
import {
  LOWER_ROW,
  STATUS_MAP,
  TOOTH_BY_FDI,
  TOOTH_STATUSES,
  UPPER_ROW,
  formatChartText,
  isProblemStatus,
  type ToothRecord,
  type ToothStatus,
  type ToothType,
} from "@/lib/dental";
import { copyText } from "@/lib/whatsapp-client";
import { loadLocal, saveLocal } from "@/lib/local-store";

// ---- chart geometry (px inside the SVG viewBox) ----
const CELL = 46;
const PAD_X = 20;
const TOOTH_W = 30;
const ARCH_TOP = 22;
const ROOT_H = 54;
const CROWN_H = 74;
const UPPER_CROWN_TOP = ARCH_TOP + ROOT_H;
const LOWER_CROWN_TOP = UPPER_CROWN_TOP + CROWN_H + 46;
const LOWER_CROWN_BOTTOM = LOWER_CROWN_TOP + CROWN_H;
const LOWER_ROOT_TIP = LOWER_CROWN_BOTTOM + ROOT_H;
const SVG_W = PAD_X * 2 + CELL * 16;
const SVG_H = LOWER_ROOT_TIP + 32;

const localKey = (patientId: string) => `chart:${patientId}`;

function crownWidth(type: ToothType): number {
  if (type === "molar") return TOOTH_W;
  if (type === "premolar") return TOOTH_W - 3;
  if (type === "canine") return TOOTH_W - 6;
  return TOOTH_W - 7;
}

function rootCount(type: ToothType, arch: "upper" | "lower"): number {
  if (type === "molar") return arch === "upper" ? 3 : 2;
  if (type === "premolar") return arch === "upper" ? 2 : 1;
  return 1;
}

function rootsPath(cx: number, baseY: number, tipY: number, count: number, width: number, type: ToothType): string {
  const spread = count > 1 ? width * 0.42 : 0;
  const rootW = type === "molar" ? width * 0.26 : width * 0.42;
  const paths: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const offset = (i - (count - 1) / 2) * spread;
    const baseX = cx + offset;
    const tipX = cx + offset * 1.35;
    paths.push(
      `M ${baseX - rootW / 2} ${baseY} L ${baseX + rootW / 2} ${baseY} L ${tipX} ${tipY} Z`
    );
  }
  return paths.join(" ");
}

function crownPath(cx: number, width: number, arch: "upper" | "lower"): string {
  const left = cx - width / 2;
  const right = cx + width / 2;
  if (arch === "upper") {
    const top = UPPER_CROWN_TOP;
    const bottom = UPPER_CROWN_TOP + CROWN_H;
    return `M ${left} ${top} L ${right} ${top} L ${right - 2} ${bottom - 10} Q ${cx} ${bottom} ${left + 2} ${bottom - 10} Z`;
  }
  const top = LOWER_CROWN_TOP;
  const bottom = LOWER_CROWN_BOTTOM;
  return `M ${left + 2} ${top + 10} Q ${cx} ${top} ${right - 2} ${top + 10} L ${right} ${bottom} L ${left} ${bottom} Z`;
}

/** Small cusp grooves so molars and premolars stay recognisable at a glance. */
function cuspLines(cx: number, width: number, arch: "upper" | "lower", type: ToothType): string[] {
  if (type === "incisor" || type === "canine") return [];
  const edge = arch === "upper" ? UPPER_CROWN_TOP + CROWN_H - 12 : LOWER_CROWN_TOP + 12;
  const dir = arch === "upper" ? -1 : 1;
  const offsets = type === "molar" ? [-width * 0.2, width * 0.2] : [0];
  return offsets.map((o) => `M ${cx + o} ${edge} L ${cx + o} ${edge + dir * 12}`);
}

export default function DentalChart({
  patientId,
  patientName,
  onAddToPlan,
}: {
  patientId?: string;
  patientName?: string;
  onAddToPlan?: (procedureId: string, tooth: string, label: { ar: string; en: string }) => void;
}) {
  const { lang } = useLang();
  const L = clinicalI18n[lang];
  const isAr = lang === "ar";

  const [records, setRecords] = useState<Record<string, ToothRecord>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<ToothStatus>("healthy");
  const [note, setNote] = useState("");
  const [numbering, setNumbering] = useState<"fdi" | "universal">("fdi");
  const [problemsOnly, setProblemsOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [offline, setOffline] = useState(false);
  const [flash, setFlash] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!patientId) {
      setRecords({});
      setSelected(null);
      return;
    }
    setLoading(true);
    setOffline(false);
    (async () => {
      try {
        const res = await fetch(`/api/admin/teeth?patient_id=${encodeURIComponent(patientId)}`);
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as ToothRecord[];
        if (cancelled) return;
        const map: Record<string, ToothRecord> = {};
        data.forEach((r) => {
          map[r.tooth_code] = r;
        });
        setRecords(map);
        saveLocal(localKey(patientId), data);
      } catch {
        if (cancelled) return;
        const local = loadLocal<ToothRecord[]>(localKey(patientId), []);
        const map: Record<string, ToothRecord> = {};
        local.forEach((r) => {
          map[r.tooth_code] = r;
        });
        setRecords(map);
        setOffline(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const recordList = useMemo(
    () => Object.values(records).filter((r) => r.status !== "healthy" || r.note),
    [records]
  );

  const summary = useMemo(() => {
    const counts = new Map<ToothStatus, number>();
    recordList.forEach((r) => counts.set(r.status, (counts.get(r.status) || 0) + 1));
    return {
      recorded: recordList.length,
      problems: recordList.filter((r) => isProblemStatus(r.status)).length,
      treated: recordList.filter((r) => r.status === "filling" || r.status === "crown" || r.status === "root-canal" || r.status === "implant").length,
      byStatus: TOOTH_STATUSES.map((s) => ({ status: s, count: counts.get(s.id) || 0 })).filter((s) => s.count > 0),
    };
  }, [recordList]);

  const recentLog = useMemo(() => {
    const entries: { tooth: string; status: ToothStatus; note: string; at: string }[] = [];
    Object.values(records).forEach((r) => {
      (r.history || []).forEach((h) => entries.push({ tooth: r.tooth_code, status: h.status, note: h.note, at: h.at }));
    });
    return entries.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 8);
  }, [records]);

  const selectedTooth = selected ? TOOTH_BY_FDI[selected] : undefined;
  const selectedMeta = STATUS_MAP[status];

  const applyRecord = useCallback((record: ToothRecord) => {
    setRecords((prev) => ({ ...prev, [record.tooth_code]: record }));
  }, []);

  function pick(fdi: string) {
    setSelected(fdi);
    const existing = records[fdi];
    setStatus(existing?.status || "healthy");
    setNote(existing?.note || "");
    setFlash("");
  }

  async function save() {
    if (!selected || !patientId) return;
    setSaving(true);
    setFlash("");
    const at = new Date().toISOString();
    const previous = records[selected]?.history || [];
    const optimistic: ToothRecord = {
      tooth_code: selected,
      status,
      note,
      updated_at: at,
      history: [{ status, note, at }, ...previous].slice(0, 20),
    };
    try {
      const res = await fetch("/api/admin/teeth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, tooth_code: selected, status, note }),
      });
      if (!res.ok) throw new Error("failed");
      const saved = (await res.json()) as ToothRecord;
      applyRecord({ ...optimistic, ...saved });
      setFlash(L.chart.saved);
    } catch {
      applyRecord(optimistic);
      setOffline(true);
      setFlash(L.chart.savedLocal);
    } finally {
      setSaving(false);
      persistLocal(optimistic);
    }
  }

  function persistLocal(record: ToothRecord) {
    if (!patientId) return;
    const next = { ...records, [record.tooth_code]: record };
    saveLocal(localKey(patientId), Object.values(next));
  }

  async function clearTooth() {
    if (!selected || !patientId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/teeth?patient_id=${encodeURIComponent(patientId)}&tooth_code=${encodeURIComponent(selected)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("failed");
    } catch {
      setOffline(true);
    }
    setRecords((prev) => {
      const next = { ...prev };
      delete next[selected];
      saveLocal(localKey(patientId), Object.values(next));
      return next;
    });
    setStatus("healthy");
    setNote("");
    setSaving(false);
    setFlash(L.chart.cleared);
  }

  async function exportChart() {
    const text = formatChartText(patientName || (isAr ? "مريض" : "Patient"), recordList, lang, numbering);
    const ok = await copyText(text);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 2000);
  }

  if (!patientId) {
    return (
      <div className="card text-center text-sm text-c-muted">{L.tools.noPatient}</div>
    );
  }

  const numberLabel = (fdi: string) => (numbering === "fdi" ? fdi : String(TOOTH_BY_FDI[fdi].universal));

  function renderTooth(fdi: string, index: number) {
    const tooth = TOOTH_BY_FDI[fdi];
    const record = records[fdi];
    const toothStatus: ToothStatus = record?.status || "healthy";
    const meta = STATUS_MAP[toothStatus];
    const isSelected = selected === fdi;
    const dimmed = problemsOnly && !isProblemStatus(toothStatus);
    const cx = PAD_X + CELL * index + CELL / 2;
    const width = crownWidth(tooth.type);
    const count = rootCount(tooth.type, tooth.arch);
    const baseY = tooth.arch === "upper" ? UPPER_CROWN_TOP : LOWER_CROWN_BOTTOM;
    const tipY = tooth.arch === "upper" ? ARCH_TOP : LOWER_ROOT_TIP;
    const crown = tooth.arch === "upper" ? UPPER_CROWN_TOP : LOWER_CROWN_TOP;

    return (
      <g
        key={fdi}
        tabIndex={0}
        role="button"
        aria-label={`${fdi} ${tooth.name.en} ${meta.en}`}
        onClick={() => pick(fdi)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pick(fdi);
          }
        }}
        className="cursor-pointer outline-none transition-opacity duration-150 hover:opacity-90 focus-visible:opacity-90"
        style={{ opacity: dimmed ? 0.18 : 1 }}
      >
        <title>{`${numberLabel(fdi)} — ${tooth.name[lang]} (${meta[lang]})`}</title>
        {isSelected && (
          <rect
            x={cx - width / 2 - 5}
            y={ARCH_TOP - 6}
            width={width + 10}
            height={LOWER_ROOT_TIP - ARCH_TOP + 12}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.4}
            strokeDasharray="3 3"
          />
        )}
        <path d={rootsPath(cx, baseY, tipY, count, width, tooth.type)} fill="none" stroke={meta.color} strokeWidth={1} strokeLinejoin="round" opacity={toothStatus === "healthy" ? 0.5 : 0.75} />
        <path d={crownPath(cx, width, tooth.arch)} fill={meta.color} fillOpacity={meta.alpha} stroke={meta.color} strokeWidth={isSelected ? 2.4 : 1.2} strokeLinejoin="round" />
        {cuspLines(cx, width, tooth.arch, tooth.type).map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#000000" strokeOpacity={toothStatus === "healthy" ? 0.25 : 0.45} strokeWidth={1} />
        ))}
        {toothStatus === "extracted" && (
          <g stroke="#c9c9c9" strokeWidth={2} strokeLinecap="round">
            <path d={`M ${cx - width / 3} ${crown + CROWN_H / 3} L ${cx + width / 3} ${crown + (CROWN_H * 2) / 3}`} />
            <path d={`M ${cx + width / 3} ${crown + CROWN_H / 3} L ${cx - width / 3} ${crown + (CROWN_H * 2) / 3}`} />
          </g>
        )}
        <text
          x={cx}
          y={tooth.arch === "upper" ? ARCH_TOP - 10 : LOWER_ROOT_TIP + 18}
          textAnchor="middle"
          fontSize={11}
          fontWeight={toothStatus === "healthy" ? 400 : 700}
          fill={toothStatus === "healthy" ? "#666666" : meta.color}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {numberLabel(fdi)}
        </text>
      </g>
    );
  }

  return (
    <div className="space-y-5">
      {/* summary + legend */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid flex-1 grid-cols-3 gap-px bg-c-border">
          <div className="bg-c-card px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-c-muted">{L.chart.recorded}</div>
            <div className="text-2xl font-black text-c-white">{summary.recorded}</div>
          </div>
          <div className="bg-c-card px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-c-muted">{L.chart.problems}</div>
            <div className="text-2xl font-black text-c-danger">{summary.problems}</div>
          </div>
          <div className="bg-c-card px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-c-muted">{L.chart.treated}</div>
            <div className="text-2xl font-black text-c-accent">{summary.treated}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setNumbering(numbering === "fdi" ? "universal" : "fdi")} className="btn-secondary !px-3 !py-1.5 !text-[11px]">
            {L.chart.numbering}: {numbering === "fdi" ? "FDI" : "Universal"}
          </button>
          <button type="button" onClick={() => setProblemsOnly((v) => !v)} className={`btn-secondary !px-3 !py-1.5 !text-[11px] ${problemsOnly ? "!border-c-accent !text-c-accent" : ""}`}>
            {problemsOnly ? L.chart.filterAll : L.chart.filterProblems}
          </button>
          <button type="button" onClick={exportChart} className="btn-secondary !px-3 !py-1.5 !text-[11px]">
            {copied ? L.chart.copied : L.chart.export}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_335px]">
        {/* chart */}
        <div className="card !p-3">
          <div className="mb-1 flex items-center justify-between px-1 text-[10px] uppercase tracking-[0.2em] text-c-muted">
            <span>{L.chart.upper}</span>
            <span>{L.chart.subtitle}</span>
          </div>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="h-auto w-full min-w-[620px] select-none" role="group" aria-label={L.chart.title}>
              <line x1={8} y1={UPPER_CROWN_TOP + CROWN_H + 23} x2={SVG_W - 8} y2={UPPER_CROWN_TOP + CROWN_H + 23} stroke="#2a2a2a" strokeWidth={1} strokeDasharray="6 6" />
              <line x1={PAD_X + CELL * 8} y1={6} x2={PAD_X + CELL * 8} y2={SVG_H - 6} stroke="#2a2a2a" strokeWidth={1} strokeDasharray="4 4" />
              {UPPER_ROW.map((fdi, i) => renderTooth(fdi, i))}
              {LOWER_ROW.map((fdi, i) => renderTooth(fdi, i))}
            </svg>
          </div>
          <div className="mt-1 px-1 text-[10px] uppercase tracking-[0.2em] text-c-muted">{L.chart.lower}</div>

          {/* legend */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-c-border pt-3">
            {TOOTH_STATUSES.map((s) => (
              <span key={s.id} className="flex items-center gap-2 text-[11px] text-c-muted">
                <span className="inline-block h-2.5 w-2.5 border" style={{ background: s.color, opacity: s.alpha + 0.15, borderColor: s.color }} />
                {s[lang]}
              </span>
            ))}
          </div>
        </div>

        {/* editor */}
        <div className="space-y-4">
          <div className="card">
            {loading ? (
              <p className="text-sm text-c-muted">{L.common.loading}</p>
            ) : !selectedTooth || !selected ? (
              <p className="text-sm text-c-muted">{L.chart.selectHint}</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-c-border pb-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-c-muted">{L.chart.selected}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black" style={{ color: selectedMeta.color }}>
                        {numberLabel(selectedTooth.fdi)}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-c-white">{selectedTooth.name[lang]}</div>
                        <div className="text-[11px] text-c-muted">
                          FDI {selectedTooth.fdi} · Universal {selectedTooth.universal}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-[10px] uppercase tracking-wider text-c-muted">{L.chart.status}</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TOOTH_STATUSES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStatus(s.id)}
                        className={`flex items-center gap-2 border px-2 py-1.5 text-[11px] transition-all ${
                          status === s.id ? "border-c-accent bg-white/5 text-c-white" : "border-c-border text-c-muted hover:border-c-accent/40 hover:text-c-light"
                        }`}
                      >
                        <span className="inline-block h-2.5 w-2.5" style={{ background: s.color }} />
                        {s[lang]}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-c-muted">{selectedMeta.description[lang]}</p>
                </div>

                <div>
                  <div className="mb-2 text-[10px] uppercase tracking-wider text-c-muted">{L.chart.note}</div>
                  <textarea
                    className="form-input h-16 text-sm"
                    placeholder={L.chart.notePlaceholder}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={save} disabled={saving} className="btn-primary !px-4 !py-2 !text-xs">
                    {saving ? L.common.loading : L.chart.save}
                  </button>
                  <button type="button" onClick={clearTooth} disabled={saving || (!records[selected] )} className="btn-secondary !px-4 !py-2 !text-xs disabled:opacity-40">
                    {L.chart.clear}
                  </button>
                  {onAddToPlan && selectedMeta.suggestedProcedure && (
                    <button
                      type="button"
                      onClick={() =>
                        onAddToPlan(selectedMeta.suggestedProcedure as string, selectedTooth.fdi, {
                          ar: selectedMeta.ar,
                          en: selectedMeta.en,
                        })
                      }
                      className="btn-secondary !px-4 !py-2 !text-xs"
                    >
                      + {L.chart.addToPlan}
                    </button>
                  )}
                </div>
                {flash && <p className="text-xs text-c-success">{flash}</p>}
                {offline && <p className="text-[11px] text-c-gold">{L.tools.offline}</p>}

                {(records[selected]?.history?.length || 0) > 0 && (
                  <div className="border-t border-c-border pt-3">
                    <div className="mb-2 text-[10px] uppercase tracking-wider text-c-muted">{L.chart.quickLog}</div>
                    <div className="space-y-1.5">
                      {records[selected]!.history!.slice(0, 5).map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px]">
                          <span className="mt-1 inline-block h-2 w-2 shrink-0" style={{ background: STATUS_MAP[h.status].color }} />
                          <div className="min-w-0">
                            <span className="text-c-light">{STATUS_MAP[h.status][lang]}</span>
                            <span className="text-c-muted"> · {String(h.at).slice(0, 16).replace("T", " ")}</span>
                            {h.note && <p className="truncate text-c-muted">{h.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card">
            <div className="mb-3 text-[10px] uppercase tracking-wider text-c-muted">{L.chart.quickLog}</div>
            {recentLog.length === 0 ? (
              <p className="text-xs text-c-muted">{L.chart.noLog}</p>
            ) : (
              <div className="space-y-2">
                {recentLog.map((entry, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pick(entry.tooth)}
                    className="flex w-full items-start gap-2 border border-c-border px-2 py-1.5 text-start transition-colors hover:border-c-accent/40"
                  >
                    <span className="mt-1 inline-block h-2 w-2 shrink-0" style={{ background: STATUS_MAP[entry.status].color }} />
                    <span className="min-w-0">
                      <span className="text-[11px] font-bold text-c-white">{entry.tooth}</span>
                      <span className="text-[11px] text-c-muted">
                        {" "}
                        {TOOTH_BY_FDI[entry.tooth]?.name[lang]} — {STATUS_MAP[entry.status][lang]}
                      </span>
                      {entry.note && <p className="truncate text-[11px] text-c-muted">{entry.note}</p>}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
