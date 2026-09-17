// Standard dental medication templates, quick prescription kits, bilingual
// formatting and light-weight interaction warnings.

import { newId } from "./id";

export type MedCategory = "analgesic" | "antibiotic" | "mouthwash" | "corticosteroid" | "other";

export type MedTemplate = {
  id: string;
  ar: string;
  en: string;
  category: MedCategory;
  dosage: string;
  frequency: { ar: string; en: string };
  duration: { ar: string; en: string };
  instructions: { ar: string; en: string };
  caution?: { ar: string; en: string };
  /** True for amoxicillin-family drugs (penicillin allergy check). */
  penicillin?: boolean;
  pediatric?: boolean;
};

export const MED_CATEGORIES: { id: MedCategory; ar: string; en: string }[] = [
  { id: "analgesic", ar: "مسكنات", en: "Analgesics" },
  { id: "antibiotic", ar: "مضادات حيوية", en: "Antibiotics" },
  { id: "mouthwash", ar: "غسول ومطهر", en: "Mouthwash" },
  { id: "corticosteroid", ar: "كورتيزون", en: "Corticosteroids" },
  { id: "other", ar: "أخرى", en: "Other" },
];

export const MED_TEMPLATES: MedTemplate[] = [
  // ----- Antibiotics -----
  {
    id: "amoxicillin",
    ar: "أموكسيسيلين 500 ملغ",
    en: "Amoxicillin 500 mg",
    category: "antibiotic",
    dosage: "كبسولة",
    frequency: { ar: "كل 8 ساعات", en: "every 8 hours" },
    duration: { ar: "5 أيام", en: "5 days" },
    instructions: { ar: "مع كوب ماء، أكمل الجرعة كاملة حتى لو تحسنت الأعراض", en: "With water, complete the full course even if symptoms improve" },
    caution: { ar: "يمنع لمرضى حساسية البنسلين", en: "Contraindicated in penicillin allergy" },
    penicillin: true,
  },
  {
    id: "augmentin",
    ar: "أموكسيسيلين + كلافولانيك 875 ملغ",
    en: "Amoxicillin + Clavulanic acid 875 mg",
    category: "antibiotic",
    dosage: "قرص",
    frequency: { ar: "كل 12 ساعة", en: "every 12 hours" },
    duration: { ar: "5 أيام", en: "5 days" },
    instructions: { ar: "مع الطعام لتقليل اضطراب المعدة", en: "With food to reduce stomach upset" },
    caution: { ar: "يمنع لمرضى حساسية البنسلين", en: "Contraindicated in penicillin allergy" },
    penicillin: true,
  },
  {
    id: "metronidazole",
    ar: "ميترونيدازول 500 ملغ",
    en: "Metronidazole 500 mg",
    category: "antibiotic",
    dosage: "قرص",
    frequency: { ar: "كل 8 ساعات", en: "every 8 hours" },
    duration: { ar: "5 أيام", en: "5 days" },
    instructions: { ar: "بعد الأكل، ممنوع تماماً تناول الكحول أثناء العلاج", en: "After meals; strictly no alcohol during treatment" },
    caution: { ar: "يجب تجنب الكحول — يسبب تفاعلاً شديداً", en: "Avoid alcohol — severe reaction" },
  },
  {
    id: "azithromycin",
    ar: "أزيثرومايسين 500 ملغ",
    en: "Azithromycin 500 mg",
    category: "antibiotic",
    dosage: "قرص",
    frequency: { ar: "مرة واحدة يومياً", en: "once daily" },
    duration: { ar: "3 أيام", en: "3 days" },
    instructions: { ar: "بديل آمن عند حساسية البنسلين، قبل الأكل بساعة", en: "Safe alternative in penicillin allergy, one hour before food" },
  },
  {
    id: "clindamycin",
    ar: "كليندامايسين 300 ملغ",
    en: "Clindamycin 300 mg",
    category: "antibiotic",
    dosage: "كبسولة",
    frequency: { ar: "كل 8 ساعات", en: "every 8 hours" },
    duration: { ar: "5 أيام", en: "5 days" },
    instructions: { ar: "مع كوب كبير من الماء لتجنب تهيج المريء", en: "With a full glass of water to avoid oesophageal irritation" },
    caution: { ar: "أوقف الدواء وأراجع الطبيب عند حدوث إسهال شديد", en: "Stop and seek advice if severe diarrhoea occurs" },
  },
  {
    id: "amoxicillin-pediatric",
    ar: "شراب أموكسيسيلين 250 ملغ/5 مل",
    en: "Amoxicillin suspension 250 mg/5 ml",
    category: "antibiotic",
    dosage: "5 مل (حسب الوزن)",
    frequency: { ar: "كل 8 ساعات", en: "every 8 hours" },
    duration: { ar: "5 أيام", en: "5 days" },
    instructions: { ar: "يُرج جيداً قبل الاستخدام، الجرعة تُحسب حسب وزن الطفل", en: "Shake well, dose by child's body weight" },
    penicillin: true,
    pediatric: true,
  },
  // ----- Analgesics -----
  {
    id: "ibuprofen",
    ar: "إيبوبروفين 400 ملغ",
    en: "Ibuprofen 400 mg",
    category: "analgesic",
    dosage: "قرص",
    frequency: { ar: "كل 8 ساعات عند الألم", en: "every 8 hours as needed" },
    duration: { ar: "3 أيام", en: "3 days" },
    instructions: { ar: "بعد الأكل وليس على معدة فارغة", en: "After food, never on an empty stomach" },
    caution: { ar: "يُستخدم بحذر لمرضى المعدة والكلى والحوامل", en: "Use with caution in gastric/renal disease and pregnancy" },
  },
  {
    id: "paracetamol",
    ar: "باراسيتامول 500 ملغ",
    en: "Paracetamol 500 mg",
    category: "analgesic",
    dosage: "قرص",
    frequency: { ar: "كل 6 ساعات عند اللزوم", en: "every 6 hours if needed" },
    duration: { ar: "3 أيام", en: "3 days" },
    instructions: { ar: "الحد الأقصى 4 غرام في اليوم", en: "Maximum 4 g per day" },
    caution: { ar: "تجنب تناوله مع أدوية أخرى تحتوي باراسيتامول", en: "Avoid combining with other paracetamol products" },
  },
  {
    id: "diclofenac",
    ar: "ديكلوفيناك 50 ملغ",
    en: "Diclofenac 50 mg",
    category: "analgesic",
    dosage: "قرص",
    frequency: { ar: "كل 12 ساعة", en: "every 12 hours" },
    duration: { ar: "3 أيام", en: "3 days" },
    instructions: { ar: "بعد الأكل، للألم والتورم الشديد", en: "After food, for severe pain and swelling" },
    caution: { ar: "لا يُجمع مع إيبوبروفين أو نابروكسين", en: "Do not combine with ibuprofen or naproxen" },
  },
  {
    id: "naproxen",
    ar: "نابروكسين 500 ملغ",
    en: "Naproxen 500 mg",
    category: "analgesic",
    dosage: "قرص",
    frequency: { ar: "كل 12 ساعة", en: "every 12 hours" },
    duration: { ar: "3 أيام", en: "3 days" },
    instructions: { ar: "بعد الأكل مع كوب ماء كامل", en: "After food with a full glass of water" },
    caution: { ar: "لا يُجمع مع مسكنات أخرى من نفس العائلة", en: "Do not combine with other NSAIDs" },
  },
  {
    id: "paracetamol-pediatric",
    ar: "شراب باراسيتامول 120 ملغ/5 مل",
    en: "Paracetamol suspension 120 mg/5 ml",
    category: "analgesic",
    dosage: "5 مل (حسب الوزن)",
    frequency: { ar: "كل 6 ساعات عند اللزوم", en: "every 6 hours if needed" },
    duration: { ar: "3 أيام", en: "3 days" },
    instructions: { ar: "لا تُعطى أكثر من 4 جرعات في 24 ساعة", en: "No more than 4 doses in 24 hours" },
    pediatric: true,
  },
  // ----- Mouthwash / antiseptic -----
  {
    id: "chlorhexidine",
    ar: "غسول كلورهيكسيدين 0.12%",
    en: "Chlorhexidine mouthwash 0.12%",
    category: "mouthwash",
    dosage: "15 مل",
    frequency: { ar: "مرتين يومياً", en: "twice daily" },
    duration: { ar: "7 أيام", en: "7 days" },
    instructions: { ar: "مضمضة لمدة 30 ثانية بدون تخفيف ثم بصق، لا تُبلع", en: "Rinse 30 seconds undiluted then spit, do not swallow" },
    caution: { ar: "قد يسبب تصبغ مؤقت للأسنان، لا يُستخدم مع معجون يحتوي فلورايد مباشرة", en: "May temporarily stain teeth; keep 30 min apart from fluoride toothpaste" },
  },
  {
    id: "povidone",
    ar: "غرغرة بوفيدون أيودين",
    en: "Povidone-iodine gargle",
    category: "mouthwash",
    dosage: "10 مل مخففة",
    frequency: { ar: "3 مرات يومياً", en: "3 times daily" },
    duration: { ar: "5 أيام", en: "5 days" },
    instructions: { ar: "تُخفف بالماء الفاتر وتُغرغر 30 ثانية", en: "Dilute with warm water and gargle 30 seconds" },
    caution: { ar: "يمنع لمرضى الغدة الدرقية أو حساسية اليود", en: "Contraindicated in thyroid disease or iodine allergy" },
  },
  { id: "saline", ar: "محلول ملحي دافئ", en: "Warm saline rinse", category: "mouthwash", dosage: "نصف ملعقة صغيرة ملح", frequency: { ar: "3 مرات يومياً بعد الأكل", en: "3 times daily after meals" }, duration: { ar: "7 أيام", en: "7 days" }, instructions: { ar: "تُذاب في كوب ماء فاتر وتُغرغر بلطف", en: "Dissolve in a cup of warm water and rinse gently" } },
  { id: "hydrogen-peroxide", ar: "بيروكسيد الهيدروجين 1.5%", en: "Hydrogen peroxide 1.5%", category: "mouthwash", dosage: "10 مل", frequency: { ar: "مرتين يومياً", en: "twice daily" }, duration: { ar: "5 أيام", en: "5 days" }, instructions: { ar: "مضمضة ثم بصق، للقيح والتقرحات", en: "Rinse and spit, for pus and ulcers" } },
  // ----- Corticosteroids -----
  {
    id: "dexamethasone",
    ar: "ديكساميثازون 0.5 ملغ",
    en: "Dexamethasone 0.5 mg",
    category: "corticosteroid",
    dosage: "قرص",
    frequency: { ar: "كل 12 ساعة", en: "every 12 hours" },
    duration: { ar: "3 أيام", en: "3 days" },
    instructions: { ar: "لتقليل التورم بعد الجراحة، مع الطعام", en: "To reduce post-surgical swelling, with food" },
    caution: { ar: "يُستخدم بحذر لمرضى السكري وضغط الدم", en: "Use with caution in diabetes and hypertension" },
  },
  {
    id: "prednisolone",
    ar: "بريدنيزولون 5 ملغ",
    en: "Prednisolone 5 mg",
    category: "corticosteroid",
    dosage: "قرص",
    frequency: { ar: "مرة واحدة صباحاً", en: "once in the morning" },
    duration: { ar: "3 أيام", en: "3 days" },
    instructions: { ar: "مع الطعام في الصباح", en: "With food in the morning" },
    caution: { ar: "لا يوقف فجأة بعد استعمال طويل", en: "Do not stop abruptly after prolonged use" },
  },
];

export const MED_BY_ID: Record<string, MedTemplate> = MED_TEMPLATES.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<string, MedTemplate>
);

export type RxKit = {
  id: string;
  ar: string;
  en: string;
  description: { ar: string; en: string };
  meds: string[];
};

export const RX_KITS: RxKit[] = [
  {
    id: "post-extraction",
    ar: "بعد الخلع",
    en: "Post-extraction",
    description: { ar: "مسكن + مضاد حيوي + غسول", en: "Analgesic + antibiotic + mouthwash" },
    meds: ["ibuprofen", "amoxicillin", "chlorhexidine"],
  },
  {
    id: "root-canal",
    ar: "بعد علاج العصب",
    en: "After root canal",
    description: { ar: "مسكن ومضاد حيوي قصير", en: "Short analgesic and antibiotic" },
    meds: ["ibuprofen", "amoxicillin", "paracetamol"],
  },
  {
    id: "infection",
    ar: "التهاب أو خراج",
    en: "Infection / abscess",
    description: { ar: "مضادان حيويان + مسكن قوي", en: "Dual antibiotics + strong analgesic" },
    meds: ["amoxicillin", "metronidazole", "diclofenac"],
  },
  {
    id: "gum",
    ar: "علاج اللثة",
    en: "Gum treatment",
    description: { ar: "غسول + مضاد حيوي للثة", en: "Mouthwash + periodontal antibiotic" },
    meds: ["chlorhexidine", "metronidazole"],
  },
  {
    id: "surgery",
    ar: "بعد الجراحة",
    en: "Post-surgery",
    description: { ar: "كورتيزون + مسكن + مضاد حيوي", en: "Steroid + analgesic + antibiotic" },
    meds: ["dexamethasone", "ibuprofen", "augmentin", "chlorhexidine"],
  },
  {
    id: "penicillin-allergy",
    ar: "حساسية البنسلين",
    en: "Penicillin allergy",
    description: { ar: "بدائل آمنة عند حساسية البنسلين", en: "Safe alternatives for penicillin allergy" },
    meds: ["azithromycin", "ibuprofen", "chlorhexidine"],
  },
  {
    id: "pediatric",
    ar: "الأطفال",
    en: "Pediatric",
    description: { ar: "جرعات شرابية مناسبة للأطفال", en: "Weight-based liquid doses" },
    meds: ["paracetamol-pediatric", "amoxicillin-pediatric"],
  },
];

/** Row shape used by the existing `prescriptions` table. */
export type RxLine = {
  id: string;
  med_id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  category: MedCategory;
};

export function lineFromTemplate(template: MedTemplate, lang: "ar" | "en"): RxLine {
  return {
    id: newId(),
    med_id: template.id,
    medication: lang === "ar" ? template.ar : template.en,
    dosage: template.dosage,
    frequency: template.frequency[lang],
    duration: template.duration[lang],
    instructions: template.instructions[lang],
    category: template.category,
  };
}

/** Simple, non-alarming safety checks shown above the prescription preview. */
export function rxWarnings(lines: RxLine[], lang: "ar" | "en"): string[] {
  const warnings: string[] = [];
  const ids = new Set(lines.map((l) => l.med_id));
  const antibiotics = lines.filter((l) => l.category === "antibiotic");
  const nsaids = lines.filter((l) => ["ibuprofen", "diclofenac", "naproxen"].includes(l.med_id));

  if (antibiotics.length > 1) {
    warnings.push(
      lang === "ar"
        ? "أكثر من مضاد حيوي في نفس الوصفة — تأكد من وجود سبب سريري."
        : "More than one antibiotic in this prescription — confirm the clinical indication."
    );
  }
  if (nsaids.length > 1) {
    warnings.push(
      lang === "ar"
        ? "أكثر من مسكن من عائلة NSAID — خطر على المعدة والكلى."
        : "More than one NSAID — gastric and renal risk."
    );
  }
  if (ids.has("metronidazole")) {
    warnings.push(
      lang === "ar"
        ? "ميترونيدازول: ممنوع الكحول تماماً أثناء العلاج وبعده بيومين."
        : "Metronidazole: absolutely no alcohol during treatment and for 2 days after."
    );
  }
  MED_TEMPLATES.filter((m) => ids.has(m.id) && m.caution).forEach((m) => {
    warnings.push(`${lang === "ar" ? m.ar : m.en}: ${m.caution?.[lang]}`);
  });
  return Array.from(new Set(warnings));
}

export function formatRxText(
  ctx: { clinicName: string; doctorName?: string; patientName: string; diagnosis?: string; followUp?: string },
  lines: RxLine[],
  lang: "ar" | "en"
): string {
  const out: string[] = [];
  out.push(`🏥 ${ctx.clinicName || (lang === "ar" ? "عيادتي" : "Clinic")}`);
  if (ctx.doctorName) out.push(lang === "ar" ? `👨‍⚕️ د. ${ctx.doctorName}` : `👨‍⚕️ Dr. ${ctx.doctorName}`);
  out.push("━━━━━━━━━━━━━━━━");
  out.push(lang === "ar" ? `📋 المريض: ${ctx.patientName}` : `📋 Patient: ${ctx.patientName}`);
  if (ctx.diagnosis) out.push(lang === "ar" ? `🩺 التشخيص: ${ctx.diagnosis}` : `🩺 Diagnosis: ${ctx.diagnosis}`);
  out.push("");
  out.push(lang === "ar" ? "💊 الوصفة الطبية:" : "💊 Prescription:");
  out.push("━━━━━━━━━━━━━━━━");
  lines.forEach((line, index) => {
    out.push("");
    out.push(`${index + 1}. ${line.medication}`);
    if (line.dosage) out.push(lang === "ar" ? `   📏 الجرعة: ${line.dosage}` : `   📏 Dose: ${line.dosage}`);
    if (line.frequency) out.push(lang === "ar" ? `   ⏰ التكرار: ${line.frequency}` : `   ⏰ Frequency: ${line.frequency}`);
    if (line.duration) out.push(lang === "ar" ? `   📅 المدة: ${line.duration}` : `   📅 Duration: ${line.duration}`);
    if (line.instructions) out.push(lang === "ar" ? `   💡 ملاحظات: ${line.instructions}` : `   💡 Notes: ${line.instructions}`);
  });
  out.push("");
  out.push("━━━━━━━━━━━━━━━━");
  if (ctx.followUp) out.push(lang === "ar" ? `📅 الموعد القادم: ${ctx.followUp}` : `📅 Next visit: ${ctx.followUp}`);
  out.push(lang === "ar" ? "🔔 بانتظارك لزيارتنا مرة أخرى — عيادتي" : "🔔 We look forward to seeing you again");
  return out.join("\n");
}
