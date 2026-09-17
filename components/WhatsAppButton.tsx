"use client";

import { useState } from "react";
import { useLang } from "@/lib/translations/context";
import { clinicalI18n } from "@/lib/clinical-i18n";
import { openWhatsApp, sendOrOpenWhatsApp } from "@/lib/whatsapp-client";

export default function WhatsAppButton({
  phone,
  message,
  label,
  className = "btn-secondary",
  disabled,
}: {
  phone: string;
  message: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { lang } = useLang();
  const L = clinicalI18n[lang];
  const [state, setState] = useState<"idle" | "sending" | "sent" | "fallback" | "failed">("idle");

  async function send() {
    if (disabled || !message.trim()) return;
    if (!phone.trim()) {
      openWhatsApp(phone, message);
      setState("fallback");
      return;
    }
    setState("sending");
    const result = await sendOrOpenWhatsApp(phone, message);
    if (result.ok) {
      setState("sent");
      return;
    }
    openWhatsApp(phone, message);
    setState("fallback");
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" onClick={send} disabled={disabled || state === "sending"} className={`${className} disabled:opacity-40`}>
        {state === "sending" ? L.rx.sending : label || L.rx.send}
      </button>
      {state === "sent" && <span className="text-[11px] text-c-success">✓ {L.rx.sent}</span>}
      {state === "fallback" && <span className="text-[11px] text-c-gold">{L.rx.fallback}</span>}
      {state === "failed" && <span className="text-[11px] text-c-danger">{L.rx.failed}</span>}
    </span>
  );
}
