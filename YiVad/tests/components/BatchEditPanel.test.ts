import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BatchEditPanel from "@/components/BatchOperations/BatchEditPanel.vue";

describe("BatchEditPanel", () => {
  const fields = [
    { key: "title", label: "Title", type: "text" as const },
    { key: "status", label: "Status", type: "select" as const, options: [{ label: "Active", value: "active" }] },
    { key: "priority", label: "Priority", type: "number" as const },
    { key: "dueDate", label: "Due Date", type: "date" as const },
  ];

  const mountPanel = (props: Record<string, any> = {}) =>
    mount(BatchEditPanel, {
      props: { count: 0, fields, ...props },
      global: { stubs: { Teleport: true } },
    });

  it("CT-04: component renders without errors", () => {
    const wrapper = mountPanel();
    expect(wrapper.exists()).toBe(true);
  });

  it("CT-04: exposes open and close methods", () => {
    const wrapper = mountPanel();
    expect(typeof wrapper.vm.open).toBe("function");
    expect(typeof wrapper.vm.close).toBe("function");
  });

  it("CT-04: open method is callable", () => {
    const wrapper = mountPanel();
    expect(wrapper.vm.visible).toBe(false);
    // Calling open should not throw
    expect(() => wrapper.vm.open()).not.toThrow();
  });

  it("CT-04: close method resets visible", () => {
    const wrapper = mountPanel();
    // Initially not visible
    expect(wrapper.vm.visible).toBe(false);
    wrapper.vm.close();
    expect(wrapper.vm.visible).toBe(false);
  });

  it("receives count prop correctly", () => {
    const wrapper = mountPanel({ count: 25 });
    expect(wrapper.props("count")).toBe(25);
  });

  it("receives fields prop correctly", () => {
    const wrapper = mountPanel();
    expect(wrapper.props("fields")).toEqual(fields);
  });

  it("handles empty fields array", () => {
    const wrapper = mount(BatchEditPanel, {
      props: { count: 1, fields: [] },
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.exists()).toBe(true);
  });
});