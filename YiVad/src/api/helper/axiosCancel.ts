import { CustomAxiosRequestConfig } from "../index";
import qs from "qs";

// Declare a Map to store each request's identifier and cancellation function
let pendingMap = new Map<string, AbortController>();

// Serialize parameters to ensure consistent object property order
const sortedStringify = (obj: any) => {
  return qs.stringify(obj, { arrayFormat: "repeat", sort: (a, b) => a.localeCompare(b) });
};

// Get the unique identifier for a request
export const getPendingUrl = (config: CustomAxiosRequestConfig) => {
  return [config.method, config.url, sortedStringify(config.data), sortedStringify(config.params)].join("&");
};

export class AxiosCanceler {
  /**
   * @description: Add request
   * @param {Object} config
   * @return void
   */
  addPending(config: CustomAxiosRequestConfig) {
    const url = getPendingUrl(config);
    const hadPrevious = pendingMap.has(url);
    const hasOuter = config.signal instanceof AbortSignal;
    const outerAborted = hasOuter && (config.signal as AbortSignal).aborted;
    // Before the request starts, check and cancel previous requests
    this.removePending(config);
    const controller = new AbortController();
    // ⚠️ NEVER blindly overwrite an external signal — combine them.
    let combineMode: "any" | "chain" | "override" = "override";
    if (config.signal instanceof AbortSignal && typeof (AbortSignal as any).any === "function") {
      config.signal = (AbortSignal as any).any([config.signal, controller.signal]);
      combineMode = "any";
    } else if (config.signal instanceof AbortSignal) {
      // Fallback for very old runtimes: chain via addEventListener
      const outer = config.signal;
      if (outer.aborted) {
        controller.abort((outer as any).reason);
      } else {
        outer.addEventListener("abort", () => controller.abort((outer as any).reason), { once: true });
      }
      config.signal = controller.signal;
      combineMode = "chain";
    } else {
      config.signal = controller.signal;
      combineMode = "override";
    }
    pendingMap.set(url, controller);
  }

  /**
   * @description: Remove request
   * @param {Object} config
   */
  removePending(config: CustomAxiosRequestConfig) {
    const url = getPendingUrl(config);
    // If the current request identifier exists in pending, cancel the request and delete the entry
    const controller = pendingMap.get(url);
    const exists = !!controller;
    let reason = "";
    if (controller) {
      try {
        controller.abort();
      } catch (e: any) { reason = String(e?.message || e); }
      pendingMap.delete(url);
    }
  }

  /**
   * @description: Clear all pending
   */
  removeAllPending() {
    pendingMap.forEach(controller => {
      controller && controller.abort();
    });
    pendingMap.clear();
  }
}
