import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ text: "حدث خطأ في المحادثة" }, { status: 400 });
  }

  try {
    const text = await runAgent(messages);
    return NextResponse.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return NextResponse.json({ text: `⚠️ ${msg}` }, { status: 500 });
  }
}