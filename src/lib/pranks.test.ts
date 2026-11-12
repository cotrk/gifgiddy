import { afterEach, describe, expect, test } from "bun:test";
import { shareLinkFor } from "./pranks";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

afterEach(() => {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
});

describe("prank share navigation", () => {
  test("a link copied from the Feed opens the home generator with the exact prank", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { origin: "https://gifgiddy.lovable.app", pathname: "/feed" } },
    });
    const url = new URL(shareLinkFor("a cat & piano", "https://media.example/dance.gif", "pure footwork", "prank-1"));
    expect(url.origin).toBe("https://gifgiddy.lovable.app");
    expect(url.pathname).toBe("/");
    expect(url.searchParams.get("p")).toBe("a cat & piano");
    expect(url.searchParams.get("g")).toBe("https://media.example/dance.gif");
    expect(url.searchParams.get("c")).toBe("pure footwork");
    expect(url.searchParams.get("i")).toBe("prank-1");
  });
});