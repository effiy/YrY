/**
 * @description: Request configuration
 */
export enum ResultEnum {
  SUCCESS = 0,
  ERROR = 500,
  OVERDUE = 1009,
  TIMEOUT = 30000,
  TYPE = "success"
}

/**
 * @description: Request methods
 */
export enum RequestEnum {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  PUT = "PUT",
  DELETE = "DELETE"
}

/**
 * @description: Common content types
 */
export enum ContentTypeEnum {
  // JSON
  JSON = "application/json;charset=UTF-8",
  // Text
  TEXT = "text/plain;charset=UTF-8",
  // form-data, usually used with qs
  FORM_URLENCODED = "application/x-www-form-urlencoded;charset=UTF-8",
  // form-data upload
  FORM_DATA = "multipart/form-data;charset=UTF-8"
}
