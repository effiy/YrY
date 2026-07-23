/**
 * 认证管理模块
 * 负责 Token 的存储、获取和 Header 生成
 */

const API_TOKEN_KEY = "YiH5.apiToken.v1";

/**
 * 获取存储的 Token
 * @returns {string} Token 字符串
 */
export const getStoredToken = () => {
  try {
    return String(localStorage.getItem(API_TOKEN_KEY) || "").trim();
  } catch {
    return "";
  }
};

/**
 * 保存 Token
 * @param {string} token 
 */
export const saveToken = (token) => {
  try {
    localStorage.setItem(API_TOKEN_KEY, String(token || "").trim());
  } catch {
    // ignore
  }
};

/**
 * 获取认证 Header
 * @param {string} [token] - 可选的临时 Token
 * @returns {Object} Headers 对象
 */
export const getAuthHeaders = (token) => {
  const authToken = token || getStoredToken();
  if (!authToken) return {};
  return { "X-Token": authToken };
};
