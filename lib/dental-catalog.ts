// Dental procedure catalogue with default Saudi-market pricing, session counts
// and bilingual labels. Used by the treatment plan builder and by the X-ray
// analyzer when it suggests treatment.

export type ProcedureCategory =
  | "diagnostic"
  | "preventive"
  | "restorative"
  | "endodontic"
  | "surgical"
  | "prosthetic"
  | "periodontal"
  | "cosmetic"
  | "orthodontic";

export type Procedure = {
  id: string;
  ar: string;
  en: string;
  category: ProcedureCategory;
  /** Default price in SAR. */
  price: number;
  /** Typical number of visits / sessions. */
  sessions: number;
  note?: { ar: string; en: string };
};

export const PROCEDURE_CATEGORIES: { id: ProcedureCategory; ar: string; en: string }[] = [
  { id: "diagnostic", ar: "التشخيص", en: "Diagnostic" },
  { id: "preventive", ar: "الوقاية", en: "Preventive" },
  { id: "restorative", ar: "الترميم", en: "Restorative" },
  { id: "endodontic", ar: "علاج الجذور", en: "Endodontic" },
  { id: "surgical", ar: "الجراحة والخلع", en: "Surgical" },
  { id: "prosthetic", ar: "التركيبات", en: "Prosthetic" },
  { id: "periodontal", ar: "اللثة", en: "Periodontal" },
  { id: "cosmetic", ar: "التجميل", en: "Cosmetic" },
  { id: "orthodontic", ar: "التقويم", en: "Orthodontic" },
];

export const PROCEDURES: Procedure[] = [
  { id: "exam", ar: "فحص وتشخيص", en: "Exam & diagnosis", category: "diagnostic", price: 100, sessions: 1 },
  { id: "xray-pa", ar: "أشعة سنية (بريابيكال)", en: "Periapical X-ray", category: "diagnostic", price: 80, sessions: 1 },
  { id: "xray-pano", ar: "أشعة بانورامية", en: "Panoramic X-ray", category: "diagnostic", price: 200, sessions: 1 },
  { id: "cbct", ar: "أشعة مقطعية CBCT", en: "CBCT scan", category: "diagnostic", price: 500, sessions: 1 },

  { id: "cleaning", ar: "تنظيف وتلميع", en: "Scaling & polishing", category: "preventive", price: 350, sessions: 1 },
  { id: "fluoride", ar: "تطبيق فلورايد", en: "Fluoride application", category: "preventive", price: 150, sessions: 1 },
  { id: "sealant", ar: "حشوة وقائية (سيلانت)", en: "Fissure sealant", category: "preventive", price: 180, sessions: 1, note: { ar: "لكل سن", en: "per tooth" } },

  { id: "filling-composite", ar: "حشوة تجميلية", en: "Composite filling", category: "restorative", price: 350, sessions: 1 },
  { id: "filling-amalgam", ar: "حشوة أملغم", en: "Amalgam filling", category: "restorative", price: 250, sessions: 1 },
  { id: "filling-gic", ar: "حشوة زجاجية أيونية", en: "Glass ionomer filling", category: "restorative", price: 280, sessions: 1 },
  { id: "inlay", ar: "حشوة إنلي/أونلي", en: "Inlay / onlay", category: "restorative", price: 1400, sessions: 2 },

  { id: "rct-anterior", ar: "علاج عصب — سن أمامي", en: "Root canal — anterior", category: "endodontic", price: 900, sessions: 2 },
  { id: "rct-premolar", ar: "علاج عصب — ضاحك", en: "Root canal — premolar", category: "endodontic", price: 1100, sessions: 2 },
  { id: "rct-molar", ar: "علاج عصب — رحى", en: "Root canal — molar", category: "endodontic", price: 1400, sessions: 3 },
  { id: "rct-retreat", ar: "إعادة علاج عصب", en: "Root canal re-treatment", category: "endodontic", price: 1800, sessions: 3 },
  { id: "pulpotomy", ar: "بضع لب / علاج عصب للأطفال", en: "Pulpotomy (pediatric)", category: "endodontic", price: 500, sessions: 1 },

  { id: "extraction-simple", ar: "خلع بسيط", en: "Simple extraction", category: "surgical", price: 250, sessions: 1 },
  { id: "extraction-surgical", ar: "خلع جراحي", en: "Surgical extraction", category: "surgical", price: 800, sessions: 1 },
  { id: "extraction-wisdom", ar: "خلع ضرس عقل مدفون", en: "Impacted wisdom extraction", category: "surgical", price: 1500, sessions: 1 },
  { id: "frenectomy", ar: "قطع اللجام", en: "Frenectomy", category: "surgical", price: 900, sessions: 1 },
  { id: "biopsy", ar: "أخذ خزعة", en: "Biopsy", category: "surgical", price: 700, sessions: 1 },

  { id: "crown-zirconia", ar: "تاج زيركون", en: "Zirconia crown", category: "prosthetic", price: 1500, sessions: 2 },
  { id: "crown-pfm", ar: "تاج خزفي على معدن", en: "Porcelain fused to metal crown", category: "prosthetic", price: 900, sessions: 2 },
  { id: "crown-metal", ar: "تاج معدني", en: "Full metal crown", category: "prosthetic", price: 700, sessions: 2 },
  { id: "crown-temp", ar: "تاج مؤقت", en: "Temporary crown", category: "prosthetic", price: 300, sessions: 1 },
  { id: "bridge-3", ar: "جسر ثلاثي الوحدات", en: "3-unit bridge", category: "prosthetic", price: 3500, sessions: 3 },
  { id: "implant", ar: "زراعة سن (المرحلة الجراحية)", en: "Dental implant (surgical stage)", category: "prosthetic", price: 3500, sessions: 2, note: { ar: "لا يشمل التاج", en: "crown not included" } },
  { id: "implant-crown", ar: "تاج على زراعة", en: "Implant crown", category: "prosthetic", price: 1800, sessions: 2 },
  { id: "denture-full", ar: "طقم كامل", en: "Complete denture", category: "prosthetic", price: 4000, sessions: 4 },
  { id: "denture-partial", ar: "طقم جزئي", en: "Partial denture", category: "prosthetic", price: 2500, sessions: 3 },
  { id: "night-guard", ar: "واقي ليلي (صرير الأسنان)", en: "Night guard (bruxism)", category: "prosthetic", price: 900, sessions: 2 },

  { id: "perio-deep", ar: "علاج لثة (تنظيف عميق)", en: "Deep periodontal cleaning", category: "periodontal", price: 600, sessions: 2 },
  { id: "perio-root-planing", ar: "كحت وتسوية الجذور", en: "Root planing", category: "periodontal", price: 400, sessions: 1 },
  { id: "perio-graft", ar: "ترقيع لثة", en: "Gum graft", category: "periodontal", price: 2500, sessions: 2 },
  { id: "perio-flap", ar: "جراحة رفع السديلة", en: "Flap surgery", category: "periodontal", price: 1800, sessions: 2 },

  { id: "whitening", ar: "تبييض الأسنان", en: "Teeth whitening", category: "cosmetic", price: 1200, sessions: 2 },
  { id: "veneer", ar: "عدسة تجميلية (فينير)", en: "Veneer", category: "cosmetic", price: 1600, sessions: 2 },
  { id: "composite-bonding", ar: "تجميل بالحشوة المباشرة", en: "Composite bonding", category: "cosmetic", price: 600, sessions: 1 },
  { id: "smile-design", ar: "تصميم ابتسامة رقمي", en: "Digital smile design", category: "cosmetic", price: 1500, sessions: 2 },

  { id: "ortho-consult", ar: "استشارة تقويم", en: "Orthodontic consultation", category: "orthodontic", price: 200, sessions: 1 },
  { id: "ortho-metal", ar: "تقويم معدني", en: "Metal braces", category: "orthodontic", price: 8000, sessions: 12 },
  { id: "ortho-ceramic", ar: "تقويم خزفي", en: "Ceramic braces", category: "orthodontic", price: 11000, sessions: 12 },
  { id: "aligners", ar: "تقويم شفاف متحرك", en: "Clear aligners", category: "orthodontic", price: 12000, sessions: 10 },
  { id: "retainer", ar: "مثبت بعد التقويم", en: "Retainer", category: "orthodontic", price: 800, sessions: 1 },
];

export const PROCEDURE_BY_ID: Record<string, Procedure> = PROCEDURES.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<string, Procedure>
);

export function getProcedure(id: string): Procedure | undefined {
  return PROCEDURE_BY_ID[id];
}

export function categoryLabel(id: ProcedureCategory, lang: "ar" | "en"): string {
  return PROCEDURE_CATEGORIES.find((c) => c.id === id)?.[lang] || id;
}
