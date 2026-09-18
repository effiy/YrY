/**
 * Deterministic tests for the pre-stream tool execution pipeline.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useToolExecution } from "@/views/ai-chat/composables/useToolExecution";
import type { WebSearchResult } from "@/api/modules/searchService";

function makeRef<T>(initial: T): { value: T } {
  return { value: initial };
}

interface Deps {
  webSearchEnabled: { value: boolean };
  webSearchResults: { value: WebSearchResult[] };
  webSearching: { value: boolean };
  streamingPhase: { value: string };
  executeTool: ReturnType<typeof vi.fn>;
  setActiveMessages: ReturnType<typeof vi.fn>;
  activeConversation: { value: any };
  persistActive: ReturnType<typeof vi.fn>;
  runStream: ReturnType<typeof vi.fn>;
}

function makeDeps(overrides?: Partial<Deps>): Deps {
  return {
    webSearchEnabled: makeRef(true),
    webSearchResults: makeRef<WebSearchResult[]>([]),
    webSearching: makeRef(false),
    streamingPhase: makeRef("idle"),
    executeTool: vi.fn(),
    setActiveMessages: vi.fn(),
    activeConversation: makeRef({ messages: [], key: "test" }),
    persistActive: vi.fn().mockResolvedValue(true),
    runStream: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as Deps;
}

function sampleResults(): WebSearchResult[] {
  return [
    { title: "Result 1", url: "https://github.com/1", snippet: "First result" },
    { title: "Result 2", url: "https://stackoverflow.com/2", snippet: "Second" },
  ];
}

describe("useToolExecution", () => {
  let deps: Deps;
  let signal: AbortSignal;

  beforeEach(() => {
    deps = makeDeps();
    signal = new AbortController().signal;
  });

  describe("executePreStreamTools", () => {
    const query = "test query with enough chars for search";

    it("returns empty when webSearchEnabled is false", async () => {
      deps.webSearchEnabled.value = false;
      const { executePreStreamTools } = useToolExecution(deps);
      const r = await executePreStreamTools(query, signal, Date.now());
      expect(r.initialContext).toBe("");
      expect(r.timingMs).toBe(0);
    });

    it("returns empty for empty query", async () => {
      const { executePreStreamTools } = useToolExecution(deps);
      const r = await executePreStreamTools("", signal, Date.now());
      expect(r.initialContext).toBe("");
    });

    it("skips search for non-search-worthy queries", async () => {
      const { executePreStreamTools } = useToolExecution(deps);
      const r = await executePreStreamTools("hi", signal, Date.now());
      expect(r.initialContext).toBe("");
      expect(deps.streamingPhase.value).toBe("thinking");
    });

    it("sets streamingPhase to fetching on search start", async () => {
      deps.executeTool.mockResolvedValue({ content: "x", details: sampleResults() });
      const { executePreStreamTools } = useToolExecution(deps);
      const p = executePreStreamTools(query, signal, Date.now());
      expect(deps.streamingPhase.value).toBe("fetching");
      await p;
    });

    it("formats details into context when results returned", async () => {
      deps.executeTool.mockResolvedValue({ details: sampleResults() });
      const { executePreStreamTools } = useToolExecution(deps);
      const r = await executePreStreamTools("q1 format details", signal, Date.now());
      expect(r.initialContext).toContain("Real-time Web Search Results");
      expect(deps.webSearchResults.value).toHaveLength(2);
    });

    it("returns content as-is when no details present", async () => {
      deps.executeTool.mockResolvedValue({ content: "direct context" });
      const { executePreStreamTools } = useToolExecution(deps);
      const r = await executePreStreamTools("q2 direct content", signal, Date.now());
      expect(r.initialContext).toBe("direct context");
    });

    it("returns empty context when search fails", async () => {
      deps.executeTool.mockRejectedValue(new Error("fail"));
      const { executePreStreamTools } = useToolExecution(deps);
      const r = await executePreStreamTools("q3 search fail", signal, Date.now());
      expect(r.initialContext).toBe("");
    });

    it("pendingSearch stays pending for on-time results", async () => {
      deps.executeTool.mockResolvedValue({ details: sampleResults() });
      const { executePreStreamTools } = useToolExecution(deps);
      const r = await executePreStreamTools("q4 pending search", signal, Date.now());
      let resolved = false;
      r.pendingSearch.then(() => { resolved = true; });
      await new Promise(r => setTimeout(r, 10));
      expect(resolved).toBe(false);
    });

    it("sets webSearching false after completion", async () => {
      deps.executeTool.mockResolvedValue({ content: "ok" });
      const { executePreStreamTools } = useToolExecution(deps);
      await executePreStreamTools("q5 web searching", signal, Date.now());
      expect(deps.webSearching.value).toBe(false);
    });

    it("sets webSearching false after failure", async () => {
      deps.executeTool.mockRejectedValue(new Error("fail"));
      const { executePreStreamTools } = useToolExecution(deps);
      await executePreStreamTools("q6 web searching fail", signal, Date.now());
      expect(deps.webSearching.value).toBe(false);
    });
  });
});