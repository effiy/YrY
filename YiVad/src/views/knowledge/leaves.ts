/**
 * Knowledge leaves — second-level folders under each top-level category.
 * Source of truth for per-leaf view folders, routes, and menu links.
 * Derived from YiKnowledge leaf README "已收录" sections.
 */
export interface KnowledgeLeaf {
  category: string;
  leaf: string;
  label: string;
  desc: string;
}

export const KNOWLEDGE_LEAVES: KnowledgeLeaf[] = [
  // industry
  { category: "industry", leaf: "competitors", label: "Competitors", desc: "竞品分析、厂商动态" },
  { category: "industry", leaf: "market-trends", label: "Market Trends", desc: "市场趋势、行业变化" },
  { category: "industry", leaf: "reports", label: "Industry Reports", desc: "行业报告摘要" },
  { category: "industry", leaf: "use-cases", label: "Use Cases", desc: "落地案例、客户案例" },
  // lessons
  { category: "lessons", leaf: "wins", label: "Wins", desc: "成功案例" },
  { category: "lessons", leaf: "failures", label: "Failures", desc: "失败案例与教训" },
  { category: "lessons", leaf: "gotchas", label: "Gotchas", desc: "踩坑记录与陷阱" },
  // methodology
  { category: "methodology", leaf: "ai-specific", label: "AI Methodology", desc: "RAG / Agent / 评估 / 微调" },
  { category: "methodology", leaf: "pm-frameworks", label: "PM Frameworks", desc: "RICE / JTBD / Kano / OKR" },
  { category: "methodology", leaf: "thinking", label: "Thinking Models", desc: "思维框架与决策模型" },
  // people
  { category: "people", leaf: "team", label: "Team", desc: "团队成员" },
  { category: "people", leaf: "stakeholders", label: "Stakeholders", desc: "干系人" },
  { category: "people", leaf: "experts", label: "Experts", desc: "外部专家" },
  // product
  { category: "product", leaf: "strategy", label: "Product Strategy", desc: "战略框架、五力、蓝海" },
  { category: "product", leaf: "prd", label: "PRD", desc: "产品需求文档" },
  { category: "product", leaf: "ux", label: "UX", desc: "用户体验、可用性" },
  { category: "product", leaf: "metrics", label: "Metrics", desc: "北极星、留存、AI 指标" },
  // resources
  { category: "resources", leaf: "prompts", label: "Prompts", desc: "可复用提示词" },
  { category: "resources", leaf: "templates", label: "Templates", desc: "可复用模板" },
  { category: "resources", leaf: "reading-list", label: "Reading List", desc: "阅读清单" },
  // tech
  { category: "tech", leaf: "ai-foundations", label: "AI Foundations", desc: "Transformer / Attention / KV Cache / MoE" },
  { category: "tech", leaf: "ai-platform", label: "AI Platform", desc: "推理引擎 / 向量库 / 可观测" },
  { category: "tech", leaf: "data", label: "Data", desc: "数据工程、存储" },
  { category: "tech", leaf: "infra", label: "Infra", desc: "基础设施、技术债、容量成本" },
  // work
  { category: "work", leaf: "processes", label: "Processes", desc: "流程：oncall / 监控 / 技术债" },
  { category: "work", leaf: "collaboration", label: "Collaboration", desc: "异步、跨时区、RACI" },
  { category: "work", leaf: "meetings", label: "Meetings", desc: "周会、评审、复盘" },
  { category: "work", leaf: "tools", label: "Tools", desc: "Claude Code / vLLM / Biome" }
];

/** Leaves grouped by category, for hub/category-list rendering. */
export function leavesOf(category: string): KnowledgeLeaf[] {
  return KNOWLEDGE_LEAVES.filter(l => l.category === category);
}

/** Route name for a leaf list, e.g. "kTechAiFoundationsList". */
export function leafListRouteName(category: string, leaf: string): string {
  return `k${pascal(category)}${pascal(leaf)}List`;
}

/** Route name for a leaf detail, e.g. "kTechAiFoundationsDetail". */
export function leafDetailRouteName(category: string, leaf: string): string {
  return `k${pascal(category)}${pascal(leaf)}Detail`;
}

/** Route path for a leaf list, e.g. "/knowledge/tech/ai-foundations". */
export function leafListPath(category: string, leaf: string): string {
  return `/knowledge/${category}/${leaf}`;
}

/** Route path for a leaf detail, e.g. "/knowledge/tech/ai-foundations/detail". */
export function leafDetailPath(category: string, leaf: string): string {
  return `/knowledge/${category}/${leaf}/detail`;
}

function pascal(s: string): string {
  return s
    .split(/[-_]/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}
