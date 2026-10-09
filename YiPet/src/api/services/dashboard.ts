/**
 * Dashboard API service — lightweight project health data for YiPet popup.
 *
 * Consumes YiAi /dashboard/summary and /dashboard/live-snapshot endpoints
 * for at-a-glance project status without loading the full YiVad dashboard.
 *
 * Style: Class (consistent with other services) with a `createDashboardService`
 * factory alias preserved for backwards compatibility.
 */
import type { ApiClient } from '../client';
import { unwrapOrThrow } from '../client';

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

/* ═══════════════════════════════════════════════════════════════════════
   Service Class
   ═══════════════════════════════════════════════════════════════════════ */

export class DashboardService {
  constructor(private client: ApiClient) {}

  /** Lightweight project health summary — ideal for popup widgets. */
  async getSummary(): Promise<DashboardSummary> {
    return unwrapOrThrow(
      await this.client.get<DashboardSummary>('/dashboard/summary'),
      'Dashboard summary',
    );
  }

  /** Single snapshot of live KPIs (non-streaming). */
  async getLiveSnapshot(): Promise<LiveSnapshot> {
    return unwrapOrThrow(
      await this.client.get<LiveSnapshot>('/dashboard/live-snapshot'),
      'Live snapshot',
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   Backwards-compat factory alias
   ═══════════════════════════════════════════════════════════════════════ */

export function createDashboardService(client: ApiClient): DashboardService {
  return new DashboardService(client);
}