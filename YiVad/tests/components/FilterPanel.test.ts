import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FilterPanel, { type FilterCondition } from "@/components/ProTable/components/FilterPanel.vue";

const fields = [
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
  { key: "age", label: "Age" },
  { key: "createdAt", label: "Created At" },
];

describe("FilterPanel", () => {
  const mountPanel = (props: Record<string, any> = {}) =>
    mount(FilterPanel, {
      props: { conditions: [], fields, ...props },
    });

  it("CT-07-1: renders component structure", () => {
    const wrapper = mountPanel();
    expect(wrapper.find(".filter-panel").exists()).toBe(true);
  });

  it("CT-07-1: renders footer with Add/Clear/Apply buttons", () => {
    const wrapper = mountPanel();
    expect(wrapper.find(".filter-panel__footer").exists()).toBe(true);
    expect(wrapper.text()).toContain("Add condition");
    expect(wrapper.text()).toContain("Clear");
    expect(wrapper.text()).toContain("Apply");
  });

  it("CT-07-5: add condition button emits update:conditions", async () => {
    const wrapper = mountPanel();
    // The "+ Add condition" button is in the footer
    const footer = wrapper.find(".filter-panel__footer");
    const buttons = footer.findAllComponents({ name: "ElButton" });
    const addBtn = buttons.find(b => b.text().includes("Add"));
    await addBtn!.trigger("click");
    expect(wrapper.emitted("update:conditions")).toBeTruthy();
  });

  it("CT-07-5: emits apply with conditions", () => {
    const conditions: FilterCondition[] = [
      { field: "name", operator: "contains", value: "test" },
    ];
    const wrapper = mountPanel({ conditions });
    const footer = wrapper.find(".filter-panel__footer");
    const buttons = footer.findAllComponents({ name: "ElButton" });
    const applyBtn = buttons.find(b => b.text() === "Apply");
    applyBtn!.vm.$emit("click");
    expect(wrapper.emitted("apply")).toBeTruthy();
  });

  it("CT-07-5: emits clear event", () => {
    const wrapper = mountPanel({
      conditions: [{ field: "name", operator: "eq", value: "x" }],
    });
    const footer = wrapper.find(".filter-panel__footer");
    const buttons = footer.findAllComponents({ name: "ElButton" });
    const clearBtn = buttons.find(b => b.text() === "Clear");
    clearBtn!.vm.$emit("click");
    expect(wrapper.emitted("clear")).toBeTruthy();
  });

  it("CT-07-8: hides value input for is_empty operator", () => {
    const conditions: FilterCondition[] = [
      { field: "name", operator: "is_empty", value: "" },
    ];
    const wrapper = mountPanel({ conditions });
    // For is_empty, the ElInput should not be rendered
    const inputs = wrapper.findAllComponents({ name: "ElInput" });
    expect(inputs.length).toBe(0);
  });

  it("renders condition rows for each filter condition", () => {
    const conditions: FilterCondition[] = [
      { field: "name", operator: "eq", value: "a" },
      { field: "age", operator: "gt", value: "18", logic: "and" },
    ];
    const wrapper = mountPanel({ conditions });
    const conditionRows = wrapper.findAll(".filter-panel__condition");
    expect(conditionRows.length).toBe(2);
  });

  it("handles empty fields gracefully", () => {
    const wrapper = mount(FilterPanel, {
      props: { conditions: [], fields: [] },
    });
    expect(wrapper.exists()).toBe(true);
  });
});