/**
 * 会话相关 API
 */

import { config } from "../config.js?v=2";
import { getAuthHeaders } from "./auth.js";
import { fetchWithAuth, extractList } from "./client.js";

const SESSION_API_URL = `${config.apiBase}${config.endpoints.session}`;
const EXECUTE_API_URL = `${String(config.apiBase || "").replace(/\/+$/, "")}/`;

const executeModule = async (module_name, method_name, parameters, token) => {
  const headers = {
    ...getAuthHeaders(token),
    "Content-Type": "application/json",
  };
  const response = await fetch(EXECUTE_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ module_name, method_name, parameters }),
  });
  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }
  if (!response.ok) {
    const msg = String(json?.message || json?.data?.message || json?.error || `HTTP error! status: ${response.status}`).trim();
    const err = new Error(msg || "请求失败");
    err.status = response.status;
    err.data = json;
    throw err;
  }
  return json;
};

/**
 * 获取会话列表
 * @param {string} [token]
 * @returns {Promise<Array>}
 */
export const fetchSessions = async (token) => {
  const params = new URLSearchParams({
    module_name: "services.database.data_service",
    method_name: "query_documents",
    parameters: JSON.stringify({
      cname: "sessions",
    }),
  });
  const url = `${config.apiBase}/?${params.toString()}`;
  
  const response = await fetchWithAuth(url, {}, token);
  const data = await response.json();
  // 统一从 data/list/items 等结构中提取数组
  const sessions = extractList(data, "list");
  return sessions;
};

/**
 * 获取会话详情
 * @param {string} sessionKey
 * @param {string} [token]
 * @returns {Promise<Object|null>}
 */
export const fetchSessionDetail = async (sessionKey, token) => {
  if (!sessionKey) return null;

  const queryParams = {
    cname: "sessions",
    filter: { key: sessionKey }
  };

  const params = new URLSearchParams({
    module_name: "services.database.data_service",
    method_name: "query_documents",
    parameters: JSON.stringify(queryParams),
  });
  const url = `${config.apiBase}/?${params.toString()}`;

  const response = await fetchWithAuth(url, {}, token);
  const data = await response.json();
  const list = extractList(data);
  return list[0] || null;
};

const buildSessionPageContentPath = (session) => {
  if (!session || typeof session !== "object") return "";

  const tags = Array.isArray(session.tags) ? session.tags : [];
  let currentPath = "";
  tags.forEach((folderName) => {
    if (!folderName || (folderName.toLowerCase && folderName.toLowerCase() === "default")) return;
    currentPath = currentPath ? `${currentPath}/${folderName}` : String(folderName);
  });

  let fileName = session.title || session.pageTitle || "Untitled";
  fileName = String(fileName).replace(/\//g, "-");
  let cleanPath = currentPath ? `${currentPath}/${fileName}` : fileName;
  cleanPath = cleanPath.replace(/\\/g, "/").replace(/^\/+/, "");

  if (!cleanPath) {
    const pageDesc = session.pageDescription || "";
    if (pageDesc && String(pageDesc).includes("文件：")) {
      cleanPath = String(pageDesc).replace("文件：", "").trim();
      cleanPath = cleanPath.replace(/\\/g, "/").replace(/^\/+/, "");
    }
  }

  if (cleanPath.startsWith("static/")) {
    cleanPath = cleanPath.substring(7);
  }

  cleanPath = cleanPath.replace(/^\/+/, "");

  if (!cleanPath && session.key) {
    cleanPath = `session_${String(session.key)}.txt`;
  }

  return String(cleanPath || "");
};

export const fetchSessionPageContent = async (session, token) => {
  const cleanPath = buildSessionPageContentPath(session);
  if (!cleanPath) return "";

  const base = String(config.apiBase || "").replace(/\/+$/, "");
  const url = `${base}/read-file`;

  const response = await fetchWithAuth(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_file: cleanPath }),
    },
    token,
  );
  const json = await response.json();
  const content = json?.data?.content;
  if ((json?.code === 0 || json?.code === 200) && typeof content === "string" && json?.data?.type !== "base64") {
    return content;
  }
  return "";
};

/**
 * 保存新会话
 * @param {Object} sessionData
 * @param {string} [token]
 * @returns {Promise<Object>}
 */
export const saveSession = async (sessionData, token) => {
  const key = String(sessionData?.key || "").trim();
  if (!key) throw new Error("会话Key不能为空");

  const payload = sessionData && typeof sessionData === "object" ? { ...sessionData, key } : { key };
  const setPayload = payload && typeof payload === "object" ? { ...payload } : {};
  delete setPayload.key;
  delete setPayload.createdTime;
  delete setPayload.createdAt;

  try {
    await executeModule("services.database.data_service", "update_document", { cname: "sessions", data: payload }, token);
  } catch (e) {
    const msg = String(e?.message || "").trim();
    const notFound = msg.includes("未找到ID") || msg.includes("未找到") || e?.status === 404;
    if (!notFound) throw e;
    await executeModule(
      "services.database.data_service",
      "upsert_document",
      {
        cname: "sessions",
        filter: { key },
        update: {
          $set: setPayload,
          $setOnInsert: { key },
        },
      },
      token
    );
  }

  const session = await fetchSessionDetail(key, token);
  return { code: 0, message: "success", data: { session } };
};

/**
 * 更新会话
 * @param {string} sessionKey
 * @param {Object} data
 * @param {string} [token]
 * @returns {Promise<Object>}
 */
export const updateSession = async (sessionKey, data, token) => {
  if (!sessionKey) {
    throw new Error("会话Key不能为空");
  }
  const response = await fetchWithAuth(
    `${SESSION_API_URL}${encodeURIComponent(sessionKey)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
    token
  );
  return await response.json();
};

/**
 * 删除会话
 * @param {string} sessionKey
 * @param {string} [token]
 * @returns {Promise<Object>}
 */
export const deleteSession = async (sessionKey, token) => {
  if (!sessionKey) {
    throw new Error("会话Key不能为空");
  }
  // 使用 delete_document 接口删除会话
  const result = await executeModule(
    "services.database.data_service",
    "delete_document",
    {
      cname: "sessions",
      key: String(sessionKey),
    },
    token
  );
  return { code: 0, message: "会话删除成功", data: result };
};
