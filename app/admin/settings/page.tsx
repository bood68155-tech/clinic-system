import Link from "next/link";
import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <main className="relative min-h-screen px-6 py-8">
      <div className="pointer-events-none fixed inset-0 glow-bg" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-[0.15em] text-c-white">Clinic Settings</h1>
            <p className="mt-1 text-sm text-c-muted">Shown to patients on the website and in confirmations</p>
          </div>
          <Link href="/admin" className="btn-secondary !py-2 !text-xs">← Admin</Link>
        </div>
        <SettingsForm initial={s} />
      </div>
    </main>
  );
}