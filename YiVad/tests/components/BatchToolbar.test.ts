import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BatchToolbar from "@/components/BatchOperations/BatchToolbar.vue";

describe("BatchToolbar", () => {
  // BatchToolbar uses Teleport — stub it to render inline
  const mountToolbar = (props: Record<string, any> = {}) =>
    mount(BatchToolbar, {
      props: { selectedCount: 0, ...props },
      global: {
        stubs: {
          Teleport: {
            template: '<div class="teleport-stub"><slot /></div>',
          },
        },
      },
    });

  it("CT-04-1: visible when selectedCount > 0", () => {
    const wrapper = mountToolbar({ selectedCount: 5 });
    expect(wrapper.find(".batch-toolbar").exists()).toBe(true);
  });

  it("CT-04-1: hidden when selectedCount === 0", () => {
    const wrapper = mountToolbar({ selectedCount: 0 });
    expect(wrapper.find(".batch-toolbar").exists()).toBe(false);
  });

  it("CT-04-2: displays correct selected count text", () => {
    const wrapper = mountToolbar({ selectedCount: 42 });
    expect(wrapper.find(".batch-toolbar__count").text()).toContain("42");
  });

  it("renders all action buttons", () => {
    const wrapper = mountToolbar({ selectedCount: 3 });
    expect(wrapper.text()).toContain("Edit");
    expect(wrapper.text()).toContain("Move");
    expect(wrapper.text()).toContain("Copy");
    expect(wrapper.text()).toContain("Tag");
    expect(wrapper.text()).toContain("Import");
    expect(wrapper.text()).toContain("Mail");
    expect(wrapper.text()).toContain("Delete");
    expect(wrapper.text()).toContain("Clear");
  });

  it("CT-04-6: does not render when selected count is 0", () => {
    const wrapper = mountToolbar({ selectedCount: 0 });
    expect(wrapper.find(".batch-toolbar").exists()).toBe(false);
  });

  it("renders slot content in actions area", () => {
    const wrapper = mount(BatchToolbar, {
      props: { selectedCount: 1 },
      slots: { default: '<button class="custom-action">Custom</button>' },
      global: {
        stubs: {
          Teleport: {
            template: '<div class="teleport-stub"><slot /></div>',
          },
        },
      },
    });
    expect(wrapper.find(".custom-action").exists()).toBe(true);
  });
});