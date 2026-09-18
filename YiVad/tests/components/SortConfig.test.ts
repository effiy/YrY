import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SortConfig from "@/components/ProTable/components/SortConfig.vue";

const columns = [
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
  { key: "createdAt", label: "Created At" },
];

describe("SortConfig", () => {
  const mountSort = (props: Record<string, any> = {}) =>
    mount(SortConfig, {
      props: { modelValue: [], columns, ...props },
      global: {
        stubs: {
          ElPopover: { template: '<div class="popover-stub"><slot /><slot name="reference" /></div>' },
        },
      },
    });

  it("CT-06-1: renders component structure", () => {
    const wrapper = mountSort();
    expect(wrapper.find(".sort-config").exists()).toBe(true);
  });

  it("CT-06-1: renders Sort reference button", () => {
    const wrapper = mountSort();
    expect(wrapper.text()).toContain("Sort");
  });

  it("CT-06-2: renders add button", () => {
    const wrapper = mountSort();
    expect(wrapper.find(".sort-config__header").text()).toContain("Add");
  });

  it("CT-06-2: add sort emits update:modelValue", async () => {
    const wrapper = mountSort({ modelValue: [] });
    const header = wrapper.find(".sort-config__header");
    const addBtn = header.findComponent({ name: "ElButton" });
    await addBtn.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
  });

  it("CT-06-3: shows empty state when no sort fields", () => {
    const wrapper = mountSort({ modelValue: [] });
    expect(wrapper.find(".sort-config__empty").exists()).toBe(true);
    expect(wrapper.text()).toContain("Add");
  });

  it("CT-06-3: hides empty state when sort fields exist", () => {
    const wrapper = mountSort({
      modelValue: [{ field: "name", order: "asc" }],
    });
    expect(wrapper.find(".sort-config__empty").exists()).toBe(false);
  });

  it("CT-06-4: renders sort field rows", () => {
    const wrapper = mountSort({
      modelValue: [
        { field: "name", order: "asc" },
        { field: "age", order: "desc" },
      ],
    });
    const rows = wrapper.findAll(".sort-config__row");
    expect(rows.length).toBe(2);
  });

  it("renders Clear and Apply buttons in footer", () => {
    const wrapper = mountSort({
      modelValue: [{ field: "name", order: "asc" }],
    });
    const footer = wrapper.find(".sort-config__footer");
    expect(footer.exists()).toBe(true);
    expect(footer.text()).toContain("Clear");
    expect(footer.text()).toContain("Apply");
  });

  it("handles empty columns gracefully", () => {
    const wrapper = mount(SortConfig, {
      props: { modelValue: [], columns: [] },
      global: {
        stubs: {
          ElPopover: { template: '<div class="popover-stub"><slot /><slot name="reference" /></div>' },
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});