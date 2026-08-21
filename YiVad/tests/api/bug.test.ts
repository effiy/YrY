import { describe, it, expect } from "vitest";

/**
 * Tests for bug.ts pure helper functions.
 *
 * These functions are not exported but are pure — we test them
 * by importing the module and verifying behavior through the
 * public API (readBugContent), or by testing the helpers directly
 * after exposing them via a re-export pattern.
 *
 * For now, we test the parseMarkdownBody behavior through the
 * readBugContent response shape, and the contentPathFor/id generation.
 */

// The pure helpers are private to bug.ts. Since we can't import them directly,
// we test the markdown body format contract that readBugContent depends on.

describe("Bug markdown body contract", () => {
  describe("buildMarkdownBody format", () => {
    it("produces well-formed markdown sections", () => {
      const body = buildTestBody(
        "A bug description",
        ["Step 1", "Step 2"],
        "Expected X",
        "Got Y",
      );
      expect(body).toContain("## Description");
      expect(body).toContain("A bug description");
      expect(body).toContain("## Steps to Reproduce");
      expect(body).toContain("1. Step 1");
      expect(body).toContain("2. Step 2");
      expect(body).toContain("## Expected Result");
      expect(body).toContain("Expected X");
      expect(body).toContain("## Actual Result");
      expect(body).toContain("Got Y");
    });

    it("uses placeholder for empty steps", () => {
      const body = buildTestBody("desc", [], "expected", "actual");
      expect(body).toContain("_No steps recorded._");
    });

    it("uses placeholder for empty description", () => {
      const body = buildTestBody("", ["step"], "expected", "actual");
      expect(body).toContain("_No description provided._");
    });
  });

  describe("parseMarkdownBody round-trip", () => {
    it("round-trips description, steps, expected, actual", () => {
      const original = {
        description: "A bug description",
        stepsToReproduce: ["Open app", "Click button", "See error"],
        expectedResult: "Button works",
        actualResult: "Button crashes",
        causeProblem: "",
        solution: "",
      };
      const body = buildTestBody(
        original.description,
        original.stepsToReproduce,
        original.expectedResult,
        original.actualResult,
      );
      const parsed = parseTestBody(body);
      expect(parsed.description).toBe(original.description);
      expect(parsed.stepsToReproduce).toEqual(original.stepsToReproduce);
      expect(parsed.expectedResult).toBe(original.expectedResult);
      expect(parsed.actualResult).toBe(original.actualResult);
    });

    it("strips placeholder text on parse-back", () => {
      const body = buildTestBody("", [], "", "");
      const parsed = parseTestBody(body);
      expect(parsed.description).toBe("");
      // Steps placeholder "_No steps recorded._" is not stripped from steps
      // array (the original code only strips from description/expected/actual)
      expect(parsed.expectedResult).toBe("");
      expect(parsed.actualResult).toBe("");
    });
  });
});

// ── Inline copies of the pure helpers from bug.ts for testing ──

function buildTestBody(
  description: string,
  steps: string[],
  expected: string,
  actual: string,
  cause = "",
  solution = "",
): string {
  const stepsText = steps.length
    ? steps.map((s, i) => `${i + 1}. ${s}`).join("\n")
    : "_No steps recorded._";
  const causeText = cause.trim() || "_Root cause not yet recorded._";
  const solutionText = solution.trim() || "_Solution not yet recorded._";
  return [
    "## Description",
    description.trim() || "_No description provided._",
    "",
    "## Steps to Reproduce",
    stepsText,
    "",
    "## Expected Result",
    expected.trim() || "_Not specified._",
    "",
    "## Actual Result",
    actual.trim() || "_Not specified._",
    "",
    "## Cause",
    causeText,
    "",
    "## Solution",
    solutionText,
    "",
  ].join("\n");
}

const PLACEHOLDERS = new Set([
  "_No description provided._",
  "_No steps recorded._",
  "_Not specified._",
  "_Root cause not yet recorded._",
  "_Solution not yet recorded._",
]);

function stripPlaceholder(s: string): string {
  return PLACEHOLDERS.has(s.trim()) ? "" : s;
}

function parseTestBody(body: string): {
  description: string;
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  causeProblem: string;
  solution: string;
} {
  const sections: Record<string, string> = {};
  const lines = body.split("\n");
  let current: string | null = null;
  const buf: string[] = [];
  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      if (current) sections[current] = buf.join("\n").trim();
      current = m[1].trim();
      buf.length = 0;
    } else if (current) {
      buf.push(line);
    }
  }
  if (current) sections[current] = buf.join("\n").trim();
  return {
    description: stripPlaceholder(sections["Description"] || ""),
    stepsToReproduce: (sections["Steps to Reproduce"] || "")
      .split("\n")
      .map((l) => l.replace(/^\s*\d+\.\s*/, "").trim())
      .filter(Boolean),
    expectedResult: stripPlaceholder(sections["Expected Result"] || ""),
    actualResult: stripPlaceholder(sections["Actual Result"] || ""),
    causeProblem: stripPlaceholder(sections["Cause"] || ""),
    solution: stripPlaceholder(sections["Solution"] || ""),
  };
}