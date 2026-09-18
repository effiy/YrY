import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AdvancedFilter from "@/components/ProTable/components/AdvancedFilter.vue";

const fields = [
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
];

describe("AdvancedFilter", () => {
  const mountFilter = (props: Record<string, any> = {}) =>
    mount(AdvancedFilter, {
      props: { fields, ...props },
      global: {
        stubs: {
          Teleport: { template: '<div class="teleport-stub"><slot /></div>' },
        },
      },
    });

  it("CT-07-4: exposes open and close methods", () => {
    const wrapper = mountFilter();
    expect(typeof wrapper.vm.open).toBe("function");
    expect(typeof wrapper.vm.close).toBe("function");
  });

  it("CT-07-4: open method shows dialog", async () => {
    const wrapper = mountFilter();
    expect(wrapper.vm.visible).toBe(false);
    wrapper.vm.open();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.visible).toBe(true);
  });

  it("CT-07-4: close method hides dialog", async () => {
    const wrapper = mountFilter();
    wrapper.vm.open();
    await wrapper.vm.$nextTick();
    wrapper.vm.close();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.visible).toBe(false);
  });

  it("CT-07-4: renders FilterPanel inside dialog when opened", async () => {
    const wrapper = mountFilter();
    wrapper.vm.open();
    await wrapper.vm.$nextTick();
    // FilterPanel is a child component
    const filterPanel = wrapper.findComponent({ name: "FilterPanel" });
    expect(filterPanel.exists()).toBe(true);
  });

  it("CT-07-4: displays preview count when provided", async () => {
    const wrapper = mountFilter({ previewCount: 42 });
    wrapper.vm.open();
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("42");
  });

  it("CT-07-4: hides preview when count is null", async () => {
    const wrapper = mountFilter({ previewCount: null });
    wrapper.vm.open();
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".advanced-filter__preview").exists()).toBe(false);
  });

  it("emits apply from FilterPanel and closes", async () => {
    const wrapper = mountFilter();
    wrapper.vm.open();
    await wrapper.vm.$nextTick();

    const filterPanel = wrapper.findComponent({ name: "FilterPanel" });
    await filterPanel.vm.$emit("apply", [{ field: "name", operator: "eq", value: "test" }]);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("apply")).toBeTruthy();
    expect(wrapper.emitted("apply")![0][0]).toEqual([
      { field: "name", operator: "eq", value: "test" },
    ]);
  });

  it("emits clear from FilterPanel", async () => {
    const wrapper = mountFilter();
    wrapper.vm.open();
    await wrapper.vm.$nextTick();

    const filterPanel = wrapper.findComponent({ name: "FilterPanel" });
    await filterPanel.vm.$emit("clear");

    expect(wrapper.emitted("clear")).toBeTruthy();
  });
});