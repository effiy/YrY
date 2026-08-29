import { describe, it, expect } from "vitest";
import { formatContextForPrompt, hasContextFiles } from "@/utils/contextFormatter";

describe("formatContextForPrompt", () => {
  it("returns empty string for empty pageContent", () => {
    expect(formatContextForPrompt("", [])).toBe("");
    expect(formatContextForPrompt("   ", [])).toBe("");
  });

  it("returns empty string when no valid sections", () => {
    expect(formatContextForPrompt("just some text without headers", [])).toBe("");
  });

  it("formats a single section", () => {
    const content = "## path/to/file.md\n\nFile body content here.";
    const result = formatContextForPrompt(content, []);
    expect(result).toContain("## Reference documents");
    expect(result).toContain("### path/to/file.md");
    expect(result).toContain("File body content here.");
    expect(result).toContain("`path/to/file.md`");
  });

  it("formats multiple sections", () => {
    const content = [
      "## file1.md\n\nContent one.",
      "---",
      "## file2.md\n\nContent two.",
    ].join("\n\n");
    const result = formatContextForPrompt(content, []);
    expect(result).toContain("### file1.md");
    expect(result).toContain("### file2.md");
    expect(result).toContain("Content one.");
    expect(result).toContain("Content two.");
  });

  it("trims by relevance when context is large", () => {
    // Build a large context with many sections
    const sections: string[] = [];
    for (let i = 0; i < 50; i++) {
      sections.push(`## file${i}.md\n\n${"x".repeat(500)}`);
    }
    const content = sections.join("\n\n---\n\n");
    const result = formatContextForPrompt(content, [], "specific query about file1");
    // Should still produce valid output
    expect(result).toContain("## Reference documents");
    expect(result.length).toBeGreaterThan(0);
    // Should trim (not include all 50 sections)
    const sectionCount = (result.match(/### /g) || []).length;
    expect(sectionCount).toBeLessThan(50);
  });
});

describe("hasContextFiles", () => {
  it("returns true when tags have ctx: prefix", () => {
    expect(hasContextFiles(["ctx:path/to/file.md"])).toBe(true);
  });

  it("returns true when pageContent is non-empty", () => {
    expect(hasContextFiles([], "some content")).toBe(true);
  });

  it("returns false when both are empty", () => {
    expect(hasContextFiles([], "")).toBe(false);
    expect(hasContextFiles([])).toBe(false);
  });
});