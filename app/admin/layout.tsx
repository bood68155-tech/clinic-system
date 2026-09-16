import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="pointer-events-none fixed inset-0 opacity-40 glow-bg" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-lg font-bold text-white">🏥 لوحة التحكم</h1>
          <AdminSidebar />
        </div>
        {children}
      </div>
    </main>
  );
}