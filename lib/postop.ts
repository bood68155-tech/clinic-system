// Post-procedure care instructions and the one-click WhatsApp message builder.

export type Bilingual = { ar: string; en: string };

export type PostOpTemplate = {
  id: string;
  ar: string;
  en: string;
  icon: string;
  /** How long the instructions apply. */
  duration: Bilingual;
  dos: Bilingual[];
  donts: Bilingual[];
  warning: Bilingual[];
  followUp: Bilingual;
  /** Medication templates typically prescribed with this procedure. */
  meds?: string[];
  /** Procedure ids for the follow-up visit. */
  procedures?: string[];
};

export const POSTOP_TEMPLATES: PostOpTemplate[] = [
  {
    id: "extraction",
    ar: "خلع سن",
    en: "Tooth extraction",
    icon: "🦷",
    duration: { ar: "٣ – ٥ أيام", en: "3 – 5 days" },
    dos: [
      { ar: "اعض على الشاش المعقم لمدة ٣٠–٤٥ دقيقة دون تغييره", en: "Bite firmly on the gauze for 30–45 minutes without changing it" },
      { ar: "ضع كمادة باردة على الخد من الخارج ٢٠ دقيقة كل ساعة خلال أول ٢٤ ساعة", en: "Apply a cold pack outside the cheek 20 min/hour for the first 24 hours" },
      { ar: "تناول الطعام اللين والبارد مثل الزبادي والعصائر", en: "Eat soft, cool food such as yoghurt and juices" },
      { ar: "اشرب من كوب بدون شفاط (سترو)", en: "Drink from a cup, do not use a straw" },
      { ar: "تناول الأدوية الموصوفة في وقتها حتى مع اختفاء الألم", en: "Take the prescribed medication on schedule even if pain subsides" },
    ],
    donts: [
      { ar: "لا تبصق أو تغرغر أو تشفط بقوة في أول ٢٤ ساعة", en: "Do not spit, rinse or suck forcefully for the first 24 hours" },
      { ar: "لا تلمس مكان الخلع بإصبعك أو لسانك", en: "Do not touch the socket with your finger or tongue" },
      { ar: "تجنب التدخين والقهوة الساخنة والبهارات تماماً", en: "Avoid smoking, hot drinks and spicy food entirely" },
      { ar: "تجنب المجهود البدني والرياضة العنيفة ليومين", en: "Avoid heavy physical activity for two days" },
    ],
    warning: [
      { ar: "نزيف مستمر يزيد عن ٣٠ دقيقة على الرغم من العض على الشاش", en: "Bleeding lasting more than 30 minutes despite biting on gauze" },
      { ar: "ألم شديد متزايد بعد اليوم الثالث", en: "Severe pain increasing after day 3" },
      { ar: "تورم كبير أو حرارة أو صعوبة في البلع والتنفس", en: "Marked swelling, fever, or difficulty swallowing or breathing" },
    ],
    followUp: { ar: "المراجعة بعد ٧ أيام لفحص الشفاء وإزالة الغرز إن وجدت", en: "Review in 7 days to check healing and remove sutures if placed" },
    meds: ["ibuprofen", "amoxicillin", "chlorhexidine"],
    procedures: ["exam"],
  },
  {
    id: "surgical-extraction",
    ar: "خلع جراحي / ضرس العقل",
    en: "Surgical / wisdom tooth extraction",
    icon: "🩺",
    duration: { ar: "٧ – ١٠ أيام", en: "7 – 10 days" },
    dos: [
      { ar: "الراحة التامة اليوم الأول ورفع الرأس أثناء النوم", en: "Complete rest on day one and keep your head elevated while sleeping" },
      { ar: "كمادات باردة ٢٠ دقيقة كل ساعة أول ٢٤ ساعة ثم دافئة", en: "Cold compresses 20 min/hour for 24 hours, then warm" },
      { ar: "طعام لين وبارد لمدة ٣ أيام", en: "Soft, cool food for 3 days" },
      { ar: "فتح الفم بلطف والعودة لتنظيف الأسنان بالفرشاة الناعمة من اليوم الثاني", en: "Open the mouth gently and resume soft brushing from day two" },
    ],
    donts: [
      { ar: "لا تغرغر أو تبصق في أول ٢٤ ساعة", en: "No rinsing or spitting for the first 24 hours" },
      { ar: "لا تمارس الرياضة أو الساونا لمدة ٥ أيام", en: "No sports or sauna for 5 days" },
      { ar: "امتنع عن التدخين لمدة أسبوع على الأقل", en: "Stop smoking for at least a week" },
    ],
    warning: [
      { ar: "تورم يزداد بشكل ملحوظ بعد اليوم الثالث", en: "Swelling that clearly increases after day 3" },
      { ar: "حرارة أعلى من ٣٨ درجة", en: "Fever above 38 °C" },
      { ar: "خدر أو تنميل مستمر في الشفة أو اللسان", en: "Persistent numbness in the lip or tongue" },
    ],
    followUp: { ar: "المراجعة بعد ٣ أيام للفحص ثم بعد ٧–١٠ أيام لإزالة الغرز", en: "Review in 3 days, then in 7–10 days for suture removal" },
    meds: ["augmentin", "ibuprofen", "dexamethasone", "chlorhexidine"],
    procedures: ["exam", "xray-pa"],
  },
  {
    id: "root-canal",
    ar: "علاج العصب",
    en: "Root canal treatment",
    icon: "🦷",
    duration: { ar: "٣ – ٤ أيام", en: "3 – 4 days" },
    dos: [
      { ar: "تناول المسكن قبل زوال تأثير التخدير مباشرة", en: "Take the analgesic before the anaesthetic wears off" },
      { ar: "تجنب القضم على السن المعالج حتى نهاية الترميم النهائي", en: "Avoid chewing on the treated tooth until the final restoration" },
      { ar: "فرش الأسنان بحرص حول السن المعالج مع تحريك الفرشاة بلطف", en: "Brush carefully around the treated tooth with gentle strokes" },
      { ar: "استخدم الغسول الموصوف بعد ٢٤ ساعة من الجلسة", en: "Use the prescribed mouthwash 24 hours after the session" },
    ],
    donts: [
      { ar: "لا تتناول المشروبات شديدة السخونة أثناء تأثير التخدير", en: "Do not drink very hot liquids while still numb" },
      { ar: "لا تتعامل مع سن تعرض للكسر أو فقدان حشوة مؤقتة", en: "Do not ignore a fractured tooth or a lost temporary filling" },
      { ar: "لا توقف العلاج في منتصفه حتى لو اختفى الألم", en: "Never interrupt the treatment even if the pain disappears" },
    ],
    warning: [
      { ar: "ألم شديد لا يتحسن بالمسكنات", en: "Severe pain not relieved by analgesics" },
      { ar: "تورم في اللثة أو الوجه", en: "Swelling of the gum or face" },
      { ar: "سقوط الحشوة المؤقتة قبل الموعد", en: "Loss of the temporary filling before the next visit" },
    ],
    followUp: { ar: "الجلسة القادمة في الموعد المحدد لاستكمال العلاج ثم الترميم النهائي", en: "Return for the next session, then the final restoration" },
    meds: ["ibuprofen", "amoxicillin", "paracetamol"],
    procedures: ["filling-composite"],
  },
  {
    id: "filling",
    ar: "حشوة / ترميم",
    en: "Filling / restoration",
    icon: "✨",
    duration: { ar: "١ – ٢ يوم", en: "1 – 2 days" },
    dos: [
      { ar: "الانتظار ساعتين قبل تناول الطعام لأن تأثير التخدير قد يستمر", en: "Wait two hours before eating as the anaesthetic may still be active" },
      { ar: "استخدم الفرشاة والخيط بشكل طبيعي من اليوم الأول", en: "Resume normal brushing and flossing from day one" },
      { ar: "أبلغنا إذا شعرت بأن الحشوة عالية عند الإطباق", en: "Tell us if the filling feels high when biting" },
    ],
    donts: [
      { ar: "تجنب القضم على الحلويات اللاصقة والجليد", en: "Avoid sticky sweets and biting ice" },
      { ar: "لا تنخر القهوة الساخنة جداً في نفس اليوم", en: "Avoid very hot coffee on the same day" },
    ],
    warning: [
      { ar: "حساسية مستمرة لأكثر من أسبوعين", en: "Sensitivity lasting more than two weeks" },
      { ar: "ألم عند القضم أو عند البرد", en: "Pain on biting or with cold" },
      { ar: "تفتت أو سقوط جزء من الحشوة", en: "Chipping or loss of part of the filling" },
    ],
    followUp: { ar: "المراجعة خلال أسبوعين للتأكد من الإطباق", en: "Review within two weeks to check the bite" },
    procedures: ["exam"],
  },
  {
    id: "scaling",
    ar: "تنظيف وتلميع / علاج اللثة",
    en: "Scaling & periodontal therapy",
    icon: "🪥",
    duration: { ar: "٢ – ٣ أيام", en: "2 – 3 days" },
    dos: [
      { ar: "مضمضة بمحلول الملح الدافئ مرتين يومياً", en: "Rinse with warm saline twice daily" },
      { ar: "فرش ناعم مع استخدام الخيط الطبي يومياً", en: "Use a soft brush and dental floss daily" },
      { ar: "استخدم الغسول الموصوف بعد ٢٤ ساعة من الجلسة", en: "Use the prescribed mouthwash 24 hours after the session" },
    ],
    donts: [
      { ar: "تجنب الأطعمة الصلبة والباردة جداً لليوم الأول", en: "Avoid hard and very cold food on the first day" },
      { ar: "لا تتوقف عن تنظيف الأسنان رغم النزيف البسيط", en: "Do not stop brushing despite slight bleeding" },
    ],
    warning: [
      { ar: "نزيف غزير مستمر", en: "Heavy persistent bleeding" },
      { ar: "ألم شديد في اللثة أو تخلخل واضح في الأسنان", en: "Severe gum pain or obvious tooth mobility" },
    ],
    followUp: { ar: "المراجعة بعد ٤ – ٦ أسابيع لتقييم اللثة وإعادة الفحص", en: "Review in 4–6 weeks to reassess the gums" },
    meds: ["chlorhexidine", "metronidazole"],
    procedures: ["perio-deep"],
  },
  {
    id: "implant",
    ar: "زراعة سن",
    en: "Dental implant",
    icon: "🔩",
    duration: { ar: "٧ – ١٠ أيام", en: "7 – 10 days" },
    dos: [
      { ar: "الالتزام الكامل بالأدوية الموصوفة والمضاد الحيوي", en: "Strictly follow the prescribed medication and antibiotic" },
      { ar: "الكمادات الباردة أول ٢٤ ساعة ثم الدافئة", en: "Cold compresses for 24 hours, then warm" },
      { ar: "التغذية اللينة والاهتمام بنظافة المنطقة بدقة", en: "Soft diet and meticulous care of the site" },
      { ar: "المنظف اللطيف حول الغرسة بعد ٢٤ ساعة", en: "Gently clean around the implant after 24 hours" },
    ],
    donts: [
      { ar: "لا تمارس الرياضة العنيفة أو الساونا لأسبوع", en: "No heavy exercise or sauna for a week" },
      { ar: "امتنع عن التدخين تماماً — يؤثر على الالتحام العظمي", en: "Stop smoking entirely — it affects osseointegration" },
      { ar: "لا تستخدم فرشاة كهربائية على المنطقة لمدة أسبوع", en: "No electric toothbrush over the area for a week" },
    ],
    warning: [
      { ar: "تورم متزايد أو إفرازات من مكان الغرسة", en: "Increasing swelling or discharge from the site" },
      { ar: "حركة في الغرسة أو ألم عند اللمس", en: "Mobility of the implant or pain on touch" },
      { ar: "حرارة أو طعم غريب مستمر في الفم", en: "Fever or persistent bad taste" },
    ],
    followUp: { ar: "المراجعة بعد ١٠ أيام لفحص الالتحام ثم بعد ٣ أشهر للتركيب النهائي", en: "Review in 10 days, then at 3 months for the final crown" },
    meds: ["augmentin", "ibuprofen", "chlorhexidine", "dexamethasone"],
    procedures: ["implant-crown"],
  },
  {
    id: "crown",
    ar: "تركيب تاج / تركيبات",
    en: "Crown / fixed prosthesis",
    icon: "👑",
    duration: { ar: "١ – ٤ أيام", en: "1 – 4 days" },
    dos: [
      { ar: "احرص على التاج المؤقت ولا تزيله بنفسك", en: "Take care of the temporary crown and do not remove it yourself" },
      { ar: "تجنب الأطعمة اللاصقة مثل العلكة والكراميل", en: "Avoid sticky foods such as chewing gum and caramel" },
      { ar: "قلّب الطعام على الجهة الأخرى حتى تثبيت التاج النهائي", en: "Chew on the other side until the final crown is cemented" },
    ],
    donts: [
      { ar: "لا تتناول الطعام الصلب على السن المؤقت", en: "Do not bite hard food on the temporary crown" },
      { ar: "لا تستخدم الخيط القاسي مباشرة حول التاج المؤقت", en: "Do not use harsh floss directly around the temporary crown" },
    ],
    warning: [
      { ar: "سقوط التاج المؤقت — احفظه وراجعنا فوراً", en: "Temporary crown falls off — keep it and come in immediately" },
      { ar: "ألم شديد أو حساسية غير محتملة", en: "Severe pain or unbearable sensitivity" },
    ],
    followUp: { ar: "موعد تثبيت التاج النهائي في التاريخ المحدد", en: "Final crown cementation on the scheduled date" },
    procedures: ["crown-zirconia"],
  },
  {
    id: "whitening",
    ar: "تبييض الأسنان",
    en: "Teeth whitening",
    icon: "⚪",
    duration: { ar: "٢ – ٧ أيام", en: "2 – 7 days" },
    dos: [
      { ar: "استخدم معجون الأسنان المخصص للحساسية خلال الأسبوع الأول", en: "Use the desensitising toothpaste for the first week" },
      { ar: "اشرب الماء بكثرة وابتعد عن الأصباغ ٤٨ ساعة", en: "Drink plenty of water and avoid staining foods for 48 hours" },
    ],
    donts: [
      { ar: "تجنب القهوة والشاي والشوكولاتة والصلصة والبنجر لأسبوع", en: "Avoid coffee, tea, chocolate, tomato sauce and beetroot for a week" },
      { ar: "امتنع عن التدخين — يعيد التصبغ فوراً", en: "No smoking — it stains the teeth immediately" },
    ],
    warning: [
      { ar: "حساسية شديدة مستمرة لأكثر من ٣ أيام", en: "Severe sensitivity lasting more than 3 days" },
      { ar: "تغير لون غير متوقع في اللثة", en: "Unexpected colour change of the gums" },
    ],
    followUp: { ar: "المتابعة بعد أسبوع لتقييم اللون", en: "Follow-up after one week to assess the shade" },
  },
  {
    id: "ortho",
    ar: "تركيب التقويم",
    en: "Orthodontic appliance",
    icon: "🪢",
    duration: { ar: "طوال فترة العلاج", en: "Whole treatment period" },
    dos: [
      { ar: "نظف الأسنان بعد كل وجبة بفرشاة التقويم والخيط المخصص", en: "Clean after every meal with an orthodontic brush and floss" },
      { ar: "استخدم الشمع الطبي على البروزات المزعجة", en: "Use dental wax on irritating brackets" },
      { ar: "تناول الطعام المقطع لقطع صغيرة", en: "Cut food into small pieces" },
    ],
    donts: [
      { ar: "تجنب العلكة والمكسرات والجزر والتفاح غير المقطع", en: "Avoid gum, nuts, raw carrots and whole apples" },
      { ar: "لا تحاول تعديل السلك بنفسك", en: "Do not adjust the wire yourself" },
    ],
    warning: [
      { ar: "انفصال براكيت أو بروز سلك يؤدي لجرح الفم", en: "Detached bracket or a poking wire causing mouth injury" },
      { ar: "حركة سريعة أو ألم غير معتاد في أسنان", en: "Rapid movement or unusual tooth pain" },
    ],
    followUp: { ar: "الشد الشهري في الموعد المحدد — التأخير يطيل مدة العلاج", en: "Monthly adjustment on schedule — delays extend treatment" },
  },
  {
    id: "pediatric",
    ar: "أسنان الأطفال",
    en: "Pediatric dentistry",
    icon: "🧸",
    duration: { ar: "١ – ٣ أيام", en: "1 – 3 days" },
    dos: [
      { ar: "استخدمي المسكن المناسب لعمر ووزن الطفل بالجرعة الموصوفة", en: "Use the age/weight appropriate analgesic at the prescribed dose" },
      { ar: "ساعدي الطفل في تفريش الأسنان مرتين يومياً بمعجون مخصص للأطفال", en: "Help the child brush twice daily with a child-specific toothpaste" },
      { ar: "كافئي الطفل بعد العلاج لبناء تجربة إيجابية مع طبيب الأسنان", en: "Reward the child after treatment to build a positive experience" },
    ],
    donts: [
      { ar: "لا تعطي الطفل الأسبرين نهائياً", en: "Never give the child aspirin" },
      { ar: "تجنبي الحلويات والمشروبات الغازية قبل النوم", en: "Avoid sweets and soft drinks before bedtime" },
    ],
    warning: [
      { ar: "حرارة أو تورم في الوجه", en: "Fever or facial swelling" },
      { ar: "رفض الطفل للطعام أو نومه المتقطع من الألم", en: "The child refusing food or waking repeatedly from pain" },
    ],
    followUp: { ar: "المراجعة بعد ٦ أشهر للفحص الدوري وتطبيق الفلورايد", en: "Review in 6 months for a check-up and fluoride" },
    meds: ["paracetamol-pediatric", "amoxicillin-pediatric"],
    procedures: ["fluoride"],
  },
];

export const POSTOP_BY_ID: Record<string, PostOpTemplate> = POSTOP_TEMPLATES.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, PostOpTemplate>
);

export type PostOpContext = {
  clinicName?: string;
  clinicPhone?: string;
  patientName?: string;
  doctorName?: string;
  nextVisit?: string;
};

export function buildPostOpMessage(template: PostOpTemplate, ctx: PostOpContext, lang: "ar" | "en"): string {
  const out: string[] = [];
  const title = lang === "ar" ? template.ar : template.en;
  out.push(`🏥 ${ctx.clinicName || (lang === "ar" ? "عيادتي" : "Clinic")}`);
  out.push(lang === "ar" ? `📌 تعليمات ما بعد: ${title}` : `📌 After-care instructions: ${title}`);
  if (ctx.patientName) out.push(lang === "ar" ? `👤 المريض: ${ctx.patientName}` : `👤 Patient: ${ctx.patientName}`);
  out.push(lang === "ar" ? `⏱ المدة: ${template.duration.ar}` : `⏱ Duration: ${template.duration.en}`);
  out.push("━━━━━━━━━━━━━━━━");

  out.push(lang === "ar" ? "✅ يُنصح بالآتي:" : "✅ Please do:");
  template.dos.forEach((d) => out.push(`• ${lang === "ar" ? d.ar : d.en}`));

  out.push("");
  out.push(lang === "ar" ? "❌ يجب تجنب:" : "❌ Please avoid:");
  template.donts.forEach((d) => out.push(`• ${lang === "ar" ? d.ar : d.en}`));

  out.push("");
  out.push(lang === "ar" ? "⚠️ راجع العيادة فوراً إذا حدث:" : "⚠️ Contact us immediately if:");
  template.warning.forEach((w) => out.push(`• ${lang === "ar" ? w.ar : w.en}`));

  out.push("");
  out.push("━━━━━━━━━━━━━━━━");
  out.push(lang === "ar" ? `🗓 ${template.followUp.ar}` : `🗓 ${template.followUp.en}`);
  if (ctx.nextVisit) out.push(lang === "ar" ? `📅 موعدك القادم: ${ctx.nextVisit}` : `📅 Your next visit: ${ctx.nextVisit}`);
  if (ctx.doctorName) out.push(lang === "ar" ? `👨‍⚕️ د. ${ctx.doctorName}` : `👨‍⚕️ Dr. ${ctx.doctorName}`);
  if (ctx.clinicPhone) out.push(lang === "ar" ? `☎️ للاستفسار: ${ctx.clinicPhone}` : `☎️ Enquiries: ${ctx.clinicPhone}`);
  out.push(lang === "ar" ? "💙 نتمنى لك شفاءً عاجلاً" : "💙 Wishing you a speedy recovery");
  return out.join("\n");
}
