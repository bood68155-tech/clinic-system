// Deterministic dental X-ray analysis simulator.
//
// The "AI" pass is generated from a stable seed derived from the uploaded image
// so the same radiograph always yields the same findings. It is a simulation for
// teaching / demo purposes - it is NOT a diagnostic device. When a Gemini API
// key is configured the analyzer can additionally ask the real vision model,
// and the two paths share the exact same result shape.

import { newId } from "./id";
import { TOOTH_BY_FDI } from "./dental";

export type XraySeverity = "low" | "moderate" | "high";

export type XrayFindingType =
  | "caries"
  | "periapical"
  | "bone-loss"
  | "calculus"
  | "impacted"
  | "restoration"
  | "root-fracture"
  | "cyst";

export type XrayFinding = {
  id: string;
  type: XrayFindingType;
  severity: XraySeverity;
  /** 0 - 1 */
  confidence: number;
  region: string;
  tooth: string;
  /** Marker position as percentages of the image box (0-100). */
  x: number;
  y: number;
  w: number;
  h: number;
  note: { ar: string; en: string };
  /** Suggested procedure id from the dental catalogue. */
  suggestion?: string;
};

export type XrayQuality = {
  score: number;
  label: { ar: string; en: string };
};

export type XrayAnalysis = {
  id: string;
  source: "simulator" | "gemini";
  createdAt: string;
  quality: XrayQuality;
  summary: { ar: string; en: string };
  findings: XrayFinding[];
};

export type FindingTypeMeta = {
  id: XrayFindingType;
  label: { ar: string; en: string };
  /** Relative chance of being produced and severity weighting. */
  weight: number;
  severity: XraySeverity;
  suggestion?: string;
  notes: { ar: string; en: string }[];
  /** Marker box footprint in percent of image. */
  box: { w: number; h: number };
};

export const FINDING_TYPES: FindingTypeMeta[] = [
  {
    id: "caries",
    label: { ar: "نخر (تسوس)", en: "Caries" },
    weight: 6,
    severity: "moderate",
    suggestion: "filling-composite",
    box: { w: 11, h: 13 },
    notes: [
      { ar: "منطقة شفافية إشعاعية في الطبقة الخارجية تشير إلى نخر نشط يحتاج ترميم.", en: "Radiolucent area in the outer layer suggesting active caries requiring restoration." },
      { ar: "نخر متوسط العمق قريب من العاج، يُنصح بحشوة تجميلية ومتابعة.", en: "Moderate depth caries approaching dentine; composite restoration and review advised." },
      { ar: "شبهة نخر أولي — الجدار السطحي غير واضح ويحتاج فحصاً سريرياً.", en: "Suspected early caries — surface wall unclear, clinical validation needed." },
    ],
  },
  {
    id: "periapical",
    label: { ar: "آفة حول الذروة", en: "Periapical lesion" },
    weight: 3,
    severity: "high",
    suggestion: "rct-retreat",
    box: { w: 12, h: 12 },
    notes: [
      { ar: "توسع في المسافة حول الذروة مع شبهة آفة ذروية تحتاج تقييماً لبياً.", en: "Widened periapical space with suspected apical lesion — endodontic assessment needed." },
      { ar: "منطقة شفافية إشعاعية دائرية حول الذروة توحي بالتهاب مزمن بعد علاج عصب سابق.", en: "Round radiolucent area at the apex suggesting chronic inflammation after previous root canal." },
    ],
  },
  {
    id: "bone-loss",
    label: { ar: "فقدان العظم السنخي", en: "Alveolar bone loss" },
    weight: 4,
    severity: "moderate",
    suggestion: "perio-deep",
    box: { w: 14, h: 14 },
    notes: [
      { ar: "انخفاض أُفقي في العظم السنخي بمقدار الثلث تقريباً — دلالة على مرض لثة متوسط.", en: "Approximately one-third horizontal alveolar bone loss — moderate periodontal disease." },
      { ar: "فقدان عظم عمودي موضعي بين الأسنان يحتاج كحت وتسوية الجذور.", en: "Localised vertical bone loss between teeth requiring scaling and root planing." },
    ],
  },
  {
    id: "calculus",
    label: { ar: "تكلسات جيرية", en: "Calculus deposits" },
    weight: 4,
    severity: "low",
    suggestion: "cleaning",
    box: { w: 12, h: 10 },
    notes: [
      { ar: "كتل إشعاعية كثيفة أعلى خط اللثة توحي بترسبات جيرية تحت اللثة.", en: "Dense radiopaque deposits above the gum line suggesting subgingival calculus." },
      { ar: "ترسبات جيرية على الأسطح الملاصقة مع التهاب لثة موضعي.", en: "Interproximal calculus deposits with localised gingival inflammation." },
    ],
  },
  {
    id: "impacted",
    label: { ar: "سن مدفون", en: "Impacted tooth" },
    weight: 2,
    severity: "high",
    suggestion: "extraction-wisdom",
    box: { w: 15, h: 16 },
    notes: [
      { ar: "ضرس عقل مدفون بميل لقاحي مع تلامس مع جذر السن المجاور — تقييم قلع.", en: "Impacted wisdom tooth in mesioangular position contacting the adjacent root — extraction assessment." },
      { ar: "سن مدفون كامل داخل العظم يحتاج أشعة مقطعية CBCT قبل القلع.", en: "Fully bone-impacted tooth requiring CBCT before extraction." },
    ],
  },
  {
    id: "restoration",
    label: { ar: "ترميم أو تاج قائم", en: "Existing restoration" },
    weight: 3,
    severity: "low",
    box: { w: 11, h: 12 },
    notes: [
      { ar: "جسم إشعاعي كثيف يطابق حشوة سابقة — الحواف بحالة مقبولة.", en: "Radiopaque body consistent with an existing restoration — margins acceptable." },
      { ar: "تاج تركيبي قائم مع فراغ هامشي بسيط يحتاج مراقبة.", en: "Existing prosthetic crown with mild marginal gap requiring monitoring." },
    ],
  },
  {
    id: "root-fracture",
    label: { ar: "شبهة كسر جذر", en: "Suspected root fracture" },
    weight: 1,
    severity: "high",
    suggestion: "extraction-simple",
    box: { w: 10, h: 14 },
    notes: [
      { ar: "خط شفاف إشعاعي على مستوى الجذر يوحي بكسر رأسي — تأكيد بالأشعة المقطعية.", en: "Radiolucent line at the root level suggesting a vertical fracture — CBCT confirmation advised." },
      { ar: "شبهة كسر في الذروة مع انتفاخ موضعي في الأنسجة.", en: "Suspected apical fracture with localised tissue swelling." },
    ],
  },
  {
    id: "cyst",
    label: { ar: "كيسة / آفة كبيرة", en: "Cyst / large lesion" },
    weight: 1,
    severity: "high",
    suggestion: "cbct",
    box: { w: 18, h: 16 },
    notes: [
      { ar: "منطقة شفافية إشعاعية واسعة محددة الحواف توحي بكيسة تحتاج تقييماً جراحياً.", en: "Large well-defined radiolucent area suggesting a cyst — surgical evaluation required." },
      { ar: "آفة عظمية بحجم كبير تسبب ضغطاً على الجذور المجاورة.", en: "Large osseous lesion exerting pressure on adjacent roots." },
    ],
  },
];

export const FINDING_TYPE_BY_ID: Record<string, FindingTypeMeta> = FINDING_TYPES.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, FindingTypeMeta>
);

type Region = {
  id: string;
  label: { ar: string; en: string };
  x: [number, number];
  y: [number, number];
  teeth: string[];
};

const REGIONS: Region[] = [
  {
    id: "upper-right-posterior",
    label: { ar: "الفك العلوي — يمين (خلفي)", en: "Upper right — posterior" },
    x: [7, 27],
    y: [21, 39],
    teeth: ["16", "17", "15", "18", "14"],
  },
  {
    id: "upper-anterior",
    label: { ar: "الفك العلوي — أمامي", en: "Upper anterior" },
    x: [35, 65],
    y: [15, 34],
    teeth: ["11", "12", "21", "22", "13", "23"],
  },
  {
    id: "upper-left-posterior",
    label: { ar: "الفك العلوي — يسار (خلفي)", en: "Upper left — posterior" },
    x: [73, 93],
    y: [21, 39],
    teeth: ["26", "27", "25", "28", "24"],
  },
  {
    id: "lower-right-posterior",
    label: { ar: "الفك السفلي — يمين (خلفي)", en: "Lower right — posterior" },
    x: [7, 27],
    y: [59, 79],
    teeth: ["46", "47", "45", "48", "44"],
  },
  {
    id: "lower-anterior",
    label: { ar: "الفك السفلي — أمامي", en: "Lower anterior" },
    x: [35, 65],
    y: [63, 82],
    teeth: ["41", "42", "31", "32", "43", "33"],
  },
  {
    id: "lower-left-posterior",
    label: { ar: "الفك السفلي — يسار (خلفي)", en: "Lower left — posterior" },
    x: [73, 93],
    y: [59, 79],
    teeth: ["36", "37", "35", "38", "34"],
  },
];

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(value: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const pick = <T,>(rng: () => number, list: T[]): T => list[Math.floor(rng() * list.length) % list.length];
const between = (rng: () => number, min: number, max: number) => min + rng() * (max - min);
const round1 = (v: number) => Math.round(v * 10) / 10;

const QUALITY_LABELS: XrayQuality["label"][] = [
  { ar: "جودة ممتازة — تباين واضح", en: "Excellent quality — clear contrast" },
  { ar: "جودة جيدة — مناسبة للتشخيص", en: "Good quality — diagnostic" },
  { ar: "جودة متوسطة — بعض المناطق غير واضحة", en: "Fair quality — some areas unclear" },
  { ar: "جودة منخفضة — يُنصح بإعادة التصوير", en: "Low quality — repeat exposure advised" },
];

/** Builds a stable, plausible analysis for a given seed (file fingerprint). */
export function simulateXrayAnalysis(seedText: string, preferredTooth = ""): XrayAnalysis {
  const rng = mulberry32(hashString(seedText || "clinic-xray"));

  // Weighted pool of finding types.
  const pool: FindingTypeMeta[] = [];
  FINDING_TYPES.forEach((t) => {
    for (let i = 0; i < t.weight; i += 1) pool.push(t);
  });

  const count = 2 + Math.floor(rng() * 4); // 2 - 5 findings
  const used = new Set<string>();
  const findings: XrayFinding[] = [];

  for (let attempt = 0; attempt < count * 4 && findings.length < count; attempt += 1) {
    const type = pick(rng, pool);
    const region = preferredTooth && TOOTH_BY_FDI[preferredTooth]
      ? REGIONS.find((r) => r.teeth.includes(preferredTooth)) || pick(rng, REGIONS)
      : pick(rng, REGIONS);
    const tooth = preferredTooth && TOOTH_BY_FDI[preferredTooth] ? preferredTooth : pick(rng, region.teeth);
    const key = `${type.id}:${tooth}`;
    if (used.has(key)) continue;
    used.add(key);

    const severity: XraySeverity =
      type.severity === "low"
        ? "low"
        : rng() > 0.62
          ? "high"
          : type.severity;
    const confidence = round1(between(rng, severity === "high" ? 0.78 : 0.62, severity === "high" ? 0.97 : 0.9));

    const w = type.box.w * between(rng, 0.85, 1.15);
    const h = type.box.h * between(rng, 0.85, 1.15);
    const x = Math.min(Math.max(between(rng, region.x[0], region.x[1]) - w / 2, 1), 99 - w);
    const y = Math.min(Math.max(between(rng, region.y[0], region.y[1]) - h / 2, 1), 99 - h);

    findings.push({
      id: newId(),
      type: type.id,
      severity,
      confidence,
      region: region.label.en.replace(" — ", " ").toLowerCase(),
      tooth,
      x: round1(x),
      y: round1(y),
      w: round1(w),
      h: round1(h),
      note: pick(rng, type.notes),
      suggestion: type.suggestion,
    });
  }

  findings.sort((a, b) => b.confidence - a.confidence);
  const qualityScore = Math.round(between(rng, 0.72, 0.98) * 100);
  const qualityLabel = qualityScore >= 92 ? QUALITY_LABELS[0] : qualityScore >= 84 ? QUALITY_LABELS[1] : qualityScore >= 76 ? QUALITY_LABELS[2] : QUALITY_LABELS[3];

  return {
    id: newId(),
    source: "simulator",
    createdAt: new Date().toISOString(),
    quality: { score: qualityScore, label: qualityLabel },
    summary: buildSummary(findings),
    findings,
  };
}

export function buildSummary(findings: XrayFinding[]): { ar: string; en: string } {
  if (!findings.length) {
    return {
      ar: "لم تُكتشف ملاحظات إشعاعية واضحة في هذه الصورة.",
      en: "No clear radiographic findings detected on this image.",
    };
  }
  const counter = new Map<XrayFindingType, number>();
  findings.forEach((f) => counter.set(f.type, (counter.get(f.type) || 0) + 1));
  const highs = findings.filter((f) => f.severity === "high").length;

  const arParts = Array.from(counter.entries()).map(([type, n]) => `${FINDING_TYPE_BY_ID[type].label.ar} (${n})`);
  const enParts = Array.from(counter.entries()).map(([type, n]) => `${FINDING_TYPE_BY_ID[type].label.en} (${n})`);

  return {
    ar: `تم رصد ${findings.length} ملاحظة: ${arParts.join("، ")}.${highs ? ` منها ${highs} حالة تحتاج تدخلاً عاجلاً.` : " لا توجد حالات حرجة."}`,
    en: `${findings.length} findings detected: ${enParts.join(", ")}.${highs ? ` ${highs} high-priority item(s) require prompt attention.` : " No critical items."}`,
  };
}

/** Draws a synthetic panoramic radiograph so the analyzer can be tried with no assets. */
export function makeDemoXrayDataUrl(): string {
  if (typeof document === "undefined") return "";
  const width = 1024;
  const height = 520;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#030303";
  ctx.fillRect(0, 0, width, height);

  // Soft exposure glow.
  const glow = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width / 1.7);
  glow.addColorStop(0, "rgba(190,190,190,0.30)");
  glow.addColorStop(0.55, "rgba(110,110,110,0.14)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Film grain.
  for (let i = 0; i < 12000; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const a = Math.random() * 0.06;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(x, y, 1, 1);
  }

  const drawArch = (upper: boolean) => {
    const baseY = upper ? height * 0.32 : height * 0.68;
    const curve = upper ? -1 : 1;
    for (let i = 0; i < 16; i += 1) {
      const t = (i + 0.5) / 16;
      const x = 70 + t * (width - 140);
      const arc = Math.sin(t * Math.PI) * 34 * curve;
      const y = baseY + arc;
      const cusps = i < 2 || i > 13 ? 26 : i < 5 || i > 10 ? 30 : i < 7 || i > 8 ? 24 : 22;
      const w = cusps;
      const h = upper ? 78 : 74;
      const grad = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
      grad.addColorStop(0, "rgba(245,245,245,0.88)");
      grad.addColorStop(0.5, "rgba(205,205,205,0.78)");
      grad.addColorStop(1, "rgba(120,120,120,0.55)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      const top = upper ? y - h : y;
      ctx.roundRect?.(x - w / 2, top, w, h, 6);
      if (!ctx.roundRect) ctx.rect(x - w / 2, top, w, h);
      ctx.fill();
      // root shadows
      ctx.strokeStyle = "rgba(230,230,230,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, upper ? top + 8 : top + h - 8);
      ctx.lineTo(x, upper ? top - 26 : top + h + 26);
      ctx.stroke();
    }
  };

  // Bone body tint.
  ctx.fillStyle = "rgba(120,120,120,0.10)";
  ctx.beginPath();
  ctx.ellipse(width / 2, height / 2, width * 0.46, height * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  drawArch(true);
  drawArch(false);

  // Jaw outline.
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, height * 0.24);
  ctx.quadraticCurveTo(width / 2, height * 0.02, width - 60, height * 0.24);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(60, height * 0.76);
  ctx.quadraticCurveTo(width / 2, height * 0.99, width - 60, height * 0.76);
  ctx.stroke();

  return canvas.toDataURL("image/jpeg", 0.92);
}

/** Normalizes the JSON returned by the vision model into our shared shape. */
export function normalizeModelFindings(raw: unknown): XrayFinding[] {
  if (!Array.isArray(raw)) return [];
  const out: XrayFinding[] = [];
  raw.forEach((item: Record<string, unknown>) => {
    const type = String(item?.type || "").toLowerCase().replace(/\s+/g, "-");
    const meta = FINDING_TYPE_BY_ID[type];
    if (!meta) return;
    const tooth = String(item?.tooth || "");
    const severityRaw = String(item?.severity || meta.severity).toLowerCase();
    const severity: XraySeverity =
      severityRaw === "high" || severityRaw === "moderate" || severityRaw === "low" ? (severityRaw as XraySeverity) : meta.severity;
    const x = Number(item?.x);
    const y = Number(item?.y);
    const w = Number(item?.w) || meta.box.w;
    const h = Number(item?.h) || meta.box.h;
    out.push({
      id: newId(),
      type: meta.id,
      severity,
      confidence: Math.min(Math.max(Number(item?.confidence) || 0.75, 0.3), 1),
      region: String(item?.region || ""),
      tooth: TOOTH_BY_FDI[tooth] ? tooth : "",
      x: Number.isFinite(x) ? Math.min(Math.max(x, 1), 99 - w) : 35,
      y: Number.isFinite(y) ? Math.min(Math.max(y, 1), 99 - h) : 30,
      w,
      h,
      note: {
        ar: String(item?.note_ar || item?.note || meta.notes[0].ar),
        en: String(item?.note_en || item?.note || meta.notes[0].en),
      },
      suggestion: meta.suggestion,
    });
  });
  return out;
}
