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

const STATUS: Record<string, { label: string; cls: string }> = {
  booked: { label: "BOOKED", cls: "tag-accent" },
  completed: { label: "DONE", cls: "tag-success" },
  cancelled: { label: "CANCEL", cls: "tag-danger" },
};

function getName(p: Appointment["patients"]): string {
  if (!p) return "—";
  return Array.isArray(p) ? p[0]?.name || "—" : p.name || "—";
}
function getPhone(p: Appointment["patients"]): string {
  if (!p) return "—";
  return Array.isArray(p) ? p[0]?.phone || "—" : p.phone || "—";
}

export default function AdminAppointments({ appointments, today }: { appointments: Appointment[]; today: string }) {
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
    return <div className="card text-center text-c-muted">No appointments</div>;
  }

  return (
    <div className="card overflow-x-auto !p-0">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-c-border bg-c-surface text-[10px] uppercase tracking-[0.2em] text-c-muted">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Patient</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Reason</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {list.map((a) => {
            const st = STATUS[a.status] || STATUS.booked;
            return (
              <tr key={a.id} className="border-b border-c-border/50 transition-colors hover:bg-c-surface/50">
                <td className="px-4 py-3 text-c-muted">{a.date}</td>
                <td className="px-4 py-3 font-bold text-c-white">{a.time}</td>
                <td className="px-4 py-3 text-c-light">{getName(a.patients)}</td>
                <td className="px-4 py-3 text-c-muted" dir="ltr">{getPhone(a.patients)}</td>
                <td className="px-4 py-3 text-c-muted">{a.reason || "—"}</td>
                <td className="px-4 py-3">
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus(a.id, e.target.value)}
                    className={`cursor-pointer border px-2 py-1 text-[10px] uppercase tracking-wider ${st.cls}`}
                  >
                    <option value="booked">Booked</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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