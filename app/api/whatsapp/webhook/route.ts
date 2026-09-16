import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { runAgent } from "@/lib/agent";
import { sendWhatsApp } from "@/lib/whatsapp";
import type { AgentMessage } from "@/lib/agent";

const MAX_HISTORY = 30;

function parseHistory(raw: unknown): AgentMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m: any) => m && typeof m.text === "string" && (m.role === "user" || m.role === "assistant" || m.role === "model"))
    .slice(-MAX_HISTORY);
}

async function handleIncomingMessage(from: string, text: string) {
  const { data: row } = await supabase
    .from("whatsapp_sessions")
    .select("messages")
    .eq("phone", from)
    .maybeSingle();

  const history = parseHistory(row?.messages);
  const session = [...history, { role: "user" as const, text }];

  let reply: string;
  try {
    reply = await runAgent(session);
  } catch (err) {
    reply = `⚠️ ${err instanceof Error ? err.message : "حدث خطأ"}`;
  }

  const updated: AgentMessage[] = [...session, { role: "assistant", text: reply }];

  await supabase
    .from("whatsapp_sessions")
    .upsert({ phone: from, messages: updated.slice(-MAX_HISTORY), updated_at: new Date().toISOString() });

  await sendWhatsApp(from, reply);
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY;

  if (mode === "subscribe" && token && token === expected && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("verification failed", { status: 403 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const entries: any[] = body?.entry || [];

  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const messages: any[] = change?.value?.messages || [];
      for (const m of messages) {
        if (!m || m.type !== "text" || !m.from || !m.text?.body) continue;
        try {
          await handleIncomingMessage(String(m.from), String(m.text.body));
        } catch (err) {
          console.error("whatsapp handler error:", err);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}