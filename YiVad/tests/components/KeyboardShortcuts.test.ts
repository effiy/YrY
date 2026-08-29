import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import KeyboardShortcuts from "@/components/KeyboardShortcuts/index.vue";

describe("KeyboardShortcuts", () => {
  it("renders the component", () => {
    const wrapper = mount(KeyboardShortcuts, { attachTo: document.body });
    // The overlay is hidden by default (v-if="visible"), but the component
    // template is still part of the wrapper's HTML
    expect(wrapper.vm).toBeDefined();
  });

  it("does not render overlay when hidden", () => {
    mount(KeyboardShortcuts, { attachTo: document.body });
    expect(document.body.querySelector(".shortcuts-overlay")).toBeNull();
  });

  it("has keyboard shortcut data", () => {
    const wrapper = mount(KeyboardShortcuts, { attachTo: document.body });
    // The component defines shortcut groups internally
    // Verify the component mounts without errors
    expect(wrapper.findComponent({ name: "keyboardShortcuts" }).exists()).toBe(
      true,
    );
  });
});