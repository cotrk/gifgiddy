import { createServerFn } from "@tanstack/react-start";

type KlipyItem = {
  file?: Record<string, { gif?: { url?: string }; webp?: { url?: string } }>;
};

export const getGiddyGifs = createServerFn({ method: "GET" }).handler(
  async () => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const klipyKey = process.env["KLIPY_API_KEY"];
    if (!lovableKey || !klipyKey) {
      return { urls: [] as string[], error: "GIF service not configured" };
    }

    const searches = ["griddy dance", "doing the griddy", "football griddy celebration"];
    const responses = await Promise.all(
      searches.map(async (query) => {
        const params = new URLSearchParams({ q: query, customer_id: "giddygif", per_page: "18" });
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
          console.error(`KLIPY search failed [${response.status}] for ${query}`);
          return [] as KlipyItem[];
        }
        const json = await response.json();
        return (json?.data?.data ?? []) as KlipyItem[];
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

    return { urls: [...new Set(urls)], error: urls.length ? null : "GIF search failed" };
  }
);
