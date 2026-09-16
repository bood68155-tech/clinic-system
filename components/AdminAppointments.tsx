"use client";

import { useState } from "react";

type Appointment = {
  id: string;
  date: string;
  time: string;
  reason: string;
  status: "booked" | "completed" | "cancelled";
  patients?: { name: string; phone: string } | { name: string; phone: string }[] | null;
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  booked: { label: "محجوز", cls: "border-sky-500/40 bg-sky-500/10 text-sky-300" },
  completed: { label: "مكتمل", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
  cancelled: { label: "ملغي", cls: "border-red-500/40 bg-red-500/10 text-red-300" },
};

export default function AdminAppointments({
  appointments,
  today,
}: {
  appointments: Appointment[];
  today: string;
}) {
  const [list, setList] = useState(appointments);

  async function updateStatus(id: string, status: string) {
    const prev = list;
    setList((l) => l.map((a) => (a.id === id ? { ...a, status: status as Appointment["status"] } : a)));
    const res = await fetch("/api/admin/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) setList(prev);
  }

  if (!list.length) {
    return <div className="card text-center text-white/40">لا مواعيد للعرض</div>;
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/50">
            <th className="pb-3 font-medium">التاريخ</th>
            <th className="pb-3 font-medium">الوقت</th>
            <th className="pb-3 font-medium">المريض</th>
            <th className="pb-3 font-medium">الهاتف</th>
            <th className="pb-3 font-medium">السبب</th>
            <th className="pb-3 font-medium">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {list.map((a) => {
            const st = STATUS_LABEL[a.status] || STATUS_LABEL.booked;
            return (
              <tr key={a.id} className="border-b border-white/5">
                <td className="py-3 text-white/70">{a.date}</td>
                <td className="py-3 font-semibold text-white">{a.time}</td>
                <td className="py-3 text-white">{Array.isArray(a.patients) ? a.patients[0]?.name || "—" : a.patients?.name || "—"}</td>
                <td className="py-3 text-white/70" dir="ltr">{Array.isArray(a.patients) ? a.patients[0]?.phone || "—" : a.patients?.phone || "—"}</td>
                <td className="py-3 text-white/50">{a.reason || "—"}</td>
                <td className="py-3">
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus(a.id, e.target.value)}
                    className={`cursor-pointer rounded-lg border px-2 py-1 text-xs ${st.cls}`}
                  >
                    <option value="booked">محجوز</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}