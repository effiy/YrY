import { describe, it, expect, vi } from "vitest";

vi.mock("@/stores/modules/project", () => ({
  useProjectStore: () => ({
    currentProject: null,
    fetchProject: vi.fn().mockResolvedValue(null),
  }),
}));

vi.mock("@/api/modules/knowledgeService", () => ({
  listKnowledgeFiles: vi.fn().mockResolvedValue({ files: [] }),
}));
vi.mock("@/api/modules/issueService", () => ({
  getIssueList: vi.fn().mockResolvedValue({ data: { list: [] } }),
}));
vi.mock("@/api/modules/moduleService", () => ({
  getModuleList: vi.fn().mockResolvedValue({ data: { list: [] } }),
}));
vi.mock("@/api/modules/bug", () => ({
  getBugList: vi.fn().mockResolvedValue({ data: { list: [] } }),
}));

describe("useProjectDetail", () => {
  it("module exports the hook", async () => {
    const mod = await import("@/hooks/useProjectDetail");
    expect(mod.useProjectDetail).toBeDefined();
  });

  it("returns data containers on empty key", async () => {
    const { useProjectDetail } = await import("@/hooks/useProjectDetail");
    const { ref } = await import("vue");
    const key = ref("");  // empty key triggers early return
    const { knowledgeFiles, allIssues, allModules, allBugs, lastUpdated, retry } = useProjectDetail(key);
    expect(knowledgeFiles.value).toEqual([]);
    expect(allIssues.value).toEqual([]);
    expect(allModules.value).toEqual([]);
    expect(allBugs.value).toEqual([]);
    expect(typeof lastUpdated.value).toBe("number");
    expect(typeof retry).toBe("function");
  });

  it("has polling lifecycle methods", async () => {
    const { useProjectDetail } = await import("@/hooks/useProjectDetail");
    const { ref } = await import("vue");
    const key = ref("");
    const { startPolling, stopPolling } = useProjectDetail(key);
    expect(typeof startPolling).toBe("function");
    expect(typeof stopPolling).toBe("function");
    expect(() => stopPolling()).not.toThrow();
  });

  it("project is a computed from store", async () => {
    const { useProjectDetail } = await import("@/hooks/useProjectDetail");
    const { ref } = await import("vue");
    const key = ref("");
    const { project, loading, error } = useProjectDetail(key);
    expect(project).toBeDefined();
  });
});
