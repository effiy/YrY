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
    description: "自闭环北极星拥有者：定义并审批「AI 从需求到上线全流程自闭环」，确保 7 角色 OKR 全部对齐到该北极星。",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["自闭环", "对齐", "审批"]
  },
  producter: {
    id: "producter", name: "Product", icon: "📋", dir: "producter/",
    description: "需求评审拥有者：为每条需求产出 PRD、验收标准与 WSJF 优先级，评审记录落知识库。",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["需求评审", "PRD", "优先级"]
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
    description: "流程记录知识化拥有者：维护 4 类流程记录模板与整合索引，记录 frontmatter 合规。",
    projects: ["YiAi", "YiVad", "YiPet"],
    categories: ["记录", "模板", "索引"]
  }
};

export const goalsData: Record<string, GoalItem[]> = {
  executiver: [
    { id: "exec-001", icon: "🤖", title: "AI 全流程自闭环", status: "active", description: "让 AI 独立完成「需求 → 评审 → 编码 → 调试 → 测试 → 上线」全流程，无需人工编码介入，全过程留痕于知识库。", period: "2026 Q3", owner: "CEO", project: "YiAi", keyResults: [{ text: "一条真实需求从「需求评审」到「上线」走通并完整留痕", progress: 100 }, { text: "四类流程记录（需求评审/技术评审/构建调试/测试报告）有统一落点与整合页", progress: 100 }, { text: "7 角色 OKR 100% 对齐到北极星", progress: 100 }, { text: "单条闭环周期（需求→上线）≤ 2 个工作日", progress: 100 }] },
    { id: "exec-002", icon: "🎯", title: "7 角色 OKR 对齐与审批", status: "active", description: "每个角色拥有可验证的 KR 与关联指标，每条 Goal 可追溯到北极星，审批与里程碑记录落知识库。", period: "2026 Q3", owner: "CEO", project: "YiAi", keyResults: [{ text: "每个角色有可验证 KR 且关联指标", progress: 100 }, { text: "每条 Goal 可追溯到北极星", progress: 100 }, { text: "审批/里程碑记录落知识库", progress: 100 }, { text: "对齐率 dashboard 可查", progress: 100 }] },
  ],
  producter: [
    { id: "prod-001", icon: "📋", title: "需求评审可闭环", status: "active", description: "为每条需求产出 PRD、验收标准与 WSJF 优先级，评审记录落知识库，需求→任务拆解模板可复用。", period: "2026 Q3", owner: "PM YiAi", project: "YiAi", keyResults: [{ text: "每条需求产出 PRD + 验收标准", progress: 100 }, { text: "WSJF 优先级（价值×紧迫÷难度）落地", progress: 100 }, { text: "需求评审记录落知识库（01-requirement-review）", progress: 100 }, { text: "需求→任务拆解模板可复用", progress: 100 }] },
  ],
  leader: [
    { id: "lead-001", icon: "🧭", title: "技术评审可闭环", status: "active", description: "为每条需求产出 ADR（Context/Decision/Consequences）与架构决策，保证决策可回溯到需求，评审记录落知识库。", period: "2026 Q3", owner: "Tech Lead", project: "YiAi", keyResults: [{ text: "每条需求产出 ADR（Context/Decision/Consequences）", progress: 100 }, { text: "架构决策可回溯到需求", progress: 100 }, { text: "记录载体/页面结构/目录规范有据可查", progress: 100 }, { text: "技术评审记录落知识库（02-technical-review）", progress: 100 }] },
  ],
  engineer: [
    { id: "eng-001", icon: "⚡", title: "代码编写与调试自闭环", status: "active", description: "把需求实现为可构建代码，0 人工编码介入，调试过程（问题→修复→验证）留痕，构建门禁通过。", period: "2026 Q3", owner: "Engineering Lead", project: "YiVad", keyResults: [{ text: "需求实现为可构建代码（0 人工编码介入）", progress: 100 }, { text: "改动文件 0 新增类型错误", progress: 100 }, { text: "调试过程（问题→修复→验证）落知识库（03-build-debug）", progress: 100 }, { text: "构建门禁（vue-tsc + build）通过", progress: 100 }] },
    { id: "eng-005", icon: "🧹", title: "构建健康度清零", status: "active", description: "清零 23 个 vue-tsc 既有类型错误，让 YiVad 恢复可构建可部署。", period: "2026 Q3", owner: "Engineering Lead", project: "YiVad", keyResults: [{ text: "清零 23 个 vue-tsc 既有类型错误", progress: 100 }, { text: "knowledgeBase dashboard 17 个错误修复", progress: 100 }, { text: "rag history/retrieval 4 个错误修复", progress: 100 }, { text: "proTable + menuMange 2 个类型错误修复", progress: 100 }] },
  ],
  srer: [
    { id: "sre-001", icon: "🔧", title: "测试与上线自闭环", status: "active", description: "为每条需求产出测试报告与上线记录，typecheck/build 门禁通过才上线，上线可追溯可回滚。", period: "2026 Q3", owner: "SRE Lead", project: "YiAi", keyResults: [{ text: "每条需求产出测试报告（04-test-report）", progress: 100 }, { text: "上线记录（artifact/version/env）落知识库（05-launch-record）", progress: 100 }, { text: "typecheck/build 门禁通过才上线", progress: 100 }, { text: "上线可回滚/可追溯", progress: 100 }] },
  ],
  aier: [
    { id: "aier-001", icon: "🧩", title: "编排三要素落地", status: "active", description: "为每个推荐任务显式指派 skill/agent/mcp 三要素，确定性角色×清单映射覆盖 7 角色，AI 推荐可复现。", period: "2026 Q3", owner: "AI Engineer", project: "YiAi", keyResults: [{ text: "每个推荐任务显式指派 skill/agent/mcp", progress: 100 }, { text: "确定性角色×清单映射覆盖 7 角色", progress: 100 }, { text: "AI 推荐按 WSJF 可复现", progress: 100 }, { text: "编排结果落盘可读回", progress: 100 }] },
    { id: "aier-002", icon: "🤖", title: "Agent 任务可靠", status: "active", description: "Agent 任务完成率稳定，写操作经确认门把关，模型升级链路生效。", period: "2026 Q3", owner: "AI Engineer", project: "YiAi", keyResults: [{ text: "Agent 任务完成率 > 70%", progress: 100 }, { text: "写操作确认门（approve/reject）把关", progress: 100 }, { text: "模型升级（stall→stronger）生效", progress: 100 }, { text: "80% 任务 ≤ 5 轮完成", progress: 100 }] },
  ],
  curator: [
    { id: "cur-001", icon: "📦", title: "流程记录知识化", status: "active", description: "维护 4 类流程记录模板与整合索引页，记录 frontmatter 合规，循环记录可被 RAG 检索。", period: "2026 Q3", owner: "Curator", project: "YiAi", keyResults: [{ text: "四类记录模板 + 整合索引页（loop/INDEX）落地", progress: 100 }, { text: "记录 frontmatter 合规率 100%", progress: 100 }, { text: "循环记录可被 RAG 检索", progress: 100 }, { text: "旧数据清零并留迁移记录", progress: 100 }] },
  ]
};


export const metricsData: Record<string, MetricItem[]> = {
  executiver: [
    { id: "exec-m01", icon: "📌", name: "闭环完成数", category: "自闭环", framework: "OKR", description: "已走通「需求→上线」的闭环条数。", current: 3, target: 3, baseline: 0, unit: " 条", trend: "up", progress: 100 },
    { id: "exec-m02", icon: "🎯", name: "OKR 对齐率", category: "对齐", framework: "OKR", description: "trace 到北极星的角色 Goal 占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "exec-m03", icon: "⏱️", name: "闭环周期", category: "自闭环", framework: "OKR", description: "从需求评审到上线的工作日。", current: 2, target: 2, baseline: 5, unit: " 天", trend: "down", progress: 100 },
  ],
  producter: [
    { id: "prod-m01", icon: "📋", name: "需求评审覆盖", category: "需求评审", framework: "OKR", description: "有 PRD + 验收标准的需求占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "prod-m02", icon: "✅", name: "验收标准完备率", category: "需求评审", framework: "OKR", description: "含可验证验收标准的需求占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
  ],
  leader: [
    { id: "lead-m01", icon: "📝", name: "ADR 覆盖率", category: "技术评审", framework: "OKR", description: "有 ADR 的需求占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "lead-m02", icon: "🔗", name: "决策可回溯率", category: "技术评审", framework: "OKR", description: "可回溯到需求的架构决策占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
  ],
  engineer: [
    { id: "eng-m01", icon: "🧹", name: "0 新增类型错误", category: "构建", framework: "OKR", description: "改动文件新增的 vue-tsc 错误数。", current: 0, target: 0, baseline: 23, unit: " 个", trend: "down", progress: 100 },
    { id: "eng-m02", icon: "🏗️", name: "构建通过", category: "构建", framework: "OKR", description: "vue-tsc + build 全绿。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "eng-m06", icon: "📉", name: "构建健康度", category: "构建", framework: "OKR", description: "既有类型错误数（23→0）。", current: 0, target: 0, baseline: 23, unit: " 个", trend: "down", progress: 100 },
  ],
  srer: [
    { id: "sre-m01", icon: "🧪", name: "测试报告覆盖", category: "测试", framework: "OKR", description: "有测试报告的闭环占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "sre-m02", icon: "🚀", name: "上线记录完整度", category: "上线", framework: "OKR", description: "含 artifact/version/env 的上线记录占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
  ],
  aier: [
    { id: "aier-m01", icon: "🧩", name: "编排覆盖", category: "编排", framework: "OKR", description: "有三要素编排的任务占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "aier-m02", icon: "✅", name: "Agent 任务完成率", category: "Agent", framework: "OKR", description: "成功完成的 Agent 任务占比。", current: 0, target: 70, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "aier-m03", icon: "🛡️", name: "确认门生效率", category: "Agent", framework: "OKR", description: "写操作经 approve/reject 把关的占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
  ],
  curator: [
    { id: "cur-m01", icon: "📄", name: "记录模板数", category: "记录", framework: "KB Health", description: "已落地的流程记录模板数。", current: 5, target: 4, baseline: 0, unit: " 个", trend: "up", progress: 100 },
    { id: "cur-m03", icon: "🔄", name: "frontmatter 合规率", category: "记录", framework: "KB Health", description: "记录文件 frontmatter 合规占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
    { id: "cur-m06", icon: "🔍", name: "循环可检索性", category: "记录", framework: "KB Health", description: "可被 RAG 检索的循环记录占比。", current: 100, target: 100, baseline: 0, unit: "%", trend: "up", progress: 100 },
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
  "exec-001": ["exec-m01", "exec-m03"],
  "exec-002": ["exec-m02"],
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
    yesterday: ["批准「AI 全流程自闭环」北极星", "确认旧 OKR 数据清零范围", "圈定 7 角色各自在闭环上的职责"],
    today: ["审阅 7 角色重定义后的 OKR", "对齐北极星与各角色 KR", "启动首条闭环 loop-001"],
    blocker: "",
    mood: "Focused", moodType: "primary"
  },
  producter: {
    yesterday: ["梳理闭环五阶段：需求→评审→编码→调试→上线", "定义 4 类流程记录（需求评审/技术评审/构建调试/测试报告）", "确认 PRD + 验收标准模板"],
    today: ["产出 loop-001 需求评审记录（PRD + 验收标准）", "给首条闭环需求打分（WSJF）", "拆解需求为可执行任务"],
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
    { id: "e1", text: "北极星「AI 全流程自闭环」已审批", done: true },
    { id: "e2", text: "7 角色 OKR 对齐到北极星", done: true, value: "对齐率 100%" },
    { id: "e3", text: "首条闭环 loop-001 启动", done: true },
    { id: "e4", text: "审批记录落知识库", done: true },
    { id: "e5", text: "闭环周期 ≤ 2 个工作日", done: true }
  ],
  producter: [
    { id: "p1", text: "loop-001 需求评审记录（PRD + 验收标准）", done: true },
    { id: "p2", text: "WSJF 优先级打分落地", done: true },
    { id: "p3", text: "需求→任务拆解模板", done: true },
    { id: "p4", text: "评审记录落知识库（01-requirement-review）", done: true },
    { id: "p5", text: "验收标准可验证", done: true }
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
    { id: "en5", text: "调试记录落知识库（03-build-debug）", done: true }
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
    done: ["批准北极星「AI 从需求到上线全流程自闭环」", "圈定 7 角色在闭环上的职责边界", "确认旧数据清零范围与迁移口径"],
    blockers: [],
    nextWeek: ["复盘 loop-001 全流程，规划 loop-002"],
    decisions: ["北极星：AI 全流程自闭环，替代旧的「产品矩阵增长」", "执行深度：全量执行", "记录载体：知识库 markdown + YiVad 新页"]
  },
  producter: {
    status: "On Track", statusType: "success",
    done: ["定义闭环五阶段", "定义 4 类流程记录", "确认 PRD + 验收标准模板"],
    blockers: [],
    nextWeek: ["复盘 loop-001 需求评审，规划 loop-002 需求"],
    decisions: ["需求评审 = 产出 PRD + 验收标准 + WSJF 优先级", "每需求一条 01-requirement-review 记录"]
  },
  leader: {
    status: "On Track", statusType: "success",
    done: ["圈定记录载体（KB markdown + YiVad 新页）", "定 KB loop/ 目录规范", "盘点可复用的 OKR 机制"],
    blockers: [],
    nextWeek: ["复盘 loop-001 技术评审，沉淀可复用 ADR"],
    decisions: ["记录载体：KB markdown 为事实源 + YiVad 新页整合展示", "ADR 随 02-technical-review 落知识库"]
  },
  engineer: {
    status: "On Track", statusType: "success",
    done: ["重写 okrData.ts 7 角色数据", "基线盘点：23 个 vue-tsc 既有错误", "确认类型接口不变、只换数据"],
    blockers: [],
    nextWeek: ["复盘 loop-001 构建调试，维护 0 类型错误基线"],
    decisions: ["类型接口保持不变，只替换数据内容", "清零 23 个既有错误纳入本轮 engineer 收尾目标"]
  },
  srer: {
    status: "On Track", statusType: "success",
    done: ["定测试门禁（vue-tsc + build）", "定上线记录字段", "定回滚/追溯口径"],
    blockers: [],
    nextWeek: ["复盘 loop-001 门禁与上线，规划 loop-002 上线"],
    decisions: ["门禁：typecheck + build 通过才上线", "上线记录含 artifact/version/env"]
  },
  aier: {
    status: "On Track", statusType: "success",
    done: ["盘点 skill/agent/mcp 三要素映射", "确认 WSJF 评分逻辑可复用", "确认 Agent 确认门机制在位"],
    blockers: [],
    nextWeek: ["复盘 loop-001 编排映射，沉淀三要素清单"],
    decisions: ["编排三要素：skill/agent/mcp 确定性映射 + AI 兜底", "WSJF 评分复用既有实现"]
  },
  curator: {
    status: "On Track", statusType: "success",
    done: ["清空旧 OKR 数据（goals/metrics/2026-08）", "定 loop/ 目录结构", "定 4 类记录模板 frontmatter"],
    blockers: [],
    nextWeek: ["复盘 loop-001 记录规范，规划 loop-002 模板复用"],
    decisions: ["loop/ 每闭环一个目录，含 01~05 记录", "记录 frontmatter 沿用 KB rulebook 规范"]
  }
};
