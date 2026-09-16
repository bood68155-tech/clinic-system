"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ClinicSettings } from "@/lib/settings";

export default function SettingsForm({ initial }: { initial: ClinicSettings }) {
  const [name, setName] = useState(initial.clinic_name);
  const [phone, setPhone] = useState(initial.clinic_phone);
  const [address, setAddress] = useState(initial.clinic_address);
  const [logo, setLogo] = useState(initial.clinic_logo);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `clinic-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("clinic-images")
      .upload(path, file, { contentType: file.type });
    if (error) {
      setStatus("error");
    } else {
      const { data } = supabase.storage.from("clinic-images").getPublicUrl(path);
      setLogo(data.publicUrl);
      setStatus("idle");
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinic_name: name, clinic_phone: phone, clinic_address: address, clinic_logo: logo }),
    });
    setSaving(false);
    setStatus(res.ok ? "success" : "error");
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">شعار / صورة العيادة</label>
        <div className="flex flex-wrap items-center gap-4">
          {logo ? (
            <img
              src={logo}
              alt="شعار العيادة"
              className="h-20 w-20 rounded-xl border border-white/15 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-white/20 text-white/40">
              🖼️
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="block w-full text-sm text-white/60 file:mr-3 file:rounded-lg file:border-none file:bg-clinic-accent file:px-4 file:py-2 file:text-clinic-dark"
            />
            <p className="mt-1 text-xs text-white/40">تظهر في ترويسة الموقع وصفحة الرئيسية</p>
          </div>
        </div>
        {uploading && <p className="mt-2 text-sm text-white/50">جاري رفع الصورة...</p>}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">اسم العيادة</label>
        <input
          className="input"
          placeholder="مثال: عيادة الأمل"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-white/40">يظهر في الترويسة وفي الردود التلقائية للوكيل الذكي</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">رقم واتساب العيادة</label>
        <input
          className="input"
          dir="ltr"
          placeholder="9627XXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <p className="mt-1 text-xs text-white/40">بالصيغة الدولية بدون + (مثال: 96279...) — يفعّل زر تأكيد واتساب للمريض</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">عنوان العيادة</label>
        <input
          className="input"
          placeholder="مثال: شارع المدينة، عمان"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {status === "success" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          ✅ تم حفظ الإعدادات بنجاح
        </div>
      )}
      {status === "error" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          ⚠️ حدث خطأ في الحفظ
        </div>
      )}

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </button>
    </form>
  );
}