import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";
import { buildSummary, normalizeModelFindings } from "@/lib/xray-simulator";

function isAdmin(req: Request) {
  const pass = process.env.ADMIN_PASSWORD;
  return pass && (req.headers.get("cookie") || "").includes(`clinic-admin=${pass}`);
}

export const dynamic = "force-dynamic";

const PROMPT = `You are a dental radiography assistant helping a licensed dentist review a radiograph.
Look for: caries, periapical lesions, alveolar bone loss, calculus, impacted teeth, existing restorations/crowns, root fractures and cysts.
Reply with ONLY minified JSON, no markdown, exactly this shape:
{"summary_ar":"...","summary_en":"...","findings":[{"type":"caries|periapical|bone-loss|calculus|impacted|restoration|root-fracture|cyst","tooth":"FDI code or empty string","severity":"low|moderate|high","confidence":0.0,"region":"short text","x":0,"y":0,"w":10,"h":10,"note_ar":"...","note_en":"..."}]}
x, y, w, h are percentages of the image size; x/y are the top-left corner of the bounding box. Return at most 6 findings and an empty array when the image is not a radiograph.`;

type ParsedImage = { mimeType: string; data: string };

function parseDataUrl(value: string): ParsedImage | null {
  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(value || "");
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

function parseJson(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

/** Persists an analysis (simulated or Gemini) into the patient's record. */
export async function PUT(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const patientId = String(body.patient_id || "");
  if (!patientId) return NextResponse.json({ ok: false, error: "patient_id مطلوب" }, { status: 400 });

  const summary = body.summary;
  const { data, error } = await supabase
    .from("xray_analyses")
    .insert({
      patient_id: patientId,
      image_url: String(body.image_url || ""),
      source: String(body.source || "simulator"),
      findings: Array.isArray(body.findings) ? body.findings : [],
      summary: String(typeof summary === "string" ? summary : summary?.en || summary?.ar || ""),
      quality_score: Number(body.quality_score) || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, analysis: data });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const image = parseDataUrl(String(body.image || ""));
  if (!image) return NextResponse.json({ ok: false, source: "unavailable", error: "صورة غير صالحة" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, source: "unavailable", error: "GEMINI_API_KEY غير مضبوط" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    });

    const result = await model.generateContent([
      { text: PROMPT },
      { inlineData: { mimeType: image.mimeType, data: image.data } },
    ]);

    const parsed = parseJson(result.response.text());
    if (!parsed) {
      return NextResponse.json({ ok: false, source: "unavailable", error: "تعذر تحليل رد النموذج" });
    }

    const findings = normalizeModelFindings(parsed.findings);
    return NextResponse.json({
      ok: true,
      source: "gemini",
      findings,
      summary: {
        ar: String(parsed.summary_ar || buildSummary(findings).ar),
        en: String(parsed.summary_en || buildSummary(findings).en),
      },
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      source: "unavailable",
      error: err instanceof Error ? err.message : "فشل تحليل الأشعة",
    });
  }
}
