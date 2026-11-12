import { describe, test } from "node:test";
import { strictEqual } from "node:assert";
import { validSocialUrl } from "./persona";

describe("persona social links", () => {
  test("social links must go to the matching service over HTTPS", () => {
    strictEqual(validSocialUrl("instagram", "https://www.instagram.com/giddy/"), true);
    strictEqual(validSocialUrl("tiktok", "https://www.tiktok.com/@giddy"), true);
    strictEqual(validSocialUrl("youtube", "https://youtube.com/@giddy"), true);
    strictEqual(validSocialUrl("instagram", "https://instagram.com.evil.example/giddy"), false);
    strictEqual(validSocialUrl("tiktok", "javascript:alert(1)"), false);
    strictEqual(validSocialUrl("youtube", "http://youtube.com/@giddy"), false);
    strictEqual(validSocialUrl("instagram", ""), true);
  });
});