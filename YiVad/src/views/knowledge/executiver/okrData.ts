// ═══════════════════════════════════════════════════════════
// Shared OKR data — single source of truth for okr.vue and okrRole.vue
//
// 2026-Q3 重定义：北极星 =「AI 从需求到上线全流程自闭环」。
// 7 个角色不再围绕「产品增长 / 生态整合」等旧目标，而是各自拥有
// 闭环上的一环（需求评审 / 技术评审 / 编码调试 / 测试上线 / 编排 /
// 记录知识化），全部 trace 到同一条北极星。
// ═══════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────
export interface KeyResult {
  text: string;
  progress: number;
  /** 证据文件（相对 YiKnowledge 根目录），点击 KR 可预览。 */
  file?: string;
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

export interface WeeklyItem {
  text: string;
  /** 证据文件（相对 YiKnowledge 根目录），点击条目可预览。 */
  file?: string;
}

export interface WeeklyRoleData {
  status: string;
  statusType: "success" | "warning" | "danger" | "info" | "primary";
  done: WeeklyItem[];
  blockers: WeeklyItem[];
  nextWeek: WeeklyItem[];
  decisions: WeeklyItem[];
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
    description: "经营战略拥有者：提供市场情报（market-intel）、经营战略与组织路线（org-strategy）、经营阅读（reading-list）三类跨管线 Business 上下文，让战略决策基于市场现实。",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["市场情报", "经营战略", "组织路线"]
  },
  producter: {
    id: "producter", name: "Product", icon: "📋", dir: "producter/",
    description: "需求评审拥有者：为每条需求产出 PRD（背景/目标/范围/非目标/干系人）、可验证验收标准与 WSJF 优先级（价值×紧迫÷难度），评审记录落知识库（01-requirement-review），需求→任务拆解模板可复用。",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["PRD", "验收标准", "WSJF 优先级"]
  },
  leader: {
    id: "leader", name: "Leader", icon: "🧭", dir: "leader/",
    description: "技术评审拥有者：为每条需求产出 ADR 与架构决策，保证决策可回溯到需求。",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["技术评审", "ADR", "架构"]
  },
  engineer: {
    id: "engineer", name: "Engineer", icon: "⚡", dir: "engineer/",
    description: "代码编写与调试拥有者：把需求实现为可构建代码，调试过程留痕，0 新增类型错误。",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["编码", "调试", "构建"]
  },
  srer: {
    id: "srer", name: "SRE", icon: "🔧", dir: "srer/",
    description: "测试与上线拥有者：产出测试报告与上线记录，typecheck/build 门禁通过才上线。",
    projects: ["YiAi"],
    categories: ["测试", "上线", "门禁"]
  },
  aier: {
    id: "aier", name: "AI Engineer", icon: "🤖", dir: "aier/",
    description: "编排与 Agent 可靠拥有者：为每个任务落地 skill/agent/mcp 三要素，保证 Agent 任务可复现。",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["编排", "Agent", "可复现"]
  },
  curator: {
    id: "curator", name: "Curator", icon: "📦", dir: "curator/",
    description: "流程记录知识化拥有者：维护 5 类流程记录模板与整合索引，记录 frontmatter 合规。",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["记录", "模板", "索引"]
  }
};

export const goalsData: Record<string, GoalItem[]> = {
  executiver: [
    { id: "exec-001", icon: "📊", title: "市场情报与竞争洞察", status: "active", description: "追踪 LLM/SaaS 竞品格局、市场趋势与第三方行业报告（Gartner/McKinsey/a16z/CAICT/IDC），让战略决策基于市场现实。", period: "2026 Q3", owner: "CEO", project: "YiAi", keyResults: [{ text: "竞品分析覆盖 LLM 供应商 / SaaS 头部 / 区域竞对", progress: 100, file: "okr/2026-Q3/goals/executiver/kr-exec-001-competitor-coverage.md" }, { text: "第三方行业报告摘要（Gartner/McKinsey/a16z/CAICT/IDC）落知识库", progress: 67, file: "okr/2026-Q3/goals/executiver/kr-exec-001-report-summaries.md" }, { text: "半年度市场趋势复盘 + 新兴赛道追踪", progress: 60, file: "okr/2026-Q3/goals/executiver/kr-exec-001-market-trends.md" }, { text: "竞品与行业信息可被 RAG 检索，过时条目标记 deprecated", progress: 70, file: "okr/2026-Q3/goals/executiver/kr-exec-001-rag-retrievability.md" }] },
    { id: "exec-002", icon: "🧭", title: "经营战略与组织路线", status: "active", description: "用战略框架（Porter/Blue Ocean/VRIO/SWOT/BMC/价值主张）定义竞争定位，产出年度战略规划、季度经营复盘、组织 OKR 与编制预算规划。", period: "2026 Q3", owner: "CEO", project: "YiAi", keyResults: [{ text: "战略框架与商业模型（BMC/价值主张/第二曲线）落地到产品战略实例", progress: 100, file: "okr/2026-Q3/goals/executiver/kr-exec-002-strategy-frameworks.md" }, { text: "年度战略规划 + 季度经营复盘（QBR）产出", progress: 60, file: "okr/2026-Q3/goals/executiver/kr-exec-002-annual-qbr.md" }, { text: "组织级 OKR 跟踪 + 编制/预算规划落地", progress: 75, file: "okr/2026-Q3/goals/executiver/kr-exec-002-okr-budget.md" }, { text: "合规与数据留存策略（regulatory change / retention review）有据可查", progress: 80, file: "okr/2026-Q3/goals/executiver/kr-exec-002-compliance.md" }] },
    { id: "exec-003", icon: "📚", title: "经营学习与阅读", status: "active", description: "维护月度精选阅读清单与读书笔记，沉淀可执行洞察（如 High Output Management），并蒸馏到对应语义知识叶。", period: "2026 Q3", owner: "CEO", project: "YiAi", keyResults: [{ text: "月度阅读清单滚动更新", progress: 70, file: "okr/2026-Q3/goals/executiver/kr-exec-003-reading-list.md" }, { text: "读书笔记含可执行 takeaway（High Output Management）", progress: 100, file: "okr/2026-Q3/goals/executiver/kr-exec-003-reading-notes.md" }, { text: "有价值观点蒸馏到方法论/技术语义叶", progress: 50, file: "okr/2026-Q3/goals/executiver/kr-exec-003-knowledge-distillation.md" }] },
  ],
  producter: [
    { id: "prod-001", icon: "📋", title: "需求评审可闭环", status: "active", description: "作为需求评审拥有者，为每条闭环需求产出 PRD（背景/目标/范围/非目标/干系人）、可被测试门禁直接判定的验收标准与 WSJF 优先级（价值×紧迫÷难度），评审记录落知识库，需求→任务拆解模板可复用。", period: "2026 Q3", owner: "PM YiAi", project: "YiAi", keyResults: [{ text: "每条需求产出 PRD（背景/目标/范围/非目标/干系人）", progress: 100, file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/01-requirement-review.md" }, { text: "验收标准可被测试门禁直接判定", progress: 100, file: "okr/2026-Q3/2026-08/p0-producter-产出需求评审记录-prd-验收标准-wsjf.md" }, { text: "WSJF 优先级（价值×紧迫÷难度）打分排序", progress: 100, file: "okr/2026-Q3/2026-08/p0-producter-产出需求评审记录-prd-验收标准-wsjf.md" }, { text: "需求评审记录落知识库（01-requirement-review）", progress: 100, file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/01-requirement-review.md" }, { text: "需求→任务拆解模板可复用", progress: 100, file: "okr/2026-Q3/loop/_templates/01-requirement-review.md" }] },
  ],
  leader: [
    { id: "lead-001", icon: "🧭", title: "技术评审可闭环", status: "active", description: "作为技术评审拥有者，为每条需求产出 ADR（Context/Decision/Consequences）、数据模型与风险对策，保证决策可回溯到需求，评审记录落知识库（02-technical-review），ADR 模板可复用。", period: "2026 Q3", owner: "Tech Lead", project: "YiAi", keyResults: [{ text: "每条需求产出 ADR（Context/Decision/Consequences）", progress: 100, file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/02-technical-review.md" }, { text: "数据模型与风险对策随技术评审记录产出", progress: 100, file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/02-technical-review.md" }, { text: "架构决策可回溯到需求", progress: 100, file: "okr/2026-Q3/2026-08/p0-leader-产出技术评审记录-adr-记录载体选型.md" }, { text: "技术评审记录落知识库（02-technical-review）", progress: 100, file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/02-technical-review.md" }, { text: "ADR 模板可复用（Context/Decision/Consequences）", progress: 100, file: "okr/2026-Q3/loop/_templates/02-technical-review.md" }] },
  ],
  engineer: [
    { id: "eng-001", icon: "⚡", title: "代码编写与调试自闭环", status: "active", description: "作为代码编写与调试拥有者，把需求实现为可构建代码（0 人工编码介入），改动文件 0 新增类型错误，调试过程（问题→修复→验证）留痕落知识库（04-build-debug），构建门禁通过。", period: "2026 Q3", owner: "Engineering Lead", project: "YiVad", keyResults: [{ text: "需求实现为可构建代码（0 人工编码介入）", progress: 100, file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/04-build-debug.md" }, { text: "改动文件 0 新增类型错误", progress: 100, file: "okr/2026-Q3/2026-08/p1-engineer-维护-0-类型错误基线-沉淀构建调试模板复用.md" }, { text: "调试过程（问题→修复→验证）落知识库（04-build-debug）", progress: 100, file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/04-build-debug.md" }, { text: "构建门禁（vue-tsc + build）通过", progress: 100, file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/04-build-debug.md" }] },
    { id: "eng-005", icon: "🧹", title: "构建健康度清零", status: "active", description: "清零 23 个 vue-tsc 既有类型错误，让 YiVad 恢复可构建可部署。", period: "2026 Q3", owner: "Engineering Lead", project: "YiVad", keyResults: [{ text: "清零 23 个 vue-tsc 既有类型错误", progress: 100, file: "okr/2026-Q3/2026-08/p0-engineer-清零-23-个-vue-tsc-既有类型错误.md" }, { text: "knowledgeBase dashboard 17 个错误修复", progress: 100, file: "okr/2026-Q3/2026-08/p0-engineer-清零-23-个-vue-tsc-既有类型错误.md" }, { text: "rag history/retrieval 4 个错误修复", progress: 100, file: "okr/2026-Q3/2026-08/p0-engineer-清零-23-个-vue-tsc-既有类型错误.md" }, { text: "proTable + menuMange 2 个类型错误修复", progress: 100, file: "okr/2026-Q3/2026-08/p0-engineer-清零-23-个-vue-tsc-既有类型错误.md" }] },
  ],
  srer: [
    { id: "sre-001", icon: "🔧", title: "测试与上线自闭环", status: "active", description: "作为测试与上线拥有者，为每条需求产出测试报告（04-test-report）与上线记录（05-launch-record），typecheck/build 门禁通过才上线，上线可追溯可回滚。", period: "2026 Q3", owner: "SRE Lead", project: "YiAi", keyResults: [{ text: "每条需求产出测试报告（04-test-report）", progress: 100, file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/04-test-report.md" }, { text: "上线记录（artifact/version/env）落知识库（05-launch-record）", progress: 100, file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/05-launch-record.md" }, { text: "typecheck/build 门禁通过才上线", progress: 100, file: "okr/2026-Q3/2026-08/p1-srer-跑门禁-产出测试报告与上线记录.md" }, { text: "上线可回滚/可追溯", progress: 100, file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/05-launch-record.md" }] },
  ],
  aier: [
    { id: "aier-001", icon: "🧩", title: "编排三要素落地", status: "active", description: "作为编排拥有者，为每个推荐任务显式指派 skill/agent/mcp 三要素，确定性角色×清单映射覆盖 7 角色，AI 推荐可复现，编排结果落盘可读回。", period: "2026 Q3", owner: "AI Engineer", project: "YiAi", keyResults: [{ text: "每个推荐任务显式指派 skill/agent/mcp", progress: 100, file: "okr/2026-Q3/2026-08/p2-aier-沉淀-7-角色三要素编排清单-规划-loop-002-编排.md" }, { text: "确定性角色×清单映射覆盖 7 角色", progress: 100, file: "okr/2026-Q3/2026-08/p2-aier-补齐-7-角色三要素编排映射.md" }, { text: "AI 推荐按 WSJF 可复现", progress: 100, file: "okr/2026-Q3/2026-08/p2-aier-补齐-7-角色三要素编排映射.md" }, { text: "编排结果落盘可读回", progress: 100, file: "okr/2026-Q3/2026-08/p2-aier-沉淀-7-角色三要素编排清单-规划-loop-002-编排.md" }] },
    { id: "aier-002", icon: "🤖", title: "Agent 任务可靠", status: "active", description: "作为 Agent 可靠拥有者，Agent 任务完成率稳定，写操作经确认门（approve/reject）把关，模型升级（stall→stronger）链路生效。", period: "2026 Q3", owner: "AI Engineer", project: "YiAi", keyResults: [{ text: "Agent 任务完成率 > 70%", progress: 100, file: "aier/methodology/agent-harness-plugin-architecture.md" }, { text: "写操作确认门（approve/reject）把关", progress: 100, file: "aier/methodology/agent-harness-plugin-architecture.md" }, { text: "模型升级（stall→stronger）生效", progress: 100, file: "aier/methodology/agent-harness-plugin-architecture.md" }, { text: "80% 任务 ≤ 5 轮完成", progress: 100, file: "aier/methodology/agent-harness-plugin-architecture.md" }] },
  ],
  curator: [
    { id: "cur-001", icon: "📦", title: "流程记录知识化", status: "active", description: "作为流程记录知识化拥有者，维护 5 类流程记录模板与整合索引（loop/INDEX），记录 frontmatter 合规，循环记录可被 RAG 检索。", period: "2026 Q3", owner: "Curator", project: "YiAi", keyResults: [{ text: "五类记录模板 + 整合索引页（loop/INDEX）落地", progress: 100, file: "okr/2026-Q3/loop/INDEX.md" }, { text: "记录 frontmatter 合规率 100%", progress: 100, file: "okr/2026-Q3/loop/INDEX.md" }, { text: "循环记录可被 RAG 检索", progress: 100, file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/README.md" }, { text: "旧数据清零并留迁移记录", progress: 100, file: "okr/2026-Q3/2026-08/p0-curator-清除旧-okr-数据-重置知识库-okr-目录.md" }] },
  ]
};


export const metricsData: Record<string, MetricItem[]> = {
  executiver: [
    { id: "exec-m01", icon: "🎯", name: "竞品覆盖度", category: "市场情报", framework: "OKR", description: "已分析的竞品分类数（LLM 供应商 / SaaS 头部 / 区域竞对）。", current: 3, target: 3, baseline: 0, unit: " 类", trend: "up", progress: 100 },
    { id: "exec-m02", icon: "📄", name: "行业报告摘要数", category: "市场情报", framework: "OKR", description: "已摘要的第三方行业报告数（Gartner/McKinsey/a16z/CAICT/IDC）。", current: 4, target: 6, baseline: 0, unit: " 篇", trend: "up", progress: 67 },
    { id: "exec-m03", icon: "🧭", name: "战略框架落地数", category: "经营战略", framework: "OKR", description: "落地到产品战略实例的战略框架/工具数（Porter/Blue Ocean/BMC/价值主张）。", current: 4, target: 4, baseline: 0, unit: " 个", trend: "up", progress: 100 },
    { id: "exec-m04", icon: "🗺️", name: "组织规划完备度", category: "组织路线", framework: "OKR", description: "年度规划 / QBR / OKR 跟踪 / 预算规划的文档完备度。", current: 3, target: 4, baseline: 0, unit: " 类", trend: "up", progress: 75 },
    { id: "exec-m05", icon: "📚", name: "阅读蒸馏率", category: "阅读", framework: "OKR", description: "读书笔记蒸馏到语义知识叶的比例。", current: 50, target: 100, baseline: 0, unit: "%", trend: "up", progress: 50 },
  ],
  producter: [
    { id: "prod-m01", icon: "📋", name: "需求评审覆盖", category: "需求评审", framework: "OKR", description: "有 PRD + 验收标准 + WSJF 优先级的需求占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "prod-m02", icon: "✅", name: "验收标准完备率", category: "验收标准", framework: "OKR", description: "验收标准可被测试门禁直接判定的需求占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
  ],
  leader: [
    { id: "lead-m01", icon: "📝", name: "ADR 覆盖率", category: "技术评审", framework: "OKR", description: "产出 ADR（Context/Decision/Consequences）的需求占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "lead-m02", icon: "🔗", name: "决策可回溯率", category: "技术评审", framework: "OKR", description: "架构决策可回溯到需求的比例。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
  ],
  engineer: [
    { id: "eng-m01", icon: "🧹", name: "0 新增类型错误", category: "构建", framework: "OKR", description: "改动文件在 vue-tsc --noEmit 下 0 新增错误。", current: 0, target: 0, baseline: 0, unit: " 个", trend: "down", progress: 100 },
    { id: "eng-m02", icon: "🏗️", name: "构建通过", category: "构建", framework: "OKR", description: "pnpm build 成功产出可部署 artifact。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "eng-m06", icon: "📉", name: "构建健康度", category: "构建", framework: "OKR", description: "vue-tsc 既有类型错误总数，目标从 23 清零。", current: 0, target: 0, baseline: 23, unit: " 个", trend: "down", progress: 100 },
  ],
  srer: [
    { id: "sre-m01", icon: "🧪", name: "测试报告覆盖", category: "测试", framework: "OKR", description: "有测试报告（typecheck/build + 手动验证）的需求占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "sre-m02", icon: "🚀", name: "上线记录完整度", category: "上线", framework: "OKR", description: "上线记录含 artifact/version/env 且可追溯的需求占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
  ],
  aier: [
    { id: "aier-m01", icon: "🧩", name: "编排覆盖", category: "编排", framework: "OKR", description: "显式指派 skill/agent/mcp 三要素的推荐任务占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "aier-m02", icon: "✅", name: "Agent 任务完成率", category: "Agent", framework: "OKR", description: "Agent 任务成功完成的比例，目标 > 70%。", current: 0, target: 70, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "aier-m03", icon: "🛡️", name: "确认门生效率", category: "Agent", framework: "OKR", description: "写操作经 approve/reject 确认门把关的比例。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
  ],
  curator: [
    { id: "cur-m01", icon: "📄", name: "记录模板数", category: "记录", framework: "OKR", description: "流程记录模板数量（需求评审/技术评审/构建调试/测试报告/上线 5 类）。", current: 5, target: 5, baseline: 0, unit: " 个", trend: "up", progress: 100 },
    { id: "cur-m03", icon: "🔄", name: "frontmatter 合规率", category: "记录", framework: "OKR", description: "记录 frontmatter 满足 KB rulebook 必填字段的比例。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "cur-m06", icon: "🔍", name: "循环可检索性", category: "记录", framework: "OKR", description: "循环记录可被 RAG 检索到的比例。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
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
  "exec-001": ["exec-m01", "exec-m02"],
  "exec-002": ["exec-m03", "exec-m04"],
  "exec-003": ["exec-m05"],
  "prod-001": ["prod-m01", "prod-m02"],
  "lead-001": ["lead-m01", "lead-m02"],
  "eng-001": ["eng-m01", "eng-m02"],
  "eng-005": ["eng-m06"],
  "sre-001": ["sre-m01", "sre-m02"],
  "aier-001": ["aier-m01"],
  "aier-002": ["aier-m02", "aier-m03"],
  "cur-001": ["cur-m01", "cur-m03", "cur-m06"],
};

export function getGoalMetrics(goalId: string): MetricItem[] {
  return (goalMetricMap[goalId] || []).map(id => allMetricsMap[id]).filter(Boolean);
}

export const roleDailyDataMap: Record<string, DailyRoleData> = {
  executiver: {
    yesterday: ["更新 LLM 供应商竞品格局", "摘要一份第三方行业报告", "审阅年度战略规划框架"],
    today: ["跑半年度市场趋势复盘", "落地 Business Model Canvas 到产品战略实例", "更新月度阅读清单"],
    blocker: "",
    mood: "Strategic", moodType: "primary"
  },
  producter: {
    yesterday: ["复盘 loop-001 需求评审：对照 PRD 与验收标准，记录可判定/需人工判据", "产出 loop-002 PRD（背景/目标/范围/非目标）", "WSJF 打分沿用既有实现"],
    today: ["写 loop-002 验收标准（可被测试门禁直接判定）", "把复盘结论落 01-requirement-review", "需求→任务拆解模板复用到 loop-002"],
    blocker: "",
    mood: "Productive", moodType: "success"
  },
  leader: {
    yesterday: ["圈定记录载体：知识库 markdown + YiVad 新页", "梳理 KB 目录规范（loop/ 结构）", "盘点既有 OKR 机制可复用件"],
    today: ["产出 loop-001 技术评审记录（ADR）", "定页面结构（processRecord.vue）", "确认路由/菜单注册模式"],
    blocker: "",
    mood: "Steady", moodType: "success"
  },
  engineer: {
    yesterday: ["重写 okrData.ts 7 角色数据", "基线盘点：23 个 vue-tsc 既有错误", "确认类型接口不变、只换数据"],
    today: ["写 processRecord.vue + 路由 + 菜单", "typecheck 调试至 0 新增错误", "清零 23 个既有类型错误"],
    blocker: "",
    mood: "Building", moodType: "primary"
  },
  srer: {
    yesterday: ["定测试门禁：vue-tsc + build", "定上线记录字段（artifact/version/env）", "定回滚/追溯口径"],
    today: ["跑 typecheck/build 验证", "写 loop-001 测试报告", "写 loop-001 上线记录"],
    blocker: "",
    mood: "Alert", moodType: "warning"
  },
  aier: {
    yesterday: ["盘点 skill/agent/mcp 三要素映射", "确认 WSJF 评分逻辑可复用", "确认 Agent 确认门机制在位"],
    today: ["补齐 7 角色三要素编排映射", "校验推荐任务可复现", "确认编排落盘可读回"],
    blocker: "",
    mood: "Building", moodType: "primary"
  },
  curator: {
    yesterday: ["清空旧 OKR 数据（goals/metrics/2026-08）", "定 loop/ 目录结构", "定 4 类记录模板 frontmatter"],
    today: ["建 loop/ 目录 + 模板", "写 loop/INDEX 整合索引", "更新 YiKnowledge README/INDEX 指向"],
    blocker: "",
    mood: "Organized", moodType: "success"
  }
};

// ═══════════════════════════════════════════════
// Role-specific Daily Checklist

export const roleChecklistMap: Record<string, ChecklistItem[]> = {
  executiver: [
    { id: "e1", text: "竞品分析覆盖 LLM/SaaS/区域竞对", done: true, value: "3 类" },
    { id: "e2", text: "第三方行业报告摘要落知识库", done: false },
    { id: "e3", text: "战略框架（Porter/Blue Ocean/BMC）落地", done: true },
    { id: "e4", text: "年度规划 + QBR + OKR 跟踪就位", done: false },
    { id: "e5", text: "月度阅读清单滚动更新", done: false }
  ],
  producter: [
    { id: "p1", text: "loop-001 PRD（背景/目标/范围/非目标/干系人）", done: true },
    { id: "p2", text: "验收标准可被测试门禁直接判定", done: true },
    { id: "p3", text: "WSJF 优先级（价值×紧迫÷难度）打分", done: true },
    { id: "p4", text: "需求评审记录落知识库（01-requirement-review）", done: true },
    { id: "p5", text: "需求→任务拆解模板可复用", done: true }
  ],
  leader: [
    { id: "l1", text: "loop-001 技术评审记录（ADR）", done: true },
    { id: "l2", text: "记录载体选型有据", done: true },
    { id: "l3", text: "页面结构（processRecord.vue）定稿", done: true },
    { id: "l4", text: "KB 目录规范（loop/）定稿", done: true },
    { id: "l5", text: "决策可回溯到需求", done: true }
  ],
  engineer: [
    { id: "en1", text: "okrData.ts 7 角色数据重写", done: true },
    { id: "en2", text: "processRecord.vue + 路由 + 菜单", done: true },
    { id: "en3", text: "改动文件 0 新增类型错误", done: true },
    { id: "en4", text: "清零 23 个既有类型错误", done: true },
    { id: "en5", text: "调试记录落知识库（04-build-debug）", done: true }
  ],
  srer: [
    { id: "sr1", text: "typecheck/build 门禁验证", done: true },
    { id: "sr2", text: "测试报告（04-test-report）", done: true },
    { id: "sr3", text: "上线记录（05-launch-record）", done: true },
    { id: "sr4", text: "artifact/version/env 字段完整", done: true },
    { id: "sr5", text: "上线可追溯可回滚", done: true }
  ],
  aier: [
    { id: "a1", text: "7 角色三要素编排映射覆盖", done: true },
    { id: "a2", text: "WSJF 推荐可复现", done: true },
    { id: "a3", text: "编排落盘可读回", done: true },
    { id: "a4", text: "确认门把关写操作", done: true },
    { id: "a5", text: "Agent 任务完成率追踪", done: true }
  ],
  curator: [
    { id: "c1", text: "旧 OKR 数据清零", done: true },
    { id: "c2", text: "loop/ 目录 + 模板建立", done: true },
    { id: "c3", text: "loop/INDEX 整合索引", done: true },
    { id: "c4", text: "记录 frontmatter 合规", done: true },
    { id: "c5", text: "YiKnowledge README/INDEX 更新", done: true }
  ]
};

// ═══════════════════════════════════════════════
// Role-specific Weekly Data

export const roleWeeklyDataMap: Record<string, WeeklyRoleData> = {
  executiver: {
    status: "On Track", statusType: "success",
    done: [
      { text: "更新 LLM 供应商竞品格局", file: "okr/2026-Q3/goals/executiver/kr-exec-001-competitor-coverage.md" },
      { text: "摘要 Gartner/McKinsey 行业报告", file: "okr/2026-Q3/goals/executiver/kr-exec-001-report-summaries.md" },
      { text: "落地 Business Model Canvas 战略实例", file: "okr/2026-Q3/goals/executiver/kr-exec-002-strategy-frameworks.md" }
    ],
    blockers: [],
    nextWeek: [
      { text: "跑季度经营复盘（QBR）", file: "okr/2026-Q3/goals/executiver/kr-exec-002-annual-qbr.md" },
      { text: "更新月度阅读清单与读书笔记", file: "okr/2026-Q3/goals/executiver/kr-exec-003-reading-list.md" }
    ],
    decisions: [
      { text: "定位：Business Strategy 跨管线上下文", file: "okr/2026-Q3/goals/executiver/kr-exec-002-strategy-frameworks.md" },
      { text: "三芯片：market-intel / org-strategy / reading-list", file: "okr/2026-Q3/goals/executiver/kr-exec-001-competitor-coverage.md" },
      { text: "路线：战略框架 → 合成 → 规划 → 执行", file: "okr/2026-Q3/goals/executiver/kr-exec-002-okr-budget.md" }
    ]
  },
  producter: {
    status: "On Track", statusType: "success",
    done: [
      { text: "产出 loop-001 需求评审（PRD + 6 验收标准 + WSJF）", file: "okr/2026-Q3/2026-08/p0-producter-产出需求评审记录-prd-验收标准-wsjf.md" },
      { text: "需求评审记录落知识库（01-requirement-review）", file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/01-requirement-review.md" },
      { text: "复盘 loop-001，产出 loop-002 PRD 与验收标准", file: "okr/2026-Q3/2026-08/p1-producter-复盘-loop-001-需求评审-产出-loop-002-prd-与验收标准.md" }
    ],
    blockers: [],
    nextWeek: [
      { text: "跑通 loop-002 需求评审全流程", file: "okr/2026-Q3/loop/_templates/01-requirement-review.md" },
      { text: "沉淀 PRD / 验收标准 / WSJF 可复用模板", file: "okr/2026-Q3/loop/_templates/01-requirement-review.md" }
    ],
    decisions: [
      { text: "需求评审 = 产出 PRD + 验收标准 + WSJF 优先级", file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/01-requirement-review.md" },
      { text: "每需求一条 01-requirement-review 记录", file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/01-requirement-review.md" },
      { text: "验收标准必须可被测试门禁直接判定", file: "okr/2026-Q3/2026-08/p0-producter-产出需求评审记录-prd-验收标准-wsjf.md" }
    ]
  },
  leader: {
    status: "On Track", statusType: "success",
    done: [
      { text: "圈定记录载体（KB markdown + YiVad 新页）", file: "okr/2026-Q3/2026-08/p0-leader-产出技术评审记录-adr-记录载体选型.md" },
      { text: "定 KB loop/ 目录规范", file: "okr/2026-Q3/loop/INDEX.md" },
      { text: "盘点可复用的 OKR 机制", file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/02-technical-review.md" }
    ],
    blockers: [],
    nextWeek: [
      { text: "复盘 loop-001 技术评审，沉淀可复用 ADR", file: "okr/2026-Q3/2026-08/p1-leader-复盘-loop-001-技术评审-沉淀可复用-adr-模板.md" }
    ],
    decisions: [
      { text: "记录载体：KB markdown 为事实源 + YiVad 新页整合展示", file: "okr/2026-Q3/2026-08/p0-leader-产出技术评审记录-adr-记录载体选型.md" },
      { text: "ADR 随 02-technical-review 落知识库", file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/02-technical-review.md" }
    ]
  },
  engineer: {
    status: "On Track", statusType: "success",
    done: [
      { text: "重写 okrData.ts 7 角色数据", file: "okr/2026-Q3/2026-08/p0-engineer-重定义-7-角色-okr-北极星-ai-全流程自闭环.md" },
      { text: "基线盘点：23 个 vue-tsc 既有错误", file: "okr/2026-Q3/2026-08/p0-engineer-清零-23-个-vue-tsc-既有类型错误.md" },
      { text: "确认类型接口不变、只换数据", file: "okr/2026-Q3/2026-08/p1-engineer-写-processrecord-vue-流程记录整合页-路由-菜单.md" }
    ],
    blockers: [],
    nextWeek: [
      { text: "复盘 loop-001 构建调试，维护 0 类型错误基线", file: "okr/2026-Q3/2026-08/p1-engineer-维护-0-类型错误基线-沉淀构建调试模板复用.md" }
    ],
    decisions: [
      { text: "类型接口保持不变，只替换数据内容", file: "okr/2026-Q3/2026-08/p0-engineer-重定义-7-角色-okr-北极星-ai-全流程自闭环.md" },
      { text: "清零 23 个既有错误纳入本轮 engineer 收尾目标", file: "okr/2026-Q3/2026-08/p0-engineer-清零-23-个-vue-tsc-既有类型错误.md" }
    ]
  },
  srer: {
    status: "On Track", statusType: "success",
    done: [
      { text: "定测试门禁（vue-tsc + build）", file: "okr/2026-Q3/2026-08/p1-srer-跑门禁-产出测试报告与上线记录.md" },
      { text: "定上线记录字段", file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/05-launch-record.md" },
      { text: "定回滚/追溯口径", file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/05-launch-record.md" }
    ],
    blockers: [],
    nextWeek: [
      { text: "复盘 loop-001 门禁与上线，规划 loop-002 上线", file: "okr/2026-Q3/2026-08/p2-srer-复盘-loop-001-门禁与上线-规划-loop-002-上线口径.md" }
    ],
    decisions: [
      { text: "门禁：typecheck + build 通过才上线", file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/04-test-report.md" },
      { text: "上线记录含 artifact/version/env", file: "okr/2026-Q3/loop/loop-001-okr-self-closed-loop/05-launch-record.md" }
    ]
  },
  aier: {
    status: "On Track", statusType: "success",
    done: [
      { text: "盘点 skill/agent/mcp 三要素映射", file: "okr/2026-Q3/2026-08/p2-aier-补齐-7-角色三要素编排映射.md" },
      { text: "确认 WSJF 评分逻辑可复用", file: "okr/2026-Q3/2026-08/p2-aier-沉淀-7-角色三要素编排清单-规划-loop-002-编排.md" },
      { text: "确认 Agent 确认门机制在位", file: "aier/methodology/agent-harness-plugin-architecture.md" }
    ],
    blockers: [],
    nextWeek: [
      { text: "复盘 loop-001 编排映射，沉淀三要素清单", file: "okr/2026-Q3/2026-08/p2-aier-沉淀-7-角色三要素编排清单-规划-loop-002-编排.md" }
    ],
    decisions: [
      { text: "编排三要素：skill/agent/mcp 确定性映射 + AI 兜底", file: "okr/2026-Q3/2026-08/p2-aier-补齐-7-角色三要素编排映射.md" },
      { text: "WSJF 评分复用既有实现", file: "okr/2026-Q3/2026-08/p2-aier-沉淀-7-角色三要素编排清单-规划-loop-002-编排.md" }
    ]
  },
  curator: {
    status: "On Track", statusType: "success",
    done: [
      { text: "清空旧 OKR 数据（goals/metrics/2026-08）", file: "okr/2026-Q3/2026-08/p0-curator-清除旧-okr-数据-重置知识库-okr-目录.md" },
      { text: "定 loop/ 目录结构", file: "okr/2026-Q3/loop/INDEX.md" },
      { text: "定 4 类记录模板 frontmatter", file: "okr/2026-Q3/2026-08/p1-curator-建立-4-类流程记录模板-loop-目录.md" }
    ],
    blockers: [],
    nextWeek: [
      { text: "复盘 loop-001 记录规范，规划 loop-002 模板复用", file: "okr/2026-Q3/2026-08/p2-curator-复盘-loop-001-记录规范-规划-loop-002-模板复用.md" }
    ],
    decisions: [
      { text: "loop/ 每闭环一个目录，含 01~05 记录", file: "okr/2026-Q3/loop/INDEX.md" },
      { text: "记录 frontmatter 沿用 KB rulebook 规范", file: "okr/2026-Q3/2026-08/p1-curator-建立-4-类流程记录模板-loop-目录.md" }
    ]
  }
};
