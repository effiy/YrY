import { describe, it, expect } from "vitest";
import { normalizeSession } from "@/utils/chatNormalizers";

describe("normalizeSession", () => {
  it("returns null for null", () => {
    expect(normalizeSession(null)).toBeNull();
  });

  it("normalizes messages in session", () => {
    const session = {
      key: "s1",
      messages: [{ role: "user", message: "hello" }],
    } as any;
    const result = normalizeSession(session);
    expect(result).not.toBeNull();
    expect(result!.messages[0].message).toBe("hello");
  });

  it("keeps already-normalized session unchanged", () => {
    const session = {
      key: "s1",
      messages: [{ role: "user", message: "hello" }],
    } as any;
    const result = normalizeSession(session);
    // normalizeSession maps messages (creates new array), but content matches
    expect(result!.key).toBe(session.key);
    expect(result!.messages).toEqual(session.messages);
  });

  it("handles empty messages array", () => {
    const session = { key: "s1", messages: [] } as any;
    const result = normalizeSession(session);
    expect(result!.key).toBe(session.key);
    expect(result!.messages).toEqual([]);
  });
});