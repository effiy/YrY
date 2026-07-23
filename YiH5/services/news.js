/**
 * 新闻相关 API
 */

import { config } from "../config.js?v=2";
import { extractList, fetchWithAuth } from "./client.js";
import { logger } from "../../YiPet/cdn/utils/h5/index.js";

// 新闻查询配置
const NEWS_PAGE_SIZE = Number(config.news.pageSize) || 500;
const NEWS_MAX_PAGES = Number(config.news.maxPages) || 10;
const NEWS_LIST_FIELDS = Array.isArray(config.news.listFields) ? config.news.listFields : [
  "key",
  "title",
  "link",
  "description",
  "tags",
  "source_name",
  "source_url",
  "published",
  "published_parsed",
  "createdTime",
  "updatedTime",
];

/**
 * 获取新闻列表（支持分页）
 * @param {string} isoDate - ISO 格式日期字符串
 * @param {string} [token]
 * @param {Object} [options]
 * @returns {Promise<{data: {list: Array, totalPages: number}}>}
 */
export const fetchNews = async (isoDate, token, options = {}) => {
  const timeoutMs = Number.isFinite(Number(options.timeoutMs)) ? Number(options.timeoutMs) : 12000;

  // Simplified parameters as requested
  const queryParams = {
    cname: 'rss',
    isoDate: isoDate
  };

  const params = new URLSearchParams({
    module_name: "services.database.data_service",
    method_name: "query_documents",
    parameters: JSON.stringify(queryParams),
  });

  const url = `${config.apiBase}/?${params.toString()}`;

  const createSignal = () => {
    const controller = new AbortController();
    const { signal } = controller;

    const external = options.signal;
    let timeoutId = null;

    if (external) {
      if (external.aborted) controller.abort(external.reason);
      else {
        const onAbort = () => controller.abort(external.reason);
        external.addEventListener("abort", onAbort, { once: true });
      }
    }

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        try {
          controller.abort(new Error("timeout"));
        } catch {
          controller.abort();
        }
      }, timeoutMs);
    }

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    return { signal, cleanup };
  };

  try {
    const { signal, cleanup } = createSignal();
    try {
      const response = await fetchWithAuth(url, { signal }, token);
      const result = await response.json();

      const newsList = extractList(result, "list");
      
      const validNews = [];
      const keys = new Set();
      
      if (Array.isArray(newsList)) {
        for (const item of newsList) {
            const key = String(item?.key ?? item?._id ?? item?.id ?? item?.link ?? item?.title ?? "").trim();
            if (!key) continue;
            if (!keys.has(key)) {
                keys.add(key);
                validNews.push(item);
            }
        }
      }
      
      return {
        data: {
          list: validNews,
          totalPages: 1,
          fetchedPages: 1,
          hasMore: false
        }
      };
    } finally {
      cleanup();
    }
  } catch (error) {
    if (String(error?.name || "") === "AbortError") {
      throw error;
    }
    logger.error(`fetchNews failed`, error);
    throw error;
  }
};
