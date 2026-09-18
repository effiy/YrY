import { describe, it, expect } from "vitest";
import {
  extractDate,
  relativeTime,
  readingTime,
  detectLang,
  qualityStars,
  repClass,
  repLabel,
  computeResultMeta,
} from "@/views/ai-chat/composables/useSearchResultHelpers";

// ── extractDate ────────────────────────────────────────────────────────

describe("extractDate", () => {
  it("extracts DD Mon YYYY format", () => {
    expect(extractDate("Published 15 Mar 2024 by John")).toBe("15 Mar 2024");
  });

  it("extracts Mon DD, YYYY format", () => {
    expect(extractDate("Updated March 15, 2024 with new content")).toBe("March 15, 2024");
  });

  it("extracts YYYY-MM-DD format", () => {
    expect(extractDate("Release date: 2024-03-15")).toBe("2024-03-15");
  });

  it("extracts MM/DD/YYYY format", () => {
    expect(extractDate("Posted on 3/15/2024")).toBe("3/15/2024");
  });

  it("extracts relative 'N days ago' format", () => {
    expect(extractDate("Updated 2 days ago by admin")).toBe("2");
  });

  it("returns empty for date-less text", () => {
    expect(extractDate("No dates here")).toBe("");
  });

  it("returns empty for empty snippet", () => {
    expect(extractDate("")).toBe("");
  });
});

// ── relativeTime ────────────────────────────────────────────────────────

describe("relativeTime", () => {
  it("returns 'today' for today", () => {
    const d = new Date();
    expect(relativeTime(d.toISOString())).toBe("today");
  });

  it("returns '1d ago' for yesterday", () => {
    const d = new Date(Date.now() - 86400000);
    expect(relativeTime(d.toISOString())).toBe("1d ago");
  });

  it("returns N days ago", () => {
    const d = new Date(Date.now() - 5 * 86400000);
    expect(relativeTime(d.toISOString())).toBe("5d ago");
  });

  it("returns N months ago", () => {
    const d = new Date(Date.now() - 60 * 86400000);
    const r = relativeTime(d.toISOString());
    expect(r).toMatch(/^\d+mo ago$/);
  });

  it("returns year ago for old dates", () => {
    const d = new Date("2020-01-01");
    const r = relativeTime(d.toISOString());
    expect(r).toMatch(/^\d+y ago$/);
  });

  it("returns empty for empty input", () => {
    expect(relativeTime("")).toBe("");
  });

  it("returns original string for invalid dates", () => {
    expect(relativeTime("not a date")).toBe("not a date");
  });
});

// ── readingTime ─────────────────────────────────────────────────────────

describe("readingTime", () => {
  it("returns '1 min read' for short content", () => {
    expect(readingTime("Short", "Title")).toBe("1 min read");
  });

  it("returns estimated minutes for longer content", () => {
    const long = "word ".repeat(300); // ~300 words, ~1.5 min
    expect(readingTime(long, "Title")).toBe("~2 min read");
  });

  it("handles empty snippet", () => {
    expect(readingTime("", "Title Only")).toBe("1 min read");
  });

  it("estimates CJK text by character count", () => {
    // "这是" × 300 = 600 CJK chars, 0 Latin. 600 words / 200 wpm = ~3 min.
    const cjk = "这是".repeat(300);
    expect(readingTime(cjk, "中文标题")).toBe("~3 min read");
  });

  it("handles mixed CJK + Latin text", () => {
    // 100 "word " (500 Latin chars) + 100 "测试" (200 CJK chars)
    // words = 200 + round(500/5) = 200 + 100 = 300. mins = round(300/200) = 2
    const mixed = "word ".repeat(100) + "测试".repeat(100);
    expect(readingTime(mixed, "Mixed Title")).toBe("~2 min read");
  });
});

// ── detectLang ──────────────────────────────────────────────────────────

describe("detectLang", () => {
  it("detects English", () => {
    expect(detectLang("This is a test sentence with enough characters")).toBe("EN");
  });

  it("detects Chinese (CJK)", () => {
    expect(detectLang("这是一个中文测试句子内容很丰富")).toBe("ZH");
  });

  it("detects Russian (Cyrillic)", () => {
    expect(detectLang("Это тестовое предложение на русском")).toBe("RU");
  });

  it("detects Arabic", () => {
    expect(detectLang("هذا نص تجريبي باللغة العربية")).toBe("AR");
  });

  it("returns empty for too-short text", () => {
    expect(detectLang("Hi")).toBe("");
  });

  it("returns empty for empty text", () => {
    expect(detectLang("")).toBe("");
  });
});

// ── qualityStars ────────────────────────────────────────────────────────

describe("qualityStars", () => {
  it("returns empty for 0 quality", () => {
    expect(qualityStars(0)).toBe("");
  });

  it("returns empty for undefined quality", () => {
    expect(qualityStars(undefined)).toBe("");
  });

  it("returns correct stars for quality 3", () => {
    expect(qualityStars(3)).toBe("★★★");
  });

  it("caps at 5 stars", () => {
    expect(qualityStars(7)).toBe("★★★★★");
  });
});

// ── repClass & repLabel ─────────────────────────────────────────────────

describe("repClass", () => {
  it("returns rep-high for .gov domains", () => {
    expect(repClass("https://example.gov/page")).toBe("rep-high");
  });

  it("returns rep-high for .edu domains", () => {
    expect(repClass("https://mit.edu/research")).toBe("rep-high");
  });

  it("returns rep-high for known high domains", () => {
    expect(repClass("https://github.com/user/repo")).toBe("rep-high");
  });

  it("returns rep-low for known low domains", () => {
    expect(repClass("https://pinterest.com/board")).toBe("rep-low");
  });

  it("returns rep-mid for unknown domains", () => {
    expect(repClass("https://example.com")).toBe("rep-mid");
  });
});

describe("repLabel", () => {
  it("returns 'High authority' for .gov", () => {
    expect(repLabel("https://example.gov")).toBe("High authority");
  });

  it("returns 'Low quality' for pinterest", () => {
    expect(repLabel("https://pinterest.com")).toBe("Low quality");
  });

  it("returns empty for unknown domains", () => {
    expect(repLabel("https://example.com")).toBe("");
  });
});

// ── computeResultMeta ───────────────────────────────────────────────────

describe("computeResultMeta", () => {
  it("returns meta for each result", () => {
    const results = [
      { title: "Test", url: "https://example.com", snippet: "A test result" },
      { title: "测试", url: "https://example.cn", snippet: "中文测试结果内容非常丰富" },
    ];
    const meta = computeResultMeta(results);
    expect(meta).toHaveLength(2);
    expect(meta[0].readTime).toBe("1 min read");
    expect(meta[0].lang).toBe("EN");
    expect(meta[1].lang).toBe("ZH");
  });

  it("handles empty results", () => {
    expect(computeResultMeta([])).toEqual([]);
  });
});