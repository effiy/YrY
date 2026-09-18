import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import EmptyState from "@/components/EmptyState/EmptyState.vue";

describe("EmptyState", () => {
  it("CT-05-3: renders title text", () => {
    const wrapper = mount(EmptyState, {
      props: { title: "No data found" },
    });
    expect(wrapper.find(".empty-state__title").text()).toBe("No data found");
  });

  it("CT-05-3: renders description when provided", () => {
    const wrapper = mount(EmptyState, {
      props: { title: "Empty", description: "Try adjusting your filters" },
    });
    expect(wrapper.find(".empty-state__description").text()).toBe("Try adjusting your filters");
  });

  it("CT-05-3: hides description when not provided", () => {
    const wrapper = mount(EmptyState, {
      props: { title: "Empty" },
    });
    expect(wrapper.find(".empty-state__description").exists()).toBe(false);
  });

  it("CT-05-4: renders action button when actionText is provided", () => {
    const wrapper = mount(EmptyState, {
      props: { title: "Empty", actionText: "Create New" },
    });
    const btn = wrapper.findComponent({ name: "ElButton" });
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toBe("Create New");
  });

  it("CT-05-4: emits action when button is clicked", async () => {
    const wrapper = mount(EmptyState, {
      props: { title: "Empty", actionText: "Retry" },
    });
    await wrapper.findComponent({ name: "ElButton" }).trigger("click");
    expect(wrapper.emitted("action")).toBeTruthy();
  });

  it("CT-05-4: hides action section when no actionText and no slot", () => {
    const wrapper = mount(EmptyState, {
      props: { title: "Empty" },
    });
    expect(wrapper.find(".empty-state__action").exists()).toBe(false);
  });

  it("CT-05-5: renders custom illustration via slot", () => {
    const wrapper = mount(EmptyState, {
      props: { title: "Empty" },
      slots: { illustration: '<div class="custom-illustration">Custom</div>' },
    });
    expect(wrapper.find(".custom-illustration").exists()).toBe(true);
  });

  it("CT-05-5: renders custom action via slot", () => {
    const wrapper = mount(EmptyState, {
      props: { title: "Empty" },
      slots: { action: '<button class="custom-btn">Go</button>' },
    });
    expect(wrapper.find(".custom-btn").exists()).toBe(true);
  });

  it("has role status for accessibility", () => {
    const wrapper = mount(EmptyState, {
      props: { title: "No results" },
    });
    expect(wrapper.attributes("role")).toBe("status");
  });

  it("renders default icon illustration when no slot provided", () => {
    const wrapper = mount(EmptyState, {
      props: { title: "Empty" },
    });
    expect(wrapper.find(".empty-state__illustration").exists()).toBe(true);
  });
});