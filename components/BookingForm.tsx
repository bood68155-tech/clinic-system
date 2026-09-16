"use client";

import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/lib/translations/context";

type Status = "idle" | "loading" | "success" | "error";

export default function BookingForm() {
  const { t, lang } = useLang();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [lastBooking, setLastBooking] = useState<{ name: string; date: string; time: string } | null>(null);
  const [clinicsPhone, setClinicsPhone] = useState("");
  const [clinicsName, setClinicsName] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((s) => { setClinicsPhone(s.clinic_phone || ""); setClinicsName(s.clinic_name || ""); }).catch(() => {});
  }, []);

  const loadSlots = useCallback(async (d: string) => {
    setLoadingSlots(true); setTime("");
    try { const res = await fetch(`/api/available-slots?date=${d}`); const data = await res.json(); setSlots(data.slots || []); } catch { setSlots([]); } finally { setLoadingSlots(false); }
  }, []);

  useEffect(() => { loadSlots(date); }, [date, loadSlots]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !time) { setStatus("error"); setMessage(lang === "ar" ? "يرجى تعبئة كل البيانات" : "Please fill all fields"); return; }
    setStatus("loading");
    const res = await fetch("/api/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, time, name, phone, reason }) });
    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setMessage(`${data.appointment?.time || time} — ${lang === "ar" ? "تم تأكيد حجزك بنجاح" : "Booking confirmed"}`);
      setLastBooking({ name, date, time: String(data.appointment?.time || time).slice(0, 5) });
      setName(""); setPhone(""); setReason(""); loadSlots(date);
    } else { setStatus("error"); setMessage(data.error || "Error"); }
  }

  const waText = encodeURIComponent(
    lang === "ar"
      ? `مرحباً، أنا ${lastBooking?.name || name}.\nأؤكد حجزي في ${clinicsName} بتاريخ ${lastBooking?.date || date} الساعة ${lastBooking?.time || time}.`
      : `Hello, I'm ${lastBooking?.name || name}.\nConfirming my booking at ${clinicsName} on ${lastBooking?.date || date} at ${lastBooking?.time || time}.`
  );

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-c-muted">{t.booking.date}</label>
          <input type="date" className="form-input" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-c-muted">{t.booking.time}</label>
          {loadingSlots ? (
            <div className="form-input text-c-muted">{t.common.loading}</div>
          ) : slots.length === 0 ? (
            <div className="form-input text-c-muted">{t.booking.noSlots}</div>
          ) : (
            <select className="form-input" value={time} onChange={(e) => setTime(e.target.value)} disabled={slots.length === 0}>
              <option value="">— Select —</option>
              {slots.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-c-muted">{t.booking.name}</label>
          <input className="form-input" placeholder={lang === "ar" ? "أحمد محمد" : "John Doe"} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-c-muted">{t.booking.phone}</label>
          <input className="form-input" placeholder="07XXXXXXXX" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-c-muted">{t.booking.reason}</label>
        <input className="form-input" placeholder={lang === "ar" ? "ألم في الأسنان" : "Tooth pain"} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>

      {status === "success" && lastBooking && (
        <div className="space-y-3 border border-c-success/30 bg-c-success/10 p-4">
          <div className="text-c-success">✓ {message}</div>
          <div className="text-sm text-c-light">{lastBooking.name} · {lastBooking.date} · {lastBooking.time}</div>
          {clinicsPhone && (
            <a href={`https://wa.me/${clinicsPhone}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center gap-2 !py-2 text-xs">
              {lang === "ar" ? "تأكيد عبر واتساب" : "Confirm via WhatsApp"}
            </a>
          )}
        </div>
      )}
      {status === "error" && message && (
        <div className="border border-c-danger/30 bg-c-danger/10 p-4 text-c-danger">{message}</div>
      )}

      <button type="submit" className="btn-primary w-full" disabled={status === "loading"}>
        {status === "loading" ? t.common.loading : t.booking.confirm}
      </button>

      {slots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {slots.slice(0, 8).map((s) => (
            <button key={s} type="button" onClick={() => setTime(s)} className={`tag ${time === s ? "!border-c-accent !text-c-accent !bg-c-accent/10" : ""}`}>
              {s}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}