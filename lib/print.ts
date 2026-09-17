// The dashboard is a dark theme, so window.print() on the page would produce
// light text on white paper. This opens a clean print document instead.

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function printText(title: string, text: string): void {
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank", "width=860,height=920");
  if (!win) return;
  const body = escapeHtml(text);
  win.document.write(`<!doctype html><html dir="auto"><head><meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: "Segoe UI", Tahoma, "Noto Sans Arabic", sans-serif; padding: 32px; color: #111; }
  h1 { font-size: 18px; margin: 0 0 18px; padding-bottom: 10px; border-bottom: 2px solid #111; letter-spacing: 0.02em; }
  pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.75; margin: 0; }
</style></head><body><h1>${escapeHtml(title)}</h1><pre>${body}</pre></body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}
