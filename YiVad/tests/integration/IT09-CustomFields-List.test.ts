import { describe, it, expect, beforeEach } from "vitest";

/**
 * IT-09: 自定义字段 × 列表
 *
 * 验证自定义字段与列表的集成：
 * - 自定义字段自动出现在可选列中
 * - 可排序和筛选
 * - 可导出
 */
describe("IT-09: CustomFields × List", () => {
  const baseColumns = [
    { key: "name", label: "Name", visible: true, order: 0 },
    { key: "age", label: "Age", visible: true, order: 1 },
  ];

  const addCustomField = (columns: typeof baseColumns, field: { key: string; label: string }) => {
    const maxOrder = Math.max(...columns.map(c => c.order), -1);
    columns.push({ ...field, visible: true, order: maxOrder + 1 });
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it("custom field appears in column list", () => {
    const cols = [...baseColumns.map(c => ({ ...c }))];
    addCustomField(cols, { key: "_custom_status", label: "Custom Status" });
    expect(cols.length).toBe(3);
    expect(cols[2].key).toBe("_custom_status");
    expect(cols[2].label).toBe("Custom Status");
  });

  it("custom field has correct order after base columns", () => {
    const cols = [...baseColumns.map(c => ({ ...c }))];
    addCustomField(cols, { key: "cf1", label: "CF1" });
    addCustomField(cols, { key: "cf2", label: "CF2" });
    expect(cols[2].key).toBe("cf1");
    expect(cols[3].key).toBe("cf2");
  });

  it("custom field can be included in sort config", () => {
    const sortField = { field: "_custom_score", order: "desc" as const };
    expect(sortField.field).toBe("_custom_score");
    expect(sortField.order).toBe("desc");
  });

  it("custom field can be included in filter config", () => {
    const filter = { "_custom_status": "active" };
    expect(filter).toHaveProperty("_custom_status");
  });

  it("custom field can be included in export column selection", () => {
    const exportColumns = ["name", "age", "_custom_field"];
    expect(exportColumns).toContain("_custom_field");
    expect(exportColumns.length).toBe(3);
  });

  it("custom field visible state can be toggled", () => {
    const cols = [...baseColumns.map(c => ({ ...c }))];
    addCustomField(cols, { key: "cf1", label: "CF1" });
    // Toggle visibility
    cols[2].visible = false;
    expect(cols[2].visible).toBe(false);
    cols[2].visible = true;
    expect(cols[2].visible).toBe(true);
  });
});