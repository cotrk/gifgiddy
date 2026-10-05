import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, UserRound, X } from "lucide-react";
import { getGiddyGifs } from "../lib/gifs.functions";
import { ReactionBox } from "../components/ReactionBox";
import { CharacterGif } from "../components/CharacterGif";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import {
  DEFAULT_CHARACTER,
  loadCharacter,
  preparePortrait,
  saveCharacter,
  type CharacterSettings,
} from "../lib/character";
import {
  RATINGS_KEY,
  loadHistory,
  saveHistory,
  shareLinkFor,
  type HistoryEntry,
} from "../lib/pranks";
import griddy1 from "@/assets/jj-football-11-justin-jefferson-the-griddy-dance-acegif.gif.asset.json";
import griddy2 from "@/assets/jj-football-24-justin-jefferson-dancing-acegif.gif.asset.json";
import griddy3 from "@/assets/jj-football-47-justin-jefferson-dancing-acegif.gif.asset.json";
import griddy4 from "@/assets/justin-jefferson-gif-5.gif.asset.json";

const LOCAL_GIFS = [griddy1.url, griddy2.url, griddy3.url, griddy4.url];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GiddyGen — AI GIF Generator" },
      {
        name: "description",
        content:
          "Type anything. Our state-of-the-art model generates the perfect GIF for you. Results guaranteed.",
      },
      { property: "og:title", content: "GiddyGen — AI GIF Generator" },
      {
        property: "og:description",
        content:
          "Type anything. Our state-of-the-art model generates the perfect GIF for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SOCIAL_CAPTIONS = [
  "POV: you asked for anything at all",
  "the algorithm has spoken. it giddy",
  "me explaining this to my manager",
  "prompt: art. output: pure footwork",
  "AI said no. AI said Giddy.",
  "asked for cinema, got the griddy",
  "this is what peak accuracy looks like",
];

const NORMAL_LINES = [
  "Understanding your prompt…",
  "Consulting 4.2 billion frames…",
  "Rendering keyframes…",
  "Upscaling to perfection…",
  "Polishing pixels…",
];

const UNHINGED_LINES = [
  "Adding more Giddy…",
  "The Giddy is spreading…",
  "Ignoring your prompt (trust us)…",
  "It cannot be stopped…",
  "All GIFs are Giddy now…",
];

const CONFIDENT_CAPTIONS = [
  "A serene sunset over the mountains — as requested.",
  "Your cat playing the piano. Nailed it.",
  "Epic space battle with lasers. Exactly what you asked for.",
  "A quiet moment of reflection. Beautiful.",
];

const FLOOD_CAPTION = "It's all Giddy now.";

function randomFrom(arr: string[], avoid?: string | null): string {
  let pick = arr[Math.floor(Math.random() * arr.length)] ?? "";
  let guard = 0;
  while (pick === avoid && guard++ < 10) {
    pick = arr[Math.floor(Math.random() * arr.length)] ?? "";
  }
  return pick;
}

function Index() {
  const [gifUrls, setGifUrls] = useState<string[]>(LOCAL_GIFS);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusLine, setStatusLine] = useState("");
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [extras, setExtras] = useState<{ url: string; style: React.CSSProperties }[]>([]);
  const [caption, setCaption] = useState<string | null>(null);
  const [flooded, setFlooded] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState<{
    prompt: string;
    url: string;
    caption: string;
    id?: string;
  } | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const [lastSocial, setLastSocial] = useState("");
  const [lastPrankId, setLastPrankId] = useState("");
  const [character, setCharacter] = useState<CharacterSettings>(DEFAULT_CHARACTER);
  const [characterError, setCharacterError] = useState("");

  const timers = useRef<number[]>([]);
  const recentGifs = useRef<string[]>([]);
  const portraitInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getGiddyGifs()
      .then((r) => {
        const remote = r.urls.filter((u) => u.toLowerCase().includes(".gif"));
        if (remote.length) setGifUrls([...new Set([...LOCAL_GIFS, ...remote])]);
      })
      .catch(() => undefined);
    const params = new URLSearchParams(window.location.search);
    const p = params.get("p");
    const g = params.get("g");
    if (g) {
      const sharedId = params.get("i");
      setShared({
        prompt: p ?? "",
        url: g,
        caption: params.get("c") ?? "",
        ...(sharedId ? { id: sharedId } : {}),
      });
    }
    setCharacter(loadCharacter());


    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  // Restore past pranks + ratings so the gallery and feed survive a reload
  useEffect(() => {
    const saved = loadHistory();
    let ratings: Record<string, number> = {};
    try {
      const raw = window.localStorage.getItem(RATINGS_KEY);
      if (raw) ratings = JSON.parse(raw) as Record<string, number>;
    } catch {
      /* ignore */
    }
    if (saved.length) {
      setHistory(saved.map((e) => ({ ...e, rating: ratings[e.id] ?? e.rating })));
    }
  }, []);

  // Every prank auto-posts to the feed (persisted locally)
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const rate = (id: string, rating: number) => {
    setHistory((h) => {
      const next = h.map((e) => (e.id === id ? { ...e, rating } : e));
      try {
        window.localStorage.setItem(
          RATINGS_KEY,
          JSON.stringify(Object.fromEntries(next.map((e) => [e.id, e.rating])))
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const setNote = (id: string, note: string) => {
    setHistory((h) => h.map((e) => (e.id === id ? { ...e, note: note.slice(0, 80) } : e)));
  };

  const updateCharacter = (patch: Partial<CharacterSettings>) => {
    setCharacter((current) => {
      const next = { ...current, ...patch };
      saveCharacter(next);
      return next;
    });
  };

  const uploadPortrait = async (file?: File) => {
    if (!file) return;
    setCharacterError("");
    try {
      const image = await preparePortrait(file);
      updateCharacter({ image, enabled: true });
    } catch (error) {
      setCharacterError(error instanceof Error ? error.message : "That portrait could not be used.");
    } finally {
      if (portraitInput.current) portraitInput.current.value = "";
    }
  };

  const copyLink = async (prompt: string, url: string, caption?: string, prankId?: string) => {
    try {
      await navigator.clipboard.writeText(shareLinkFor(prompt, url, caption, prankId));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };


  const stage = attempts >= 5 ? 2 : attempts >= 2 ? 1 : 0;

  const generate = useCallback(() => {
    if (loading || gifUrls.length === 0) return;
    const submitted = prompt.trim() || "(no prompt — they just clicked)";
    setLoading(true);
    setProgress(0);
    setExtras([]);
    setCaption(null);

    const lines = stage >= 1 ? UNHINGED_LINES : NORMAL_LINES;
    const total = 2600;
    lines.forEach((line, i) => {
      timers.current.push(
        window.setTimeout(() => setStatusLine(line), (total / lines.length) * i)
      );
    });
    const start = Date.now();
    const tick = window.setInterval(() => {
      const pct = Math.min(99, ((Date.now() - start) / total) * 100);
      setProgress(pct);
    }, 80);
    timers.current.push(tick);

    timers.current.push(
      window.setTimeout(() => {
        window.clearInterval(tick);
        setProgress(100);
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        const fresh = gifUrls.filter((candidate) => !recentGifs.current.includes(candidate));
        const url = randomFrom(fresh.length ? fresh : gifUrls, result ?? undefined);
        recentGifs.current = [url, ...recentGifs.current.filter((item) => item !== url)].slice(0, 4);
        setResult(url);
        setLastPrompt(submitted);
        const social = randomFrom(SOCIAL_CAPTIONS, lastSocial).slice(0, 40);
        setLastSocial(social);
        const prankId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setLastPrankId(prankId);
        setHistory((h) => [
          { id: prankId, prompt: submitted, url, rating: 0, social, note: "" },
          ...h,
        ]);


        if (nextAttempts >= 5) {
          setFlooded(true);
        } else if (nextAttempts >= 3) {
          const count = nextAttempts - 2;
          const extraList = Array.from({ length: count }, (_, i) => ({
            url: gifUrls[(i * 7 + nextAttempts) % gifUrls.length] ?? "",
            style: {
              top: `${Math.random() * 60}%`,
              left: `${Math.random() * 60}%`,
              transform: `rotate(${(Math.random() - 0.5) * 40}deg) scale(${0.7 + Math.random() * 0.6})`,
              zIndex: 10 + i,
            } as React.CSSProperties,
          }));
          setExtras(extraList);
          setCaption(randomFrom(CONFIDENT_CAPTIONS));
        }
        setLoading(false);
      }, total)
    );
  }, [attempts, gifUrls, lastSocial, loading, prompt, result, stage]);

  const reset = () => {
    setAttempts(0);
    setFlooded(false);
    setResult(null);
    setExtras([]);
    setCaption(null);
    setHistory([]);
    setPrompt("");
  };

  const floodTiles = flooded
    ? Array.from({ length: 24 }, (_, i) => gifUrls[i % gifUrls.length])
    : [];

  return (
    <div className="dark relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Flooded takeover */}
      {flooded && (
        <div className="fixed inset-0 z-50 grid grid-cols-4 gap-1 overflow-hidden bg-background/95 p-1">
          {floodTiles.map((url, i) => (
            <img
              key={i}
              src={url}
              alt="Giddy dance GIF"
              className="h-full w-full rounded object-cover"
              style={{ transform: `rotate(${(i % 5) - 2}deg)` }}
            />
          ))}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background/70">
            <p className="text-5xl font-black tracking-tight md:text-7xl">{FLOOD_CAPTION}</p>
            <button
              onClick={reset}
              className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Start over (it won't help)
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center px-6 py-16">
        <p className="mb-3 rounded-full border border-border px-4 py-1 text-xs tracking-widest text-muted-foreground uppercase">
          GiddyGen v9 · Now with 0% fewer guardrails
        </p>
        <Link
          to="/feed"
          className="mb-6 text-xs font-semibold text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
        >
          Browse The Feed →
        </Link>
        <h1 className="text-center text-5xl font-black tracking-tight md:text-6xl">
          Type anything.
          <br />
          <span className="bg-gradient-to-r from-chart-2 via-chart-5 to-chart-1 bg-clip-text text-transparent">
            Get the perfect GIF.
          </span>
        </h1>
        <p className="mt-4 max-w-md text-center text-sm text-muted-foreground">
          Our model understands exactly what you mean. Every time. Definitely.
        </p>

        {/* Shared result */}
        {shared && (
          <div className="mt-8 w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-2xl">
            <p className="mb-3 text-xs text-muted-foreground">
              A friend asked for “{shared.prompt || "something"}” and got:
            </p>
            <CharacterGif
              src={shared.url}
              alt="Shared Giddy dance GIF"
              className="w-full rounded-xl"
            />
            {shared.caption && (
              <p className="mt-3 text-center text-sm font-semibold">“{shared.caption}”</p>
            )}
            <div className="-mx-4 mt-3">
              <ReactionBox
                prompt={shared.prompt}
                caption={shared.caption}
                gifUrl={shared.url}
                {...(shared.id ? { prankId: shared.id } : {})}
              />
            </div>


            <button
              onClick={() => setShared(null)}
              className="mt-3 text-xs text-muted-foreground underline"
            >
              Dismiss and try your own prompt
            </button>
          </div>
        )}

        {/* Prompt box */}
        <div className="mt-10 w-full">
          <div className="flex gap-2 rounded-2xl border border-border bg-card p-2 shadow-2xl">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="A serene sunset over the mountains…"
              disabled={loading}
              className="flex-1 rounded-xl bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={generate}
              disabled={loading || gifUrls.length === 0}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {gifUrls.length === 0 ? "Warming up…" : "Generate"}
            </button>
          </div>
        </div>

        <section className="mt-4 w-full rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-bold">Custom Giddy character</h2>
                <p className="text-[11px] text-muted-foreground">Place a portrait over the dancer.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={character.enabled && character.image ? "default" : "outline"}
                disabled={!character.image}
                onClick={() => updateCharacter({ enabled: !character.enabled })}
              >
                {character.enabled ? "Custom on" : "Original"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => portraitInput.current?.click()}>
                <Upload aria-hidden="true" />
                {character.image ? "Replace" : "Upload portrait"}
              </Button>
              {character.image && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Remove custom portrait"
                  title="Remove custom portrait"
                  onClick={() => updateCharacter(DEFAULT_CHARACTER)}
                >
                  <X aria-hidden="true" />
                </Button>
              )}
              <input
                ref={portraitInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label="Upload custom character portrait"
                onChange={(event) => uploadPortrait(event.target.files?.[0])}
              />
            </div>
          </div>
          {characterError && <p className="mt-3 text-xs text-destructive">{characterError}</p>}
          {character.image && (
            <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Left / right
                <Slider
                  className="mt-2"
                  min={5}
                  max={95}
                  value={[character.x]}
                  onValueChange={(value) => updateCharacter({ x: value[0] ?? character.x })}
                />
              </label>
              <label className="text-[11px] font-semibold text-muted-foreground">
                Up / down
                <Slider
                  className="mt-2"
                  min={5}
                  max={95}
                  value={[character.y]}
                  onValueChange={(value) => updateCharacter({ y: value[0] ?? character.y })}
                />
              </label>
              <label className="text-[11px] font-semibold text-muted-foreground">
                Portrait size
                <Slider
                  className="mt-2"
                  min={10}
                  max={55}
                  value={[character.size]}
                  onValueChange={(value) => updateCharacter({ size: value[0] ?? character.size })}
                />
              </label>
            </div>
          )}
        </section>

        {/* Loading */}
        {loading && (
          <div className="mt-10 w-full max-w-md">
            <p className="mb-2 text-center font-mono text-xs text-muted-foreground">{statusLine}</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="relative mt-10 w-full max-w-md">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <CharacterGif
                src={result}
                alt="AI-generated GIF"
                className="w-full"
                settings={character}
              />
              {lastSocial && (
                <p className="px-4 pt-3 text-sm font-semibold">“{lastSocial}”</p>
              )}
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {caption ?? "Generated in 2.6s · 100% prompt-accurate"}
                </p>
                <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  giddy_v{attempts}.gif
                </span>
              </div>
              <div className="border-t border-border px-4 py-3">
                <button
                   onClick={() => copyLink(lastPrompt, result, lastSocial, lastPrankId)}
                  className="w-full rounded-lg border border-border px-4 py-2 text-xs font-semibold transition hover:bg-muted"
                >
                  {copied ? "Link copied — go ruin someone's day" : "Copy shareable link"}
                </button>
              </div>

            </div>
            {extras.map((e, i) => (
              <img
                key={i}
                src={e.url}
                alt=""
                className="pointer-events-none absolute w-40 rounded-xl border border-border shadow-xl"
                style={e.style}
              />
            ))}
          </div>
        )}

        {attempts > 0 && !loading && !flooded && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {attempts === 1 && "Not what you meant? Try again — the model learns."}
            {attempts === 2 && "Hmm. Statistically, this is what you wanted."}
            {attempts >= 3 && attempts < 5 && "The model has developed preferences."}
          </p>
        )}

        {/* Gallery of shame */}
        {history.length > 0 && (
          <section className="mt-16 w-full">
            <h2 className="mb-1 text-lg font-bold">Gallery of Shame</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              A permanent record of what you asked for vs. what you got. Rate the funniest ones.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[...history]
                .sort((a, b) => b.rating - a.rating)
                .map((h) => (
                  <div key={h.id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                     <CharacterGif
                      src={h.url}
                      alt="Giddy dance"
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-muted-foreground">“{h.prompt}”</p>
                      <p className="mt-1 text-xs font-medium">→ “{h.social}”</p>
                      <input
                        value={h.note}
                        onChange={(e) => setNote(h.id, e.target.value)}
                        maxLength={80}
                        placeholder="Write your own caption for friends…"
                        className="mt-2 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none placeholder:text-muted-foreground"
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => rate(h.id, n === h.rating ? 0 : n)}
                              aria-label={`Rate ${n} out of 5`}
                              className={`px-0.5 text-sm transition ${
                                n <= h.rating ? "text-chart-5" : "text-muted-foreground opacity-40"
                              } hover:opacity-100`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <button
                           onClick={() => copyLink(h.prompt, h.url, h.note || h.social, h.id)}
                          className="rounded border border-border px-2 py-0.5 text-[10px] transition hover:bg-muted"
                        >
                          Copy link
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        <footer className="mt-auto pt-16 text-center text-[10px] text-muted-foreground">
          GiddyGen · Trained exclusively on one GIF · No refunds ·{" "}
          <Link to="/feed" className="underline">
            The Feed
          </Link>
        </footer>
      </main>
    </div>
  );
}
