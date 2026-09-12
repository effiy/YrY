import { describe, it, expect } from "vitest";
import { formatValue, handleProp, handleRowAccordingToProp, generateUUID } from "@/utils";

/**
 * Utility function tests.
 *
 * Tests the pure utility functions that are used across the codebase:
 * date formatting, UUID generation, prop handling, and value formatting.
 */

describe("formatValue", () => {
  it("returns the value as-is for non-null/undefined, including empty string", () => {
    expect(formatValue("hello")).toBe("hello");
    expect(formatValue(42)).toBe(42);
    expect(formatValue(0)).toBe(0);
    expect(formatValue(false)).toBe(false);
    expect(formatValue("")).toBe("");
  });

  it("returns '--' for null values", () => {
    expect(formatValue(null)).toBe("--");
  });

  it("returns '--' for undefined values", () => {
    expect(formatValue(undefined)).toBe("--");
  });

  it("returns empty string for empty string (not nullish)", () => {
    expect(formatValue("")).toBe("");
  });
});

describe("handleProp", () => {
  it("returns last segment for dotted path", () => {
    expect(handleProp("user.name")).toBe("name");
  });

  it("returns key as-is when no dots", () => {
    expect(handleProp("username")).toBe("username");
  });

  it("returns last segment for deeply nested path", () => {
    expect(handleProp("a.b.c")).toBe("c");
  });
});

describe("handleRowAccordingToProp", () => {
  it("returns nested value for dotted path", () => {
    const row = { user: { name: "Alice", age: 30 } };
    expect(handleRowAccordingToProp(row, "user.name")).toBe("Alice");
    expect(handleRowAccordingToProp(row, "user.age")).toBe(30);
  });

  it("returns direct value for flat key", () => {
    const row = { name: "Bob", age: 25 };
    expect(handleRowAccordingToProp(row, "name")).toBe("Bob");
  });

  it("returns '--' for missing nested path", () => {
    const row = { user: { name: "Alice" } };
    expect(handleRowAccordingToProp(row, "user.email")).toBe("--");
  });
});

describe("generateUUID", () => {
  it("generates a non-empty string", () => {
    const uuid = generateUUID();
    expect(uuid).toBeTruthy();
    expect(typeof uuid).toBe("string");
  });

  it("generates unique values", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateUUID()));
    expect(ids.size).toBe(100);
  });

  it("contains hex characters and dashes", () => {
    const uuid = generateUUID();
    expect(/^[0-9a-f-]+$/.test(uuid)).toBe(true);
  });

  it("has standard UUID format", () => {
    const uuid = generateUUID();
    expect(uuid).toHaveLength(36);
    expect(uuid[8]).toBe("-");
    expect(uuid[13]).toBe("-");
    expect(uuid[18]).toBe("-");
    expect(uuid[23]).toBe("-");
  });
});