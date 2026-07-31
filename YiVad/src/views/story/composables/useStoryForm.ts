/**
 * Story form initialization and validation logic.
 *
 * Centralises the form default factories used by the story store's
 * openCreateDialog / openEditDialog methods, keeping the store lean.
 */
import type { StoryDocument, Scenario } from "@/api/modules/story";

export function newScenarioKey(): string {
  return `sc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyConstraints() {
  return { compliance: [], technical: [], performance: [] };
}

export function emptyAcceptanceCriteria() {
  return { functional: [], data: [], objectiveVerification: [] };
}

/** Convert a string[] to newline-joined text (for textareas). */
export function linesToStr(arr?: string[]): string {
  return (arr ?? []).join("\n");
}

/** Split newline-joined text to string[] (from textareas). */
export function strToLines(s: string | undefined): string[] {
  if (!s) return [];
  return s.split("\n").map(l => l.trim()).filter(Boolean);
}

/** Default scenario factory. */
export function makeScenario(overrides?: Partial<Scenario>): Scenario {
  return {
    key: newScenarioKey(),
    name: "",
    description: "",
    priority: "p2",
    status: "planning",
    steps: [],
    tags: [],
    files: [],
    trigger: "",
    prerequisites: "",
    expectedResult: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}
