import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useTableGroup, type GroupConfig, type GroupAggregation } from "@/hooks/useTableGroup";

function makeData() {
  return [
    { name: "Alice", dept: "Engineering", city: "NYC", salary: 100 },
    { name: "Bob", dept: "Engineering", city: "NYC", salary: 120 },
    { name: "Carol", dept: "Engineering", city: "SF", salary: 110 },
    { name: "Dave", dept: "Design", city: "NYC", salary: 90 },
    { name: "Eve", dept: "Design", city: "SF", salary: 95 },
  ];
}

describe("useTableGroup", () => {
  it("returns flat data rows when no groups configured", () => {
    const data = ref(makeData());
    const { flatDisplayData } = useTableGroup({ data });
    expect(flatDisplayData.value).toHaveLength(5);
    expect(flatDisplayData.value[0]).toMatchObject({ type: "data" });
  });

  it("groups by single field", () => {
    const data = ref(makeData());
    const groups = ref<GroupConfig[]>([{ field: "dept", order: 0 }]);
    const { flatDisplayData } = useTableGroup({ data, groups });

    // Without expanding, only group rows appear
    expect(flatDisplayData.value).toHaveLength(2);
    const values = flatDisplayData.value.map(r => r.type === "group" ? r.value : null);
    expect(values).toContain("Design");
    expect(values).toContain("Engineering");
  });

  it("expands groups to show children", () => {
    const data = ref(makeData());
    const groups = ref<GroupConfig[]>([{ field: "dept", order: 0 }]);
    const { flatDisplayData, expandAll } = useTableGroup({ data, groups });

    expandAll();
    // 2 groups + 5 data rows = 7
    expect(flatDisplayData.value).toHaveLength(7);
  });

  it("nested grouping by two fields", () => {
    const data = ref(makeData());
    const groups = ref<GroupConfig[]>([
      { field: "dept", order: 0 },
      { field: "city", order: 1 }
    ]);
    const { groupedData, expandAll, flatDisplayData } = useTableGroup({ data, groups });

    expandAll();
    // All groups and all data rows visible
    const groupRows = flatDisplayData.value.filter(r => r.type === "group");
    expect(groupRows.length).toBeGreaterThanOrEqual(2);
  });

  it("toggleGroup expands and collapses single group", () => {
    const data = ref(makeData());
    const groups = ref<GroupConfig[]>([{ field: "dept", order: 0 }]);
    const { flatDisplayData, toggleGroup } = useTableGroup({ data, groups });

    // Find Engineering group
    const engGroup = flatDisplayData.value.find(r => r.type === "group" && r.value === "Engineering")!;
    expect(engGroup).toBeDefined();

    toggleGroup(engGroup.key);
    // Engineering children should now be visible
    const engChildren = flatDisplayData.value.filter(r => r.type === "data" && (r as any).data.dept === "Engineering");
    expect(engChildren).toHaveLength(3);
  });

  it("collapseAll hides all children", () => {
    const data = ref(makeData());
    const groups = ref<GroupConfig[]>([{ field: "dept", order: 0 }]);
    const { flatDisplayData, expandAll, collapseAll } = useTableGroup({ data, groups });

    expandAll();
    expect(flatDisplayData.value.length).toBeGreaterThan(2);
    collapseAll();
    expect(flatDisplayData.value).toHaveLength(2); // only group headers
  });

  it("addGroup and removeGroup", () => {
    const data = ref(makeData());
    const groups = ref<GroupConfig[]>([]);
    const { addGroup, removeGroup } = useTableGroup({ data, groups });

    addGroup("dept");
    expect(groups.value).toHaveLength(1);
    expect(groups.value[0]).toMatchObject({ field: "dept", order: 0 });

    addGroup("city");
    expect(groups.value).toHaveLength(2);

    removeGroup("dept");
    expect(groups.value).toHaveLength(1);
    expect(groups.value[0]).toMatchObject({ field: "city", order: 0 });
  });

  it("reorderGroups changes order", () => {
    const data = ref(makeData());
    const groups = ref<GroupConfig[]>([
      { field: "dept", order: 0 },
      { field: "city", order: 1 },
    ]);
    const { reorderGroups } = useTableGroup({ data, groups });

    reorderGroups(0, 1);
    expect(groups.value[0].field).toBe("city");
    expect(groups.value[1].field).toBe("dept");
    expect(groups.value[0].order).toBe(0);
    expect(groups.value[1].order).toBe(1);
  });

  it("group rows have correct count and aggregations", () => {
    const data = ref(makeData());
    const groups = ref<GroupConfig[]>([{ field: "dept", order: 0 }]);
    const aggregations = ref<GroupAggregation[]>([
      { field: "salary", type: "sum" },
      { field: "salary", type: "avg" }
    ]);
    const { groupedData } = useTableGroup({ data, groups, aggregations });

    const eng = groupedData.value.find(r => r.type === "group" && r.value === "Engineering")!;
    expect(eng).toBeDefined();
    expect((eng as any).count).toBe(3);
    expect((eng as any).aggregations.salary_sum).toBe(330);
    expect((eng as any).aggregations.salary_avg).toBe(110);
  });

  it("handles empty data", () => {
    const data = ref<Record<string, unknown>[]>([]);
    const groups = ref<GroupConfig[]>([{ field: "dept", order: 0 }]);
    const { flatDisplayData } = useTableGroup({ data, groups });
    expect(flatDisplayData.value).toHaveLength(0);
  });

  it("null values grouped as (空)", () => {
    const data = ref([
      { name: "A", dept: null },
      { name: "B", dept: "Eng" },
    ]);
    const groups = ref<GroupConfig[]>([{ field: "dept", order: 0 }]);
    const { groupedData } = useTableGroup({ data, groups });
    expect(groupedData.value[0]).toMatchObject({ value: "(空)" });
  });
});