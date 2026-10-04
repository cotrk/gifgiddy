import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_ID_HEADER)) headers.set(RUN_ID_HEADER, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(RUN_ID_HEADER)?.trim() || undefined;
    return res;
  };
}

export async function punchUpReaction(input: {
  reaction: string;
  prompt: string;
  caption: string;
}): Promise<{ comment: string | null; error: string | null }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { comment: null, error: "The comment helper isn't set up yet." };

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch(),
  });

  try {
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system:
        "You write one short, funny, share-ready social comment (max 120 characters) reacting to a prank: someone typed a GIF prompt into an AI generator and, as always, got the Griddy dance. Keep the friend's voice and meaning, punch it up, keep it friendly and clean. No hashtags spam (max one), no quotes around it, output only the comment.",
      prompt: `They asked for: "${input.prompt}"\nThe prank caption: "${input.caption}"\nFriend's raw reaction: "${input.reaction}"`,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = (await result.text).trim().replace(/^["“]|["”]$/g, "").slice(0, 160);
    if (!text) return { comment: null, error: "The model came back speechless. Try a different reaction." };
    return { comment: text, error: null };
  } catch (e) {
    const status = (e as { statusCode?: number })?.statusCode;
    console.error("punchUpReaction failed", status, e);
    if (status === 429) return { comment: null, error: "Too many requests right now. Wait a moment and try again." };
    if (status === 402 || status === 403)
      return { comment: null, error: "AI credits are used up for this app. The owner needs to top up." };
    return { comment: null, error: "Couldn't write a comment right now. Try again in a bit." };
  }
}
