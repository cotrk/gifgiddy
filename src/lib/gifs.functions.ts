import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DANCE_SEARCHES, uniqueDances } from "./dance-pool";

type KlipyItem = {
  file?: Record<string, { gif?: { url?: string }; webp?: { url?: string } }>;
};

export const getGiddyGifs = createServerFn({ method: "GET" })
  .inputValidator(z.object({ page: z.number().int().min(1).max(100).default(1) }).default({ page: 1 }))
  .handler(async ({ data }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const klipyKey = process.env["KLIPY_API_KEY"];
    if (!lovableKey || !klipyKey) {
      return { urls: [] as string[], error: "GIF service not configured" };
    }

    const responses = await Promise.all(
      DANCE_SEARCHES.map(async (query) => {
        const params = new URLSearchParams({ q: query, customer_id: "giddygif", per_page: "18", page: String(data.page) });
        try {
        const response = await fetch(
          `https://connector-gateway.lovable.dev/klipy/gifs/search?${params}`,
          {
            headers: {
              Authorization: `Bearer ${lovableKey}`,
              "X-Connection-Api-Key": klipyKey,
            },
          }
        );
        if (!response.ok) {
          console.error(`KLIPY search failed [${response.status}] for ${query}: ${await response.text()}`);
          return [] as KlipyItem[];
        }
        const json = await response.json();
        if (json?.result !== true) {
          console.error(`KLIPY search rejected for ${query}: ${JSON.stringify(json)}`);
          return [] as KlipyItem[];
        }
        return (json?.data?.data ?? []) as KlipyItem[];
        } catch (error) {
          console.error(`KLIPY search could not complete for ${query}`, error);
          return [] as KlipyItem[];
        }
      })
    );

    const urls = responses
      .flat()
      .map((item) => {
        const f = item.file ?? {};
        // Only animated .gif files — webp stills were rendering frozen
        return (
          f["md"]?.gif?.url ??
          f["sm"]?.gif?.url ??
          f["hd"]?.gif?.url ??
          Object.values(f)[0]?.gif?.url ??
          null
        );
      })
      .filter((u): u is string => typeof u === "string" && u.toLowerCase().includes(".gif"));

    return { urls: uniqueDances(urls), error: urls.length ? null : "More dances could not be loaded. Try again shortly." };
  }
);
