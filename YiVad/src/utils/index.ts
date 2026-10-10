import { FieldNamesProps } from "@/components/ProTable/interface";
import { get as _get, cloneDeep as _cloneDeep } from "lodash-es";

const mode = import.meta.env.RSBUILD_ENV_ROUTER_MODE;

/**
 * @description Generate unique UUID (RFC 4122 v4)
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * @description 获取浏览器默认语言（归一化为 "zh" 或 "en"）
 * @returns {String} "zh" | "en"
 */
export function getBrowserLang() {
  const browserLang = (typeof navigator !== "undefined" && (navigator.language || (navigator as any).browserLanguage)) || "en";
  const key = String(browserLang).toLowerCase().replace("_", "-");
  if (key.startsWith("zh") || key === "cn") return "zh";
  return "en";
}

/**
 * @description Get url + params for different router modes
 * @returns {String}
 */
export function getUrlWithParams() {
  const url = {
    hash: location.hash.substring(1),
    history: location.pathname + location.search
  };
  return url[mode];
}

/**
 * @description Flatten menu recursively for easy dynamic route addition
 * @param {Array} menuList Menu list
 * @returns {Array}
 */
export function getFlatMenuList(menuList: Menu.MenuOptions[]): Menu.MenuOptions[] {
  let newMenuList: Menu.MenuOptions[] = _cloneDeep(menuList);
  return newMenuList.flatMap(item => [item, ...(item.children ? getFlatMenuList(item.children) : [])]);
}

/**
 * @description Recursively filter menus to show in sidebar (excluding isHide == true)
 * @param {Array} menuList Menu list
 * @returns {Array}
 * */
export function getShowMenuList(menuList: Menu.MenuOptions[]) {
  let newMenuList: Menu.MenuOptions[] = _cloneDeep(menuList);
  return newMenuList.filter(item => {
    item.children?.length && (item.children = getShowMenuList(item.children));
    return !item.meta?.isHide;
  });
}

/**
 * @description Recursively sort menu tree children by `order` field (ascending),
 * falling back to meta.title alphabetically (A-Z, locale-aware) when orders are equal or undefined.
 * Returns a new sorted tree — does not mutate the original.
 * @param {Array} nodes Menu tree nodes
 * @returns {Array}
 */
export function sortMenuTree(nodes: any[]): any[] {
  if (!nodes?.length) return [];
  return [...nodes]
    .map(node => (node.children?.length ? { ...node, children: sortMenuTree(node.children) } : node))
    .sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return (a.meta?.title ?? "").localeCompare(b.meta?.title ?? "", "zh-CN-u-kf-lower");
    });
}

/**
 * @description Recursively find all breadcrumbs to store in pinia/vuex
 * @param {Array} menuList Menu list
 * @param {Array} parent Parent menu
 * @param {Object} result Processed result
 * @returns {Object}
 */
export const getAllBreadcrumbList = (menuList: Menu.MenuOptions[], parent = [], result: { [key: string]: any } = {}) => {
  for (const item of menuList) {
    result[item.path] = [...parent, item];
    if (item.children) getAllBreadcrumbList(item.children, result[item.path], result);
  }
  return result;
};

/**
 * @description Handle ProTable array value or empty data
 * @param {*} callValue Value to process
 * @returns {String}
 * */
export function formatValue(callValue: any) {
  // If current value is array, join with / (customizable)
  if (Array.isArray(callValue)) return callValue.length ? callValue.join(" / ") : "--";
  return callValue ?? "--";
}

/**
 * @description Handle multi-level nested prop, return data (e.g. prop: user.name)
 * @param {Object} row Current row data
 * @param {String} prop Current prop
 * @returns {*}
 * */
export function handleRowAccordingToProp(row: { [key: string]: any }, prop: string) {
  if (!prop.includes(".")) return row[prop] ?? "--";
  return _get(row, prop, "--");
}

/**
 * @description Process prop, return last level for nested props
 * @param {String} prop Current prop
 * @returns {String}
 * */
export function handleProp(prop: string) {
  const propArr = prop.split(".");
  if (propArr.length == 1) return prop;
  return propArr[propArr.length - 1];
}

/**
 * @description Query data from enum list (auto-detect label/value keys for formatting)
 * @param {String} callValue Current cell value
 * @param {Array} enumData Dictionary list
 * @param {Array} fieldNames Key names for label, value, and children
 * @param {String} type Filter type (currently only tag)
 * @returns {String}
 * */
export function filterEnum(callValue: any, enumData?: any, fieldNames?: FieldNamesProps, type?: "tag") {
  const value = fieldNames?.value ?? "value";
  const label = fieldNames?.label ?? "label";
  const children = fieldNames?.children ?? "children";
  let filterData: { [key: string]: any } = {};
  // Check if enumData is an array
  if (Array.isArray(enumData)) filterData = findItemNested(enumData, callValue, value, children);
  // Check if output is tag type
  if (type == "tag") {
    return filterData?.tagType ? filterData.tagType : "";
  } else {
    return filterData ? filterData[label] : "--";
  }
}

/**
 * @description Recursively find enum value matching callValue
 * */
function findItemNested(enumData: any, callValue: any, value: string, children: string) {
  return enumData.reduce((accumulator: any, current: any) => {
    if (accumulator) return accumulator;
    if (current[value] === callValue) return current;
    if (current[children]) return findItemNested(current[children], callValue, value, children);
  }, null);
}

/* ── Safe ResizeObserver Factory ──────────────────────────────────────── */
/**
 * @description Creates a ResizeObserver whose callbacks are deferred to the
 *              next animation frame and coalesced per-frame, avoiding the
 *              classic "ResizeObserver loop completed with undelivered
 *              notifications" error that fires when a callback synchronously
 *              mutates observed dimensions (e.g. ECharts .resize(), layout
 *              relayout inside an Element Plus table cell).
 *
 *              Usage pattern:
 *                const ro = createSafeResizeObserver(entries => { ... });
 *                ro.observe(el);
 *                // later: ro.disconnect();  // same API as native
 * @param callback Standard ResizeObserverCallback (invoked inside RAF)
 * @param options  Optional { debounceMs: 0 } — extra debounce on top of RAF
 * @returns ResizeObserver-compatible object (observe / unobserve / disconnect)
 */
export function createSafeResizeObserver(
  callback: ResizeObserverCallback,
  options?: { debounceMs?: number }
): ResizeObserver {
  const Unsupported = typeof ResizeObserver === "undefined";
  const debounceMs = options?.debounceMs ?? 0;

  if (Unsupported) {
    // Safari < 13.1 / very old browsers: return a silent no-op shim so callers
    // never have to feature-guard. `any` cast because the shim doesn't need
    // the full class contract.
    return {
      observe() {},
      unobserve() {},
      disconnect() {}
    } as unknown as ResizeObserver;
  }

  let rafId = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingEntries: ResizeObserverEntry[] = [];
  let pendingObserver: ResizeObserver | null = null;

  function flush() {
    rafId = 0;
    const entries = pendingEntries;
    const observer = pendingObserver;
    pendingEntries = [];
    pendingObserver = null;
    if (!entries.length || !observer) return;
    try {
      callback(entries, observer);
    } catch (e) {
      // ResizeObserver callback errors must never bubble up and break the
      // renderer loop; swallow + report via console (not errorReporter, since
      // these are almost always benign layout races).
      console.warn("[resizeObserver] callback suppressed:", e);
    }
  }

  function schedule() {
    if (rafId) return; // already pending a frame
    rafId = window.requestAnimationFrame(flush);
  }

  const observer = new ResizeObserver((entries, innerObs) => {
    pendingObserver = innerObs;
    for (const e of entries) pendingEntries.push(e);
    if (debounceMs > 0) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(schedule, debounceMs);
    } else {
      schedule();
    }
  });

  // Wrap so disconnect also cancels in-flight RAF / timer
  const origDisconnect = observer.disconnect.bind(observer);
  (observer as any).disconnect = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    pendingEntries = [];
    pendingObserver = null;
    origDisconnect();
  };

  return observer;
}
