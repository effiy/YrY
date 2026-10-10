import type { App } from "vue";
import { reportError } from "./errorReporter";

/* ── Benign browser warning classifier ─────────────────────────────────── */
// Chrome / WebKit emit "ResizeObserver loop completed with undelivered
// notifications" as an uncatchable console-level Error *and* a window error
// event when a ResizeObserver callback synchronously dirties layout and
// produces more observer entries than the engine can deliver within the same
// frame. It is cosmetic, not functional. We suppress it across all three
// channels: errorHandler, unhandledrejection, and window.onerror.
const RO_LOOP_HINTS = [
  "resizeobserver loop completed with undelivered notifications",
  "resizeobserver loop limit exceeded"
];

function isResizeObserverLoopMsg(msg: string): boolean {
  if (!msg) return false;
  const lower = String(msg).toLowerCase();
  return RO_LOOP_HINTS.some(h => lower.includes(h));
}
function isResizeObserverLoopError(e: Error): boolean {
  return !!e && (isResizeObserverLoopMsg(e.message) || isResizeObserverLoopMsg((e as any).stack ?? ""));
}

export interface ErrorContext {
  type: "RENDER" | "API" | "PROMISE" | "SCRIPT" | "UNKNOWN";
  error: Error;
  componentName?: string;
  info?: string;
  url?: string;
  timestamp: number;
}

export function classifyError(error: Error): "network" | "server" | "permission" | "notfound" | "unknown" {
  const message = error.message?.toLowerCase() || "";

  if (message.includes("network") || message.includes("fetch") || message.includes("timeout")) {
    return "network";
  }
  if (message.includes("401") || message.includes("unauthorized") || message.includes("forbidden")) {
    return "permission";
  }
  if (message.includes("404") || message.includes("not found")) {
    return "notfound";
  }
  if (message.includes("500") || message.includes("internal server")) {
    return "server";
  }
  return "unknown";
}

export function getUserFriendlyMessage(error: Error | string): string {
  const message = typeof error === "string" ? error : error.message || "";

  const messageMap: Record<string, string> = {
    "Network Error": "网络连接失败，请检查网络后重试",
    "timeout of": "请求超时，请稍后重试",
    "Request failed with status code 401": "登录已过期，请重新登录",
    "Request failed with status code 403": "您没有权限访问此资源",
    "Request failed with status code 404": "请求的资源不存在",
    "Request failed with status code 500": "服务器内部错误，请稍后重试",
    "Request failed with status code 502": "服务暂时不可用，请稍后重试",
    "Request failed with status code 503": "服务正在维护中，请稍后重试"
  };

  if (messageMap[message]) return messageMap[message];

  for (const [key, value] of Object.entries(messageMap)) {
    if (message.includes(key)) return value;
  }

  return message || "发生未知错误，请刷新页面重试";
}

export function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function setupGlobalErrorHandler(app: App): void {
  app.config.errorHandler = (err: unknown, instance, info) => {
    const error = err instanceof Error ? err : new Error(String(err));

    // Filter HTTP request errors to avoid duplicate handling
    // (Axios errors have `status` on network failures or `response.status` on HTTP errors)
    const httpStatus = (error as any).status ?? (error as any).response?.status;
    if (httpStatus !== undefined) return;

    // ── Benign noise filter ──────────────────────────────────────────────
    // ResizeObserver loop warning: emitted by Element Plus internal layout
    // observers and ECharts .resize() in tight layout phases. This is a
    // cosmetic browser warning, never a functional failure.
    if (isResizeObserverLoopError(error)) return;

    const ctx: ErrorContext = {
      type: "RENDER",
      error,
      componentName: (instance as any)?.$options?.name || "unknown",
      info,
      timestamp: Date.now()
    };

    console.error("[ErrorHandler] Vue Error:", ctx);
    reportError(ctx);
  };

  app.config.warnHandler = (msg, instance, trace) => {
    const raw = typeof msg === "string" ? msg : (msg as any)?.message ?? String(msg);
    // Suppress ResizeObserver noise at warn level too (some devtool layers
    // re-emit the loop error as a Vue warning).
    if (isResizeObserverLoopMsg(raw)) return;
    if (import.meta.env.DEV) {
      console.warn(`[Vue Warn] ${msg}`, { component: (instance as any)?.$options?.name, trace });
    }
  };
}

export function setupUnhandledRejectionHandler(): void {
  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

    // Benign browser noise
    if (isResizeObserverLoopError(error)) {
      event.preventDefault();
      return;
    }

    const ctx: ErrorContext = {
      type: "PROMISE",
      error,
      timestamp: Date.now()
    };

    console.error("[ErrorHandler] Unhandled Promise Rejection:", ctx);
    reportError(ctx);
    event.preventDefault();
  });
}

export function setupGlobalScriptErrorHandler(): void {
  window.onerror = (message, source, lineno, colno, error) => {
    const msgStr = typeof message === "string" ? message : (message as any)?.message ?? String(message);
    // Benign browser noise
    if (isResizeObserverLoopMsg(msgStr) || (error && isResizeObserverLoopError(error))) {
      return true; // suppress
    }

    const ctx: ErrorContext = {
      type: "SCRIPT",
      error: error || new Error(msgStr),
      url: source,
      timestamp: Date.now()
    };

    console.error("[ErrorHandler] Script Error:", ctx);
    reportError(ctx);
    return true;
  };
}
