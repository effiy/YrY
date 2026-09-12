import { describe, it, expect } from "vitest";
import { useProjectFilter } from "@/views/project/composables/useProjectFilter";

describe("useProjectFilter", () => {
  it("has no active filter by default", () => {
    const { hasActiveFilter } = useProjectFilter();
    expect(hasActiveFilter.value).toBe(false);
  });

  it("canUndo is false by default", () => {
    const { canUndo } = useProjectFilter();
    expect(canUndo.value).toBe(false);
  });

  it("sets a filter and marks it active", () => {
    const { setFilter, activeFilter, hasActiveFilter } = useProjectFilter();
    setFilter("status", "active");
    expect(activeFilter.value.status).toBe("active");
    expect(hasActiveFilter.value).toBe(true);
  });

  it("toggles filter off when clicking the same value", () => {
    const { setFilter, activeFilter } = useProjectFilter();
    setFilter("status", "active");
    setFilter("status", "active");
    expect(activeFilter.value.status).toBeUndefined();
  });

  it("undoes last filter change", () => {
    const { setFilter, activeFilter, undoLastFilter, canUndo } = useProjectFilter();
    setFilter("status", "active");
    setFilter("risk", "overdue");
    undoLastFilter();
    expect(activeFilter.value.status).toBe("active");
    expect(activeFilter.value.risk).toBeUndefined();
    expect(canUndo.value).toBe(true);
  });

  it("removes a single filter dimension", () => {
    const { setFilter, removeFilter, activeFilter } = useProjectFilter();
    setFilter("status", "active");
    setFilter("risk", "overdue");
    removeFilter("status");
    expect(activeFilter.value.status).toBeUndefined();
    expect(activeFilter.value.risk).toBe("overdue");
  });

  it("clears all filters", () => {
    const { setFilter, clearAllFilters, activeFilter, hasActiveFilter } = useProjectFilter();
    setFilter("status", "active");
    setFilter("risk", "overdue");
    clearAllFilters();
    expect(activeFilter.value).toEqual({});
    expect(hasActiveFilter.value).toBe(false);
  });

  it("no-ops clearAllFilters when already empty", () => {
    const { clearAllFilters, hasActiveFilter } = useProjectFilter();
    clearAllFilters();
    expect(hasActiveFilter.value).toBe(false);
  });

  it("matchesFilter filters by status", () => {
    const { setFilter, matchesFilter } = useProjectFilter();
    setFilter("status", "active");
    const project = { key: "PL", name: "Test", status: "active" } as any;
    const stats = { statuses: {}, openPriorities: {}, types: {} } as any;
    expect(matchesFilter(project, stats, [], "good")).toBe(true);
    expect(matchesFilter({ ...project, status: "archived" }, stats, [], "good")).toBe(false);
  });

  it("matchesFilter filters by risk", () => {
    const { setFilter, matchesFilter } = useProjectFilter();
    setFilter("risk", "overdue");
    const project = { key: "PL", name: "Test", status: "active" } as any;
    const stats = { statuses: {}, openPriorities: {}, types: {} } as any;
    expect(matchesFilter(project, stats, ["overdue"], "good")).toBe(true);
    expect(matchesFilter(project, stats, ["stale"], "good")).toBe(false);
  });

  it("matchesFilter filters by health", () => {
    const { setFilter, matchesFilter } = useProjectFilter();
    setFilter("health", "poor");
    const project = { key: "PL", name: "Test", status: "active" } as any;
    const stats = { statuses: {}, openPriorities: {}, types: {} } as any;
    expect(matchesFilter(project, stats, [], "poor")).toBe(true);
    expect(matchesFilter(project, stats, [], "good")).toBe(false);
  });

  it("matchesFilter filters by flagged projects", () => {
    const { setFilter, matchesFilter } = useProjectFilter();
    setFilter("flagged", "true");
    const project = { key: "PL", name: "Test", status: "active" } as any;
    const stats = { statuses: {}, openPriorities: {}, types: {} } as any;
    expect(matchesFilter(project, stats, ["overdue"], "good")).toBe(true);
    expect(matchesFilter(project, stats, [], "good")).toBe(false);
  });

  it("generates filter pills with correct metadata", () => {
    const { setFilter, activeFilterPills } = useProjectFilter();
    setFilter("status", "active");
    expect(activeFilterPills.value).toHaveLength(1);
    expect(activeFilterPills.value[0]).toMatchObject({
      key: "status",
      val: "active",
    });
    expect(activeFilterPills.value[0].color).toBeDefined();
  });
});