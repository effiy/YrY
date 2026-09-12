import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ErrorFallback from "@/components/error/ErrorFallback.vue";

const mockReplace = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockT = vi.fn((key: string) => {
  const map: Record<string, string> = {
    "error.reload": "刷新页面",
    "error.goHome": "返回首页",
    "error.technicalDetails": "技术细节",
  };
  return map[key] || key;
});

describe("ErrorFallback", () => {
  function mountFallback(props = {}) {
    return mount(ErrorFallback, {
      props,
      global: {
        mocks: { $t: mockT },
        stubs: {
          "el-result": { template: '<div class="el-result"><slot name="extra" /></div>' },
          "el-button": { template: '<button @click="$emit(\'click\')"><slot /></button>' },
        },
      },
    });
  }

  it("renders with default title and message", () => {
    const wrapper = mountFallback();
    expect(wrapper.vm).toBeDefined();
    expect(wrapper.props("title")).toBe("页面发生错误");
  });

  it("renders custom title and message", () => {
    const wrapper = mountFallback({
      title: "服务不可用",
      message: "服务器正在维护中，请稍后再试。",
    });
    expect(wrapper.props("title")).toBe("服务不可用");
    expect(wrapper.props("message")).toBe("服务器正在维护中，请稍后再试。");
  });

  it("renders error details in DEV mode", () => {
    const error = new Error("测试错误");
    const wrapper = mountFallback({ error });
    expect(wrapper.vm).toBeDefined();
  });

  it("renders without error prop", () => {
    const wrapper = mountFallback();
    expect(wrapper.props("error")).toBeNull();
  });
});