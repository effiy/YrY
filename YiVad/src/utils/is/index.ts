/**
 * @description: Check if value is a certain type
 */
export function is(val: unknown, type: string) {
  return Object.prototype.toString.call(val) === `[object ${type}]`;
}

/**
 * @description: Is function
 */
export function isFunction<T = Function>(val: unknown): val is T {
  return is(val, "Function");
}

/**
 * @description: Is defined
 */
export const isDef = <T = unknown>(val?: T): val is T => {
  return typeof val !== "undefined";
};

/**
 * @description: Is undefined
 */
export const isUnDef = <T = unknown>(val?: T): val is T => {
  return !isDef(val);
};

/**
 * @description: Is object
 */
export const isObject = (val: any): val is Record<any, any> => {
  return val !== null && is(val, "Object");
};

/**
 * @description: Is date
 */
export function isDate(val: unknown): val is Date {
  return is(val, "Date");
}

/**
 * @description: Is number
 */
export function isNumber(val: unknown): val is number {
  return is(val, "Number");
}

/**
 * @description: Is AsyncFunction
 */
export function isAsyncFunction<T = any>(val: unknown): val is Promise<T> {
  return is(val, "AsyncFunction");
}

/**
 * @description: Is promise
 */
export function isPromise<T = any>(val: unknown): val is Promise<T> {
  return is(val, "Promise") && isObject(val) && isFunction(val.then) && isFunction(val.catch);
}

/**
 * @description: Is string
 */
export function isString(val: unknown): val is string {
  return is(val, "String");
}

/**
 * @description: Is boolean
 */
export function isBoolean(val: unknown): val is boolean {
  return is(val, "Boolean");
}

/**
 * @description: Is array
 */
export function isArray(val: any): val is Array<any> {
  return val && Array.isArray(val);
}

/**
 * @description: Is client-side
 */
export const isClient = () => {
  return typeof window !== "undefined";
};

/**
 * @description: Is browser window
 */
export const isWindow = (val: any): val is Window => {
  return typeof window !== "undefined" && is(val, "Window");
};

/**
 * @description: Is DOM element
 */
export const isElement = (val: unknown): val is Element => {
  return isObject(val) && !!val.tagName;
};

/**
 * @description: Is null
 */
export function isNull(val: unknown): val is null {
  return val === null;
}

/**
 * @description: Is null or undefined
 */
export function isNullOrUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) || isNull(val);
}

/**
 * @description: Is hex color
 */
export const isHexColor = (str: string) => {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str);
};
