"use client";

import { useEffect, useState } from "react";

type Doctor = { id: string; name: string; specialty: string; phone: string; is_active: boolean };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() { setLoading(true); const res = await fetch("/api/admin/doctors"); setDoctors(await res.json()); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function addDoctor() {
    if (!name.trim()) return;
    await fetch("/api/admin/doctors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, specialty, phone }) });
    setName(""); setSpecialty(""); setPhone(""); load();
  }

  async function removeDoctor(id: string) {
    if (!confirm("Delete this doctor?")) return;
    await fetch("/api/admin/doctors", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="section-title">Add Doctor</h2>
        <div className="card">
          <div className="grid gap-3 md:grid-cols-4 items-end">
            <input className="form-input" placeholder="Doctor Name *" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="form-input" placeholder="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
            <input className="form-input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
            <button onClick={addDoctor} disabled={!name.trim()} className="btn-primary disabled:opacity-40">Add</button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-title">Doctors ({doctors.length})</h2>
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-c-border bg-c-surface text-[10px] uppercase tracking-[0.2em] text-c-muted">
                <th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Specialty</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id} className="border-b border-c-border/50 transition-colors hover:bg-c-surface/50">
                  <td className="px-4 py-3 font-bold text-c-white">{d.name}</td>
                  <td className="px-4 py-3 text-c-accent">{d.specialty || "—"}</td>
                  <td className="px-4 py-3 text-c-muted" dir="ltr">{d.phone || "—"}</td>
                  <td className="px-4 py-3"><span className={d.is_active ? "tag-success" : "tag-danger"}>{d.is_active ? "ACTIVE" : "OFF"}</span></td>
                  <td className="px-4 py-3"><button onClick={() => removeDoctor(d.id)} className="text-xs uppercase tracking-wider text-c-danger hover:text-red-300">Delete</button></td>
                </tr>
              ))}
              {!doctors.length && !loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-c-muted">No doctors</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}