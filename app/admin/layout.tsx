import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 opacity-40 glow-bg" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-c-border px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center bg-c-accent text-[10px] font-black text-c-bg">+</span>
            <span className="text-sm font-black uppercase tracking-wider text-c-white">Dashboard</span>
          </div>
          <AdminSidebar />
        </div>
        <div className="px-4 py-6 md:px-6">{children}</div>
      </div>
    </main>
  );
}