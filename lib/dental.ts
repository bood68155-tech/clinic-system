// Dental chart domain model (FDI + Universal numbering, arch geometry metadata
// and the colour-coded clinical status vocabulary used across the dashboard).

export type ToothStatus =
  | "healthy"
  | "watch"
  | "decay"
  | "filling"
  | "crown"
  | "root-canal"
  | "implant"
  | "fracture"
  | "extracted";

export type ToothType = "incisor" | "canine" | "premolar" | "molar";
export type Arch = "upper" | "lower";
export type Quadrant = 1 | 2 | 3 | 4;

export type ToothStatusMeta = {
  id: ToothStatus;
  ar: string;
  en: string;
  short: { ar: string; en: string };
  /** Status colour - the rest of the UI stays monochrome, these carry meaning. */
  color: string;
  /** Fill opacity so light statuses stay legible on the black chart. */
  alpha: number;
  description: { ar: string; en: string };
  /** Catalog procedure suggested when this status is recorded. */
  suggestedProcedure?: string;
};

export const TOOTH_STATUSES: ToothStatusMeta[] = [
  {
    id: "healthy",
    ar: "سليم",
    en: "Healthy",
    short: { ar: "سليم", en: "OK" },
    color: "#8b8b8b",
    alpha: 0.14,
    description: { ar: "لا توجد ملاحظات سريرية", en: "No clinical findings" },
  },
  {
    id: "watch",
    ar: "تحت المتابعة",
    en: "Watch",
    short: { ar: "متابعة", en: "Watch" },
    color: "#d4a11e",
    alpha: 0.7,
    description: { ar: "تسوس مبكر يحتاج مراقبة", en: "Early change - needs monitoring" },
    suggestedProcedure: "exam",
  },
  {
    id: "decay",
    ar: "تسوس",
    en: "Decay",
    short: { ar: "تسوس", en: "Decay" },
    color: "#ff4444",
    alpha: 0.85,
    description: { ar: "تسوس نشط يحتاج ترميم", en: "Active caries needing restoration" },
    suggestedProcedure: "filling-composite",
  },
  {
    id: "filling",
    ar: "حشوة",
    en: "Filling",
    short: { ar: "حشوة", en: "Fill" },
    color: "#4f8ef7",
    alpha: 0.8,
    description: { ar: "ترميم سابق بحالة جيدة", en: "Existing restoration, stable" },
    suggestedProcedure: "filling-composite",
  },
  {
    id: "crown",
    ar: "تاج",
    en: "Crown",
    short: { ar: "تاج", en: "Crown" },
    color: "#f2f2f2",
    alpha: 0.85,
    description: { ar: "تاج تركيبي موجود", en: "Existing prosthetic crown" },
    suggestedProcedure: "crown-zirconia",
  },
  {
    id: "root-canal",
    ar: "علاج عصب",
    en: "Root canal",
    short: { ar: "عصب", en: "RCT" },
    color: "#a78bfa",
    alpha: 0.85,
    description: { ar: "سن معالج لبياً", en: "Endodontically treated tooth" },
    suggestedProcedure: "rct-molar",
  },
  {
    id: "implant",
    ar: "زراعة",
    en: "Implant",
    short: { ar: "زراعة", en: "Imp" },
    color: "#34d399",
    alpha: 0.8,
    description: { ar: "زراعة سنية مثبتة", en: "Osseointegrated implant" },
    suggestedProcedure: "implant-crown",
  },
  {
    id: "fracture",
    ar: "كسر",
    en: "Fracture",
    short: { ar: "كسر", en: "Fx" },
    color: "#f97316",
    alpha: 0.85,
    description: { ar: "كسر في التاج أو الجذر", en: "Crown or root fracture" },
    suggestedProcedure: "crown-zirconia",
  },
  {
    id: "extracted",
    ar: "مخلوع / مفقود",
    en: "Extracted",
    short: { ar: "خلع", en: "Ext" },
    color: "#5b6472",
    alpha: 0.35,
    description: { ar: "سن مخلوع أو مفقود", en: "Extracted or missing tooth" },
    suggestedProcedure: "implant",
  },
];

export const STATUS_MAP: Record<ToothStatus, ToothStatusMeta> = TOOTH_STATUSES.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<ToothStatus, ToothStatusMeta>
);

export type Tooth = {
  /** FDI two-digit code, e.g. "16". */
  fdi: string;
  /** Universal numbering 1-32 (1 = upper right third molar). */
  universal: number;
  quadrant: Quadrant;
  arch: Arch;
  type: ToothType;
  /** 1 = central incisor ... 8 = third molar, counted from the midline. */
  position: number;
  name: { ar: string; en: string };
};

const POSITION_NAMES: Record<number, { ar: string; en: string }> = {
  1: { ar: "القاطع المركزي", en: "Central incisor" },
  2: { ar: "القاطع الجانبي", en: "Lateral incisor" },
  3: { ar: "الناب", en: "Canine" },
  4: { ar: "الضاحك الأول", en: "First premolar" },
  5: { ar: "الضاحك الثاني", en: "Second premolar" },
  6: { ar: "الرحى الأولى", en: "First molar" },
  7: { ar: "الرحى الثانية", en: "Second molar" },
  8: { ar: "الرحى الثالثة (ضرس العقل)", en: "Third molar (wisdom)" },
};

function toothTypeFor(position: number): ToothType {
  if (position <= 2) return "incisor";
  if (position === 3) return "canine";
  if (position <= 5) return "premolar";
  return "molar";
}

function buildTooth(fdi: string, universal: number): Tooth {
  const quadrant = Number(fdi[0]) as Quadrant;
  const position = Number(fdi[1]);
  const arch: Arch = quadrant <= 2 ? "upper" : "lower";
  const base = POSITION_NAMES[position];
  return {
    fdi,
    universal,
    quadrant,
    arch,
    type: toothTypeFor(position),
    position,
    name: {
      ar: arch === "upper" ? `${base.ar} العلوي` : `${base.ar} السفلي`,
      en: arch === "upper" ? `Upper ${base.en.toLowerCase()}` : `Lower ${base.en.toLowerCase()}`,
    },
  };
}

/** Chart row order as displayed to the dentist (patient's right on the left). */
export const UPPER_ROW: string[] = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
];

export const LOWER_ROW: string[] = [
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38",
];

export const TEETH: Tooth[] = [
  ...UPPER_ROW.map((fdi, i) => buildTooth(fdi, i + 1)),
  ...LOWER_ROW.map((fdi, i) => buildTooth(fdi, 32 - i)),
];

export const TOOTH_BY_FDI: Record<string, Tooth> = TEETH.reduce(
  (acc, t) => {
    acc[t.fdi] = t;
    return acc;
  },
  {} as Record<string, Tooth>
);

export type ToothLogEntry = {
  status: ToothStatus;
  note: string;
  at: string;
};

export type ToothRecord = {
  tooth_code: string;
  status: ToothStatus;
  note: string;
  updated_at?: string;
  history?: ToothLogEntry[];
};

export function isProblemStatus(status: ToothStatus): boolean {
  return status === "decay" || status === "fracture" || status === "watch" || status === "extracted";
}

/** Human readable chart recap, used for WhatsApp / print exports. */
export function formatChartText(
  patientName: string,
  records: ToothRecord[],
  lang: "ar" | "en",
  system: "fdi" | "universal" = "fdi"
): string {
  const head =
    lang === "ar"
      ? `🦷 مخطط الأسنان — ${patientName}`
      : `🦷 Dental chart — ${patientName}`;
  const lines = records
    .slice()
    .sort((a, b) => Number(a.tooth_code) - Number(b.tooth_code))
    .map((r) => {
      const meta = STATUS_MAP[r.status];
      const code = r.tooth_code;
      const universal = TOOTH_BY_FDI[code]?.universal;
      const label = system === "fdi" ? `#${code}` : `#${universal}`;
      const name = TOOTH_BY_FDI[code]?.name[lang] || "";
      const status = meta[lang];
      const note = r.note ? ` — ${r.note}` : "";
      return `${label} ${name}: ${status}${note}`;
    });
  const header =
    lang === "ar"
      ? `العدد المسجل: ${records.length}`
      : `Teeth recorded: ${records.length}`;
  return [head, header, "──────────────", ...lines].join("\n");
}
