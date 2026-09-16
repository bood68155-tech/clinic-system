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
    if (res.ok) { router.replace("/admin"); router.refresh(); }
    else { setError(data.error || "Invalid password"); setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-sm border border-c-border bg-c-card p-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-c-accent text-xl font-black text-c-bg">+</div>
        <h1 className="text-lg font-black uppercase tracking-[0.2em] text-c-white">Doctor Panel</h1>
        <p className="mt-1 text-xs uppercase tracking-wider text-c-muted">Enter password to continue</p>
      </div>
      <input
        type="password"
        className="form-input mt-6"
        dir="ltr"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <div className="mt-3 border border-c-danger/30 bg-c-danger/10 p-3 text-sm text-c-danger">{error}</div>}
      <button type="submit" className="btn-primary mt-4 w-full" disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </button>
    </form>
  );
}