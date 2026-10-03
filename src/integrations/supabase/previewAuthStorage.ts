// Simple localStorage adapter — no preview-broker needed outside Lovable.
export function brokeredPreviewStorage() {
  if (typeof window === "undefined") return undefined;
  return localStorage;
}
