"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ClinicSettings } from "@/lib/settings";
import { useLang } from "@/lib/translations/context";

export default function SettingsForm({ initial }: { initial: ClinicSettings }) {
  const { t, lang } = useLang();
  const [name, setName] = useState(initial.clinic_name);
  const [phone, setPhone] = useState(initial.clinic_phone);
  const [address, setAddress] = useState(initial.clinic_address);
  const [logo, setLogo] = useState(initial.clinic_logo);
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `clinic-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("clinic-images").upload(path, file, { contentType: file.type });
    if (error) setStatus("error");
    else { const { data } = supabase.storage.from("clinic-images").getPublicUrl(path); setLogo(data.publicUrl); setStatus("idle"); }
    setUploading(false);
  }

  function handleUrlApply() {
    const trimmed = logoUrlInput.trim();
    if (trimmed) {
      setLogo(trimmed);
      setLogoUrlInput("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setStatus("idle");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinic_name: name, clinic_phone: phone, clinic_address: address, clinic_logo: logo }),
    });
    setSaving(false); setStatus(res.ok ? "success" : "error");
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-c-muted">{t.settings.clinicLogo}</label>
        <div className="flex flex-wrap items-center gap-4">
          {logo ? (
            <img src={logo} alt="logo" className="h-20 w-20 border border-c-border bg-c-surface object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center border border-dashed border-c-border text-c-muted">◈</div>
          )}
          <div className="flex-1 space-y-3">
            <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-c-muted file:mr-3 file:border file:border-c-accent file:bg-c-accent file:px-4 file:py-2 file:font-bold file:text-c-bg" />
            <div className="flex gap-2">
              <input
                type="url"
                placeholder={lang === "ar" ? "أو الصق رابط الصورة هنا..." : "Or paste image URL here..."}
                value={logoUrlInput}
                onChange={(e) => setLogoUrlInput(e.target.value)}
                className="form-input !py-2 !text-xs flex-1"
              />
              <button type="button" onClick={handleUrlApply} className="btn-secondary !px-4 !py-2 !text-xs whitespace-nowrap">
                {lang === "ar" ? "تطبيق" : "Apply"}
              </button>
            </div>
          </div>
        </div>
        {uploading && <p className="mt-2 text-sm text-c-muted">Uploading...</p>}
        {logo && (
          <button type="button" onClick={() => setLogo("")} className="mt-2 text-xs text-c-danger hover:underline">
            {lang === "ar" ? "إزالة الشعار" : "Remove logo"}
          </button>
        )}
      </div>
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-c-muted">{t.settings.clinicName}</label>
        <input className="form-input" placeholder={lang === "ar" ? "عيادة الأمل" : "Hope Clinic"} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-c-muted">{t.settings.clinicPhone}</label>
        <input className="form-input" dir="ltr" placeholder="9627XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-c-muted">{t.settings.clinicAddress}</label>
        <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      {status === "success" && <div className="border border-c-success/30 bg-c-success/10 p-4 text-sm text-c-success">✓ {t.common.saved}</div>}
      {status === "error" && <div className="border border-c-danger/30 bg-c-danger/10 p-4 text-sm text-c-danger">{t.common.error}</div>}
      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? t.common.loading : t.settings.save}
      </button>
    </form>
  );
}
