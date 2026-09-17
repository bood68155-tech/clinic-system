/** Client-safe unique id (crypto.randomUUID when available). */
export function newId(): string {
  const cryptoObj = typeof globalThis !== "undefined" ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
