import { describe, expect, it } from "vitest";
import { createMockSession, createMockSessions } from "../mocks/sessions";

describe("mock session factories", () => {
  it("createMockSession produces a valid session shape", () => {
    const session = createMockSession();
    expect(session).toHaveProperty("key");
    expect(session).toHaveProperty("url");
    expect(session).toHaveProperty("title");
    expect(session).toHaveProperty("messages");
    expect(session.messages).toEqual([]);
    expect(session.tags).toContain("source:test");
  });

  it("createMockSession accepts overrides", () => {
    const session = createMockSession({ title: "Custom Title", isFavorite: true });
    expect(session.title).toBe("Custom Title");
    expect(session.isFavorite).toBe(true);
  });

  it("createMockSessions produces correct count", () => {
    const sessions = createMockSessions(5);
    expect(sessions).toHaveLength(5);
    expect(sessions[0].title).toBe("Test Session 1");
    expect(sessions[4].title).toBe("Test Session 5");
  });

  it("createMockSession generates unique keys", () => {
    const a = createMockSession();
    const b = createMockSession();
    expect(a.key).not.toBe(b.key);
  });
});