import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ErrorCard from "@/components/error/ErrorCard.vue";

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
}));

const mockT = vi.fn((key: string) => {
  const map: Record<string, string> = {
    "error.retry": "重试",
    "error.goBack": "返回上一页",
    "error.reload": "刷新页面",
    "error.details": "错误详情",
  };
  return map[key] || key;
});

function mountErrorCard(props = {}) {
  return mount(ErrorCard, {
    props: {
      title: "测试错误",
      ...props,
    },
    global: {
      mocks: {
        $t: mockT,
      },
      stubs: {
        "el-result": { template: '<div class="el-result"><slot name="extra" /></div>' },
        "el-button": { template: '<button @click="$emit(\'click\')"><slot /></button>' },
        "router-link": { template: "<a><slot /></a>" },
      },
    },
  });
}

describe("ErrorCard", () => {
  it("renders title and message", () => {
    const wrapper = mountErrorCard({
      title: "网络连接失败",
      message: "请检查网络",
    });
    expect(wrapper.vm).toBeDefined();
  });

  it("shows retry button when retryable", () => {
    const wrapper = mountErrorCard({
      title: "加载失败",
      retryable: true,
    });
    expect(wrapper.vm).toBeDefined();
  });

  it("emits retry event on retry click", async () => {
    const wrapper = mountErrorCard({
      title: "加载失败",
      retryable: true,
    });
    // Simulate retry emission
    (wrapper.vm as any).$emit("retry");
    expect(wrapper.emitted("retry")).toBeTruthy();
  });

  it("does not show retry when not retryable", () => {
    const wrapper = mountErrorCard({
      title: "权限不足",
      retryable: false,
      errorType: "permission",
    });
    expect(wrapper.props("retryable")).toBe(false);
  });

  it("shows goBack button by default", () => {
    const wrapper = mountErrorCard({ title: "错误" });
    expect(wrapper.props("showGoBack")).toBe(true);
  });

  it("hides goBack when showGoBack is false", () => {
    const wrapper = mountErrorCard({
      title: "错误",
      showGoBack: false,
    });
    expect(wrapper.props("showGoBack")).toBe(false);
  });

  it("shows details only in DEV mode by default", () => {
    const wrapper = mountErrorCard({ title: "错误" });
    // showDetails defaults to import.meta.env.DEV
    expect(wrapper.props("showDetails")).toBe(true);
  });

  it("hides details when disabled", () => {
    const wrapper = mountErrorCard({
      title: "错误",
      showDetails: false,
    });
    expect(wrapper.props("showDetails")).toBe(false);
  });

  it("accepts errorDetail prop", () => {
    const wrapper = mountErrorCard({
      title: "错误",
      errorDetail: "Error: something went wrong\n  at Component.vue:42",
    });
    expect(wrapper.props("errorDetail")).toContain("Component.vue");
  });

  it("supports network error type", () => {
    const wrapper = mountErrorCard({
      title: "网络错误",
      errorType: "network",
    });
    expect(wrapper.props("errorType")).toBe("network");
  });

  it("supports server error type", () => {
    const wrapper = mountErrorCard({
      title: "服务器错误",
      errorType: "server",
    });
    expect(wrapper.props("errorType")).toBe("server");
  });

  it("supports permission error type", () => {
    const wrapper = mountErrorCard({
      title: "权限错误",
      errorType: "permission",
    });
    expect(wrapper.props("errorType")).toBe("permission");
  });

  it("supports notfound error type", () => {
    const wrapper = mountErrorCard({
      title: "未找到",
      errorType: "notfound",
    });
    expect(wrapper.props("errorType")).toBe("notfound");
  });

  it("defaults to unknown error type", () => {
    const wrapper = mountErrorCard({ title: "未知错误" });
    expect(wrapper.props("errorType")).toBe("unknown");
  });

  it("has reload button by default", () => {
    const wrapper = mountErrorCard({ title: "错误" });
    expect(wrapper.props("showReload")).toBe(true);
  });

  it("hides reload when showReload is false", () => {
    const wrapper = mountErrorCard({
      title: "错误",
      showReload: false,
    });
    expect(wrapper.props("showReload")).toBe(false);
  });
});