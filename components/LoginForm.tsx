"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setError(data.error || "خطأ في الدخول");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card relative z-10 w-full max-w-sm space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-clinic-accent text-2xl text-clinic-dark">
          🔒
        </div>
        <h1 className="text-2xl font-bold text-white">لوحة تحكم الطبيب</h1>
        <p className="mt-1 text-sm text-white/50">أدخل كلمة السر للمتابعة</p>
      </div>

      <input
        type="password"
        className="input"
        dir="ltr"
        placeholder="كلمة السر"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          ⚠️ {error}
        </div>
      )}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "جاري الدخول..." : "دخول"}
      </button>
    </form>
  );
}