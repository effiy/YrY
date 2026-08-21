import { describe, it, expect } from "vitest";
import { normalizeMessage, normalizeSession } from "@/utils/chatNormalizers";

describe("normalizeMessage", () => {
  it("returns falsy input unchanged", () => {
    expect(normalizeMessage(null as any)).toBeNull();
    expect(normalizeMessage(undefined as any)).toBeUndefined();
  });

  it("keeps message with message field", () => {
    const msg = { role: "user", message: "hello" } as any;
    const result = normalizeMessage(msg);
    expect(result).toBe(msg); // same reference
  });

  it("normalizes legacy content → message", () => {
    const msg = { role: "user", content: "hello" } as any;
    const result = normalizeMessage(msg);
    expect(result).not.toBe(msg); // new reference
    expect((result as any).message).toBe("hello");
  });

  it("prioritizes message over content", () => {
    const msg = { role: "user", message: "new", content: "old" } as any;
    const result = normalizeMessage(msg);
    expect(result).toBe(msg);
    expect((result as any).message).toBe("new");
  });
});

describe("normalizeSession", () => {
  it("returns null for null", () => {
    expect(normalizeSession(null)).toBeNull();
  });

  it("normalizes messages in session", () => {
    const session = {
      key: "s1",
      messages: [{ role: "user", content: "hello" }],
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
    // normalizeSession maps messages through normalizeMessage (new array), but content matches
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