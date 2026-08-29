import http from "@/api/index";
import type { DashboardHealthData, RssStatsData, KnowledgeStatsData, RssSourceHealthData, OrgStatsData, AiStatsData, RagStatsData, PerformanceData, ServiceStatsData } from "@/api/interface/yiweb";

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
  return http.get("/dashboard/rss-stats", { params }) as any;
}

export function getKnowledgeStats(): Promise<{ code: number; message: string; data: KnowledgeStatsData }> {
  return http.get("/dashboard/knowledge-stats") as any;
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

export function searchKnowledge(query: string, category?: string, maxResults?: number): Promise<{ code: number; message: string; data: { results: { path: string; title: string; snippet: string; size: number }[]; total: number } }> {
  return http.post("/knowledge-search", { query, category, max_results: maxResults ?? 50 }) as any;
}