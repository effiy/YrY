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
    // Before the request starts, check and cancel previous requests
    this.removePending(config);
    const url = getPendingUrl(config);
    const controller = new AbortController();
    config.signal = controller.signal;
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
    if (controller) {
      controller.abort();
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
