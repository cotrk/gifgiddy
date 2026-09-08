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

    const params = new URLSearchParams({
      q: "giddy dance",
      customer_id: "giddygif",
      per_page: "24",
    });

    const res = await fetch(
      `https://connector-gateway.lovable.dev/klipy/gifs/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": klipyKey,
        },
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(`KLIPY search failed [${res.status}]: ${body}`);
      return { urls: [] as string[], error: `GIF search failed (${res.status})` };
    }

    const json = await res.json();
    if (!json.result) {
      return { urls: [] as string[], error: "GIF search failed" };
    }

    const items: KlipyItem[] = json?.data?.data ?? [];
    const urls = items
      .map((item) => {
        const f = item.file ?? {};
        return (
          f.md?.gif?.url ??
          f.md?.webp?.url ??
          f.sm?.gif?.url ??
          f.sm?.webp?.url ??
          f.hd?.gif?.url ??
          Object.values(f)[0]?.gif?.url ??
          Object.values(f)[0]?.webp?.url ??
          null
        );
      })
      .filter((u): u is string => typeof u === "string");

    return { urls, error: null };
  }
);
