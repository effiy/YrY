import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import EntityBreadcrumb from "@/components/EntityBreadcrumb/EntityBreadcrumb.vue";

vi.mock("@/api/modules/projectService", () => ({
  getProjectList: vi.fn().mockResolvedValue({ data: { list: [] } }),
}));

describe("EntityBreadcrumb", () => {
  it("renders the component with currentLabel", () => {
    const wrapper = mount(EntityBreadcrumb, {
      props: {
        currentLabel: "Test Page",
      },
      global: {
        stubs: {
          "router-link": { template: "<a><slot /></a>" },
          "el-icon": { template: "<i />" },
        },
      },
    });
    expect(wrapper.vm).toBeDefined();
  });

  it("does not render nav when only one segment", () => {
    const wrapper = mount(EntityBreadcrumb, {
      props: {
        currentLabel: "Detail Page",
      },
      global: {
        stubs: {
          "router-link": { template: "<a><slot /></a>" },
          "el-icon": { template: "<i />" },
        },
      },
    });
    // When only the current page segment exists (no project), nav is hidden
    expect(wrapper.find("nav.eb").exists()).toBe(false);
  });

  it("renders component without errors", () => {
    const wrapper = mount(EntityBreadcrumb, {
      props: {
        currentLabel: "My Dashboard",
      },
      global: {
        stubs: {
          "router-link": { template: "<a><slot /></a>" },
          "el-icon": { template: "<i />" },
        },
      },
    });
    expect(wrapper.vm).toBeDefined();
  });

  it("renders with currentIcon", () => {
    const wrapper = mount(EntityBreadcrumb, {
      props: {
        currentLabel: "Page",
        currentIcon: "Folder",
      },
      global: {
        stubs: {
          "router-link": { template: "<a><slot /></a>" },
          "el-icon": { template: "<i />" },
        },
      },
    });
    expect(wrapper.vm).toBeDefined();
  });
});