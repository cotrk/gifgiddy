export const DANCE_SEARCHES = [
  "griddy dance",
  "justin jefferson griddy",
  "griddy fortnite",
  "dame hombro dance",
  "bow bow bow dance",
  "zany fortnite dance",
  "wednesday dance",
] as const;

export const DANCE_USAGE_KEY = "giddygen-dance-usage-v1";

export function danceIdentity(value: string): string {
  try {
    const url = new URL(value, "https://local.invalid");
    return `${url.host}${url.pathname}`;
  } catch {
    return value;
  }
}

export function uniqueDances(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls.filter((url) => {
    const id = danceIdentity(url);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function nextUnusedDance(urls: string[], used: string[], random = Math.random): string | null {
  const seen = new Set(used.map(danceIdentity));
  const fresh = uniqueDances(urls).filter((url) => !seen.has(danceIdentity(url)));
  if (!fresh.length) return null;
  return fresh[Math.min(fresh.length - 1, Math.floor(random() * fresh.length))] ?? null;
}

export function loadUsedDances(historyUrls: string[] = []): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(DANCE_USAGE_KEY) ?? "null");
    const saved = parsed && typeof parsed === "object" && "version" in parsed && parsed.version === 1 && "urls" in parsed && Array.isArray(parsed.urls)
      ? parsed.urls.filter((url): url is string => typeof url === "string") : [];
    return uniqueDances([...saved, ...historyUrls]);
  } catch {
    return uniqueDances(historyUrls);
  }
}

export function saveUsedDances(urls: string[]): boolean {
  try {
    window.localStorage.setItem(DANCE_USAGE_KEY, JSON.stringify({ version: 1, urls: uniqueDances(urls) }));
    return true;
  } catch {
    return false;
  }
}