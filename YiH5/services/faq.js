/**
 * FAQ 相关 API
 */

import { config } from "../config.js?v=2";
import { fetchWithAuth } from "./client.js";

/**
 * 构建 FAQ API URL
 * 新 API 格式: ?module_name=services.database.data_service&method_name=query_documents&parameters={...}
 * @returns {string}
 */
export const buildFaqApiUrl = () => {
  const parameters = {
    cname: "faqs",
    pageNum: 1,
    pageSize: 2000,
    orderBy: "order",
    orderType: "asc",
  };
  
  // 将 parameters 转换为 JSON 字符串
  const parametersStr = JSON.stringify(parameters);
  const baseUrl = `${config.apiBase}${config.endpoints.faq}`;
  
  // 手动构建 URL，确保 parameters 保持为未编码的 JSON 字符串
  // API 期望格式: ?module_name=...&method_name=...&parameters={"cname":"faqs",...}
  const url = new URL(baseUrl);
  url.searchParams.set("module_name", "services.database.data_service");
  url.searchParams.set("method_name", "query_documents");
  
  // 手动添加 parameters，不进行编码（因为 API 期望接收 JSON 字符串）
  // url.toString() 已经包含了 ?module_name=...&method_name=...，所以直接追加 &parameters=...
  return `${url.toString()}&parameters=${parametersStr}`;
};

/**
 * 获取 FAQ 列表
 * @param {string} [token]
 * @returns {Promise<Object>}
 */
export const fetchFaqs = async (token) => {
  const apiUrl = buildFaqApiUrl();
  const response = await fetchWithAuth(apiUrl, {}, token);
  const result = await response.json();
  return result;
};
