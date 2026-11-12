export type Placement = { x: number; y: number; size: number; rotation: number; flipped: boolean };
export type Sticker = Placement & { id: string; kind: "image" | "emoji"; content: string; name: string };
export type CharacterSettings = Placement & {
  enabled: boolean;
  image: string;
  shape: "circle" | "square" | "original";
  brightness: number;
  saturation: number;
  stickers: Sticker[];
};

export const CHARACTER_KEY = "giddygen-character-v2";
export const LEGACY_CHARACTER_KEY = "giddygen-character";
export const CHARACTER_EVENT = "giddygen-character-change";
export const DEFAULT_CHARACTER: CharacterSettings = {
  enabled: false, image: "", x: 50, y: 20, size: 22, rotation: 0, flipped: false,
  shape: "circle", brightness: 100, saturation: 100, stickers: [],
};

function bounded(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function placement(saved: Partial<Placement>): Placement {
  return {
    x: bounded(saved.x, 50, 0, 100), y: bounded(saved.y, 20, 0, 100),
    size: bounded(saved.size, 22, 5, 100), rotation: bounded(saved.rotation, 0, -180, 180),
    flipped: saved.flipped === true,
  };
}

function isImage(value: unknown): value is string {
  return typeof value === "string" && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
}

export function normalizeCharacter(value: unknown): CharacterSettings {
  if (!value || typeof value !== "object") return { ...DEFAULT_CHARACTER, stickers: [] };
  const saved = value as Partial<CharacterSettings>;
  const stickers: Sticker[] = Array.isArray(saved.stickers) ? saved.stickers.flatMap((sticker) => {
    if (!sticker || typeof sticker !== "object" || typeof sticker.id !== "string") return [];
    if (sticker.kind === "image" ? !isImage(sticker.content) : sticker.kind !== "emoji" || typeof sticker.content !== "string" || !sticker.content.trim()) return [];
    return [{ ...placement(sticker), id: sticker.id, kind: sticker.kind, content: sticker.content, name: typeof sticker.name === "string" ? sticker.name : "Sticker" }];
  }) : [];
  return {
    ...placement(saved), enabled: saved.enabled === true, image: isImage(saved.image) ? saved.image : "",
    shape: saved.shape === "square" || saved.shape === "original" ? saved.shape : "circle",
    brightness: bounded(saved.brightness, 100, 25, 175), saturation: bounded(saved.saturation, 100, 0, 200), stickers,
  };
}

export function loadCharacter(): CharacterSettings {
  if (typeof window === "undefined") return normalizeCharacter(null);
  try {
    const raw = window.localStorage.getItem(CHARACTER_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return saved.version === 2 ? normalizeCharacter(saved.character) : normalizeCharacter(null);
    }
    const legacy = window.localStorage.getItem(LEGACY_CHARACTER_KEY);
    const character = normalizeCharacter(legacy ? JSON.parse(legacy) : null);
    if (legacy) saveCharacter(character);
    return character;
  } catch {
    return normalizeCharacter(null);
  }
}

export function saveCharacter(settings: CharacterSettings): boolean {
  if (typeof window === "undefined") return false;
  try {
    const character = normalizeCharacter(settings);
    window.localStorage.setItem(CHARACTER_KEY, JSON.stringify({ version: 2, character }));
    window.dispatchEvent(new CustomEvent(CHARACTER_EVENT, { detail: character }));
    return true;
  } catch {
    return false;
  }
}

export async function preparePortrait(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) throw new Error("That file isn’t a supported image. Choose a JPG, PNG, WebP, or GIF.");
  if (file.size > 10 * 1024 * 1024) throw new Error("That image is too large. Choose one smaller than 10 MB.");
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("That image could not be read. Try another image."));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const next = new Image();
    next.onload = () => resolve(next);
    next.onerror = () => reject(new Error("That image could not be opened. Try another image."));
    next.src = source;
  });
  // Preserve animated uploads instead of flattening them to a canvas frame.
  if (file.type === "image/gif" || file.type === "image/webp") return source;
  const scale = Math.min(1, 640 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the image. Try a different browser.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", 0.85);
}
