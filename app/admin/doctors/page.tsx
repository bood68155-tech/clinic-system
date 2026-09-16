"use client";

import { useEffect, useState } from "react";

type Doctor = { id: string; name: string; specialty: string; phone: string; is_active: boolean };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/doctors");
    setDoctors(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addDoctor() {
    if (!name.trim()) return;
    setMsg("");
    const res = await fetch("/api/admin/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, specialty, phone }),
    });
    if (!res.ok) { setMsg("خطأ"); return; }
    setName(""); setSpecialty(""); setPhone("");
    setMsg("تمت الاضافة");
    load();
  }

  async function removeDoctor(id: string) {
    if (!confirm("هل انت متأكد من حذف هذا الطبيب؟")) return;
    await fetch("/api/admin/doctors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">اضافة طبيب</h2>
        <div className="card">
          <div className="grid gap-3 md:grid-cols-4 items-end">
            <input className="form-input" placeholder="اسم الطبيب *" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="form-input" placeholder="التخصص" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
            <input className="form-input" placeholder="الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
            <div className="flex gap-2">
              <button onClick={addDoctor} disabled={!name.trim()} className="btn-primary disabled:opacity-40">
                اضافة
              </button>
              {msg && <span className="text-emerald-400 text-sm self-center">{msg}</span>}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">قائمة الاطباء ({doctors.length})</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="pb-3 font-medium">الاسم</th>
                <th className="pb-3 font-medium">التخصص</th>
                <th className="pb-3 font-medium">الهاتف</th>
                <th className="pb-3 font-medium">الحالة</th>
                <th className="pb-3 font-medium">اجراء</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id} className="border-b border-white/5">
                  <td className="py-3 text-white font-medium">{d.name}</td>
                  <td className="py-3 text-clinic-accent">{d.specialty || "—"}</td>
                  <td className="py-3 text-white/70" dir="ltr">{d.phone || "—"}</td>
                  <td className="py-3">
                    <span className={d.is_active ? "text-emerald-400" : "text-red-400"}>
                      {d.is_active ? "نشط" : "معطل"}
                    </span>
                  </td>
                  <td className="py-3">
                    <button onClick={() => removeDoctor(d.id)} className="text-red-400 hover:text-red-300 text-xs">حذف</button>
                  </td>
                </tr>
              ))}
              {!doctors.length && !loading && (
                <tr><td colSpan={5} className="py-6 text-center text-white/40">لا اطباء مسجلين</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}