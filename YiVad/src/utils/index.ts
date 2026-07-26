import { isArray } from "@/utils/is";
import { FieldNamesProps } from "@/components/ProTable/interface";

const mode = import.meta.env.VITE_ROUTER_MODE;

/**
 * @description Get localStorage
 * @param {String} key Storage name
 * @returns {String}
 */
export function localGet(key: string) {
  const value = window.localStorage.getItem(key);
  try {
    return JSON.parse(window.localStorage.getItem(key) as string);
  } catch (error) {
    return value;
  }
}

/**
 * @description Set localStorage
 * @param {String} key Storage name
 * @param {*} value Storage value
 * @returns {void}
 */
export function localSet(key: string, value: any) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * @description Remove localStorage
 * @param {String} key Storage name
 * @returns {void}
 */
export function localRemove(key: string) {
  window.localStorage.removeItem(key);
}

/**
 * @description Clear all localStorage
 * @returns {void}
 */
export function localClear() {
  window.localStorage.clear();
}

/**
 * @description Determine data type
 * @param {*} val Data to check the type of
 * @returns {String}
 */
export function isType(val: any) {
  if (val === null) return "null";
  if (typeof val !== "object") return typeof val;
  else return Object.prototype.toString.call(val).slice(8, -1).toLocaleLowerCase();
}

/**
 * @description Generate unique UUID
 * @returns {String}
 */
export function generateUUID() {
  let uuid = "";
  for (let i = 0; i < 32; i++) {
    let random = (Math.random() * 16) | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) uuid += "-";
    uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
  }
  return uuid;
}

/**
 * Check if two objects are equal
 * @param {Object} a First object to compare
 * @param {Object} b Second object to compare
 * @returns {Boolean} true if equal, false otherwise
 */
export function isObjectValueEqual(a: { [key: string]: any }, b: { [key: string]: any }) {
  if (!a || !b) return false;
  let aProps = Object.getOwnPropertyNames(a);
  let bProps = Object.getOwnPropertyNames(b);
  if (aProps.length != bProps.length) return false;
  for (let i = 0; i < aProps.length; i++) {
    let propName = aProps[i];
    let propA = a[propName];
    let propB = b[propName];
    if (!b.hasOwnProperty(propName)) return false;
    if (propA instanceof Object) {
      if (!isObjectValueEqual(propA, propB)) return false;
    } else if (propA !== propB) {
      return false;
    }
  }
  return true;
}

/**
 * @description Generate random number
 * @param {Number} min Minimum value
 * @param {Number} max Maximum value
 * @returns {Number}
 */
export function randomNum(min: number, max: number): number {
  let num = Math.floor(Math.random() * (min - max) + max);
  return num;
}

/**
 * @description Get greeting based on current time
 * @returns {String}
 */
export function getTimeState() {
  let timeNow = new Date();
  let hours = timeNow.getHours();
  if (hours >= 6 && hours <= 10) return `Good morning ⛅`;
  if (hours >= 10 && hours <= 14) return `Good afternoon 🌞`;
  if (hours >= 14 && hours <= 18) return `Good afternoon 🌞`;
  if (hours >= 18 && hours <= 24) return `Good evening 🌛`;
  if (hours >= 0 && hours <= 6) return `Good night 🌛`;
}

/**
 * @description Get browser default language
 * @returns {String}
 */
export function getBrowserLang() {
  let browserLang = navigator.language ? navigator.language : navigator.browserLanguage;
  let defaultBrowserLang = "";
  if (["cn", "zh", "zh-cn"].includes(browserLang.toLowerCase())) {
    defaultBrowserLang = "zh";
  } else {
    defaultBrowserLang = "en";
  }
  return defaultBrowserLang;
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
  let newMenuList: Menu.MenuOptions[] = JSON.parse(JSON.stringify(menuList));
  return newMenuList.flatMap(item => [item, ...(item.children ? getFlatMenuList(item.children) : [])]);
}

/**
 * @description Recursively filter menus to show in sidebar (excluding isHide == true)
 * @param {Array} menuList Menu list
 * @returns {Array}
 * */
export function getShowMenuList(menuList: Menu.MenuOptions[]) {
  let newMenuList: Menu.MenuOptions[] = JSON.parse(JSON.stringify(menuList));
  return newMenuList.filter(item => {
    item.children?.length && (item.children = getShowMenuList(item.children));
    return !item.meta?.isHide;
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
 * @description Recursively process route menu paths into a flat array (used by v1 local route auth, currently unused)
 * @param {Array} menuList All menu list
 * @param {Array} menuPathArr Flat array of menu paths
 * @returns {Array}
 */
export function getMenuListPath(menuList: Menu.MenuOptions[], menuPathArr: string[] = []): string[] {
  for (const item of menuList) {
    if (typeof item === "object" && item.path) menuPathArr.push(item.path);
    if (item.children?.length) getMenuListPath(item.children, menuPathArr);
  }
  return menuPathArr;
}

/**
 * @description Recursively find the menu object for current path (currently unused)
 * @param {Array} menuList Menu list
 * @param {String} path Current access path
 * @returns {Object | null}
 */
export function findMenuByPath(menuList: Menu.MenuOptions[], path: string): Menu.MenuOptions | null {
  for (const item of menuList) {
    if (item.path === path) return item;
    if (item.children) {
      const res = findMenuByPath(item.children, path);
      if (res) return res;
    }
  }
  return null;
}

/**
 * @description Recursively filter menu names that need caching (currently unused)
 * @param {Array} menuList All menu list
 * @param {Array} keepAliveNameArr Cached menu names array
 * @returns {Array}
 * */
export function getKeepAliveRouterName(menuList: Menu.MenuOptions[], keepAliveNameArr: string[] = []) {
  menuList.forEach(item => {
    item.meta.isKeepAlive && item.name && keepAliveNameArr.push(item.name);
    item.children?.length && getKeepAliveRouterName(item.children, keepAliveNameArr);
  });
  return keepAliveNameArr;
}

/**
 * @description Format table cell default value (el-table-column)
 * @param {Number} row Row
 * @param {Number} col Column
 * @param {*} callValue Current cell value
 * @returns {String}
 * */
export function formatTableColumn(row: number, col: number, callValue: any) {
  // If current value is array, join with / (customizable)
  if (isArray(callValue)) return callValue.length ? callValue.join(" / ") : "--";
  return callValue ?? "--";
}

/**
 * @description Handle ProTable array value or empty data
 * @param {*} callValue Value to process
 * @returns {String}
 * */
export function formatValue(callValue: any) {
  // If current value is array, join with / (customizable)
  if (isArray(callValue)) return callValue.length ? callValue.join(" / ") : "--";
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
  prop.split(".").forEach(item => (row = row[item] ?? "--"));
  return row;
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
export function findItemNested(enumData: any, callValue: any, value: string, children: string) {
  return enumData.reduce((accumulator: any, current: any) => {
    if (accumulator) return accumulator;
    if (current[value] === callValue) return current;
    if (current[children]) return findItemNested(current[children], callValue, value, children);
  }, null);
}
