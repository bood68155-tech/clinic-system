"use client";

import AdminSidebar from "@/components/AdminSidebar";
import ToothIcon from "@/components/ToothIcon";
import { useClinicSettings } from "@/lib/use-clinic-settings";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { clinic_logo } = useClinicSettings();

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 opacity-40 glow-bg" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-c-border px-4 py-3">
          <div className="flex items-center gap-3">
            {clinic_logo ? (
              <img src={clinic_logo} alt="Clinic Logo" className="h-6 w-6 rounded-sm object-cover" />
            ) : (
              <ToothIcon className="h-6 w-6 text-c-accent" />
            )}
            <span className="text-sm font-black uppercase tracking-[0.15em] text-c-white">Dental Dashboard</span>
          </div>
          <AdminSidebar />
        </div>
        <div className="px-4 py-6 md:px-6">{children}</div>
      </div>
    </main>
  );
}
