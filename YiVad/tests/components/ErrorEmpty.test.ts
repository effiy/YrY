import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ErrorEmpty from "@/components/error/ErrorEmpty.vue";

describe("ErrorEmpty", () => {
  it("renders with default description", () => {
    const wrapper = mount(ErrorEmpty, {
      global: {
        stubs: {
          "el-empty": {
            template: '<div class="el-empty-stub">{{ $attrs.description }}</div>',
            inheritAttrs: false,
          },
        },
      },
    });
    expect(wrapper.vm).toBeDefined();
  });

  it("renders custom description", () => {
    const wrapper = mount(ErrorEmpty, {
      props: { description: "没有找到匹配的数据" },
      global: {
        stubs: {
          "el-empty": {
            template: '<div class="el-empty-stub">{{ $attrs.description }}</div>',
            inheritAttrs: false,
          },
        },
      },
    });
    expect(wrapper.props("description")).toBe("没有找到匹配的数据");
  });

  it("renders action button when actionText provided", () => {
    const wrapper = mount(ErrorEmpty, {
      props: {
        description: "暂无项目",
        actionText: "创建项目",
      },
      global: {
        stubs: {
          "el-empty": {
            template: '<div class="el-empty-stub"><slot /></div>',
          },
          "el-button": {
            template: '<button><slot /></button>',
          },
        },
      },
    });
    expect(wrapper.props("actionText")).toBe("创建项目");
  });

  it("emits action event", async () => {
    const wrapper = mount(ErrorEmpty, {
      props: { actionText: "刷新" },
      global: {
        stubs: {
          "el-empty": { template: '<div class="el-empty-stub"><slot /></div>' },
          "el-button": { template: '<button><slot /></button>' },
        },
      },
    });
    (wrapper.vm as any).$emit("action");
    expect(wrapper.emitted("action")).toBeTruthy();
  });

  it("has default image size", () => {
    const wrapper = mount(ErrorEmpty, {
      global: {
        stubs: { "el-empty": { template: "<div />" } },
      },
    });
    expect(wrapper.props("imageSize")).toBe(120);
  });
});