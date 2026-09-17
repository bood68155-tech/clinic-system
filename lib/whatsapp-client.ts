// Plain (non-"use client") helpers shared by the browser components and the
// server route handlers, so phone handling stays consistent everywhere.

/** Keep digits only, drop a leading 00 and normalize local Saudi numbers to +966. */
export function normalizePhone(raw: string, defaultCountry = "966"): string {
  let digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith(defaultCountry)) return digits;
  if (digits.startsWith("0")) return defaultCountry + digits.slice(1);
  if (digits.length <= 10) return defaultCountry + digits;
  return digits;
}

/** Build a click-to-chat link that also pre-fills the message body. */
export function waLink(rawPhone: string, text: string): string {
  const digits = normalizePhone(rawPhone);
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}

export type SendResult = { ok: boolean; error?: string };

/**
 * Sends through the clinic's WhatsApp Cloud API. If that is not configured we
 * fall back to opening WhatsApp with the message pre-filled, so a single click
 * always reaches the patient.
 */
export async function sendOrOpenWhatsApp(phone: string, message: string): Promise<SendResult> {
  try {
    const res = await fetch("/api/admin/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: phone, message }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.ok) return { ok: true, error: data?.error };
    return { ok: false, error: data?.error || `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network error" };
  }
}

export function openWhatsApp(phone: string, message: string): void {
  if (typeof window === "undefined") return;
  window.open(waLink(phone, message), "_blank", "noopener,noreferrer");
}

export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
