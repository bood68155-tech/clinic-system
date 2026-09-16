"use client";

import { useState } from "react";

type Prescription = { medication: string; dosage: string; frequency: string; duration: string; instructions: string };

export default function VisitForm({ doctors, onSaved }: { doctors: { id: string; name: string; specialty: string }[]; onSaved?: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [rx, setRx] = useState<Prescription[]>([{ medication: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function setR(i: number, k: keyof Prescription, v: string) {
    setRx((r) => r.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)));
  }

  async function submit() {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: name,
          patient_phone: phone,
          visit_date: date,
          diagnosis,
          symptoms,
          notes,
          follow_up_date: followUp || null,
          prescriptions: rx.filter((p) => p.medication.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || "Error"); return; }
      setMsg("Saved successfully");
      setName(""); setPhone(""); setDiagnosis(""); setSymptoms(""); setNotes(""); setFollowUp("");
      setRx([{ medication: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
      onSaved?.();
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <input className="form-input" placeholder="Patient Name *" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="form-input" placeholder="Phone *" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
        <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="date" className="form-input" placeholder="Follow-up" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
      </div>
      <textarea className="form-input h-20" placeholder="Symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
      <textarea className="form-input h-20" placeholder="Diagnosis *" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
      <textarea className="form-input h-16" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-c-accent">Prescription</h3>
          <button type="button" onClick={() => setRx([...rx, { medication: "", dosage: "", frequency: "", duration: "", instructions: "" }])} className="btn-secondary !py-1 !px-3 !text-xs">
            + Add Medicine
          </button>
        </div>
        <div className="space-y-2">
          {rx.map((p, i) => (
            <div key={i} className="grid gap-2 border border-c-border bg-c-surface p-3 md:grid-cols-5">
              <input className="form-input text-sm" placeholder="Medication *" value={p.medication} onChange={(e) => setR(i, "medication", e.target.value)} />
              <input className="form-input text-sm" placeholder="Dosage" value={p.dosage} onChange={(e) => setR(i, "dosage", e.target.value)} />
              <input className="form-input text-sm" placeholder="Frequency" value={p.frequency} onChange={(e) => setR(i, "frequency", e.target.value)} />
              <input className="form-input text-sm" placeholder="Duration" value={p.duration} onChange={(e) => setR(i, "duration", e.target.value)} />
              <div className="flex gap-1">
                <input className="form-input flex-1 text-sm" placeholder="Notes" value={p.instructions} onChange={(e) => setR(i, "instructions", e.target.value)} />
                {rx.length > 1 && <button type="button" onClick={() => setRx(rx.filter((_, idx) => idx !== i))} className="px-2 text-c-danger">✕</button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={loading || !name || !phone || !diagnosis} className="btn-primary disabled:opacity-40">
          {loading ? "Saving..." : "Save Visit & Prescription"}
        </button>
        {msg && <span className={msg.includes("Error") || msg.includes("error") ? "text-c-danger text-sm" : "text-c-success text-sm"}>{msg}</span>}
      </div>
    </div>
  );
}