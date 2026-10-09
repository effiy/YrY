import http from "@/api/index";
import type {
  DashboardHealthData,
  RssStatsData,
  KnowledgeStatsData,
  RssSourceHealthData,
  OrgStatsData,
  AiStatsData,
  RagStatsData,
  PerformanceData,
  ServiceStatsData
} from "@/api/interface/yiAi";

export function getDashboardHealth(): Promise<{ code: number; message: string; data: DashboardHealthData }> {
  return http.get("/dashboard/health") as any;
}

export interface RssStatsParams {
  /** Inclusive start, ms-precision timestamp against ``published_parsed``. */
  start?: number;
  /** Inclusive end, ms-precision timestamp against ``published_parsed``. */
  end?: number;
}

export function getRssStats(params?: RssStatsParams): Promise<{ code: number; message: string; data: RssStatsData }> {
  return http.get("/dashboard/rss-stats", params ?? {}) as any;
}

export interface StatsFetchOptions {
  /** AbortSignal 用于外部取消（符合项目 AbortSignal 全链路约束） */
  signal?: AbortSignal;
  /** 精确超时时间（ms）。当与外层 axios timeout 同时存在时，取最小的值先触发 */
  timeout?: number;
  /**
   * 是否在并发相同 URL 时通过 axiosCanceler 去重 cancel 前序请求。
   * 默认 true 会对同一 endpoint 的并行请求互相 cancel；对于定时刷新的 API（如 knowledge-stats）
   * 应显式传入 false 避免刷新请求被 cancel 掉。
   */
  cancel?: boolean;
  /** 是否展示全局 loading 全屏遮罩。默认 true。统计 API 建议设 false。 */
  loading?: boolean;
}

export function getKnowledgeStats(
  opts: StatsFetchOptions = {}
): Promise<{ code: number; message: string; data: KnowledgeStatsData }> {
  const { signal, timeout, cancel, loading } = opts;
  const extra: Record<string, any> = {};
  if (typeof signal !== "undefined") extra.signal = signal;
  if (typeof timeout !== "undefined") extra.timeout = timeout;
  if (typeof cancel !== "undefined") extra.cancel = cancel;
  if (typeof loading !== "undefined") extra.loading = loading;
  return http.get("/dashboard/knowledge-stats", {}, extra) as any;
}

export function getRssSourceHealth(): Promise<{ code: number; message: string; data: RssSourceHealthData }> {
  return http.get("/dashboard/rss-sources") as any;
}

export function getOrgStats(): Promise<{ code: number; message: string; data: OrgStatsData }> {
  return http.get("/dashboard/organization") as any;
}

export function getAiStats(): Promise<{ code: number; message: string; data: AiStatsData }> {
  return http.get("/dashboard/ai-stats") as any;
}

export function getRagStats(): Promise<{ code: number; message: string; data: RagStatsData }> {
  return http.get("/dashboard/rag-stats") as any;
}

export function getPerformance(): Promise<{ code: number; message: string; data: PerformanceData }> {
  return http.get("/dashboard/performance") as any;
}

export function getServiceStats(): Promise<{ code: number; message: string; data: ServiceStatsData }> {
  return http.get("/dashboard/service-stats") as any;
}

export function searchKnowledge(
  query: string,
  category?: string,
  maxResults?: number
): Promise<{
  code: number;
  message: string;
  data: { results: { path: string; title: string; snippet: string; size: number }[]; total: number };
}> {
  return http.post("/knowledge-search", { query, category, max_results: maxResults ?? 50 }) as any;
}
