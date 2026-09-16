"use client";

type InvoiceFormProps = {
  patients: { id: string; name: string; phone: string }[];
  onSaved?: () => void;
};

import { useState } from "react";

export default function InvoiceForm({ patients, onSaved }: InvoiceFormProps) {
  const [patientId, setPatientId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("نقدي");
  const [paid, setPaid] = useState(true);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit() {
    if (!patientId || !amount) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          amount: Number(amount),
          paid,
          payment_method: method,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || "خطأ"); return; }
      setMsg("تم إنشاء الفاتورة");
      setPatientId("");
      setAmount("");
      setNotes("");
      onSaved?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-5 items-end">
      <select className="form-input" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
        <option value="">اختر المريض *</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>{p.name} — {p.phone}</option>
        ))}
      </select>
      <input className="form-input" type="number" placeholder="المبلغ *" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <select className="form-input" value={method} onChange={(e) => setMethod(e.target.value)}>
        <option value="نقدي">نقدي</option>
        <option value="تحويل">تحويل بنكي</option>
        <option value="بطاقة">بطاقة</option>
      </select>
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="accent-emerald-500" />
        مدفوع
      </label>
      <button onClick={submit} disabled={loading || !patientId || !amount} className="btn-primary disabled:opacity-40">
        {loading ? "..." : "🧾 إنشاء"}
      </button>
      {msg && <span className="text-xs text-emerald-400">{msg}</span>}
    </div>
  );
}