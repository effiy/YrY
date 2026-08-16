// ═══════════════════════════════════════════════════════════
// Shared OKR data — single source of truth for okr.vue and okrRole.vue
// ═══════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────
export interface KeyResult {
  text: string;
  progress: number;
}

export interface GoalItem {
  id: string; icon: string; title: string; status: string;
  description: string; period: string; owner: string; project: string;
  keyResults: KeyResult[];
}

export interface MetricItem {
  id: string; icon: string; name: string; category: string; framework: string;
  description: string; current: number; target: number; baseline: number;
  unit: string; trend: string; progress: number;
}

export interface DailyRoleData {
  yesterday: string[];
  today: string[];
  blocker: string;
  mood: string;
  moodType: "primary" | "success" | "warning" | "danger" | "info";
}

export interface ChecklistItem {
  id: string; text: string; done: boolean; value?: string;
}

export interface WeeklyRoleData {
  status: string;
  statusType: "success" | "warning" | "danger" | "info" | "primary";
  done: string[];
  blockers: string[];
  nextWeek: string[];
  decisions: string[];
}

export interface RoleMeta {
  id: string; name: string; icon: string; dir: string;
  description: string; projects: string[]; categories: string[];
}

// ── Role IDs ───────────────────────────────────
export const ROLE_IDS = ["executiver", "producter", "leader", "engineer", "srer", "aier", "curator"] as const;
export type RoleId = typeof ROLE_IDS[number];

// ── Role Metadata ──────────────────────────────
export const rolesData: Record<string, {
  id: string; name: string; icon: string; dir: string;
  description: string; projects: string[]; categories: string[];
}> = {
  executiver: {
    id: "executiver", name: "Executive", icon: "🏢", dir: "executiver/",
    description: "Org-level objectives that cascade into team goals. Own the annual and quarterly OKR cycle for the Yi family of products.",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["Growth", "Adoption", "Efficiency"]
  },
  producter: {
    id: "producter", name: "Product", icon: "📋", dir: "producter/",
    description: "Product goals that translate business strategy into measurable outcomes. Own the product roadmap and success metrics.",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["Engagement", "Adoption", "Satisfaction", "Retention"]
  },
  leader: {
    id: "leader", name: "Leader", icon: "🧭", dir: "leader/",
    description: "Technical direction goals. Every architecture decision and tech selection is a bet on a future state.",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["Architecture", "Cost", "Security", "Delivery"]
  },
  engineer: {
    id: "engineer", name: "Engineer", icon: "⚡", dir: "engineer/",
    description: "Delivery goals focused on velocity, quality, and knowledge sharing across the three projects.",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["Velocity", "Quality", "Knowledge"]
  },
  srer: {
    id: "srer", name: "SRE", icon: "🔧", dir: "srer/",
    description: "Reliability goals for YiAi (the backend serving both YiVad and YiPet).",
    projects: ["YiAi"],
    categories: ["Reliability", "Incident", "Observability"]
  },
  aier: {
    id: "aier", name: "AI Engineer", icon: "🤖", dir: "aier/",
    description: "AI capability goals across all three projects — RAG quality, agent reliability, model evaluation.",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["RAG Quality", "Agent Reliability", "Model Performance"]
  },
  curator: {
    id: "curator", name: "Curator", icon: "📦", dir: "curator/",
    description: "Knowledge base health goals. Maintain the KB that feeds all projects' AI and human workflows.",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["Coverage", "Freshness", "Quality", "Governance"]
  }
};

export const goalsData: Record<string, GoalItem[]> = {
  executiver: [
    { id: "exec-001", icon: "📈", title: "Yi Product Suite Growth", status: "active", description: "Grow the Yi product suite (YiAi + YiVad + YiPet) from internal tools to a self-serve platform.", period: "2026 H1", owner: "CEO", project: "YiAi", keyResults: [{ text: "YiAi serves 3+ business lines with independent tenant isolation", progress: 67 }, { text: "YiVad becomes the single admin console for all internal operations", progress: 80 }, { text: "YiPet reaches 50+ daily active users across departments", progress: 45 }, { text: "YiKnowledge reaches 500+ verified knowledge files with 90% freshness", progress: 82 }] },
    { id: "exec-002", icon: "🤖", title: "AI-First Transformation", status: "active", description: "Position AI as the primary interface for all internal tools. The BRD agent, RAG system, and aiChat agent mode should handle 70% of routine operational tasks.", period: "2026 Q3-Q4", owner: "CTO", project: "YiAi", keyResults: [{ text: "BRD agent autonomously generates 80% of BRD first drafts", progress: 60 }, { text: "aiChat agent mode completes 70% of CRUD tasks without human intervention", progress: 62 }, { text: "RAG retrieval relevance score > 0.85", progress: 72 }, { text: "Model cost per task reduced by 30%", progress: 40 }] },
    { id: "exec-005", icon: "🔗", title: "Yi Ecosystem Integration", status: "active", description: "Unify YiAi, YiVad, and YiPet into a seamless product ecosystem with shared identity, navigation, and data flow.", period: "2026 Q4", owner: "CEO", project: "YiVad", keyResults: [{ text: "Single sign-on across all 3 products", progress: 0 }, { text: "Unified notification system: alerts surface in YiVad and YiPet", progress: 0 }, { text: "Cross-product data pipeline: YiVad metrics feed YiAi RAG context", progress: 0 }, { text: "Ecosystem health dashboard with cross-product KPIs", progress: 0 }] },
  ],
  producter: [
    { id: "prod-001", icon: "💬", title: "YiAi Chat Experience", status: "active", description: "Make YiAi's chat interface (aiChat) the primary interaction model for all knowledge work.", period: "2026 Q3", owner: "PM YiAi", project: "YiAi", keyResults: [{ text: "aiChat agent mode task completion rate > 70%", progress: 55 }, { text: "Confirmation UX: user approves/rejects in < 3 seconds", progress: 90 }, { text: "Chat-based confirmation answers adoption > 50%", progress: 75 }, { text: "User satisfaction score > 4.0/5.0", progress: 60 }] },
    { id: "prod-002", icon: "🖥️", title: "YiVad Admin Maturity", status: "active", description: "YiVad evolves from a basic admin panel to a comprehensive management console.", period: "2026 Q3-Q4", owner: "PM YiVad", project: "YiVad", keyResults: [{ text: "7 role-specific goal and metric views implemented", progress: 40 }, { text: "ProTable-driven CRUD pages for all YiKnowledge collections", progress: 85 }, { text: "Knowledge base dashboard with freshness tracking", progress: 70 }, { text: "Admin console used by all 5 pipeline roles weekly", progress: 50 }] },
  ],
  leader: [
    { id: "lead-001", icon: "🏗️", title: "Architecture Maturity L4", status: "active", description: "Advance architecture maturity from L3 (Defined) to L4 (Measured).", period: "2026 Q3-Q4", owner: "Tech Lead", project: "YiAi", keyResults: [{ text: "YiAi: OpenAPI schema auto-generated from FastAPI routes", progress: 30 }, { text: "YiVad: TypeScript types generated from OpenAPI schema", progress: 0 }, { text: "Architecture fitness functions run in CI", progress: 0 }, { text: "All ADRs updated with current status", progress: 85 }] },
    { id: "lead-004", icon: "💰", title: "Cost Efficiency", status: "active", description: "Track and optimize infrastructure and API costs across all projects.", period: "2026 H2", owner: "Tech Lead", project: "YiAi", keyResults: [{ text: "LLM API cost dashboard with per-model breakdown", progress: 60 }, { text: "Monthly LLM cost within 80% of budget", progress: 50 }, { text: "YiAi infrastructure cost < $500/month", progress: 85 }, { text: "Cost attribution: each project's LLM usage tracked", progress: 30 }] },
  ],
  engineer: [
    { id: "eng-001", icon: "🚀", title: "Delivery Velocity", status: "active", description: "Maintain consistent delivery velocity across all three projects. Measure DORA metrics.", period: "2026 Q3", owner: "Engineering Lead", project: "YiAi", keyResults: [{ text: "YiAi: deploy frequency > 3x/week, lead time < 2 days", progress: 70 }, { text: "YiVad: deploy frequency > 2x/week, lead time < 1 day", progress: 85 }, { text: "YiPet: extension release cycle < 2 weeks", progress: 60 }, { text: "Change failure rate < 10%", progress: 80 }] },
    { id: "eng-005", icon: "🧹", title: "Technical Debt Reduction", status: "active", description: "Actively reduce technical debt. YiVad's 22 vue-tsc type errors must be resolved.", period: "2026 Q1", owner: "Engineering Lead", project: "YiVad", keyResults: [{ text: "YiVad: resolve 22 vue-tsc errors to zero", progress: 15 }, { text: "YiPet: npm audit critical/high severity issues to zero", progress: 50 }, { text: "YiAi: remove deprecated API endpoints", progress: 40 }, { text: "Quarterly tech debt review added to sprint planning", progress: 100 }] },
  ],
  srer: [
    { id: "sre-001", icon: "🎯", title: "SLO Compliance", status: "active", description: "Define and monitor Service Level Objectives for YiAi.", period: "2026 Q2", owner: "SRE Lead", project: "YiAi", keyResults: [{ text: "YiAi API availability > 99.5%", progress: 95 }, { text: "P99 latency < 500ms for non-LLM endpoints", progress: 85 }, { text: "P99 latency < 5s for LLM streaming endpoints", progress: 80 }, { text: "Error budget tracking dashboard live", progress: 60 }] },
    { id: "sre-003", icon: "📊", title: "Observability Coverage", status: "active", description: "Achieve comprehensive observability across the YiAi stack.", period: "2026 Q3-Q4", owner: "SRE Lead", project: "YiAi", keyResults: [{ text: "All YiAi API endpoints have request count, latency, error rate dashboards", progress: 70 }, { text: "MongoDB query performance monitoring with slow-query alerts", progress: 50 }, { text: "LLM call metrics: token usage, cost, latency per model", progress: 60 }, { text: "Alert coverage: all SLO breaches trigger notification within 2 minutes", progress: 75 }] },
  ],
  aier: [
    { id: "aier-001", icon: "🔍", title: "RAG Retrieval Quality", status: "active", description: "The RAG system is the foundation of AI-powered knowledge work.", period: "2026 Q3", owner: "AI Engineer", project: "YiAi", keyResults: [{ text: "Hybrid retrieval relevance score > 0.85", progress: 72 }, { text: "RAG evaluation benchmark: 100+ test queries", progress: 60 }, { text: "Chunking strategy optimized per content type", progress: 45 }, { text: "Inline citation accuracy: > 90%", progress: 78 }] },
    { id: "aier-002", icon: "🤖", title: "Agent Task Completion", status: "active", description: "The agent loop (Pi-inspired) must reliably complete multi-step tasks.", period: "2026 Q3", owner: "AI Engineer", project: "YiAi", keyResults: [{ text: "Agent task completion rate > 70% for CRUD operations", progress: 62 }, { text: "Agent stall recovery: model escalation succeeds > 80%", progress: 70 }, { text: "Tool confirmation rate: < 10% false positives", progress: 85 }, { text: "Agent max_turns: 80% of tasks complete within 5 turns", progress: 60 }] },
  ],
  curator: [
    { id: "cur-001", icon: "📖", title: "KB Coverage", status: "active", description: "Ensure every project decision, pattern, and lesson is captured in YiKnowledge.", period: "2026 H2", owner: "Curator", project: "YiAi", keyResults: [{ text: "YiKnowledge: 500+ files with complete frontmatter", progress: 82 }, { text: "Coverage gaps identified and tracked", progress: 60 }, { text: "Each project has architecture + functional-modules + dev-standards docs", progress: 100 }, { text: "No orphaned content: every file has a role home", progress: 75 }] },
    { id: "cur-002", icon: "🔄", title: "Freshness Compliance", status: "active", description: "Content rots without maintenance. Track review_cycle compliance.", period: "2026 Q3", owner: "Curator", project: "YiVad", keyResults: [{ text: "90% of files have last_verified within review_cycle", progress: 78 }, { text: "0 files with last_verified > 6 months", progress: 85 }, { text: "YiVad dashboard: freshness tracking with 5-month warnings", progress: 70 }, { text: "Quarterly review: all files with review_cycle: quarterly verified", progress: 100 }] },
  ]
};


export const metricsData: Record<string, MetricItem[]> = {
  executiver: [
    { id: "exec-m01", icon: "👥", name: "Yi Product Suite DAU", category: "Growth", framework: "OKR", description: "Daily active users across YiAi, YiVad, and YiPet.", current: 38, target: 50, baseline: 15, unit: " users", trend: "up", progress: 66 },
    { id: "exec-m02", icon: "🏭", name: "Business Line Adoption", category: "Adoption", framework: "OKR", description: "Number of business lines actively using YiAi as their AI backend.", current: 2, target: 3, baseline: 1, unit: " lines", trend: "up", progress: 67 },
    { id: "exec-m03", icon: "⚡", name: "AI Task Automation Rate", category: "Efficiency", framework: "OKR", description: "Percentage of routine operational tasks handled by AI agents.", current: 55, target: 70, baseline: 20, unit: "%", trend: "up", progress: 62 },
    { id: "exec-m06", icon: "🎯", name: "Strategic Alignment", category: "Adoption", framework: "OKR", description: "Percentage of team goals that directly trace to company-level OKRs.", current: 85, target: 95, baseline: 60, unit: "%", trend: "up", progress: 80 },
  ],
  producter: [
    { id: "prod-m01", icon: "⭐", name: "North Star Metric", category: "Engagement", framework: "HEART", description: "Weekly active users who complete at least one AI-assisted task.", current: 28, target: 50, baseline: 10, unit: " WAUs", trend: "up", progress: 56 },
    { id: "prod-m02", icon: "😊", name: "Happiness (CSAT)", category: "Satisfaction", framework: "HEART", description: "Customer satisfaction score for AI-assisted tasks.", current: 4.1, target: 4.5, baseline: 3.5, unit: "/5", trend: "up", progress: 60 },
    { id: "prod-m05", icon: "🚀", name: "Deployment Frequency", category: "Engagement", framework: "DORA", description: "How often each project deploys to production.", current: 3, target: 5, baseline: 1, unit: "/week", trend: "up", progress: 60 },
    { id: "prod-m06", icon: "⏱️", name: "Time-to-Value", category: "Adoption", framework: "HEART", description: "Time from first use to first successful AI-assisted task completion.", current: 2.5, target: 1, baseline: 5, unit: " days", trend: "down", progress: 70 },
    { id: "prod-m08", icon: "🔧", name: "Change Failure Rate", category: "Engagement", framework: "DORA", description: "Percentage of deployments that cause incidents or require rollback.", current: 8, target: 5, baseline: 20, unit: "%", trend: "down", progress: 75 }
  ],
  leader: [
    { id: "lead-m01", icon: "🏗️", name: "Architecture Maturity", category: "Architecture", framework: "Maturity Model", description: "Current architecture maturity level across all projects.", current: 3, target: 4, baseline: 2, unit: " level", trend: "up", progress: 50 },
    { id: "lead-m02", icon: "🚀", name: "DORA Elite Benchmark", category: "Delivery", framework: "DORA", description: "Composite DORA score: deploy freq + lead time + CFR + MTTR.", current: 65, target: 85, baseline: 30, unit: "/100", trend: "up", progress: 55 },
    { id: "lead-m03", icon: "💰", name: "Cost per AI Task", category: "Cost", framework: "FinOps", description: "Average LLM API cost per completed agent task.", current: 0.12, target: 0.08, baseline: 0.25, unit: " $/task", trend: "down", progress: 70 },
    { id: "lead-m04", icon: "🧹", name: "Tech Debt Ratio", category: "Architecture", framework: "Maturity Model", description: "Number of acknowledged tech debt items vs. resolved items.", current: 35, target: 10, baseline: 50, unit: " items", trend: "down", progress: 60 },
    { id: "lead-m06", icon: "📝", name: "ADR Coverage", category: "Architecture", framework: "Maturity Model", description: "Percentage of significant technical decisions documented as ADRs.", current: 80, target: 95, baseline: 40, unit: "%", trend: "up", progress: 75 },
  ],
  engineer: [
    { id: "eng-m01", icon: "🚀", name: "Deployment Frequency", category: "Velocity", framework: "DORA", description: "Deployments per week per project.", current: 2.5, target: 4, baseline: 1, unit: "/week", trend: "up", progress: 60 },
    { id: "eng-m02", icon: "⏱️", name: "Lead Time for Changes", category: "Velocity", framework: "DORA", description: "Median time from code committed to code running in production.", current: 1.5, target: 0.5, baseline: 4, unit: " days", trend: "down", progress: 70 },
    { id: "eng-m06", icon: "📚", name: "KB Contributions", category: "Knowledge", framework: "Engineering", description: "New knowledge files contributed by engineers per month.", current: 12, target: 15, baseline: 5, unit: " files/mo", trend: "up", progress: 80 },
  ],
  srer: [
    { id: "sre-m01", icon: "📡", name: "API Availability", category: "Reliability", framework: "SLO", description: "YiAi API uptime percentage. SLO: 99.5%.", current: 99.7, target: 99.5, baseline: 99.0, unit: "%", trend: "up", progress: 100 },
    { id: "sre-m02", icon: "🐌", name: "P99 Latency (non-LLM)", category: "Reliability", framework: "SLO", description: "99th percentile response time for non-LLM API endpoints.", current: 320, target: 500, baseline: 800, unit: "ms", trend: "down", progress: 100 },
    { id: "sre-m03", icon: "🎫", name: "Error Budget Remaining", category: "Reliability", framework: "SLO", description: "Percentage of error budget remaining this month.", current: 65, target: 20, baseline: 50, unit: "%", trend: "down", progress: 75 },
    { id: "sre-m06", icon: "📊", name: "Alert Coverage", category: "Observability", framework: "SLO", description: "Percentage of SLO breaches that trigger an alert within 2 minutes.", current: 85, target: 95, baseline: 50, unit: "%", trend: "up", progress: 70 },
  ],
  aier: [
    { id: "aier-m01", icon: "🔍", name: "RAG Relevance Score", category: "RAG Quality", framework: "AI Eval", description: "Hybrid retrieval relevance measured against 100+ test queries.", current: 0.78, target: 0.85, baseline: 0.55, unit: "", trend: "up", progress: 72 },
    { id: "aier-m02", icon: "✅", name: "Agent Task Completion", category: "Agent Reliability", framework: "AI Eval", description: "Percentage of agent tasks that complete successfully.", current: 62, target: 75, baseline: 30, unit: "%", trend: "up", progress: 62 },
    { id: "aier-m03", icon: "🔄", name: "Model Fallback Rate", category: "Agent Reliability", framework: "AI Eval", description: "Percentage of agent turns where the primary model stalls.", current: 15, target: 10, baseline: 35, unit: "%", trend: "down", progress: 65 },
    { id: "aier-m04", icon: "📎", name: "Citation Accuracy", category: "RAG Quality", framework: "AI Eval", description: "Percentage of inline citations that point to the correct source.", current: 85, target: 92, baseline: 60, unit: "%", trend: "up", progress: 72 },
  ],
  curator: [
    { id: "cur-m01", icon: "📄", name: "File Count", category: "Coverage", framework: "KB Health", description: "Total verified knowledge files with complete frontmatter.", current: 410, target: 500, baseline: 200, unit: " files", trend: "up", progress: 82 },
    { id: "cur-m03", icon: "🔄", name: "Freshness Score", category: "Freshness", framework: "KB Health", description: "Percentage of files with last_verified within review_cycle.", current: 78, target: 90, baseline: 50, unit: "%", trend: "up", progress: 65 },
    { id: "cur-m06", icon: "👻", name: "Orphan Content", category: "Coverage", framework: "KB Health", description: "Percentage of files without valid related links or role home.", current: 8, target: 2, baseline: 25, unit: "%", trend: "down", progress: 75 },
  ]
};

// Flat map of all metrics by ID for cross-role lookup

export const allMetricsMap: Record<string, MetricItem> = {};
for (const roleMetrics of Object.values(metricsData)) {
  for (const m of roleMetrics) {
    allMetricsMap[m.id] = m;
  }
}

// Flat map of all goals by ID for cross-role lookup (goalId → 所属项目等)
export const allGoalsMap: Record<string, GoalItem> = {};
for (const roleGoals of Object.values(goalsData)) {
  for (const g of roleGoals) {
    allGoalsMap[g.id] = g;
  }
}

// goalId → 所属角色 id（用于把目标深链回其角色 OKR 页，与任务 owner 角色区分）
export const goalRoleMap: Record<string, string> = {};
for (const [roleId, roleGoals] of Object.entries(goalsData)) {
  for (const g of roleGoals) {
    goalRoleMap[g.id] = roleId;
  }
}

// metricId → 所属角色 id（用于把指标文件归到对应 role 目录）
export const metricRoleMap: Record<string, string> = {};
for (const [roleId, roleMetrics] of Object.entries(metricsData)) {
  for (const m of roleMetrics) {
    metricRoleMap[m.id] = roleId;
  }
}

// Goal → Metric mapping (linked management: one Goal contains multiple Metrics)
export const goalMetricMap: Record<string, string[]> = {
  "exec-001": ["exec-m01", "exec-m02", "exec-m06"],
  "exec-002": ["exec-m03"],
  "exec-005": ["exec-m01", "exec-m02", "exec-m03"],
  "prod-001": ["prod-m01", "prod-m02", "prod-m06"],
  "prod-002": ["eng-m06"],
  "lead-001": ["lead-m01", "lead-m02", "lead-m06"],
  "lead-004": ["lead-m03"],
  "eng-001": ["eng-m01", "eng-m02", "prod-m05", "prod-m08"],
  "eng-005": ["lead-m04"],
  "sre-001": ["sre-m01", "sre-m02", "sre-m03"],
  "sre-003": ["sre-m06"],
  "aier-001": ["aier-m01", "aier-m04"],
  "aier-002": ["aier-m02", "aier-m03"],
  "cur-001": ["cur-m01", "cur-m06"],
  "cur-002": ["cur-m03"],
};

export function getGoalMetrics(goalId: string): MetricItem[] {
  return (goalMetricMap[goalId] || []).map(id => allMetricsMap[id]).filter(Boolean);
}

export const roleDailyDataMap: Record<string, DailyRoleData> = {
  executiver: {
    yesterday: ["Q3 all-hands deck outline approved", "Reviewed business line adoption pipeline — 2 candidates identified", "Budget review with finance: Q4 allocation draft ready"],
    today: ["Finalize Q3 all-hands presentation", "Approve Q4 budget allocation v2", "1:1 with Tech Lead — test coverage acceleration"],
    blocker: "",
    mood: "Focused", moodType: "primary"
  },
  producter: {
    yesterday: ["YiVad OKR redesign: weekly report + retro shipped", "BRD agent acceptance rate review — 65% with 3 active business lines", "YiPet user survey: 28 WAUs and growing"],
    today: ["Cross-project integration: shared UI component spec draft", "YiPet extension rating collection — user survey design", "YiVad admin maturity: role views milestone check"],
    blocker: "YiPet extension rating — no feedback channel yet",
    mood: "Productive", moodType: "success"
  },
  leader: {
    yesterday: ["Multi-provider LLM routing: all 3 providers passing integration tests", "Model escalation shipped — zero false escalations in 24h", "Cost dashboard: per-model breakdown live"],
    today: ["Test coverage acceleration sprint: reassign 2 engineers to Vitest migration", "LLM cost optimization: target model selection for non-critical tasks", "ADR-017: OpenAPI schema generation architecture review"],
    blocker: "Test coverage: YiVad 25%, YiPet 10% — need sprint dedication",
    mood: "Urgent", moodType: "danger"
  },
  engineer: {
    yesterday: ["YiVad deploy: 3x this week (target met)", "Code review turnaround: 3.2h avg (improving)", "2 KB files contributed: Rsbuild migration guide + ProTable patterns"],
    today: ["vue-tsc error resolution: target 5 errors fixed today", "Developer onboarding guide: add Rsbuild section", "PR review: YiPet multi-entry build optimization"],
    blocker: "",
    mood: "Steady", moodType: "success"
  },
  srer: {
    yesterday: ["Overnight P1: LLM latency spike root cause identified — model provider throttling", "Added 3 new endpoint monitors to alerting pipeline", "Deploy success rate: 92% (stable)"],
    today: ["Postmortem: P1 latency spike — draft within 24h", "Alert coverage: add remaining 5 endpoint monitors", "Error budget dashboard: trend visualization deploy"],
    blocker: "Alert coverage gap — 5 endpoints still unmonitored",
    mood: "Alert", moodType: "warning"
  },
  aier: {
    yesterday: ["RAG chunking strategy: code-file optimized strategy tested", "Agent task completion: 62% (steady)", "Prompt version control: 90% of system prompts tracked"],
    today: ["A/B test framework: deploy v1 to staging environment", "RAG relevance benchmark: add 20 new test queries", "Cost-per-quality-point metric: define calculation formula"],
    blocker: "A/B test framework — staging environment access pending",
    mood: "Building", moodType: "primary"
  },
  curator: {
    yesterday: ["Inbox triage: 0 items older than 7 days (6th consecutive week)", "Freshness scan: 12 files flagged for Q3 review", "Readiness checklist: 5 files passed review"],
    today: ["Quarterly archive audit: Q2 deprecated files migration", "Governance dashboard: automate weekly update script", "Engage role owners: 8 stalled files need readiness review"],
    blocker: "",
    mood: "Organized", moodType: "success"
  }
};

// ═══════════════════════════════════════════════
// Role-specific Daily Checklist

export const roleChecklistMap: Record<string, ChecklistItem[]> = {
  executiver: [
    { id: "e1", text: "Review daily metrics dashboard (DAU, adoption, automation rate)", done: true },
    { id: "e2", text: "Check strategic alignment: team goals trace to company OKRs", done: false, value: "85% aligned" },
    { id: "e3", text: "All-hands deck slides updated with latest data", done: false },
    { id: "e4", text: "1:1 notes committed to YiKnowledge", done: true },
    { id: "e5", text: "Q4 budget decisions documented with rationale", done: false }
  ],
  producter: [
    { id: "p1", text: "North Star Metric dashboard updated (WAUs, CSAT, retention)", done: true, value: "28 WAUs · CSAT 4.1" },
    { id: "p2", text: "Feature adoption: check 30-day trial numbers for new features", done: false },
    { id: "p3", text: "User feedback categorized and logged in KB", done: true },
    { id: "p4", text: "PRD updates: reflect latest sprint outcomes", done: false },
    { id: "p5", text: "Cross-project UX consistency: spot-check 3 user journeys", done: false }
  ],
  leader: [
    { id: "l1", text: "Architecture fitness functions: CI run results reviewed", done: false, value: "0% deployed" },
    { id: "l2", text: "LLM cost dashboard: verify per-model accuracy", done: true, value: "$18.40 today" },
    { id: "l3", text: "ADR review: any new decisions need documentation", done: true },
    { id: "l4", text: "Dependency audit: check for new CVEs", done: false },
    { id: "l5", text: "Test coverage: check daily delta (YiVad + YiPet + YiAi)", done: false, value: "35% avg" }
  ],
  engineer: [
    { id: "en1", text: "All PRs reviewed and merged or commented", done: true },
    { id: "en2", text: "CI pipeline: all 3 projects green on main branch", done: true, value: "3/3 green" },
    { id: "en3", text: "Today's commits pass lint + type-check", done: false },
    { id: "en4", text: "KB contribution: at least 1 file written or updated", done: true },
    { id: "en5", text: "Code review turnaround: keep under 4h target", done: false, value: "3.2h avg" }
  ],
  srer: [
    { id: "sr1", text: "API availability check: YiAi endpoints within SLO", done: true, value: "99.7%" },
    { id: "sr2", text: "Error budget status: verify remaining budget", done: true, value: "65%" },
    { id: "sr3", text: "MongoDB slow query log review", done: false, value: "0 slow queries" },
    { id: "sr4", text: "Alert pipeline: all monitors firing correctly", done: false },
    { id: "sr5", text: "Incident postmortem: draft or review pending postmortems", done: true }
  ],
  aier: [
    { id: "a1", text: "RAG relevance: daily benchmark run results", done: true, value: "0.78 score" },
    { id: "a2", text: "Agent task completion: review failed task logs", done: false },
    { id: "a3", text: "Prompt version control: any prompts changed today", done: true },
    { id: "a4", text: "Model cost tracking: per-task cost within budget", done: false, value: "$0.12/task" },
    { id: "a5", text: "A/B test framework: staging environment status check", done: false }
  ],
  curator: [
    { id: "c1", text: "Inbox triage: zero items older than 24h", done: true },
    { id: "c2", text: "Freshness scan: files approaching review_cycle deadline", done: true, value: "12 flagged" },
    { id: "c3", text: "Readiness checklist: review any draft files", done: false },
    { id: "c4", text: "Governance dashboard: update weekly metrics", done: false },
    { id: "c5", text: "Orphan content check: files without role home", done: true, value: "8% orphan" }
  ]
};

// ═══════════════════════════════════════════════
// Role-specific Weekly Data

export const roleWeeklyDataMap: Record<string, WeeklyRoleData> = {
  executiver: {
    status: "On Track", statusType: "success",
    done: ["Board deck for Q3 review finalized", "YiProduct Suite DAU crossed 38 (target: 50)", "Signed off on Q4 budget allocation", "Business line adoption pipeline: 2 candidates identified", "AI-First: agent confirmation gate + model escalation shipped (YiAi v1.2.0)", "Ecosystem: YiVad cross-page navigation unified (home / OKR / RSS / knowledge)"],
    blockers: ["YiPet adoption lagging — 45% of DAU target at mid-Q3"],
    nextWeek: ["Q3 all-hands presentation delivery", "Review business line adoption pipeline progress", "Quarterly OKR scoring: mid-Q3 checkpoint"],
    decisions: ["Q4 budget: 15% increase for AI infrastructure", "All-hands format: shift to async video + live Q&A", "OKR scoring: adopt mid-quarter checkpoints for all roles"]
  },
  producter: {
    status: "On Track", statusType: "success",
    done: ["aiChat confirmation UX shipped — user approves in < 3s", "YiVad OKR page redesigned with weekly report + retro", "BRD agent first-draft acceptance rate at 65%", "YiPet North Star metric dashboard live"],
    blockers: ["YiPet extension rating not yet collected — need user feedback loop"],
    nextWeek: ["YiVad admin maturity: role views progress review", "Cross-project integration: shared UI component spec draft", "YiPet user survey: design and deploy feedback channel"],
    decisions: ["HEART framework adopted for all product metrics", "User survey: add NPS question to YiPet extension", "Feature adoption: set 30-day trial window as standard"]
  },
  leader: {
    status: "At Risk", statusType: "danger",
    done: ["Multi-provider LLM routing: 3 providers integrated", "Model escalation (stall → stronger) shipped", "ADR coverage reached 80%", "Cost dashboard: per-model breakdown live"],
    blockers: ["Test coverage baseline significantly behind — Vitest YiVad 25%, YiPet 10%", "Cost per task still $0.12 vs $0.08 target"],
    nextWeek: ["Accelerate test infrastructure — reassign capacity", "LLM cost optimization sprint planning", "OpenAPI schema generation: FastAPI route decorator POC"],
    decisions: ["Test coverage: allocate 20% sprint capacity until baselines met", "Model routing: prefer qwen3-coder for CRUD, deepseek for analysis", "Architecture fitness functions: defer to Q4, focus on test coverage first"]
  },
  engineer: {
    status: "On Track", statusType: "success",
    done: ["YiVad deploy frequency: 3x/week (target met)", "Code review turnaround improved to 3.5h (target: 2h)", "12 KB contributions this month (target: 15)", "Rsbuild dev server: HMR consistently < 200ms"],
    blockers: ["22 vue-tsc errors — only 15% resolved"],
    nextWeek: ["Tech debt: dedicate Friday to vue-tsc error resolution", "Developer onboarding guide update", "YiPet multi-entry build optimization review"],
    decisions: ["vue-tsc errors: pair programming approach for the remaining errors", "Code review SLA: 4h during business hours, next-day otherwise", "KB contributions: add to sprint definition of done"]
  },
  srer: {
    status: "On Track", statusType: "success",
    done: ["YiAi API availability: 99.7% (above SLO)", "P99 latency for non-LLM: 320ms (well within 500ms)", "Deploy success rate: 92%", "Added 3 new endpoint monitors to alerting pipeline"],
    blockers: ["Alert coverage at 85% — need to close gap to 95% target"],
    nextWeek: ["Alerting pipeline: add missing endpoint monitors", "Error budget dashboard: add trend visualization", "LLM latency spike postmortem: action item follow-up"],
    decisions: ["Alert coverage: prioritize endpoint monitors over dashboard polish", "Error budget: freeze feature deploys if budget drops below 50%", "Postmortem action items: track in shared OKR board"]
  },
  aier: {
    status: "On Track", statusType: "success",
    done: ["RAG relevance score: 0.78 (target: 0.85)", "Agent task completion: 62% (target: 75%)", "Prompt version control: 90% coverage", "aiChat agent mode: turn-progress + confirmation shipped"],
    blockers: ["A/B test framework for prompts only at 30%", "Cost-per-quality-point metric not yet defined in production"],
    nextWeek: ["RAG chunking strategy optimization for code files", "A/B test framework: deploy v1 to staging", "Cost-per-quality-point: implement tracking in LLM call pipeline"],
    decisions: ["RAG chunking: adopt per-content-type strategy (code vs markdown vs frontmatter)", "Prompt A/B tests: require 50+ samples before accepting changes", "Model evaluation: run monthly, not quarterly"]
  },
  curator: {
    status: "On Track", statusType: "success",
    done: ["YiKnowledge: 410 files (target: 500)", "Frontmatter compliance: 88% (target: 95%)", "Weekly inbox triage: 0 items older than 7 days", "Freshness scan: 12 files flagged, 8 updated"],
    blockers: ["Readiness pass rate at 75% — need to engage role owners"],
    nextWeek: ["Quarterly archive audit (Q2 files)", "Governance dashboard: automate weekly update", "Role owner engagement: schedule readiness review sessions"],
    decisions: ["Readiness checklist: add 'anti-patterns section' as mandatory for how-to files", "Freshness: 5-month warning threshold (was 6-month)", "Archive audit: migrate deprecated files to archive/ with redirect"]
  }
};

