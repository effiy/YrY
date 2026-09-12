import { ElNotification } from "element-plus";
import type { App } from "vue";
import { reportError } from "./errorReporter";

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
    "Request failed with status code 503": "服务正在维护中，请稍后重试",
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
    if ((error as any).status !== undefined || (error as any).status === 0) return;

    const ctx: ErrorContext = {
      type: "RENDER",
      error,
      componentName: (instance as any)?.$options?.name || "unknown",
      info,
      timestamp: Date.now(),
    };

    console.error("[ErrorHandler] Vue Error:", ctx);
    reportError(ctx);
  };

  app.config.warnHandler = (msg, instance, trace) => {
    if (import.meta.env.DEV) {
      console.warn(`[Vue Warn] ${msg}`, { component: (instance as any)?.$options?.name, trace });
    }
  };
}

export function setupUnhandledRejectionHandler(): void {
  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

    const ctx: ErrorContext = {
      type: "PROMISE",
      error,
      timestamp: Date.now(),
    };

    console.error("[ErrorHandler] Unhandled Promise Rejection:", ctx);
    reportError(ctx);
    event.preventDefault();
  });
}

export function setupGlobalScriptErrorHandler(): void {
  window.onerror = (message, source, lineno, colno, error) => {
    const ctx: ErrorContext = {
      type: "SCRIPT",
      error: error || new Error(String(message)),
      url: source,
      timestamp: Date.now(),
    };

    console.error("[ErrorHandler] Script Error:", ctx);
    reportError(ctx);
    return true;
  };
}

/**
 * Legacy default export for backward compatibility.
 * Used as `app.config.errorHandler` directly.
 */
const errorHandler = (error: any) => {
  if (error.status || error.status === 0) return false;

  const errorMap: Record<string, string> = {
    InternalError: "Javascript engine internal error",
    ReferenceError: "Object not found",
    TypeError: "Wrong type or object used",
    RangeError: "Parameter out of range when using built-in object",
    SyntaxError: "Syntax error",
    EvalError: "Incorrect use of Eval",
    URIError: "URI error",
  };

  const errorName = errorMap[error.name] || "Unknown error";
  ElNotification({
    title: errorName,
    message: error,
    type: "error",
    duration: 3000,
  });

  if (error instanceof Error) {
    reportError({
      type: "RENDER",
      error,
      timestamp: Date.now(),
    });
  }
};

export default errorHandler;