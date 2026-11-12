import { describe, test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { DANCE_SEARCHES, nextUnusedDance, uniqueDances } from "./dance-pool";

describe("dance variety", () => {
  test("the pool includes Griddy variations and other dances", () => {
    strictEqual(DANCE_SEARCHES.includes("justin jefferson griddy"), true);
    strictEqual(DANCE_SEARCHES.includes("griddy fortnite"), true);
    strictEqual(DANCE_SEARCHES.includes("dame hombro dance"), true);
    strictEqual(DANCE_SEARCHES.includes("bow bow bow dance"), true);
    strictEqual(DANCE_SEARCHES.includes("zany fortnite dance"), true);
  });
  test("every clip is used once and an exhausted pool never repeats", () => {
    const pool = ["https://media.example/a.gif", "https://media.example/b.gif", "https://media.example/c.gif"];
    const used: string[] = [];
    for (const expected of pool) {
      const next = nextUnusedDance(pool, used, () => 0);
      strictEqual(next, expected);
      if (next) used.push(next);
    }
    strictEqual(nextUnusedDance(pool, used), null);
    strictEqual(nextUnusedDance([...pool, "https://media.example/d.gif"], used), "https://media.example/d.gif");
  });
  test("query strings cannot cause the same dance to appear twice", () => {
    deepStrictEqual(uniqueDances(["https://media.example/a.gif?v=1", "https://media.example/a.gif?v=2"]), ["https://media.example/a.gif?v=1"]);
    strictEqual(nextUnusedDance(["https://media.example/a.gif?v=2"], ["https://media.example/a.gif?v=1"]), null);
  });
});