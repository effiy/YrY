import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";
import { useColumnManager, type ColumnConfig } from "@/hooks/useColumnManager";

vi.mock("vue-router", () => ({
  useRoute: () => ({
    query: {},
    path: "/test",
    params: {},
  }),
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
}));

const defaultColumns: ColumnConfig[] = [
  { key: "name", label: "Name", visible: true, order: 0, sortable: true },
  { key: "age", label: "Age", visible: true, order: 1, sortable: true },
  { key: "email", label: "Email", visible: false, order: 2, sortable: true },
];

describe("IT-02: ColumnManager × TableState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("column config persists to localStorage via column manager", () => {
    const cm1 = useColumnManager("test-it02", defaultColumns);
    cm1.toggleColumn("email"); // make email visible
    expect(cm1.visibleColumns.value.length).toBe(3);

    // New instance with same key reads persisted config
    const cm2 = useColumnManager("test-it02", defaultColumns);
    expect(cm2.visibleColumns.value.length).toBe(3);
    expect(cm2.visibleColumns.value.map(c => c.key)).toContain("email");
  });

  it("resetToDefault clears persisted config", () => {
    const cm1 = useColumnManager("test-it02-reset", defaultColumns);
    cm1.toggleColumn("email");
    cm1.resetToDefault();

    const cm2 = useColumnManager("test-it02-reset", defaultColumns);
    expect(cm2.visibleColumns.value.length).toBe(2); // only original visible cols
  });

  it("column width and freeze persist across instances", () => {
    const cm = useColumnManager("test-it02-state", defaultColumns);
    cm.resizeColumn("name", 200);
    cm.freezeColumn("name", "left");

    const cm2 = useColumnManager("test-it02-state", defaultColumns);
    const nameCol = cm2.columns.value.find(c => c.key === "name");
    expect(nameCol?.width).toBe(200);
    expect(nameCol?.fixed).toBe("left");
  });

  it("showAll and hideAll toggle all columns", () => {
    const cm = useColumnManager("test-it02-all", defaultColumns);
    cm.hideAll();
    expect(cm.visibleColumns.value.length).toBe(0);

    cm.showAll();
    expect(cm.visibleColumns.value.length).toBe(3);
  });

  it("reorderColumns updates order and persists", () => {
    const cm = useColumnManager("test-it02-reorder", defaultColumns);
    cm.reorderColumns(0, 2); // move first to last
    expect(cm.visibleColumns.value[0].key).toBe("age");
    expect(cm.visibleColumns.value[1].key).toBe("email");
    expect(cm.visibleColumns.value[2].key).toBe("name");

    const cm2 = useColumnManager("test-it02-reorder", defaultColumns);
    expect(cm2.visibleColumns.value[0].key).toBe("age");
  });

  it("corrupted localStorage falls back to defaults", () => {
    localStorage.setItem("yivad-columns-test-it02-corrupt", "{invalid");
    const freshDefaults: ColumnConfig[] = [
      { key: "a", label: "A", visible: true, order: 0 },
      { key: "b", label: "B", visible: false, order: 1 },
    ];
    const cm = useColumnManager("test-it02-corrupt", freshDefaults);
    expect(cm.columns.value.length).toBe(2);
    expect(cm.visibleColumns.value.length).toBe(1);
  });
});