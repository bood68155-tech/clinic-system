import Link from "next/link";
import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <main className="relative min-h-screen px-6 py-8">
      <div className="pointer-events-none fixed inset-0 opacity-40 glow-bg" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">إعدادات العيادة</h1>
            <p className="mt-1 text-white/50">تظهر هذه البيانات للعملاء في الموقع ورسائل التأكيد</p>
          </div>
          <Link href="/admin" className="btn-secondary !py-2 text-sm">← لوحة التحكم</Link>
        </div>
        <SettingsForm initial={s} />
      </div>
    </main>
  );
}