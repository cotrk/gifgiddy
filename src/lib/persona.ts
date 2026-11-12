export type Persona = { bio: string; instagram: string; tiktok: string; youtube: string };
export const PERSONA_KEY = "giddygen-persona-v1";
export const DEFAULT_PERSONA: Persona = {
  bio: "You ask for a masterpiece. I bring the footwork. Born in a loading bar, raised in the Gallery of Shame. Every request is just another excuse to dance.",
  instagram: "",
  tiktok: "",
  youtube: "",
};

const SOCIAL_HOSTS = {
  instagram: ["instagram.com", "www.instagram.com"],
  tiktok: ["tiktok.com", "www.tiktok.com"],
  youtube: ["youtube.com", "www.youtube.com", "youtu.be"],
} as const;

export function validSocialUrl(platform: keyof typeof SOCIAL_HOSTS, value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && SOCIAL_HOSTS[platform].some((host) => host === url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function loadPersona(): Persona {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PERSONA_KEY) ?? "null");
    if (stored?.version !== 1) return DEFAULT_PERSONA;
    const result = { ...DEFAULT_PERSONA };
    if (typeof stored.bio === "string") result.bio = stored.bio.slice(0, 500);
    for (const platform of ["instagram", "tiktok", "youtube"] as const) {
      if (typeof stored[platform] === "string" && validSocialUrl(platform, stored[platform])) result[platform] = stored[platform];
    }
    return result;
  } catch {
    return DEFAULT_PERSONA;
  }
}

export function savePersona(persona: Persona): boolean {
  try {
    window.localStorage.setItem(PERSONA_KEY, JSON.stringify({ version: 1, ...persona }));
    return true;
  } catch {
    return false;
  }
}