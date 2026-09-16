"use client";

import { useState } from "react";

type VisitForm = {
  patient_name: string;
  patient_phone: string;
  visit_date: string;
  diagnosis: string;
  symptoms: string;
  notes: string;
  follow_up_date: string;
};

type Prescription = {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

export default function VisitForm({ doctors, onSaved }: { doctors: { id: string; name: string; specialty: string }[]; onSaved?: () => void }) {
  const [form, setForm] = useState<VisitForm>({
    patient_name: "",
    patient_phone: "",
    visit_date: new Date().toISOString().split("T")[0],
    diagnosis: "",
    symptoms: "",
    notes: "",
    follow_up_date: "",
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { medication: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function setF(k: keyof VisitForm, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function setRx(i: number, k: keyof Prescription, v: string) {
    setPrescriptions((rx) => rx.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)));
  }
  function addRx() {
    setPrescriptions((rx) => [...rx, { medication: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  }
  function removeRx(i: number) {
    setPrescriptions((rx) => rx.filter((_, idx) => idx !== i));
  }

  async function submit() {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: form.patient_name,
          patient_phone: form.patient_phone,
          visit_date: form.visit_date,
          diagnosis: form.diagnosis,
          symptoms: form.symptoms,
          notes: form.notes,
          follow_up_date: form.follow_up_date || null,
          prescriptions: prescriptions.filter((p) => p.medication.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || "خطأ"); return; }
      setMsg("تم الحفظ بنجاح");
      setForm({ patient_name: "", patient_phone: "", visit_date: new Date().toISOString().split("T")[0], diagnosis: "", symptoms: "", notes: "", follow_up_date: "" });
      setPrescriptions([{ medication: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
      onSaved?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input className="form-input" placeholder="اسم المريض *" value={form.patient_name} onChange={(e) => setF("patient_name", e.target.value)} />
        <input className="form-input" placeholder="رقم الهاتف *" value={form.patient_phone} onChange={(e) => setF("patient_phone", e.target.value)} dir="ltr" />
        <input type="date" className="form-input" value={form.visit_date} onChange={(e) => setF("visit_date", e.target.value)} />
        <input type="date" className="form-input" placeholder="موعد المتابعة" value={form.follow_up_date} onChange={(e) => setF("follow_up_date", e.target.value)} />
      </div>
      <textarea className="form-input h-20" placeholder="الأعراض" value={form.symptoms} onChange={(e) => setF("symptoms", e.target.value)} />
      <textarea className="form-input h-20" placeholder="التشخيص *" value={form.diagnosis} onChange={(e) => setF("diagnosis", e.target.value)} />
      <textarea className="form-input h-16" placeholder="ملاحظات" value={form.notes} onChange={(e) => setF("notes", e.target.value)} />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-white">💊 الوصفة الطبية</h3>
          <button type="button" onClick={addRx} className="btn-secondary !py-1 text-xs">+ دواء</button>
        </div>
        <div className="space-y-3">
          {prescriptions.map((rx, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-5 rounded-lg bg-white/5 p-3">
              <input className="form-input text-sm" placeholder="الدواء *" value={rx.medication} onChange={(e) => setRx(i, "medication", e.target.value)} />
              <input className="form-input text-sm" placeholder="الجرعة" value={rx.dosage} onChange={(e) => setRx(i, "dosage", e.target.value)} />
              <input className="form-input text-sm" placeholder="التكرار" value={rx.frequency} onChange={(e) => setRx(i, "frequency", e.target.value)} />
              <input className="form-input text-sm" placeholder="المدة" value={rx.duration} onChange={(e) => setRx(i, "duration", e.target.value)} />
              <div className="flex gap-1">
                <input className="form-input flex-1 text-sm" placeholder="ملاحظات" value={rx.instructions} onChange={(e) => setRx(i, "instructions", e.target.value)} />
                {prescriptions.length > 1 && (
                  <button type="button" onClick={() => removeRx(i)} className="text-red-400 px-2">✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={loading || !form.patient_name || !form.patient_phone || !form.diagnosis} className="btn-primary disabled:opacity-40">
          {loading ? "جاري الحفظ..." : "💾 حفظ الزيارة والوصفة"}
        </button>
        {msg && <span className={msg.includes("خطأ") ? "text-red-400 text-sm" : "text-emerald-400 text-sm"}>{msg}</span>}
      </div>
    </div>
  );
}