import { afterEach, describe, test } from "node:test";
import { strictEqual } from "node:assert";
import { prankDate, shareLinkFor, type HistoryEntry } from "./pranks";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

afterEach(() => {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
});

describe("prank timeline dates", () => {
  const entry: HistoryEntry = { id: "1794446400000-old", prompt: "a cat", url: "dance.gif", rating: 0, social: "footwork", note: "" };
  test("new prank timestamps and older saved Feed IDs both produce timeline dates", () => {
    strictEqual(prankDate({ ...entry, createdAt: "2026-11-12T03:39:00Z" })?.toISOString(), "2026-11-12T03:39:00.000Z");
    strictEqual(prankDate(entry)?.getTime(), 1794446400000);
    strictEqual(prankDate({ ...entry, id: "legacy-unknown" }), null);
  });
});

describe("prank share navigation", () => {
  test("a link copied from the Feed opens the home generator with the exact prank", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { origin: "https://gifgiddy.lovable.app", pathname: "/feed" } },
    });
    const url = new URL(shareLinkFor("a cat & piano", "https://media.example/dance.gif", "pure footwork", "prank-1"));
    strictEqual(url.origin, "https://gifgiddy.lovable.app");
    strictEqual(url.pathname, "/");
    strictEqual(url.searchParams.get("p"), "a cat & piano");
    strictEqual(url.searchParams.get("g"), "https://media.example/dance.gif");
    strictEqual(url.searchParams.get("c"), "pure footwork");
    strictEqual(url.searchParams.get("i"), "prank-1");
  });
});