import type { SessionRecord } from "../../src/api/types";

let counter = 0;

export function createMockSession(overrides?: Partial<SessionRecord>): SessionRecord {
  counter++;
  const now = Date.now();
  return {
    key: `mock_session_${counter}_${now}`,
    title: `Test Session ${counter}`,
    url: "https://example.com",
    pageDescription: "A test session for development",
    messages: [],
    tags: ["source:test"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createMockSessions(count: number): SessionRecord[] {
  return Array.from({ length: count }, (_, i) =>
    createMockSession({ title: `Test Session ${i + 1}` })
  );
}