/**
 * Dashboard API service — lightweight project health data for YiPet popup.
 *
 * Consumes YiAi /dashboard/summary and /dashboard/live-snapshot endpoints
 * for at-a-glance project status without loading the full YiVad dashboard.
 */
import type { ApiClient } from '../client';

export interface ProjectSummary {
  key: string;
  name: string;
  open_issues: number;
  open_bugs: number;
  health: 'healthy' | 'warning' | 'critical' | 'unknown';
}

export interface DashboardSummary {
  active_projects: number;
  total_issues: number;
  open_issues: number;
  open_bugs: number;
  today_done: number;
  overdue: number;
  blocked: number;
  chat_sessions: number;
  knowledge_files: number;
  server_uptime: number;
  projects: ProjectSummary[];
}

export interface LiveSnapshot {
  active_issues: number;
  open_bugs: number;
  today_done: number;
  today_created: number;
  overdue_count: number;
  blocked_count: number;
  total_issues: number;
  total_bugs: number;
  server_uptime: number;
  timestamp: number;
}

export function createDashboardService(client: ApiClient) {
  return {
    /** Lightweight project health summary — ideal for popup widgets. */
    async getSummary(): Promise<DashboardSummary> {
      const res = await client.get<DashboardSummary>('/dashboard/summary');
      if (!res.ok) throw new Error(res.error || 'Summary failed');
      return res.data;
    },

    /** Single snapshot of live KPIs (non-streaming). */
    async getLiveSnapshot(): Promise<LiveSnapshot> {
      const res = await client.get<LiveSnapshot>('/dashboard/live-snapshot');
      if (!res.ok) throw new Error(res.error || 'Live snapshot failed');
      return res.data;
    },
  };
}

export type DashboardService = ReturnType<typeof createDashboardService>;