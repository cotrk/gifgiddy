import { useEffect, useState } from "react";
import { makeComment } from "../lib/reactions.functions";
import { loadReaction, reactionKey, saveReaction } from "../lib/reaction-storage";
import { Button } from "./ui/button";

export function ReactionBox({
  prompt,
  caption,
  gifUrl,
  prankId,
}: {
  prompt: string;
  caption: string;
  gifUrl: string;
  prankId?: string;
}) {
  const [reaction, setReaction] = useState("");
  const [comment, setComment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const storageKey = reactionKey(prompt, gifUrl, prankId);

  useEffect(() => {
    setComment(loadReaction(storageKey) || null);
  }, [storageKey]);

  const submit = async () => {
    if (!reaction.trim() || busy) return;
    setBusy(true);
    setError(null);
    setComment(null);
    try {
      const r = await makeComment({ data: { reaction, prompt, caption } });
      if (r.error) setError(r.error);
      else {
        setComment(r.comment);
        saveReaction(storageKey, r.comment);
        setReaction("");
      }
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
          <Button
            type="button"
            onClick={submit}
            disabled={busy || !reaction.trim()}
            className="h-auto px-3 py-1.5 text-[11px] normal-case tracking-normal"
          >
            {busy ? "Writing…" : "Make it funny"}
          </Button>
        </div>
      </label>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {comment && (
        <div className="mt-2 flex items-start justify-between gap-2 rounded-lg bg-muted px-3 py-2">
          <p className="text-sm font-semibold">{comment}</p>
          <Button
            type="button"
            onClick={copy}
            variant="outline"
            className="h-auto shrink-0 px-2 py-0.5 text-[10px]"
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      )}
    </div>
  );
}
