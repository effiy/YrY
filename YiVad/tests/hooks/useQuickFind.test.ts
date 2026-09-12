import { describe, it, expect, vi, beforeEach } from "vitest";
import { useQuickFind } from "@/hooks/useQuickFind";

const sampleData = [
  { id: 1, name: "Alice", status: "active", note: "error occurred" },
  { id: 2, name: "Bob", status: "inactive", note: "all good" },
  { id: 3, name: "Charlie", status: "error", note: "another ERROR here" },
];

describe("useQuickFind", () => {
  it("initial state is hidden with empty keyword", () => {
    const qf = useQuickFind();
    expect(qf.visible.value).toBe(false);
    expect(qf.keyword.value).toBe("");
    expect(qf.matches.value).toEqual([]);
  });

  it("searches and finds matches across all columns", () => {
    const qf = useQuickFind();
    qf.keyword.value = "error";
    qf.search(sampleData, ["name", "status", "note"]);
    expect(qf.totalMatches.value).toBeGreaterThanOrEqual(2);
    expect(qf.currentMatch.value).toBe(0);
  });

  it("returns no matches for non-existent keyword", () => {
    const qf = useQuickFind();
    qf.keyword.value = "xyz123";
    qf.search(sampleData, ["name", "status", "note"]);
    expect(qf.totalMatches.value).toBe(0);
    expect(qf.statusText.value).toBe("No matches");
  });

  it("nextMatch cycles forward through matches", () => {
    const qf = useQuickFind();
    qf.keyword.value = "error";
    qf.search(sampleData, ["name", "status", "note"]);
    const total = qf.totalMatches.value;
    if (total > 1) {
      qf.nextMatch();
      expect(qf.currentMatch.value).toBe(1);
    }
  });

  it("nextMatch wraps around at the end", () => {
    const qf = useQuickFind();
    qf.keyword.value = "error";
    qf.search(sampleData, ["name", "status", "note"]);
    const total = qf.totalMatches.value;
    qf.currentMatch.value = total - 1;
    qf.nextMatch();
    expect(qf.currentMatch.value).toBe(0);
  });

  it("prevMatch cycles backward", () => {
    const qf = useQuickFind();
    qf.keyword.value = "error";
    qf.search(sampleData, ["name", "status", "note"]);
    qf.prevMatch();
    expect(qf.currentMatch.value).toBe(qf.totalMatches.value - 1);
  });

  it("matchCase enables case-sensitive search", () => {
    const qf = useQuickFind();
    qf.keyword.value = "ERROR";
    qf.matchCase.value = true;
    qf.search(sampleData, ["name", "status", "note"]);
    // Only "another ERROR here" matches case-sensitive "ERROR"
    expect(qf.totalMatches.value).toBe(1);
  });

  it("useRegex enables regex search", () => {
    const qf = useQuickFind();
    qf.keyword.value = "error";
    qf.useRegex.value = true;
    qf.search(sampleData, ["note"]);
    expect(qf.totalMatches.value).toBeGreaterThanOrEqual(1);
  });

  it("handles invalid regex gracefully", () => {
    const qf = useQuickFind();
    qf.keyword.value = "[";
    qf.useRegex.value = true;
    expect(() => qf.search(sampleData, ["name"])).not.toThrow();
    expect(qf.matches.value).toEqual([]);
  });

  it("scopeColumn limits search to specified column", () => {
    const qf = useQuickFind();
    qf.visible.value = true;
    qf.keyword.value = "Charlie";
    qf.scopeColumn.value = "name";
    qf.search(sampleData, ["name", "status", "note"]);
    // "Charlie" only appears in the "name" column
    expect(qf.totalMatches.value).toBe(1);
  });

  it("toggle opens and closes the find bar", () => {
    const qf = useQuickFind();
    qf.toggle();
    expect(qf.visible.value).toBe(true);
    qf.keyword.value = "test";
    qf.toggle();
    expect(qf.visible.value).toBe(false);
    // closing clears keyword and matches
    expect(qf.keyword.value).toBe("");
  });

  it("statusText shows match progress", () => {
    const qf = useQuickFind();
    qf.keyword.value = "error";
    qf.search(sampleData, ["name", "status", "note"]);
    const total = qf.totalMatches.value;
    if (total > 0) {
      expect(qf.statusText.value).toBe(`1 / ${total}`);
    }
  });

  it("statusText is empty when keyword is empty", () => {
    const qf = useQuickFind();
    expect(qf.statusText.value).toBe("");
  });

  it("highlight wraps matched text in mark tags", () => {
    const qf = useQuickFind();
    qf.visible.value = true;
    qf.keyword.value = "error";
    qf.search(sampleData, ["note"]);
    const html = qf.highlight(0, "note", "error occurred");
    expect(html).toContain("<mark");
    expect(html).toContain("error");
  });
});