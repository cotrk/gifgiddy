import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Copy, Instagram, Music2, Pencil, Star, Youtube } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { CharacterGif } from "../components/CharacterGif";
import { DEFAULT_PERSONA, loadPersona, savePersona, validSocialUrl, type Persona } from "../lib/persona";
import { loadHistory, prankDate, shareLinkFor, type HistoryEntry } from "../lib/pranks";
import cover from "@/assets/jj-football-11-justin-jefferson-the-griddy-dance-acegif.gif.asset.json";

export const Route = createFileRoute("/giddy")({
  head: () => ({ meta: [
    { title: "Giddy — The Persona & Prank History | GiddyGen" },
    { name: "description", content: "Meet Giddy: questionable accuracy, undeniable footwork. A bio, social links, and a timeline of your GiddyGen pranks." },
    { property: "og:title", content: "Meet Giddy | GiddyGen" },
    { property: "og:description", content: "Born in a loading bar. Raised in the Gallery of Shame. Meet the persona behind the pranks." },
    { property: "og:type", content: "profile" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: GiddyPage,
});

const socials = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "tiktok", label: "TikTok", Icon: Music2 },
  { key: "youtube", label: "YouTube", Icon: Youtube },
] as const;

function GiddyPage() {
  const [persona, setPersona] = useState<Persona>(DEFAULT_PERSONA);
  const [draft, setDraft] = useState<Persona>(DEFAULT_PERSONA);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [copyError, setCopyError] = useState("");

  useEffect(() => {
    setPersona(loadPersona());
    setEntries(loadHistory().sort((a, b) => (prankDate(b)?.getTime() ?? 0) - (prankDate(a)?.getTime() ?? 0)));
    setReady(true);
  }, []);

  const copyPrank = async (entry: HistoryEntry) => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(shareLinkFor(entry.prompt, entry.url, entry.note || entry.social, entry.id));
      setCopiedId(entry.id);
      window.setTimeout(() => setCopiedId(""), 1800);
    } catch {
      setCopyError("That link couldn’t be copied. Open the prank and copy its address instead.");
    }
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = socials.find(({ key }) => !validSocialUrl(key, draft[key]));
    if (invalid) { setError(`Use a full HTTPS ${invalid.label} profile link, or leave it blank.`); return; }
    const next = { ...draft, bio: draft.bio.trim(), instagram: draft.instagram.trim(), tiktok: draft.tiktok.trim(), youtube: draft.youtube.trim() };
    if (!next.bio) { setError("Give Giddy a bio before saving."); return; }
    if (!savePersona(next)) { setError("Your profile couldn’t be saved. Free up browser storage and try again."); return; }
    setPersona(next);
    setEditing(false);
  };

  return (
    <main className="persona-surface min-h-screen bg-background text-foreground">
      <section aria-label="Giddy persona" className="relative mx-auto h-[380px] w-full max-w-3xl overflow-hidden sm:h-[420px]">
        <img src={cover.url} alt="Justin Jefferson doing the Griddy on the football field" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="persona-cover-shade absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 px-6 pb-8 sm:px-8">
          <div>
            <p className="mb-2 font-mono text-xs uppercase text-primary">The prompt’s least expected guest</p>
            <h1 className="persona-display text-8xl leading-none sm:text-9xl">Giddy<span className="text-primary">.</span></h1>
            <p className="mt-2 text-sm text-foreground">Questionable accuracy. Undeniable footwork.</p>
          </div>
          <Button variant="outline" size="sm" className="bg-background/80" onClick={() => { setDraft(persona); setError(""); setEditing(true); }}>
            <Pencil aria-hidden="true" /> Edit persona
          </Button>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-6 sm:px-8">
        <section aria-labelledby="bio-title" className="border-b border-border py-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="bio-title" className="font-mono text-xs uppercase text-muted-foreground">01 / The backstory</h2>
            <span className="font-mono text-xs text-persona-warm">Professional prompt misinterpreter</span>
          </div>
          <p className="max-w-xl whitespace-pre-wrap break-words text-lg leading-relaxed">{persona.bio}</p>
          <div className="mt-6 flex flex-wrap gap-3" aria-label="Giddy social profiles">
            {socials.map(({ key, label, Icon }) => persona[key] ? (
              <Button key={key} asChild variant="outline" size="sm">
                <a href={persona[key]} target="_blank" rel="noopener noreferrer"><Icon aria-hidden="true" />{label}<ArrowRight aria-hidden="true" /></a>
              </Button>
            ) : (
              <span key={key} className="inline-flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4" aria-hidden="true" />{label} · Not added</span>
            ))}
          </div>
        </section>

        <dl className="grid grid-cols-3 gap-4 border-b border-border py-6">
          {[
            { value: entries.length, label: "Pranks dropped" },
            { value: new Set(entries.map((entry) => entry.url)).size, label: "Dance cameos" },
            { value: entries.filter((entry) => entry.rating > 0).length, label: "Rated by you" },
          ].map(({ value, label }) => <div key={label}><dd className="persona-display text-4xl text-primary">{ready ? String(value).padStart(2, "0") : "—"}</dd><dt className="mt-1 text-xs text-muted-foreground">{label}</dt></div>)}
        </dl>

        <section aria-labelledby="history-title" className="py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="font-mono text-xs uppercase text-muted-foreground">02 / The evidence</p><h2 id="history-title" className="persona-display mt-2 text-4xl">Prank history</h2></div>
            <Button asChild size="sm" variant="outline"><Link to="/feed">The Feed <ArrowRight aria-hidden="true" /></Link></Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Your Feed pranks · Saved in this browser</p>
          {copyError && <p role="alert" className="mt-4 text-sm text-destructive">{copyError}</p>}
          {!ready ? <p role="status" className="py-10 text-sm text-muted-foreground">Loading the evidence…</p> : !entries.length ? (
            <div className="py-12"><p className="text-lg">A clean record. Suspicious.</p><p className="mt-2 text-sm text-muted-foreground">No pranks in your Feed yet.</p><Button asChild className="mt-6"><Link to="/" search={{}}>Make a prank <ArrowRight aria-hidden="true" /></Link></Button></div>
          ) : (
            <ol className="mt-8 space-y-8 border-l border-border">
              {entries.map((entry) => {
                const date = prankDate(entry);
                return <li key={entry.id} className="relative pl-5 sm:pl-7">
                  <span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-primary" />
                  <article>
                    <p className="mb-3 font-mono text-xs text-muted-foreground">{date ? <time dateTime={date.toISOString()}>{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time> : "Earlier prank"}</p>
                    <div className="flex items-start gap-4">
                      <CharacterGif src={entry.url} alt="Dance from this prank" loading="lazy" className="aspect-square w-20 shrink-0 rounded-md sm:w-28" />
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-xs leading-relaxed text-muted-foreground">Asked for “{entry.prompt}”</p>
                        <p className="mt-2 break-words text-sm font-semibold leading-relaxed">“{entry.note || entry.social}”</p>
                        {entry.rating > 0 && <p className="mt-2 flex items-center gap-1 text-xs text-persona-warm"><Star className="h-3 w-3" aria-hidden="true" /> {entry.rating} / 5</p>}
                        <div className="mt-3 flex flex-wrap gap-1">
                          <Button asChild variant="ghost" size="sm"><Link to="/" search={{ p: entry.prompt, g: entry.url, c: entry.note || entry.social, i: entry.id }}>Open prank <ArrowRight aria-hidden="true" /></Link></Button>
                          <Button variant="ghost" size="icon" aria-label={copiedId === entry.id ? "Prank link copied" : "Copy prank link"} title="Copy prank link" onClick={() => copyPrank(entry)}>{copiedId === entry.id ? <Check /> : <Copy />}</Button>
                        </div>
                      </div>
                    </div>
                  </article>
                </li>;
              })}
            </ol>
          )}
        </section>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="dark persona-surface max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto bg-background text-foreground">
          <DialogHeader><DialogTitle>Edit Giddy’s persona</DialogTitle><DialogDescription>Bio and social links are saved in this browser.</DialogDescription></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div><label htmlFor="giddy-bio" className="mb-2 block text-sm font-medium">Bio</label><Textarea id="giddy-bio" rows={4} maxLength={500} required value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></div>
            {socials.map(({ key, label }) => <div key={key}><label htmlFor={`giddy-${key}`} className="mb-2 block text-sm font-medium">{label} profile URL</label><Input id={`giddy-${key}`} type="url" maxLength={500} placeholder="https://…" value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} /></div>)}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button><Button type="submit">Save persona</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}