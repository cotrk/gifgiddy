import { useEffect, useState, type CSSProperties } from "react";
import {
  CHARACTER_EVENT,
  DEFAULT_CHARACTER,
  loadCharacter,
  type CharacterSettings,
} from "../lib/character";

export function CharacterGif({
  src,
  alt,
  className,
  settings,
  loading,
}: {
  src: string;
  alt: string;
  className?: string;
  settings?: CharacterSettings;
  loading?: "eager" | "lazy";
}) {
  const [stored, setStored] = useState<CharacterSettings>(DEFAULT_CHARACTER);

  useEffect(() => {
    if (settings) return;
    setStored(loadCharacter());
    const update = (event: Event) => {
      const custom = event as CustomEvent<CharacterSettings>;
      setStored(custom.detail ?? loadCharacter());
    };
    window.addEventListener(CHARACTER_EVENT, update);
    return () => window.removeEventListener(CHARACTER_EVENT, update);
  }, [settings]);

  const character = settings ?? stored;
  const portraitStyle: CSSProperties = {
    left: `${character.x}%`,
    top: `${character.y}%`,
    width: `${character.size}%`,
    transform: "translate(-50%, -50%)",
  };

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" loading={loading} />
      {character.enabled && character.image && (
        <img
          src={character.image}
          alt="Custom prank character"
          className="pointer-events-none absolute z-10 aspect-square rounded-full border-2 border-foreground/70 object-cover shadow-xl"
          style={portraitStyle}
        />
      )}
    </div>
  );
}
