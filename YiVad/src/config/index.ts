// ? Global default configuration

// Home page URL (default)
export const HOME_URL: string = "/home/index";

// Login page URL (default)
export const LOGIN_URL: string = "/login";

// Default theme color
export const DEFAULT_PRIMARY: string = "#009688";

// Route whitelist (routes existing in staticRouter.ts)
export const ROUTER_WHITE_LIST: string[] = ["/500"];

// AMap key
export const AMAP_MAP_KEY: string = "";

// Baidu Map key
export const BAIDU_MAP_KEY: string = "";

// Project dictionary (values match BRD meta-schemas project enum — lowercase)
export const PROJECTS: string[] = ["yiai", "yipet", "yivad", "yiknowledge"];

// Display labels for project values
export const PROJECT_LABELS: Record<string, string> = {
  yiai: "YiAi",
  yipet: "YiPet",
  yivad: "YiVad",
  yiknowledge: "YiKnowledge"
};
