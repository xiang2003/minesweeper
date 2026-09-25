import { describe, expect, it } from "vitest";
import { localize } from "@/i18n/strings";
import { parsePreferences } from "./preferences";

describe("parsePreferences", () => {
  it("reads valid preferences", () => {
    expect(parsePreferences(JSON.stringify({ lang: "zh-Hant", seenHelp: true }))).toEqual({
      lang: "zh-Hant",
      seenHelp: true,
    });
  });

  it("drops unknown languages and bad values", () => {
    expect(parsePreferences(JSON.stringify({ lang: "fr", seenHelp: "yes", extra: 1 }))).toEqual({});
  });

  it("treats missing or corrupted data as empty", () => {
    expect(parsePreferences(null)).toEqual({});
    expect(parsePreferences("{oops")).toEqual({});
    expect(parsePreferences("42")).toEqual({});
  });
});

describe("localize", () => {
  it("picks the requested language and falls back to English", () => {
    const title = { en: "Sunrise", "zh-Hant": "日出" };
    expect(localize(title, "zh-Hant")).toBe("日出");
    expect(localize({ en: "Only English" }, "zh-Hant")).toBe("Only English");
    expect(localize("Plain", "zh-Hant")).toBe("Plain");
  });
});
