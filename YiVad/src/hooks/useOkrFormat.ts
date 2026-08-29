/**
 * YiVad — OKR format/display helpers.
 * Pure functions extracted from OkrRecommendPanel.vue.
 */

/** Minimal row type for risk-checking — avoids circular dependency on the component. */
interface OkrRow {
  listType?: string;
  kind: string;
  status?: string;
}

/** Process stages — mirrors processRecord.vue for consistent display. */
export const STAGES = [
  { key: 'requirement-review', icon: '📋', label: '需求评审' },
  { key: 'technical-review', icon: '🧭', label: '技术评审' },
  { key: 'code-review', icon: '🔍', label: '代码审查' },
  { key: 'build-debug', icon: '⚡', label: '构建调试' },
  { key: 'test-report', icon: '🧪', label: '测试报告' },
  { key: 'deployment', icon: '📦', label: '部署' },
  { key: 'launch', icon: '🚀', label: '上线记录' },
  { key: 'retrospective', icon: '🔄', label: '复盘总结' },
] as const;

export const STAGE_KEYS = STAGES.map((s) => s.key);
export const STAGE_ORDER: Record<string, number> = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));

export function stageIcon(stage: string): string {
  return STAGES.find((s) => s.key === stage)?.icon ?? '·';
}

export function stageLabel(stage: string): string {
  return STAGES.find((s) => s.key === stage)?.label ?? stage;
}

export function scoreTagType(score: number): 'danger' | 'warning' | 'primary' | 'info' {
  return score >= 60 ? 'danger' : score >= 35 ? 'warning' : score >= 15 ? 'primary' : 'info';
}

export function statusTagType(status: string): 'success' | 'danger' | 'warning' | 'info' {
  if (status === 'Done') return 'success';
  if (status === 'At Risk') return 'danger';
  if (status === 'In Progress') return 'warning';
  return 'info';
}

export function trendIcon(trend: string): string {
  return trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
}

export function isResolvedRisk(row: OkrRow): boolean {
  return row.listType === 'risk' && row.kind === 'action' && row.status === 'Done';
}