import { describe, it, expect, beforeEach } from "vitest";
import { useColumnManager, type ColumnConfig } from "@/hooks/useColumnManager";

function makeDefaults(): ColumnConfig[] {
  return [
    { key: "name", label: "Name", visible: true, order: 0, sortable: true },
    { key: "email", label: "Email", visible: true, order: 1 },
    { key: "phone", label: "Phone", visible: false, order: 2 },
    { key: "status", label: "Status", visible: true, order: 3 },
  ];
}

describe("useColumnManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns only visible columns sorted by order", () => {
    const { visibleColumns } = useColumnManager("test", makeDefaults());
    expect(visibleColumns.value).toHaveLength(3);
    expect(visibleColumns.value.map((c) => c.key)).toEqual(["name", "email", "status"]);
  });

  it("toggleColumn flips visibility", () => {
    const { visibleColumns, toggleColumn } = useColumnManager("test", makeDefaults());
    toggleColumn("name");
    expect(visibleColumns.value.map((c) => c.key)).toEqual(["email", "status"]);
  });

  it("resizeColumn updates width", () => {
    const { resizeColumn, visibleColumns } = useColumnManager("resize-test", makeDefaults());
    resizeColumn("name", 200);
    expect(visibleColumns.value.find((c) => c.key === "name")?.width).toBe(200);
  });

  it("reorderColumns rearranges columns", () => {
    const { reorderColumns, visibleColumns } = useColumnManager("reorder-test", makeDefaults());
    reorderColumns(0, 1);
    // phone is invisible but participates in reorder
    // After moving name(0) to position 1: email(0,V), name(1,V), phone(2,H), status(3,V)
    expect(visibleColumns.value.map((c) => c.key)).toEqual(["email", "name", "status"]);
  });

  it("freezeColumn sets position", () => {
    const { freezeColumn, visibleColumns } = useColumnManager("freeze-test", makeDefaults());
    freezeColumn("name", "left");
    expect(visibleColumns.value.find((c) => c.key === "name")?.fixed).toBe("left");
  });

  it("resetToDefault clears localStorage persistence", () => {
    const { toggleColumn, resetToDefault, visibleColumns } =
      useColumnManager("reset-clear-test", makeDefaults());
    const beforeCount = visibleColumns.value.length;
    toggleColumn("name");
    expect(visibleColumns.value.length).toBe(beforeCount - 1);
    resetToDefault();
    // resetToDefault clears localStorage; columns revert to original defaults
    expect(localStorage.getItem("yivad-columns-reset-clear-test")).toBeNull();
  });

  it("showAll and hideAll toggle all columns", () => {
    const { showAll, hideAll, visibleColumns } = useColumnManager("all-test", makeDefaults());
    showAll();
    expect(visibleColumns.value).toHaveLength(4);
    hideAll();
    expect(visibleColumns.value).toHaveLength(0);
  });

  it("persists column config to localStorage", () => {
    const { toggleColumn } = useColumnManager("persist-test", makeDefaults());
    toggleColumn("name");
    const saved = JSON.parse(localStorage.getItem("yivad-columns-persist-test")!);
    expect(saved.length).toBeGreaterThanOrEqual(1);
  });

  it("restores from localStorage on init", () => {
    localStorage.setItem(
      "yivad-columns-restore-test",
      JSON.stringify([{ key: "name", visible: false, order: 0 }])
    );
    const { visibleColumns } = useColumnManager("restore-test", [
      { key: "name", label: "Name", visible: true, order: 0 },
    ]);
    expect(visibleColumns.value).toHaveLength(0);
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("yivad-columns-corrupt-test", "{not-valid-json");
    expect(() => useColumnManager("corrupt-test", makeDefaults())).not.toThrow();
  });
});