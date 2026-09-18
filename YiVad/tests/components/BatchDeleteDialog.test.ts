import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BatchDeleteDialog from "@/components/BatchOperations/BatchDeleteDialog.vue";

describe("BatchDeleteDialog", () => {
  it("CT-04-3: component renders", () => {
    const wrapper = mount(BatchDeleteDialog, {
      props: { count: 10 },
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("CT-04-3: has exposed open/close methods", () => {
    const wrapper = mount(BatchDeleteDialog, {
      props: { count: 5 },
      global: { stubs: { Teleport: true } },
    });
    expect(typeof wrapper.vm.open).toBe("function");
    expect(typeof wrapper.vm.close).toBe("function");
  });

  it("CT-04-3: open toggles visible state", async () => {
    const wrapper = mount(BatchDeleteDialog, {
      props: { count: 3 },
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.vm.visible).toBe(false);
    wrapper.vm.open();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.visible).toBe(true);
  });

  it("CT-04-3: close resets visible state", async () => {
    const wrapper = mount(BatchDeleteDialog, {
      props: { count: 3 },
      global: { stubs: { Teleport: true } },
    });
    wrapper.vm.open();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.visible).toBe(true);
    wrapper.vm.close();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.visible).toBe(false);
  });

  it("receives count prop", () => {
    const wrapper = mount(BatchDeleteDialog, {
      props: { count: 99 },
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.props("count")).toBe(99);
  });

  it("accepts zero count", () => {
    const wrapper = mount(BatchDeleteDialog, {
      props: { count: 0 },
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.exists()).toBe(true);
  });
});