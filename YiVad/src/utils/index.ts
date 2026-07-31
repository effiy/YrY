import { isArray } from "@/utils/is";
import { FieldNamesProps } from "@/components/ProTable/interface";

const mode = import.meta.env.RSBUILD_ENV_ROUTER_MODE;

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
function isObjectValueEqual(a: { [key: string]: any }, b: { [key: string]: any }) {
  if (!a || !b) return false;
  let aProps = Object.getOwnPropertyNames(a);
  let bProps = Object.getOwnPropertyNames(b);
  if (aProps.length != bProps.length) return false;
  for (let i = 0; i < aProps.length; i++) {
    let propName = aProps[i];
    let propA = a[propName];
    let propB = b[propName];
    if (!Object.prototype.hasOwnProperty.call(b, propName)) return false;
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
 * @description Recursively sort menu tree children by meta.title alphabetically (A-Z, locale-aware).
 * Returns a new sorted tree — does not mutate the original.
 * @param {Array} nodes Menu tree nodes
 * @returns {Array}
 */
export function sortMenuTree(nodes: any[]): any[] {
  if (!nodes?.length) return [];
  return [...nodes]
    .map(node => (node.children?.length ? { ...node, children: sortMenuTree(node.children) } : node))
    .sort((a, b) => (a.meta?.title ?? "").localeCompare(b.meta?.title ?? "", "zh-CN-u-kf-lower"));
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
function findItemNested(enumData: any, callValue: any, value: string, children: string) {
  return enumData.reduce((accumulator: any, current: any) => {
    if (accumulator) return accumulator;
    if (current[value] === callValue) return current;
    if (current[children]) return findItemNested(current[children], callValue, value, children);
  }, null);
}
