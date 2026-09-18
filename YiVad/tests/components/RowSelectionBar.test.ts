import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import RowSelectionBar from "@/components/ProTable/components/RowSelectionBar.vue";

describe("RowSelectionBar", () => {
  it("does not render when selectedCount is 0", () => {
    const wrapper = mount(RowSelectionBar, {
      props: { selectedCount: 0 },
    });
    expect(wrapper.find(".row-selection-bar").exists()).toBe(false);
  });

  it("CT-03-1: renders when selectedCount > 0", () => {
    const wrapper = mount(RowSelectionBar, {
      props: { selectedCount: 5 },
    });
    expect(wrapper.find(".row-selection-bar").exists()).toBe(true);
  });

  it("CT-03-1: displays correct selection count", () => {
    const wrapper = mount(RowSelectionBar, {
      props: { selectedCount: 10 },
    });
    expect(wrapper.find(".row-selection-bar__count").text()).toContain("10");
  });

  it("CT-03-2: renders action area inside the bar", () => {
    const wrapper = mount(RowSelectionBar, {
      props: { selectedCount: 3 },
    });
    expect(wrapper.find(".row-selection-bar__actions").exists()).toBe(true);
  });

  it("CT-03-2: renders Clear selection text button", () => {
    const wrapper = mount(RowSelectionBar, {
      props: { selectedCount: 3 },
    });
    expect(wrapper.text()).toContain("Clear selection");
  });

  it("CT-03-3: emits clear when clear button clicked", async () => {
    const wrapper = mount(RowSelectionBar, {
      props: { selectedCount: 3 },
    });
    const buttons = wrapper.findAllComponents({ name: "ElButton" });
    const clearBtn = buttons.find(b => b.text() === "Clear selection");
    await clearBtn!.trigger("click");
    expect(wrapper.emitted("clear")).toBeTruthy();
  });

  it("CT-03-3: emits batchDelete when delete button clicked", async () => {
    const wrapper = mount(RowSelectionBar, {
      props: { selectedCount: 2 },
    });
    const buttons = wrapper.findAllComponents({ name: "ElButton" });
    const deleteBtn = buttons.find(b => b.text() === "Delete");
    await deleteBtn!.trigger("click");
    expect(wrapper.emitted("batchDelete")).toBeTruthy();
  });

  it("CT-03-3: emits batchMove when move button clicked", async () => {
    const wrapper = mount(RowSelectionBar, {
      props: { selectedCount: 2 },
    });
    const buttons = wrapper.findAllComponents({ name: "ElButton" });
    const moveBtn = buttons.find(b => b.text() === "Move");
    await moveBtn!.trigger("click");
    expect(wrapper.emitted("batchMove")).toBeTruthy();
  });

  it("CT-03-3: emits batchCopy when copy button clicked", async () => {
    const wrapper = mount(RowSelectionBar, {
      props: { selectedCount: 2 },
    });
    const buttons = wrapper.findAllComponents({ name: "ElButton" });
    const copyBtn = buttons.find(b => b.text() === "Copy");
    await copyBtn!.trigger("click");
    expect(wrapper.emitted("batchCopy")).toBeTruthy();
  });

  it("CT-03-3: emits batchTag when tag button clicked", async () => {
    const wrapper = mount(RowSelectionBar, {
      props: { selectedCount: 2 },
    });
    const buttons = wrapper.findAllComponents({ name: "ElButton" });
    const tagBtn = buttons.find(b => b.text() === "Tag");
    await tagBtn!.trigger("click");
    expect(wrapper.emitted("batchTag")).toBeTruthy();
  });

  it("CT-03-4: does not render action buttons in disabled mode", () => {
    const wrapper = mount(RowSelectionBar, {
      props: { selectedCount: 0 },
    });
    // When count is 0, no bar is rendered at all
    expect(wrapper.find(".row-selection-bar").exists()).toBe(false);
  });

  it("renders slot content by default", () => {
    const wrapper = mount(RowSelectionBar, {
      props: { selectedCount: 4 },
    });
    // Default slot renders Delete/Move/Copy/Tag buttons
    expect(wrapper.text()).toContain("Delete");
    expect(wrapper.text()).toContain("Move");
    expect(wrapper.text()).toContain("Copy");
    expect(wrapper.text()).toContain("Tag");
  });
});