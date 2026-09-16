"use client";

import { useCallback, useEffect, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function BookingForm() {
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
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        setClinicsPhone(s.clinic_phone || "");
        setClinicsName(s.clinic_name || "");
      })
      .catch(() => {});
  }, []);

  const loadSlots = useCallback(async (d: string) => {
    setLoadingSlots(true);
    setTime("");
    try {
      const res = await fetch(`/api/available-slots?date=${d}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    loadSlots(date);
  }, [date, loadSlots]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !time) {
      setStatus("error");
      setMessage("يرجى تعبئة الاسم ورقم الهاتف واختيار الموعد");
      return;
    }
    setStatus("loading");
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time, name, phone, reason }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setMessage(`${data.appointment?.time || time} — تم تأكيد حجزك بنجاح، سنتصلك للتأكيد.`);
      setLastBooking({ name, date, time: String(data.appointment?.time || time).slice(0, 5) });
      setName("");
      setPhone("");
      setReason("");
      loadSlots(date);
    } else {
      setStatus("error");
      setMessage(data.error || "حدث خطأ، حاول مرة أخرى");
    }
  }

  const waText = encodeURIComponent(
    `مرحباً، أنا ${lastBooking?.name || name || "مريض"}.\nأؤكد حجزي في ${clinicsName} بتاريخ ${lastBooking?.date || date} الساعة ${lastBooking?.time || time}.`
  );

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">التاريخ</label>
          <input
            type="date"
            className="input"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">الموعد المتاح</label>
          {loadingSlots ? (
            <div className="input flex items-center text-white/50">جاري التحميل...</div>
          ) : slots.length === 0 ? (
            <div className="input flex items-center text-white/50">لا مواعيد متاحة في هذا اليوم</div>
          ) : (
            <select className="input" value={time} onChange={(e) => setTime(e.target.value)} disabled={slots.length === 0}>
              <option value="">— اختر الموعد —</option>
              {slots.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">الاسم الكامل</label>
          <input
            className="input"
            placeholder="مثال: أحمد محمد"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">رقم الهاتف</label>
          <input
            className="input"
            placeholder="07XXXXXXXX"
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">سبب الزيارة (اختياري)</label>
        <input
          className="input"
          placeholder="مثال: ألم في الأسنان"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      {status === "success" && lastBooking && (
        <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="text-emerald-300">✅ {message}</div>
          <div className="text-sm text-white/80">
            <span className="text-white/50">المريض:</span> {lastBooking.name} · <span className="text-white/50">التاريخ:</span> {lastBooking.date} · <span className="text-white/50">الوقت:</span> {lastBooking.time}
          </div>
          {clinicsPhone && (
            <a
              href={`https://wa.me/${clinicsPhone}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2 !py-2 text-sm"
            >
              <span className="text-lg">💬</span> تأكيد الحجز عبر واتساب
            </a>
          )}
        </div>
      )}
      {status === "error" && message && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          ⚠️ {message}
        </div>
      )}

      <button type="submit" className="btn-primary w-full" disabled={status === "loading"}>
        {status === "loading" ? "جاري الحجز..." : "تأكيد الحجز"}
      </button>

      {slots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {slots.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTime(s)}
              className={`chip ${time === s ? "!border-clinic-accent !text-clinic-accent" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}