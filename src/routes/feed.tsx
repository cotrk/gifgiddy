import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadHistory, shareLinkFor, type HistoryEntry } from "../lib/pranks";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "GiddyGen — The Feed" },
      {
        name: "description",
        content:
          "Every prank, auto-posted. Browse what people asked for vs. the Giddy they got.",
      },
      { property: "og:title", content: "GiddyGen — The Feed" },
      {
        property: "og:description",
        content: "Every prank, auto-posted. Browse the Giddy misfires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Feed,
});

function Feed() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const copyLink = async (entry: HistoryEntry) => {
    try {
      await navigator.clipboard.writeText(
        shareLinkFor(entry.prompt, entry.url, entry.note || entry.social)
      );
      setCopiedId(entry.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">The Feed</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Every prank, auto-posted. No link-opening required.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold transition hover:bg-muted"
          >
            Generate your own
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-sm font-semibold">Nothing here yet.</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Generate a prank and it posts itself here automatically.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Make the first one
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {entries.map((e) => (
              <article
                key={e.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
              >
                <div className="flex items-center justify-between px-4 pt-3">
                  <p className="truncate text-xs text-muted-foreground">
                    asked for “{e.prompt}”
                  </p>
                  {e.rating > 0 && (
                    <span className="shrink-0 text-xs text-chart-5">
                      {"★".repeat(e.rating)}
                    </span>
                  )}
                </div>
                <img
                  src={e.url}
                  alt="Giddy dance GIF"
                  className="mt-3 w-full"
                  loading="lazy"
                />
                <p className="px-4 pt-3 text-sm font-semibold">
                  “{e.note || e.social}”
                </p>
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-[10px] text-muted-foreground">
                    Posted automatically · 100% prompt-accurate
                  </p>
                  <button
                    onClick={() => copyLink(e)}
                    className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-semibold transition hover:bg-muted"
                  >
                    {copiedId === e.id ? "Link copied" : "Copy link"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <footer className="mt-auto pt-16 text-center text-[10px] text-muted-foreground">
          GiddyGen · Trained exclusively on one GIF · No refunds
        </footer>
      </main>
    </div>
  );
}
