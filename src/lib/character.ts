export type CharacterSettings = {
  enabled: boolean;
  image: string;
  x: number;
  y: number;
  size: number;
};

export const CHARACTER_KEY = "giddygen-character";
export const CHARACTER_EVENT = "giddygen-character-change";

export const DEFAULT_CHARACTER: CharacterSettings = {
  enabled: false,
  image: "",
  x: 50,
  y: 20,
  size: 22,
};

export function loadCharacter(): CharacterSettings {
  if (typeof window === "undefined") return DEFAULT_CHARACTER;
  try {
    const raw = window.localStorage.getItem(CHARACTER_KEY);
    if (!raw) return DEFAULT_CHARACTER;
    const saved = JSON.parse(raw) as Partial<CharacterSettings>;
    return {
      enabled: Boolean(saved.enabled),
      image: typeof saved.image === "string" ? saved.image : "",
      x: typeof saved.x === "number" ? saved.x : DEFAULT_CHARACTER.x,
      y: typeof saved.y === "number" ? saved.y : DEFAULT_CHARACTER.y,
      size: typeof saved.size === "number" ? saved.size : DEFAULT_CHARACTER.size,
    };
  } catch {
    return DEFAULT_CHARACTER;
  }
}

export function saveCharacter(settings: CharacterSettings) {
  try {
    window.localStorage.setItem(CHARACTER_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(CHARACTER_EVENT, { detail: settings }));
  } catch {
    /* The uploaded portrait may be too large for this browser. */
  }
}

export async function preparePortrait(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose a JPG, PNG, or WebP portrait.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose a portrait smaller than 10 MB.");

  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("That portrait could not be read. Try another image."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const next = new Image();
    next.onload = () => resolve(next);
    next.onerror = () => reject(new Error("That portrait could not be opened. Try another image."));
    next.src = source;
  });

  const maxSide = 640;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the portrait.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", 0.82);
}
