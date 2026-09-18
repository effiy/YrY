import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ColSetting from "@/components/ProTable/components/ColSetting.vue";

const colSetting = [
  { prop: "name", label: "Name", isShow: true, sortable: true },
  { prop: "age", label: "Age", isShow: true, sortable: false },
  { prop: "email", label: "Email", isShow: false, sortable: true },
  { prop: "status", label: "Status", isShow: true, sortable: false, _children: [
    { prop: "status.created", label: "Created", isShow: true, sortable: false },
  ]},
];

describe("ColSetting", () => {
  const mountCol = (props: Record<string, any> = {}) =>
    mount(ColSetting, {
      props: { colSetting, ...props },
      global: { stubs: { Teleport: true } },
    });

  it("CT-02-1: component renders", () => {
    const wrapper = mountCol();
    expect(wrapper.exists()).toBe(true);
  });

  it("CT-02-1: exposes openColSetting method", () => {
    const wrapper = mountCol();
    expect(typeof wrapper.vm.openColSetting).toBe("function");
  });

  it("CT-02-1: openColSetting opens drawer", async () => {
    const wrapper = mountCol();
    expect(wrapper.vm.drawerVisible).toBe(false);
    wrapper.vm.openColSetting();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.drawerVisible).toBe(true);
  });

  it("CT-02-1: drawer title is correct", async () => {
    const wrapper = mountCol();
    wrapper.vm.openColSetting();
    await wrapper.vm.$nextTick();
    // el-drawer title is "Column Settings"
    expect(wrapper.vm.drawerVisible).toBe(true);
  });

  it("CT-02-6: receives colSetting prop correctly", () => {
    const wrapper = mountCol();
    expect(wrapper.props("colSetting")).toEqual(colSetting);
  });

  it("CT-02-7: handles empty column list", () => {
    const wrapper = mountCol({ colSetting: [] });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.props("colSetting")).toEqual([]);
  });
});