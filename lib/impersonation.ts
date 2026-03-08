/**
 * Client-side impersonation state.
 * Set when admin starts impersonating; cleared when they exit.
 */

const KEY = "impersonation";
const LABEL_KEY = "impersonation_label";

export function setImpersonation(label?: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, "1");
    if (label) sessionStorage.setItem(LABEL_KEY, label);
  } catch {
    // ignore
  }
}

function clearImpersonation(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(LABEL_KEY);
  } catch {
    // ignore
  }
}

function getImpersonationLabel(): string | null {
  if (typeof window === "undefined") return null;
  try {
    if (sessionStorage.getItem(KEY) !== "1") return null;
    return sessionStorage.getItem(LABEL_KEY);
  } catch {
    return null;
  }
}

function isImpersonating(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
