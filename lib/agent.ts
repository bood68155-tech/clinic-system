import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { getAvailableSlots, isValidDate } from "@/lib/availability";
import { bookAppointment } from "@/lib/booking";
import { getSettings } from "@/lib/settings";
import { supabase } from "@/lib/supabase";
import type { FunctionDeclaration } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `أنت "رنا"، مساعدة الاستقبال الذكية في عيادة {CLINIC_NAME}.

دورك:
- التحدث مع المرضى بلغة عربية ودودة واحترافية تماماً.
- مساعدتهم في حجز مواعيد عند الطبيب.
- عند الحجز: اجمعي الاسم الكامل ورقم الهاتف والتاريخ والوقت المفضل وسبب الزيارة.
- استخدمي أدواتك (الوظائف) للحصول على المواعيد المتاحة ولتسجيل الحجز في النظام. لا تفترضي أبداً توفر موعد دون فحصه بالأداة.

قواعد مهمة:
1. عند طلب المريض للحجز، اسألي عن كل البيانات المطلوبة بلطف، واعرضي عليه المواعيد المتاحة.
2. الوقت يُعرض بصيغة HH:MM (مثال: 14:30).
3. بعد نجاح الحجز، أكدي للمريض بموعد نجاح الحجز ورحّبي به.
4. إذا طلب موعد مشغول، أخبريه أنه محجوز واقترحي عليه موعداً آخر متاحاً.
5. حافظي على الترحيب والود، واجعلي الإجابات قصيرة وواضحة.
6. في واتساب: ابدي الرد بكلمة ترحيبية قصيرة، ثم الرد المناسب فقط.`;

const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "getAvailableSlots",
    description: "فحص المواعيد المتاحة في العيادة لتاريخ معين.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        date: {
          type: SchemaType.STRING,
          description: "التاريخ بصيغة YYYY-MM-DD (مثال: 2026-09-17). اسألي المريض عن التاريخ أولاً.",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "bookAppointment",
    description: "تسجيل حجز موعد لمريض في العيادة.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: "اسم المريض الكامل" },
        phone: { type: SchemaType.STRING, description: "رقم هاتف المريض" },
        date: { type: SchemaType.STRING, description: "التاريخ بصيغة YYYY-MM-DD" },
        time: { type: SchemaType.STRING, description: "الوقت بصيغة HH:MM (مثال: 14:30)" },
        reason: { type: SchemaType.STRING, description: "سبب الزيارة (قد يكون فارغاً)" },
      },
      required: ["name", "phone", "date", "time"],
    },
  },
  {
    name: "getPatientHistory",
    description: "عرض السجل الطبي والزيارات السابقة لمريض معين. استخدم رقم الهاتف للبحث.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        phone: { type: SchemaType.STRING, description: "رقم هاتف المريض للبحث" },
      },
      required: ["phone"],
    },
  },
];

export type AgentMessage = { role: "user" | "assistant" | "model"; text?: string; parts?: any[] };

async function executeFunction(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    if (name === "getAvailableSlots") {
      const date = String(args.date || "");
      if (!isValidDate(date)) return JSON.stringify({ error: "تاريخ غير صالح" });
      const slots = await getAvailableSlots(date);
      return JSON.stringify({ availableSlots: slots });
    }
    if (name === "bookAppointment") {
      const result = await bookAppointment({
        date: String(args.date || ""),
        time: String(args.time || ""),
        name: String(args.name || ""),
        phone: String(args.phone || ""),
        reason: String(args.reason || ""),
      });
      if (result.error) return JSON.stringify({ error: result.error });
      return JSON.stringify({ success: true, appointment: result.appointment });
    }
    if (name === "getPatientHistory") {
      const phone = String(args.phone || "");
      const { data: patient } = await supabase
        .from("patients")
        .select("id, name, phone")
        .eq("phone", phone)
        .maybeSingle();
      if (!patient) return JSON.stringify({ error: "لم يتم العثور على مريض بهذا الرقم" });

      const { data: visits } = await supabase
        .from("visits")
        .select("visit_date, diagnosis, symptoms, notes")
        .eq("patient_id", patient.id)
        .order("visit_date", { ascending: false })
        .limit(5);

      const { data: appointments } = await supabase
        .from("appointments")
        .select("date, time, status, reason")
        .eq("patient_id", patient.id)
        .order("date", { ascending: false })
        .limit(3);

      return JSON.stringify({
        patient: patient.name,
        recentVisits: (visits || []).map((v) => ({
          date: v.visit_date,
          diagnosis: v.diagnosis,
          symptoms: v.symptoms,
        })),
        upcomingAppointments: (appointments || []).filter((a) => a.status === "booked").map((a) => ({
          date: a.date,
          time: a.time,
          reason: a.reason,
        })),
      });
    }
    return JSON.stringify({ error: "وظيفة غير معروفة" });
  } catch (err) {
    return JSON.stringify({ error: err instanceof Error ? err.message : "خطأ غير متوقع" });
  }
}

export async function runAgent(messages: AgentMessage[]): Promise<string> {
  if (!API_KEY) {
    throw new Error("لم يتم ضبط مفتاح GEMINI_API_KEY في ملف .env.local");
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("لا توجد رسائل");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const settings = await getSettings();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ functionDeclarations }],
    systemInstruction: SYSTEM_PROMPT.replace("{CLINIC_NAME}", settings.clinic_name || "عيادتي"),
  });

  const contents = messages.map((m) =>
    Array.isArray(m.parts)
      ? { role: m.role === "assistant" || m.role === "model" ? "model" : "user", parts: m.parts }
      : { role: m.role === "assistant" || m.role === "model" ? "model" : "user", parts: [{ text: m.text || "" }] }
  );

  for (let i = 0; i < 6; i++) {
    const result = await model.generateContent({ contents });
    const candidate = result.response.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const functionCalls = parts.filter((p: any) => p.functionCall);

    if (functionCalls.length === 0) {
      return parts.map((p: any) => p.text || "").join("") || "...";
    }

    contents.push({ role: "model", parts });

    const toolResponseParts = [];
    for (const call of functionCalls) {
      const fn = call.functionCall;
      if (!fn) continue;
      const output = await executeFunction(fn.name, fn.args as Record<string, unknown>);
      toolResponseParts.push({
        functionResponse: { name: fn.name, response: { result: output } },
      });
    }
    contents.push({ role: "user", parts: toolResponseParts });
  }

  return "انتهى الحد الأقصى من الخطوات، حاول مرة أخرى.";
}