const REACTIONS_KEY = "giddygen-reactions";

function loadAll(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(REACTIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function reactionKey(prompt: string, url: string, prankId?: string) {
  if (prankId) return prankId;
  let hash = 2166136261;
  const value = `${prompt}\u0000${url}`;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `shared-${(hash >>> 0).toString(36)}`;
}

export function loadReaction(key: string) {
  return loadAll()[key] ?? "";
}

export function saveReaction(key: string, comment: string) {
  try {
    const next = loadAll();
    next[key] = comment;
    window.localStorage.setItem(REACTIONS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
