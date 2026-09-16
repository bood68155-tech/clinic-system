"use client";

import { useState } from "react";

export default function InvoiceForm({ patients, onSaved }: { patients: { id: string; name: string; phone: string }[]; onSaved?: () => void }) {
  const [patientId, setPatientId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
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
        body: JSON.stringify({ patient_id: patientId, amount: Number(amount), paid, payment_method: method, notes }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || "Error"); return; }
      setMsg("Invoice created");
      setPatientId(""); setAmount(""); setNotes("");
      onSaved?.();
    } finally { setLoading(false); }
  }

  return (
    <div className="grid gap-3 md:grid-cols-5 items-end">
      <select className="form-input" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
        <option value="">Select Patient *</option>
        {patients.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.phone}</option>)}
      </select>
      <input className="form-input" type="number" placeholder="Amount *" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <select className="form-input" value={method} onChange={(e) => setMethod(e.target.value)}>
        <option value="Cash">Cash</option>
        <option value="Transfer">Bank Transfer</option>
        <option value="Card">Card</option>
      </select>
      <label className="flex items-center gap-2 text-sm text-c-muted">
        <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="accent-c-success" />
        Paid
      </label>
      <button onClick={submit} disabled={loading || !patientId || !amount} className="btn-primary disabled:opacity-40">
        {loading ? "..." : "Create"}
      </button>
      {msg && <span className="text-xs text-c-success">{msg}</span>}
    </div>
  );
}