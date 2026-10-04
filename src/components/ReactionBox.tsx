import { useState } from "react";
import { makeComment } from "../lib/reactions.functions";

export function ReactionBox({ prompt, caption }: { prompt: string; caption: string }) {
  const [reaction, setReaction] = useState("");
  const [comment, setComment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const submit = async () => {
    if (!reaction.trim() || busy) return;
    setBusy(true);
    setError(null);
    setComment(null);
    try {
      const r = await makeComment({ data: { reaction, prompt, caption } });
      if (r.error) setError(r.error);
      else setComment(r.comment);
    } catch {
      setError("Couldn't reach the comment helper. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!comment) return;
    try {
      await navigator.clipboard.writeText(comment);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="border-t border-border px-4 py-3">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Your reaction
        <div className="mt-1.5 flex gap-2">
          <input
            value={reaction}
            onChange={(e) => setReaction(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            maxLength={200}
            placeholder="bro I asked for a sunset 😭"
            className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy || !reaction.trim()}
            className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold normal-case tracking-normal text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Writing…" : "Make it funny"}
          </button>
        </div>
      </label>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {comment && (
        <div className="mt-2 flex items-start justify-between gap-2 rounded-lg bg-muted px-3 py-2">
          <p className="text-sm font-semibold">{comment}</p>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded border border-border px-2 py-0.5 text-[10px] transition hover:bg-background"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
