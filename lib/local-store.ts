// Lightweight localStorage wrapper used as a graceful fallback when the
// clinical tables have not been migrated yet (or Supabase is unreachable).
// Every clinical feature keeps working locally so the dentist is never blocked.

const PREFIX = "clinic-clinical:";

export function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled (private mode) - ignore silently.
  }
}
