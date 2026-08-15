// ═══════════════════════════════════════════════════════════════
// 需求 → 上线的「完整例子数据」— 单一事实来源
//
// 参考 deepseek-harness「一切皆插件」：把整条链路做成一份可读的
// 演示数据，贯穿四个阶段：
//   需求（OKR 目标/关键结果/指标） → 编排（skill/agent/mcp）
//   → 执行（agent 跑任务） → 上线（交付/部署到 pipeline）。
//
// 与 okrData.ts 的区别：okrData 是「目标与指标」的静态目录；
// 本文件是「从目标派生出的任务 + 上线记录」的例子，二者通过
// goalId 关联，共同构成「从需求到上线」的完整样例。
// ═══════════════════════════════════════════════════════════════

// ── 流程阶段 ──────────────────────────────────

export type FlowStageKey = "requirement" | "orchestration" | "execution" | "launch";

export interface FlowStage {
  key: FlowStageKey;
  label: string;
  en: string;
  icon: string;
  description: string;
  route: string;
  count: number;
}

export const FLOW_STAGES: FlowStage[] = [
  {
    key: "requirement",
    label: "需求",
    en: "Requirement",
    icon: "🎯",
    description: "定义 OKR：目标 / 关键结果 / 指标，明确「为什么做、做成什么样」",
    route: "/knowledge/goals",
    count: 42
  },
  {
    key: "orchestration",
    label: "编排",
    en: "Orchestrate",
    icon: "🧩",
    description: "根据 OKR 并借鉴历史任务，为每个任务指派 skill / agent / mcp",
    route: "/home/index",
    count: 8
  },
  {
    key: "execution",
    label: "执行",
    en: "Execute",
    icon: "🤖",
    description: "agent 用分配的 skill 与 mcp 跑任务，确认门把关写操作",
    route: "/aiChat",
    count: 6
  },
  {
    key: "launch",
    label: "上线",
    en: "Launch",
    icon: "🚀",
    description: "交付 / 部署到 pipeline，产出可上线 artifact 与版本记录",
    route: "/knowledge/pipeline",
    count: 4
  }
];

// ── 编排 / 执行：示例任务 ──────────────────────

export type ExampleTaskStatus = "Done" | "In Progress" | "Planned" | "At Risk";
export type ExampleTaskPriority = "P0" | "P1" | "P2" | "P3";
export type ExampleListType = "daily" | "weekly" | "risk" | "sprint";

export interface ExampleTask {
  id: string;
  title: string;
  role: string;
  roleIcon: string;
  roleName: string;
  goalId: string;
  skill: string;
  agent: string;
  mcp: "github" | "yiai" | "";
  listType: ExampleListType;
  priority: ExampleTaskPriority;
  status: ExampleTaskStatus;
  owner: string;
  deadline: string;
  progress: number;
  description: string;
}

/**
 * 一条完整的「从需求到上线」样例任务链。
 * 旗舰需求 = exec-005「Yi Ecosystem Integration」，配套 exec-002 /
 * prod-002 / aier-002 / cur-001 等既有目标，展示不同角色如何被编排。
 */
export const EXAMPLE_TASKS: ExampleTask[] = [
  {
    id: "flow-t-001",
    title: "打通 home / okr / rss / knowledge 菜单跳转关联",
    role: "engineer",
    roleIcon: "⚡",
    roleName: "Engineer",
    goalId: "exec-005",
    skill: "vue",
    agent: "Engineer Agent",
    mcp: "github",
    listType: "sprint",
    priority: "P0",
    status: "Done",
    owner: "Engineering Lead",
    deadline: "2026-08-14",
    progress: 100,
    description: "跨页导航闭环：home ↔ okr ↔ rss ↔ knowledge 各子菜单互跳，无 404。"
  },
  {
    id: "flow-t-002",
    title: "为每个推荐任务落地编排三要素 skill / agent / mcp",
    role: "aier",
    roleIcon: "🤖",
    roleName: "AI Engineer",
    goalId: "exec-002",
    skill: "skill-creator",
    agent: "AI Engineer Agent",
    mcp: "yiai",
    listType: "sprint",
    priority: "P0",
    status: "Done",
    owner: "AI Engineer",
    deadline: "2026-08-13",
    progress: 100,
    description: "确定性角色×清单映射兜底 + AI 精调，随任务落盘可读回。"
  },
  {
    id: "flow-t-003",
    title: "历史任务借鉴注入 prompt（避免重复、延续上下文）",
    role: "aier",
    roleIcon: "🤖",
    roleName: "AI Engineer",
    goalId: "aier-002",
    skill: "skill-creator",
    agent: "AI Engineer Agent",
    mcp: "yiai",
    listType: "sprint",
    priority: "P1",
    status: "Done",
    owner: "AI Engineer",
    deadline: "2026-08-13",
    progress: 100,
    description: "生成/重生成时喂入其它清单已编排任务（标题 + skill/agent/mcp，≤15 条）。"
  },
  {
    id: "flow-t-004",
    title: "新建 goals / metrics 聚合页，解决知识库菜单死链",
    role: "engineer",
    roleIcon: "⚡",
    roleName: "Engineer",
    goalId: "prod-002",
    skill: "vue",
    agent: "Engineer Agent",
    mcp: "github",
    listType: "sprint",
    priority: "P1",
    status: "Done",
    owner: "Engineering Lead",
    deadline: "2026-08-12",
    progress: 100,
    description: "7 角色目标/指标聚合视图，点击深链回角色 OKR。"
  },
  {
    id: "flow-t-005",
    title: "OKR 深链修复：指标卡原地滚动 + 高亮",
    role: "engineer",
    roleIcon: "⚡",
    roleName: "Engineer",
    goalId: "prod-002",
    skill: "vue",
    agent: "Engineer Agent",
    mcp: "github",
    listType: "risk",
    priority: "P1",
    status: "Done",
    owner: "Engineering Lead",
    deadline: "2026-08-12",
    progress: 100,
    description: "去掉不存在的 /metric/:id 路由，改为 scrollIntoView + 高亮。"
  },
  {
    id: "flow-t-006",
    title: "Agent 确认门（Approve/Reject）上线",
    role: "aier",
    roleIcon: "🤖",
    roleName: "AI Engineer",
    goalId: "exec-002",
    skill: "skill-creator",
    agent: "AI Engineer Agent",
    mcp: "yiai",
    listType: "daily",
    priority: "P0",
    status: "Done",
    owner: "AI Engineer",
    deadline: "2026-08-11",
    progress: 100,
    description: "写操作需用户确认，120s 超时自动拒绝，保证 agent 不擅自落盘。"
  },
  {
    id: "flow-t-007",
    title: "RSS 内容采集与自动分类接入 YiKnowledge",
    role: "curator",
    roleIcon: "📦",
    roleName: "Curator",
    goalId: "cur-001",
    skill: "import",
    agent: "Curator Agent",
    mcp: "yiai",
    listType: "weekly",
    priority: "P2",
    status: "In Progress",
    owner: "Curator",
    deadline: "2026-08-21",
    progress: 60,
    description: "RSS 正文卸载到 YiKnowledge markdown，MongoDB 只存元数据。"
  },
  {
    id: "flow-t-008",
    title: "上线记录可视化（pipeline launch records）",
    role: "engineer",
    roleIcon: "⚡",
    roleName: "Engineer",
    goalId: "exec-005",
    skill: "vue",
    agent: "Engineer Agent",
    mcp: "github",
    listType: "sprint",
    priority: "P1",
    status: "In Progress",
    owner: "Engineering Lead",
    deadline: "2026-08-18",
    progress: 40,
    description: "把上线 artifact / 版本 / 环境 / 关联目标渲染到 pipeline 页。"
  }
];

// ── 上线记录（交付 / 部署）──────────────────

export type ExampleLaunchStatus = "live" | "staging" | "rolling";

export interface ExampleLaunch {
  id: string;
  project: string;
  projectIcon: string;
  artifact: string;
  version: string;
  env: string;
  status: ExampleLaunchStatus;
  deployedAt: string;
  goalId: string;
  taskId: string;
  description: string;
}

export const EXAMPLE_LAUNCHES: ExampleLaunch[] = [
  {
    id: "launch-001",
    project: "YiVad",
    projectIcon: "🖥️",
    artifact: "OKR 编排 + 跨页导航闭环",
    version: "v1.0.0",
    env: "prod",
    status: "live",
    deployedAt: "2026-08-14",
    goalId: "exec-005",
    taskId: "flow-t-001",
    description: "home/okr/rss/knowledge 全链路打通，需求 → 上线流程可视化。"
  },
  {
    id: "launch-002",
    project: "YiAi",
    projectIcon: "🤖",
    artifact: "Agent 确认门 + 模型升级",
    version: "v1.2.0",
    env: "prod",
    status: "live",
    deployedAt: "2026-08-11",
    goalId: "exec-002",
    taskId: "flow-t-006",
    description: "写操作确认门 + 模型 stall→stronger 升级链路，任务完成率 62%。"
  },
  {
    id: "launch-003",
    project: "YiPet",
    projectIcon: "🧩",
    artifact: "内容脚本注入 + 采集",
    version: "v0.8.0",
    env: "staging",
    status: "rolling",
    deployedAt: "2026-08-15",
    goalId: "prod-003",
    taskId: "flow-t-007",
    description: "Chrome MV3 内容脚本注入 10+ 内网平台，采集文章自动分类。"
  },
  {
    id: "launch-004",
    project: "YiKnowledge",
    projectIcon: "📚",
    artifact: "okr/ 任务目录 + 聚合视图",
    version: "v1.1.0",
    env: "prod",
    status: "live",
    deployedAt: "2026-08-12",
    goalId: "cur-001",
    taskId: "flow-t-004",
    description: "okr 任务落盘目录 + goals/metrics 聚合页，410 文件在线。"
  }
];

// ── 便捷查询 ─────────────────────────────────

/** 按角色取示例任务（供各页回退展示用）。 */
export function exampleTasksByRole(roleId: string): ExampleTask[] {
  return EXAMPLE_TASKS.filter(t => t.role === roleId);
}

/** 状态 → Element Plus tag 类型。 */
export function taskStatusType(status: ExampleTaskStatus): "success" | "warning" | "danger" | "info" {
  if (status === "Done") return "success";
  if (status === "In Progress") return "warning";
  if (status === "At Risk") return "danger";
  return "info";
}

/** 优先级 → Element Plus tag 类型。 */
export function taskPriorityType(priority: ExampleTaskPriority): "danger" | "warning" | "primary" | "info" {
  if (priority === "P0") return "danger";
  if (priority === "P1") return "warning";
  if (priority === "P2") return "primary";
  return "info";
}

/** 上线状态 → Element Plus tag 类型。 */
export function launchStatusType(status: ExampleLaunchStatus): "success" | "warning" | "info" {
  if (status === "live") return "success";
  if (status === "rolling") return "warning";
  return "info";
}
