import { describe, it, expect, vi, beforeEach } from "vitest";
import { classifyError, getUserFriendlyMessage } from "@/utils/errorHandler";

describe("classifyError", () => {
  it('classifies "Network Error" as network', () => {
    expect(classifyError(new Error("Network Error"))).toBe("network");
  });

  it('classifies fetch errors as network', () => {
    expect(classifyError(new Error("fetch failed"))).toBe("network");
  });

  it("classifies timeout errors as network", () => {
    expect(classifyError(new Error("timeout of 30000ms exceeded"))).toBe("network");
  });

  it('classifies 401 errors as permission', () => {
    expect(classifyError(new Error("Request failed with status code 401"))).toBe("permission");
    expect(classifyError(new Error("Unauthorized access"))).toBe("permission");
    expect(classifyError(new Error("Forbidden"))).toBe("permission");
  });

  it('classifies 404 errors as notfound', () => {
    expect(classifyError(new Error("Request failed with status code 404"))).toBe("notfound");
    expect(classifyError(new Error("Not found"))).toBe("notfound");
  });

  it('classifies 500 errors as server', () => {
    expect(classifyError(new Error("Request failed with status code 500"))).toBe("server");
    expect(classifyError(new Error("Internal server error"))).toBe("server");
  });

  it("classifies unknown errors as unknown", () => {
    expect(classifyError(new Error("Some random error"))).toBe("unknown");
  });

  it("handles empty error message", () => {
    expect(classifyError(new Error(""))).toBe("unknown");
  });
});

describe("getUserFriendlyMessage", () => {
  it("returns Chinese message for Network Error", () => {
    const msg = getUserFriendlyMessage("Network Error");
    expect(msg).toBe("网络连接失败，请检查网络后重试");
  });

  it("returns Chinese message for timeout", () => {
    const msg = getUserFriendlyMessage(new Error("timeout of 30000ms exceeded"));
    expect(msg).toBe("请求超时，请稍后重试");
  });

  it("returns Chinese message for 401", () => {
    const msg = getUserFriendlyMessage("Request failed with status code 401");
    expect(msg).toBe("登录已过期，请重新登录");
  });

  it("returns Chinese message for 403", () => {
    const msg = getUserFriendlyMessage("Request failed with status code 403");
    expect(msg).toBe("您没有权限访问此资源");
  });

  it("returns Chinese message for 404", () => {
    const msg = getUserFriendlyMessage("Request failed with status code 404");
    expect(msg).toBe("请求的资源不存在");
  });

  it("returns Chinese message for 500", () => {
    const msg = getUserFriendlyMessage("Request failed with status code 500");
    expect(msg).toBe("服务器内部错误，请稍后重试");
  });

  it("returns Chinese message for 502", () => {
    const msg = getUserFriendlyMessage("Request failed with status code 502");
    expect(msg).toBe("服务暂时不可用，请稍后重试");
  });

  it("returns Chinese message for 503", () => {
    const msg = getUserFriendlyMessage("Request failed with status code 503");
    expect(msg).toBe("服务正在维护中，请稍后重试");
  });

  it("returns original message for unknown errors", () => {
    const msg = getUserFriendlyMessage("Some custom error message");
    expect(msg).toBe("Some custom error message");
  });

  it("returns fallback for empty message", () => {
    const msg = getUserFriendlyMessage("");
    expect(msg).toBe("发生未知错误，请刷新页面重试");
  });

  it("accepts Error object", () => {
    const msg = getUserFriendlyMessage(new Error("Network Error"));
    expect(msg).toBe("网络连接失败，请检查网络后重试");
  });
});