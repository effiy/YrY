/**
 * API 服务模块入口
 * 统一导出所有 API 模块
 */

import { config } from "../config.js?v=2";

// 导出常量（为了兼容性）
export const API_BASE = config.apiBase;
export const NEWS_API_BASE = `${API_BASE}${config.endpoints.mongodb}`;
// FAQ_API_URL 现在需要动态构建，请使用 buildFaqApiUrl() 函数
export { buildFaqApiUrl } from "./faq.js";
export const PROMPT_API_URL = `${API_BASE}${config.endpoints.prompt}`;
export const SESSION_API_URL = `${API_BASE}${config.endpoints.session}`;
export const SESSION_SAVE_API_URL = `${API_BASE}${config.endpoints.sessionSave}`;

// 导出模块
export * from "./auth.js";
export * from "./client.js";
export * from "./session.js";
export * from "./news.js";
export * from "./faq.js";
export * from "./prompt.js";
