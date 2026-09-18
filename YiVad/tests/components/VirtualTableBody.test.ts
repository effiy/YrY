import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import VirtualTableBody from "@/components/ProTable/components/VirtualTableBody.vue";

describe("VirtualTableBody", () => {
  it("renders with correct container height", () => {
    const wrapper = mount(VirtualTableBody, {
      props: {
        totalHeight: 4800,
        offsetTop: 0,
        start: 0,
        end: 15,
        totalRows: 100,
        rowHeight: 48
      }
    });
    const container = wrapper.find(".virtual-table-body");
    expect(container.attributes("style")).toContain("height: 4800px");
  });

  it("renders top spacer with correct offset", () => {
    const wrapper = mount(VirtualTableBody, {
      props: {
        totalHeight: 4800,
        offsetTop: 2400,
        start: 50,
        end: 65,
        totalRows: 100,
        rowHeight: 48
      }
    });
    const spacers = wrapper.findAll(".virtual-table-body__spacer");
    expect(spacers[0].attributes("style")).toContain("height: 2400px");
  });

  it("computes bottom spacer correctly", () => {
    const wrapper = mount(VirtualTableBody, {
      props: {
        totalHeight: 4800,
        offsetTop: 960,
        start: 20,
        end: 35,
        totalRows: 100,
        rowHeight: 48
      }
    });
    // bottom = 4800 - 960 - (35-20)*48 = 4800 - 960 - 720 = 3120
    const spacers = wrapper.findAll(".virtual-table-body__spacer");
    expect(spacers[1].attributes("style")).toContain("height: 3120px");
  });

  it("clamps bottom spacer to 0", () => {
    const wrapper = mount(VirtualTableBody, {
      props: {
        totalHeight: 1000,
        offsetTop: 500,
        start: 0,
        end: 25,
        totalRows: 20,
        rowHeight: 50
      }
    });
    // bottom = 1000 - 500 - (25-0)*50 = 1000 - 500 - 1250 = -750, clamped to 0
    const spacers = wrapper.findAll(".virtual-table-body__spacer");
    expect(spacers[1].attributes("style")).toContain("height: 0px");
  });

  it("renders slot content", () => {
    const wrapper = mount(VirtualTableBody, {
      props: {
        totalHeight: 4800,
        offsetTop: 0,
        start: 0,
        end: 15,
        totalRows: 100,
        rowHeight: 48
      },
      slots: {
        default: '<tr class="test-row"><td>Hi</td></tr>'
      }
    });
    expect(wrapper.find(".test-row").exists()).toBe(true);
  });

  it("handles zero total rows", () => {
    const wrapper = mount(VirtualTableBody, {
      props: {
        totalHeight: 0,
        offsetTop: 0,
        start: 0,
        end: 0,
        totalRows: 0,
        rowHeight: 48
      }
    });
    const container = wrapper.find(".virtual-table-body");
    expect(container.attributes("style")).toContain("height: 0px");
  });
});