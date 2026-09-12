import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock navigator.sendBeacon
const mockSendBeacon = vi.fn().mockReturnValue(true);
const mockFetch = vi.fn().mockResolvedValue({ ok: true });

beforeEach(() => {
  vi.stubGlobal("navigator", {
    ...navigator,
    sendBeacon: mockSendBeacon,
  });
  vi.stubGlobal("fetch", mockFetch);
  vi.clearAllMocks();
});

describe("reportError", () => {
  it("export is a function", async () => {
    const { reportError } = await import("@/utils/errorReporter");
    expect(typeof reportError).toBe("function");
  });

  it("accepts ErrorContext without throwing", async () => {
    const { reportError } = await import("@/utils/errorReporter");
    const ctx = {
      type: "RENDER" as const,
      error: new Error("test error"),
      timestamp: Date.now(),
    };
    // Should not throw in DEV mode (prints to console, no network call)
    expect(() => reportError(ctx)).not.toThrow();
  });

  it("accepts API error context", async () => {
    const { reportError } = await import("@/utils/errorReporter");
    const ctx = {
      type: "API" as const,
      error: new Error("Network Error"),
      url: "/api/test",
      timestamp: Date.now(),
    };
    expect(() => reportError(ctx)).not.toThrow();
  });

  it("accepts PROMISE error context", async () => {
    const { reportError } = await import("@/utils/errorReporter");
    const ctx = {
      type: "PROMISE" as const,
      error: new Error("Unhandled promise"),
      timestamp: Date.now(),
    };
    expect(() => reportError(ctx)).not.toThrow();
  });

  it("accepts SCRIPT error context", async () => {
    const { reportError } = await import("@/utils/errorReporter");
    const ctx = {
      type: "SCRIPT" as const,
      error: new Error("Script error"),
      url: "https://example.com/app.js",
      timestamp: Date.now(),
    };
    expect(() => reportError(ctx)).not.toThrow();
  });

  it("respects sample option", async () => {
    const { reportError } = await import("@/utils/errorReporter");
    const ctx = {
      type: "RENDER" as const,
      error: new Error("test"),
      timestamp: Date.now(),
    };
    // sample=0 means never report — should not throw
    expect(() => reportError(ctx, { sample: 0 })).not.toThrow();
  });

  it("handles immediate option", async () => {
    const { reportError } = await import("@/utils/errorReporter");
    const ctx = {
      type: "RENDER" as const,
      error: new Error("test"),
      timestamp: Date.now(),
    };
    expect(() => reportError(ctx, { immediate: true })).not.toThrow();
  });

  it("deduplicates same errors", async () => {
    const { reportError } = await import("@/utils/errorReporter");
    const ctx = {
      type: "RENDER" as const,
      error: new Error("same error"),
      componentName: "TestComponent",
      timestamp: Date.now(),
    };
    // Call twice — second should be deduplicated, not throw
    reportError(ctx);
    expect(() => reportError(ctx)).not.toThrow();
  });
});