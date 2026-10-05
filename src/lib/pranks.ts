export type HistoryEntry = {
  id: string;
  prompt: string;
  url: string;
  rating: number;
  social: string;
  note: string;
};

export const RATINGS_KEY = "giddygen-ratings";
export const HISTORY_KEY = "giddygen-history";

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 50)));
  } catch {
    /* ignore */
  }
}

export function shareLinkFor(prompt: string, url: string, caption?: string, prankId?: string) {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams({ p: prompt, g: url });
  if (caption) params.set("c", caption);
  if (prankId) params.set("i", prankId);
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
