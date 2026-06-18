/**
 * report-constants — Shared constants for health report generation.
 * Extracted from health-report.mjs for module decomposition.
 */

export const REPORT_DIR = "docs/健康报告";
export const CDN_DEPTH = "../../";

export const DIM_ICONS = {
  token:       "🔑",
  config:      "⚙️",
  robots:      "🤖",
  api:         "🌐",
  reports:     "📊",
  format:      "📋",
  diagnostics: "🔬",
  git:         "📦",
  security:    "🛡️",
  file_size:   "📏",
  dep_analysis:"🔗",
  em_testing:  "🧪",
  em_types:    "🛡️",
  em_linting:  "📏",
  em_cicd:     "🔄",
  em_docs:     "📚",
  em_deps:     "📦",
  em_git:      "🌿",
  comp_qual:   "📦",
};

export const DIM_LABELS = {
  token:       "Token 凭据",
  config:      "配置文件",
  robots:      "机器人配置",
  api:         "API 可达性",
  reports:     "自循环报告",
  format:      "消息格式合规",
  diagnostics: "D0-D7 诊断",
  git:         "Git 仓库状态",
  security:    "安全扫描",
  file_size:   "文件体积",
  dep_analysis:"依赖分析",
  em_testing:  "测试体系",
  em_types:    "类型安全",
  em_linting:  "代码规范",
  em_cicd:     "CI/CD",
  em_docs:     "文档完整",
  em_deps:     "依赖管理",
  em_git:      "Git 纪律",
  comp_qual:   "组件质量",
};

export const DIM_WEIGHTS = {
  token: 12, config: 8, robots: 8, api: 12, reports: 8, format: 8, diagnostics: 8, git: 8, security: 8,
  file_size: 8, dep_analysis: 8,
  em_testing: 20, em_types: 15, em_linting: 15, em_cicd: 15, em_docs: 15, em_deps: 10, em_git: 10,
  comp_qual: 10,
};

export const GRADE_STYLE = {
  A: { color: "#22c55e", bg: "rgba(34,197,94,.12)" },
  B: { color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
  C: { color: "#f59e0b", bg: "rgba(245,158,11,.08)" },
  D: { color: "#ef4444", bg: "rgba(239,68,68,.12)" },
};
