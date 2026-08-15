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

/** 一条可执行子任务：标题（做什么）+ 做法（怎么做）+ 完成标准（如何验收）。 */
export interface ExampleSubtask {
  id: string;
  title: string;
  detail: string;
  acceptance: string;
}

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
  /** 具体可执行的任务分解（含做法与验收标准）。 */
  subtasks: ExampleSubtask[];
}

/**
 * 一条完整的「从需求到上线」样例任务链。
 * 旗舰需求 = exec-005「Yi Ecosystem Integration」，配套 exec-002 /
 * prod-002 / aier-002 / cur-001 等既有目标，展示不同角色如何被编排。
 * 每条任务都带一份「可执行任务分解」——做法 + 完成标准，可直接拆给执行者。
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
    description:
      "跨页导航闭环是 YiVad 信息架构的骨架：让用户从 Home 直达 OKR / RSS / Knowledge，各子菜单之间互跳无死链，为「需求 → 编排 → 执行 → 上线」流程提供统一入口与可回跳的深链。",
    subtasks: [
      {
        id: "flow-t-001-1",
        title: "梳理路由与菜单映射",
        detail:
          "遍历 authMenuList 与 router 配置，核对 home / okr / rss / knowledge 及子菜单的 path→component 对应关系，标出缺失与错配。",
        acceptance: "产出一份 route→component 对照清单，无 unknown route、无重复 path。"
      },
      {
        id: "flow-t-001-2",
        title: "修复菜单跳转关联",
        detail: "统一所有 nav 按钮与 quick-nav 卡片的跳转目标为已注册路由，补齐缺失路由项。",
        acceptance: "点击任意导航均无 404，breadcrumb 可回跳上级。"
      },
      {
        id: "flow-t-001-3",
        title: "深链与回退验证",
        detail: "用 ?goal= 等深链参数验证从聚合页回跳角色 OKR。",
        acceptance: "深链可定位并高亮目标，返回路径正确。"
      }
    ]
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
    description:
      "编排是把「目标」转成「可执行任务」的关键一步：为每个推荐任务显式指派 skill（能力）、agent（执行者）、mcp（外部工具/数据源）三要素，形成确定性角色×清单映射作为 AI 精调的兜底，保证编排结果可复现、可落盘、可读回。",
    subtasks: [
      {
        id: "flow-t-002-1",
        title: "建立角色×清单确定性映射",
        detail: "按 7 角色定义推荐任务到 skill / agent / mcp 的默认映射表。",
        acceptance: "每个角色的典型任务都有缺省三要素，映射表可查。"
      },
      {
        id: "flow-t-002-2",
        title: "编排结果随任务落盘",
        detail: "把三要素写入任务 frontmatter（skill / agent / mcp 字段）。",
        acceptance: "重新扫描可读回三要素，无字段丢失。"
      },
      {
        id: "flow-t-002-3",
        title: "AI 精调兜底",
        detail: "对缺省映射覆盖不到的任务，用 AI 补全三要素并回写。",
        acceptance: "冷门任务也能得到合理的三要素，无空值。"
      }
    ]
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
    description:
      "为避免重复造轮子并延续上下文，生成 / 重生成任务编排时，把其它清单里已编排的历史任务（标题 + skill/agent/mcp）注入 prompt，让模型借鉴已有决策；上限 15 条防止 prompt 膨胀。",
    subtasks: [
      {
        id: "flow-t-003-1",
        title: "采集历史已编排任务",
        detail: "扫描各清单，提取带 skill / agent / mcp 的历史任务。",
        acceptance: "得到去重后的历史任务集合（标题 + 三要素）。"
      },
      {
        id: "flow-t-003-2",
        title: "注入 prompt 并截断",
        detail: "生成 / 重生成时喂入 ≤15 条历史任务上下文。",
        acceptance: "prompt 含借鉴段且不超长，无重复条目。"
      },
      {
        id: "flow-t-003-3",
        title: "回归验证",
        detail: "对比注入前后生成结果，确认新任务不再重复已有决策。",
        acceptance: "重复项数量下降，新任务三要素与历史一致时不再重新决策。"
      }
    ]
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
    description:
      "消除知识库菜单死链：为 7 角色提供目标/指标聚合视图，把分散在各角色 OKR 的 goal / metric 汇总到一处，点击深链回角色 OKR 详情。",
    subtasks: [
      {
        id: "flow-t-004-1",
        title: "聚合 7 角色目标与指标",
        detail: "从 okrData 汇总 7 角色的 goal 与 metric，建立 goal→metric 映射。",
        acceptance: "聚合页数据完整、去重、可追溯来源角色。"
      },
      {
        id: "flow-t-004-2",
        title: "渲染聚合视图",
        detail: "目标 / 指标卡片与表格渲染，状态、进度、趋势可视化。",
        acceptance: "信息清晰可读，排序与过滤可用。"
      },
      {
        id: "flow-t-004-3",
        title: "深链回跳",
        detail: "点击目标 / 指标跳回对应角色 OKR 并定位。",
        acceptance: "跳转正确无死链，返回路径可回跳。"
      }
    ]
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
    description: "去掉不存在的 /metric/:id 路由，改为指标卡原地 scrollIntoView + 高亮，避免 404 并让指标详情可原地查看。",
    subtasks: [
      {
        id: "flow-t-005-1",
        title: "移除死路由",
        detail: "删除 /metric/:id 相关路由与跳转逻辑。",
        acceptance: "访问旧链不再 404，无残留路由。"
      },
      {
        id: "flow-t-005-2",
        title: "原地滚动定位",
        detail: "scrollIntoView 平滑滚动到目标指标卡。",
        acceptance: "点击指标链接平滑定位到目标卡。"
      },
      {
        id: "flow-t-005-3",
        title: "高亮反馈",
        detail: "定位后临时高亮目标卡并自动消退。",
        acceptance: "高亮 1600ms 后消失，视觉反馈清晰。"
      }
    ]
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
    description:
      "写操作需用户确认（Approve / Reject），120s 超时自动拒绝，保证 agent 不擅自落盘；同时支持在聊天输入框回复「可以 / 不要」等自然语言审批。",
    subtasks: [
      {
        id: "flow-t-006-1",
        title: "后端确认门",
        detail: "写操作前暂停等待 approve / reject 决策，120s 超时。",
        acceptance: "超时自动拒绝，未批准不执行写。"
      },
      {
        id: "flow-t-006-2",
        title: "前端确认 UI",
        detail: "渲染 Approve / Reject 按钮 + 聊天自然语言审批。",
        acceptance: "按钮与自然语言均可完成审批，状态及时反馈。"
      },
      {
        id: "flow-t-006-3",
        title: "拒绝记忆",
        detail: "记录被拒调用签名，相同调用不再二次弹窗。",
        acceptance: "重复写被自动拦截，不重复询问。"
      }
    ]
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
    description: "RSS 正文卸载到 YiKnowledge markdown，MongoDB 只存元数据，减小主库体积并把长文本纳入知识库检索。",
    subtasks: [
      {
        id: "flow-t-007-1",
        title: "内容脚本注入采集",
        detail: "YiPet 注入 10+ 内网平台，采集文章正文。",
        acceptance: "目标平台文章被稳定采集。"
      },
      {
        id: "flow-t-007-2",
        title: "markdown 落盘",
        detail: "正文写入 YiKnowledge 对应目录。",
        acceptance: "文件落盘可读，无乱码。"
      },
      {
        id: "flow-t-007-3",
        title: "自动分类",
        detail: "文章按角色 / 主题自动归类到目录。",
        acceptance: "分类准确率达标，可人工纠正。"
      }
    ]
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
    description: "把上线 artifact / 版本 / 环境 / 关联目标渲染到 pipeline 页，让「执行 → 上线」链路可视化、可追溯。",
    subtasks: [
      {
        id: "flow-t-008-1",
        title: "定义上线记录结构",
        detail: "定义 launch record 字段：artifact / version / env / status / goalId。",
        acceptance: "字段完整且可扩展。"
      },
      {
        id: "flow-t-008-2",
        title: "渲染 pipeline 页",
        detail: "artifact / 版本 / 环境 / 状态渲染到 pipeline 页。",
        acceptance: "pipeline 页可见上线记录，排序正确。"
      },
      {
        id: "flow-t-008-3",
        title: "关联目标",
        detail: "上线记录关联 goalId 并支持跳回目标。",
        acceptance: "可跳回对应 OKR 目标。"
      }
    ]
  },
  {
    id: "flow-t-009",
    title: "清零 22 个 vue-tsc 类型错误，恢复 YiVad 可构建",
    role: "engineer",
    roleIcon: "⚡",
    roleName: "Engineer",
    goalId: "eng-005",
    skill: "vue",
    agent: "Engineer Agent",
    mcp: "github",
    listType: "risk",
    priority: "P0",
    status: "At Risk",
    owner: "Engineering Lead",
    deadline: "2026-08-21",
    progress: 15,
    description:
      "pnpm build 被 22 个 vue-tsc 类型错误阻断，YiVad 无法构建部署。TypeScript strict 与 vue-tsc --noEmit 是硬基线。错误分布：knowledgeBase dashboard 17 个（TS2339 Refresh/Search 未定义、TS2345 DefaultRow→KnowledgeFileSummary/path）、rag 4 个（history 2 + retrieval 2，TS2345 DefaultRow→HistoryEntry/RagSource）、proTable 1 个（TS2344）。需逐文件修复并验证全量构建通过。",
    subtasks: [
      {
        id: "flow-t-009-1",
        title: "修复 knowledgeBase dashboard 17 个错误",
        detail: "补上 TS2339 缺失的 Refresh/Search 引用，修正 TS2345 DefaultRow 到 KnowledgeFileSummary/path 的类型。",
        acceptance: "vue-tsc 该文件 0 错误。"
      },
      {
        id: "flow-t-009-2",
        title: "修复 rag/history 2 个 TS2345",
        detail: "把 DefaultRow 收窄为 HistoryEntry 类型。",
        acceptance: "该文件 0 错误。"
      },
      {
        id: "flow-t-009-3",
        title: "修复 rag/retrieval 2 个 TS2345",
        detail: "把 DefaultRow 收窄为 RagSource 类型。",
        acceptance: "该文件 0 错误。"
      },
      {
        id: "flow-t-009-4",
        title: "修复 proTable/complexProTable 1 个 TS2344",
        detail: "修正泛型约束，消除 TS2344。",
        acceptance: "该文件 0 错误。"
      },
      {
        id: "flow-t-009-5",
        title: "全量构建验证",
        detail: "运行 vue-tsc --noEmit 与 pnpm build 确认无错误。",
        acceptance: "0 类型错误，构建成功，可部署。"
      }
    ]
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
