"use client";

import { useCallback, useRef, useState } from "react";
import { useLang } from "@/lib/translations/context";
import { clinicalI18n } from "@/lib/clinical-i18n";
import { FINDING_TYPE_BY_ID, makeDemoXrayDataUrl, simulateXrayAnalysis, type XrayAnalysis, type XraySeverity } from "@/lib/xray-simulator";
import { supabase } from "@/lib/supabase";

const SEVERITY_COLOR: Record<XraySeverity, string> = {
  low: "#4f8ef7",
  moderate: "#d4a11e",
  high: "#ff4444",
};

type ImageState = { dataUrl: string; name: string; seed: string };

export default function XRayAnalyzer({
  patientId,
  onAddToPlan,
}: {
  patientId?: string;
  onAddToPlan?: (procedureId: string, tooth: string, label: { ar: string; en: string }) => void;
}) {
  const { lang } = useLang();
  const L = clinicalI18n[lang];
  const isAr = lang === "ar";

  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<ImageState | null>(null);
  const [analysis, setAnalysis] = useState<XrayAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(110);
  const [invert, setInvert] = useState(false);
  const [notice, setNotice] = useState("");
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "local">("idle");

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      setNotice(isAr ? "حجم الصورة كبير — الحد الأقصى ١٠ ميغابايت" : "Image too large — 10 MB maximum");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage({ dataUrl: String(reader.result), name: file.name, seed: `${file.name}:${file.size}:${file.lastModified}` });
      setAnalysis(null);
      setActive(null);
      setAdded({});
      setNotice("");
      setSaveState("idle");
    };
    reader.readAsDataURL(file);
  }, [isAr]);

  async function runSimulator() {
    if (!image) return;
    setAnalyzing(true);
    setAnalysis(null);
    setActive(null);
    setNotice("");
    await new Promise((resolve) => setTimeout(resolve, 1300));
    const result = simulateXrayAnalysis(image.seed);
    setAnalysis(result);
    setActive(result.findings[0]?.id || null);
    setAnalyzing(false);
  }

  async function runGemini() {
    if (!image) return;
    setAnalyzing(true);
    setAnalysis(null);
    setActive(null);
    setNotice("");
    try {
      const res = await fetch("/api/admin/xray", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: image.dataUrl, patient_id: patientId || null }),
      });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.findings) && data.findings.length) {
        const fallback = simulateXrayAnalysis(image.seed);
        const result: XrayAnalysis = {
          id: fallback.id,
          source: "gemini",
          createdAt: new Date().toISOString(),
          quality: fallback.quality,
          summary: data.summary || fallback.summary,
          findings: data.findings,
        };
        setAnalysis(result);
        setActive(result.findings[0]?.id || null);
        setAnalyzing(false);
        return;
      }
      setNotice(L.xray.geminiUnavailable);
    } catch {
      setNotice(L.xray.geminiUnavailable);
    }
    const result = simulateXrayAnalysis(image.seed);
    setAnalysis(result);
    setActive(result.findings[0]?.id || null);
    setAnalyzing(false);
  }

  async function saveToRecord() {
    if (!analysis || !patientId) return;
    setSaveState("saving");
    let imageUrl = "";
    if (image) {
      try {
        const blob = await (await fetch(image.dataUrl)).blob();
        const path = `xrays/${patientId}/${Date.now()}.jpg`;
        const { error } = await supabase.storage.from("clinic-images").upload(path, blob, { contentType: blob.type || "image/jpeg" });
        if (!error) imageUrl = supabase.storage.from("clinic-images").getPublicUrl(path).data.publicUrl;
      } catch {
        imageUrl = "";
      }
    }
    try {
      const res = await fetch("/api/admin/xray", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          image_url: imageUrl,
          source: analysis.source,
          findings: analysis.findings,
          summary: analysis.summary[lang],
          quality_score: analysis.quality.score,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setSaveState("saved");
    } catch {
      setSaveState("local");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-c-white">{L.xray.title}</h3>
          <p className="mt-1 max-w-2xl text-xs text-c-muted">{L.xray.subtitle}</p>
        </div>
        <span className="tag">{L.xray.disclaimer}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* viewer */}
        <div className="space-y-3">
          <div className="card !p-3">
            {!image ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) loadFile(file);
                }}
                onClick={() => inputRef.current?.click()}
                className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 border border-dashed px-6 py-10 text-center transition-colors ${
                  dragging ? "border-c-accent bg-white/5" : "border-c-border hover:border-c-accent/50"
                }`}
              >
                <span className="text-3xl">🦷</span>
                <p className="text-sm text-c-light">{L.xray.drop}</p>
                <p className="text-[11px] text-c-muted">JPG / PNG / WEBP — {isAr ? "حتى ١٠ ميغابايت" : "up to 10 MB"}</p>
              </div>
            ) : (
              <div className="relative w-full bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.dataUrl}
                  alt={image.name}
                  className="relative block h-auto w-full"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%)${invert ? " invert(1)" : ""}`,
                  }}
                />
                {analyzing && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-black/45" />
                    <div className="pointer-events-none absolute inset-x-0 h-[3px] animate-scan bg-c-accent shadow-[0_0_24px_4px_rgba(255,255,255,0.5)]" />
                    <div className="absolute inset-x-0 bottom-3 text-center text-xs uppercase tracking-[0.25em] text-c-accent">
                      {L.xray.analyzing}
                    </div>
                  </>
                )}
                {analysis?.findings.map((finding) => {
                  const color = SEVERITY_COLOR[finding.severity];
                  const isActive = active === finding.id;
                  return (
                    <button
                      key={finding.id}
                      type="button"
                      onClick={() => setActive(finding.id)}
                      className="absolute transition-all"
                      style={{
                        left: `${finding.x}%`,
                        top: `${finding.y}%`,
                        width: `${finding.w}%`,
                        height: `${finding.h}%`,
                        border: `${isActive ? 2 : 1.4}px ${isActive ? "solid" : "dashed"} ${color}`,
                        background: `${color}22`,
                        boxShadow: isActive ? `0 0 18px ${color}` : "none",
                      }}
                      aria-label={FINDING_TYPE_BY_ID[finding.type].label[lang]}
                    >
                      <span
                        className="absolute -top-[18px] left-0 whitespace-nowrap px-1 text-[10px] font-bold"
                        style={{ background: color, color: "#000" }}
                      >
                        {FINDING_TYPE_BY_ID[finding.type].label[lang]} {Math.round(finding.confidence * 100)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) loadFile(file);
                  e.target.value = "";
                }}
              />
              <button type="button" className="btn-secondary !px-3 !py-1.5 !text-[11px]" onClick={() => inputRef.current?.click()}>
                {L.xray.choose}
              </button>
              <button
                type="button"
                className="btn-secondary !px-3 !py-1.5 !text-[11px]"
                onClick={() => {
                  const dataUrl = makeDemoXrayDataUrl();
                  if (!dataUrl) return;
                  setImage({ dataUrl, name: "demo-xray.jpg", seed: `demo-xray:${dataUrl.length}` });
                  setAnalysis(null);
                  setActive(null);
                  setAdded({});
                  setNotice("");
                }}
              >
                {L.xray.demo}
              </button>
              <button type="button" className="btn-primary !px-4 !py-1.5 !text-[11px] disabled:opacity-40" onClick={runSimulator} disabled={!image || analyzing}>
                {analyzing ? L.xray.analyzing : L.xray.analyze}
              </button>
              <button type="button" className="btn-secondary !px-3 !py-1.5 !text-[11px] disabled:opacity-40" onClick={runGemini} disabled={!image || analyzing} title={L.xray.withGemini}>
                ✦ {L.xray.withGemini}
              </button>
              {image && (
                <button
                  type="button"
                  className="ml-auto text-[11px] uppercase tracking-wider text-c-danger hover:text-c-danger/80"
                  onClick={() => {
                    setImage(null);
                    setAnalysis(null);
                    setActive(null);
                    setNotice("");
                    setSaveState("idle");
                  }}
                >
                  {L.xray.clear}
                </button>
              )}
            </div>

            {notice && <p className="mt-2 text-[11px] text-c-gold">{notice}</p>}
          </div>

          {image && (
            <div className="card grid gap-4 !p-4 md:grid-cols-3">
              <label className="text-[11px] text-c-muted">
                <span className="mb-1 block uppercase tracking-wider">{L.xray.brightness} — {brightness}%</span>
                <input type="range" min={40} max={180} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full accent-c-accent" />
              </label>
              <label className="text-[11px] text-c-muted">
                <span className="mb-1 block uppercase tracking-wider">{L.xray.contrast} — {contrast}%</span>
                <input type="range" min={40} max={220} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full accent-c-accent" />
              </label>
              <div className="flex items-end gap-2">
                <button type="button" onClick={() => setInvert((v) => !v)} className={`btn-secondary !px-3 !py-1.5 !text-[11px] ${invert ? "!border-c-accent !text-c-accent" : ""}`}>
                  {L.xray.invert}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBrightness(100);
                    setContrast(110);
                    setInvert(false);
                  }}
                  className="btn-secondary !px-3 !py-1.5 !text-[11px]"
                >
                  {L.xray.reset}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* findings */}
        <div className="space-y-4">
          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-c-muted">{L.xray.findings}</span>
              {analysis && (
                <span className="tag !text-[10px]">
                  {analysis.source === "gemini" ? L.xray.gemini : L.xray.simulator}
                </span>
              )}
            </div>

            {!analysis ? (
              <p className="text-xs text-c-muted">{analyzing ? L.xray.analyzing : L.xray.noFindings}</p>
            ) : (
              <div className="space-y-3">
                <p className="border-l-2 border-c-accent/60 pl-3 text-xs leading-relaxed text-c-light">{analysis.summary[lang]}</p>

                <div className="grid grid-cols-2 gap-px bg-c-border">
                  <div className="bg-c-surface px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-c-muted">{L.xray.quality}</div>
                    <div className="text-sm font-bold text-c-white">{analysis.quality.score}%</div>
                    <div className="text-[10px] text-c-muted">{analysis.quality.label[lang]}</div>
                  </div>
                  <div className="bg-c-surface px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-c-muted">{L.xray.findings}</div>
                    <div className="text-sm font-bold text-c-white">{analysis.findings.length}</div>
                    <div className="text-[10px] text-c-muted">{L.xray.confidence}</div>
                  </div>
                </div>

                {analysis.findings.map((finding) => {
                  const meta = FINDING_TYPE_BY_ID[finding.type];
                  const color = SEVERITY_COLOR[finding.severity];
                  return (
                    <div
                      key={finding.id}
                      className={`border p-3 transition-colors ${active === finding.id ? "border-c-accent/60 bg-white/5" : "border-c-border"}`}
                    >
                      <button type="button" onClick={() => setActive(finding.id)} className="w-full text-start">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-c-white">{meta.label[lang]}</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-bold" style={{ background: color, color: "#000" }}>
                            {L.xray.severity[finding.severity]} · {Math.round(finding.confidence * 100)}%
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-c-light">{finding.note[lang]}</p>
                        <p className="mt-1 text-[10px] text-c-muted">
                          {L.xray.tooth}: {finding.tooth || "—"} · {L.xray.region}: {finding.region || "—"}
                        </p>
                      </button>
                      {onAddToPlan && finding.suggestion && (
                        <button
                          type="button"
                          disabled={added[finding.id]}
                          onClick={() => {
                            onAddToPlan(finding.suggestion as string, finding.tooth, meta.label);
                            setAdded((prev) => ({ ...prev, [finding.id]: true }));
                          }}
                          className="btn-secondary mt-2 !px-3 !py-1 !text-[10px] disabled:opacity-50"
                        >
                          {added[finding.id] ? `✓ ${L.xray.addedToPlan}` : `+ ${L.xray.addToPlan}`}
                        </button>
                      )}
                    </div>
                  );
                })}

                {patientId && (
                  <button
                    type="button"
                    onClick={saveToRecord}
                    disabled={saveState === "saving" || saveState === "saved"}
                    className="btn-primary w-full !py-2 !text-xs disabled:opacity-50"
                  >
                    {saveState === "saving" ? L.common.loading : saveState === "saved" ? `✓ ${L.xray.saved}` : L.xray.save}
                  </button>
                )}
                {saveState === "local" && <p className="text-[11px] text-c-gold">{L.tools.offline}</p>}
              </div>
            )}
          </div>

          <div className="card !p-4">
            <p className="text-[11px] leading-relaxed text-c-muted">{L.xray.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
