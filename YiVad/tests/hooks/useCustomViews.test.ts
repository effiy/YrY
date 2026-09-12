import { describe, it, expect, beforeEach } from "vitest";
import { useCustomViews } from "@/hooks/useCustomViews";

describe("useCustomViews", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads with empty views initially", () => {
    const { views } = useCustomViews("bugs");
    expect(views.value).toEqual([]);
  });

  it("saveView creates a new view with auto-generated id", () => {
    const { views, saveView } = useCustomViews("bugs");
    const view = saveView("My View", { filters: { status: "open" } });
    expect(view.name).toBe("My View");
    expect(view.entityType).toBe("bugs");
    expect(view.id).toMatch(/^view-\d+$/);
    expect(view.isDefault).toBe(true);
    expect(views.value).toHaveLength(1);
  });

  it("saveView persists to localStorage", () => {
    const { saveView } = useCustomViews("bugs");
    saveView("Test View", { filters: { priority: "high" } });
    const saved = JSON.parse(localStorage.getItem("yivad-views-bugs")!);
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe("Test View");
  });

  it("second view is not default", () => {
    const { saveView } = useCustomViews("tasks");
    const a = saveView("A", {});
    const b = saveView("B", {});
    expect(a.isDefault).toBe(true);
    expect(b.isDefault).toBe(false);
  });

  it("setDefaultView persists the change", () => {
    const { saveView, setDefaultView } = useCustomViews("tasks");
    const a = saveView("A", {});
    const b = saveView("B", {});
    setDefaultView(b.id);
    const saved = JSON.parse(localStorage.getItem("yivad-views-tasks")!);
    const savedB = saved.find((v: any) => v.id === b.id);
    expect(savedB.isDefault).toBe(true);
  });

  it("deleteView removes a view", () => {
    const { views, saveView, deleteView } = useCustomViews("tasks");
    const v = saveView("To Delete", {});
    expect(views.value).toHaveLength(1);
    deleteView(v.id);
    expect(views.value).toHaveLength(0);
  });

  it("activateView sets activeViewId", () => {
    const { activeViewId, saveView, activateView } = useCustomViews("tasks");
    const v = saveView("A", {});
    activateView(v.id);
    expect(activeViewId.value).toBe(v.id);
  });

  it("getShareUrl builds URL with view params", () => {
    const { saveView, getShareUrl } = useCustomViews("tasks");
    const v = saveView("Shared", {
      sortField: "priority",
      sortOrder: "desc",
      filters: { status: "open" },
    });
    const url = getShareUrl(v.id);
    expect(url).toContain("view=" + v.id);
    expect(url).toContain("sortField=priority");
    expect(url).toContain("sortOrder=desc");
    expect(url).toContain("status=open");
  });

  it("getShareUrl excludes empty filter values", () => {
    const { saveView, getShareUrl } = useCustomViews("tasks");
    const v = saveView("Empty", { filters: { status: "", name: undefined } });
    const url = getShareUrl(v.id);
    expect(url).not.toContain("status=");
    expect(url).not.toContain("name=");
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("yivad-views-corrupt", "bad-json");
    expect(() => useCustomViews("corrupt")).not.toThrow();
  });

  it("restores views from localStorage on init", () => {
    const saved = [
      { id: "v1", name: "Saved", entityType: "test", filters: {}, isDefault: true, createdAt: "2026-01-01" },
    ];
    localStorage.setItem("yivad-views-test", JSON.stringify(saved));
    const { views } = useCustomViews("test");
    expect(views.value).toHaveLength(1);
    expect(views.value[0].name).toBe("Saved");
  });
});