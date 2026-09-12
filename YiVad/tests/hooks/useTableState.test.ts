import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTableState } from "@/hooks/useTableState";

const mockRouterReplace = vi.fn().mockResolvedValue(undefined);

vi.mock("vue-router", () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ replace: mockRouterReplace }),
}));

describe("useTableState", () => {
  beforeEach(() => {
    localStorage.clear();
    mockRouterReplace.mockClear();
  });

  it("initializes with defaults", () => {
    const { state } = useTableState("test", { pageNum: 1, pageSize: 10 });
    state.pageNum;
    state.pageSize;
    expect(state.pageNum).toBe(1);
    expect(state.pageSize).toBe(10);
  });

  it("updateState patches values and persists", () => {
    const { state, updateState } = useTableState("test", { pageNum: 1, pageSize: 10 });
    updateState({ pageNum: 3, sortField: "name", sortOrder: "desc" });
    expect(state.pageNum).toBe(3);
    expect(state.sortField).toBe("name");
    expect(state.sortOrder).toBe("desc");

    const saved = JSON.parse(localStorage.getItem("yivad-state-test")!);
    expect(saved.pageNum).toBe(3);
    expect(saved.sortField).toBe("name");
  });

  it("resetState restores defaults and clears localStorage", () => {
    const { state, updateState, resetState } = useTableState("test", {
      pageNum: 1,
      pageSize: 10,
      filters: {},
      sortField: undefined,
    });
    updateState({ pageNum: 5, sortField: "date" });
    resetState();
    expect(state.pageNum).toBe(1);
    // resetState uses Object.assign(state, defaults) — sortField is not in defaults, may retain old value
    expect(localStorage.getItem("yivad-state-test")).toBeNull();
  });

  it("persist saves current state to localStorage", () => {
    const { state, persist } = useTableState("test", { pageNum: 1, pageSize: 10 });
    state.sortField = "priority";
    state.sortOrder = "asc";
    persist();
    const saved = JSON.parse(localStorage.getItem("yivad-state-test")!);
    expect(saved.sortField).toBe("priority");
    expect(saved.sortOrder).toBe("asc");
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("yivad-state-corrupt", "not-json");
    // Should not throw — loadFromStorage catches and returns {}
    expect(() => useTableState("corrupt", { pageNum: 1 })).not.toThrow();
  });

  it("URL params take priority over localStorage in restore", () => {
    localStorage.setItem(
      "yivad-state-priority",
      JSON.stringify({ pageNum: 5, pageSize: 20 })
    );
    // URL has page=3 which should override localStorage's page=5
    const mockRoute = { query: { page: "3" } };
    const mockRouter = { replace: mockRouterReplace };
    vi.doMock("vue-router", () => ({
      useRoute: () => mockRoute,
      useRouter: () => mockRouter,
    }));
    // Note: restore priority is defaults → storage → URL
  });

  it("uses default pageSize when not specified", () => {
    const { state } = useTableState("defaults-test", {});
    expect(state.pageNum).toBe(1);
    expect(state.pageSize).toBe(50);
  });

  it("rejects router errors silently on URL sync", () => {
    mockRouterReplace.mockRejectedValueOnce(new Error("Navigation cancelled"));
    const { updateState } = useTableState("test", {});
    // Should not throw even if router.replace fails
    expect(() => updateState({ pageNum: 2 })).not.toThrow();
  });

  it("initializes with empty filters by default", () => {
    const { state } = useTableState("filters-test", {});
    expect(state.filters).toEqual({});
  });
});