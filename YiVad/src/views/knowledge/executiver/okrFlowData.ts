// ═══════════════════════════════════════════════════════════════
// 需求 → 上线的「完整例子数据」— 单一事实来源
//
// 2026-Q3 重定义：北极星 =「AI 从需求到上线全流程自闭环」。
// 本文件是「从新目标派生出的任务 + 上线记录」，通过 goalId 关联
// okrData.ts 的新目标，构成「从需求到上线」的自闭环样例。
// 旗舰需求 = exec-001「AI 全流程自闭环」的首条闭环 loop-001。
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
    count: 15
  },
  {
    key: "orchestration",
    label: "编排",
    en: "Orchestrate",
    icon: "🧩",
    description: "根据 OKR 并借鉴历史任务，为每个任务指派 skill / agent / mcp",
    route: "/home/index",
    count: 7
  },
  {
    key: "execution",
    label: "执行",
    en: "Execute",
    icon: "🤖",
    description: "agent 用分配的 skill 与 mcp 跑任务，确认门把关写操作",
    route: "/aiChat",
    count: 9
  },
  {
    key: "launch",
    label: "上线",
    en: "Launch",
    icon: "🚀",
    description: "交付 / 部署到 pipeline，产出可上线 artifact 与版本记录",
    route: "/knowledge/pipeline",
    count: 1
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
 * 首条闭环 loop-001 的任务链：把「AI 全流程自闭环」拆成 9 条可执行任务，
 * 每条带「做法 + 完成标准」，按角色编排，贯穿需求 → 评审 → 编码 → 测试 → 上线。
 */
export const EXAMPLE_TASKS: ExampleTask[] = [
  {
    id: "flow-t-001",
    title: "清除旧 OKR 数据，重置知识库 okr 目录",
    role: "curator",
    roleIcon: "📦",
    roleName: "Curator",
    goalId: "cur-001",
    skill: "market-research",
    agent: "Curator Agent",
    mcp: "yiai",
    listType: "sprint",
    priority: "P0",
    status: "Done",
    owner: "Curator",
    deadline: "2026-08-16",
    progress: 100,
    description: "去掉所有老数据：删除 YiKnowledge/okr/2026-Q3 下旧 goals / metrics / 2026-08 任务与 weekly，保留机制与视图，为北极星重定义腾出干净空间。",
    subtasks: [
      {
        id: "flow-t-001-1",
        title: "删除旧 goals / metrics markdown",
        detail: "rm -rf YiKnowledge/okr/2026-Q3/goals 与 metrics 下 7 角色旧目标/指标文件。",
        acceptance: "目录清空，无残留旧目标/指标文件。"
      },
      {
        id: "flow-t-001-2",
        title: "删除旧任务与周报",
        detail: "删除 2026-08 下旧 p0/p1/p2 任务与 weekly 周报。",
        acceptance: "旧任务与周报清零。"
      },
      {
        id: "flow-t-001-3",
        title: "保留机制并记录 reset",
        detail: "确认视图/推荐机制/编排逻辑不动，记录一次 reset 日志。",
        acceptance: "机制文件无改动，reset 留痕。"
      }
    ]
  },
  {
    id: "flow-t-002",
    title: "重定义 7 角色 OKR（北极星：AI 全流程自闭环）",
    role: "engineer",
    roleIcon: "⚡",
    roleName: "Engineer",
    goalId: "exec-001",
    skill: "vue",
    agent: "Engineer Agent",
    mcp: "github",
    listType: "sprint",
    priority: "P0",
    status: "Done",
    owner: "Engineering Lead",
    deadline: "2026-08-16",
    progress: 100,
    description: "重写 okrData.ts：7 角色 goals / metrics / daily / weekly 全部围绕「AI 从需求到上线全流程自闭环」北极星，接口不变只换数据。",
    subtasks: [
      {
        id: "flow-t-002-1",
        title: "定义北极星与角色职责",
        detail: "executiver 立北极星，7 角色各拥闭环一环（需求/技术/编码/测试/编排/记录）。",
        acceptance: "7 角色 Goal 全部 trace 到北极星。"
      },
      {
        id: "flow-t-002-2",
        title: "重写 goalsData 与 metricsData",
        detail: "替换旧目标/指标为自闭环主题，KRs 可验证、关联指标。",
        acceptance: "接口不变，新数据渲染正常。"
      },
      {
        id: "flow-t-002-3",
        title: "重写 daily / checklist / weekly",
        detail: "替换角色日/周数据为 loop-001 执行现场。",
        acceptance: "三处数据与新 OKR 一致。"
      }
    ]
  },
  {
    id: "flow-t-003",
    title: "产出需求评审记录（PRD + 验收标准 + WSJF）",
    role: "producter",
    roleIcon: "📋",
    roleName: "Product",
    goalId: "prod-001",
    skill: "gen-brd",
    agent: "Product Agent",
    mcp: "yiai",
    listType: "sprint",
    priority: "P0",
    status: "Done",
    owner: "PM YiAi",
    deadline: "2026-08-16",
    progress: 100,
    description: "为 loop-001 产出完整需求评审：PRD（背景/目标/范围）、验收标准（可验证）、WSJF 优先级，落知识库 01-requirement-review。",
    subtasks: [
      {
        id: "flow-t-003-1",
        title: "写 PRD",
        detail: "明确 loop-001 要做什么：重定义 OKR + 建流程记录体系 + 跑通首条闭环。",
        acceptance: "PRD 含背景/目标/范围/非目标。"
      },
      {
        id: "flow-t-003-2",
        title: "写验收标准",
        detail: "每个交付物给可验证的完成判据。",
        acceptance: "验收标准可被测试门禁直接判定。"
      },
      {
        id: "flow-t-003-3",
        title: "WSJF 打分",
        detail: "按价值×紧迫÷难度给 loop-001 各任务打分排序。",
        acceptance: "任务有优先级，排序可解释。"
      }
    ]
  },
  {
    id: "flow-t-004",
    title: "产出技术评审记录（ADR + 记录载体选型）",
    role: "leader",
    roleIcon: "🧭",
    roleName: "Leader",
    goalId: "lead-001",
    skill: "code-quality-research",
    agent: "Leader Agent",
    mcp: "github",
    listType: "sprint",
    priority: "P0",
    status: "Done",
    owner: "Tech Lead",
    deadline: "2026-08-16",
    progress: 100,
    description: "为 loop-001 产出技术评审：记录载体选型（KB markdown + YiVad 新页）、页面结构（processRecord.vue）、KB 目录规范（loop/），落知识库 02-technical-review。",
    subtasks: [
      {
        id: "flow-t-004-1",
        title: "写 ADR：记录载体选型",
        detail: "决策：KB markdown 为事实源 + YiVad 新页整合展示，理由与权衡。",
        acceptance: "ADR 含 Context/Decision/Consequences。"
      },
      {
        id: "flow-t-004-2",
        title: "定页面结构",
        detail: "processRecord.vue 读取 loop/ 目录，按闭环列 4+1 类记录卡片。",
        acceptance: "页面结构可落地。"
      },
      {
        id: "flow-t-004-3",
        title: "定 KB 目录规范",
        detail: "loop/loop-XXX/ 下 01~05 记录 + INDEX + _templates。",
        acceptance: "目录规范可复用。"
      }
    ]
  },
  {
    id: "flow-t-005",
    title: "建立 4 类流程记录模板 + loop 目录",
    role: "curator",
    roleIcon: "📦",
    roleName: "Curator",
    goalId: "cur-001",
    skill: "import",
    agent: "Curator Agent",
    mcp: "yiai",
    listType: "sprint",
    priority: "P1",
    status: "Done",
    owner: "Curator",
    deadline: "2026-08-16",
    progress: 100,
    description: "建 YiKnowledge/okr/2026-Q3/loop/ 目录与 _templates（需求评审/技术评审/构建调试/测试报告/上线 5 类模板），frontmatter 沿用 KB rulebook 规范。",
    subtasks: [
      {
        id: "flow-t-005-1",
        title: "建 loop/ 目录",
        detail: "创建 loop/、loop/_templates/、loop/loop-001-<slug>/ 结构。",
        acceptance: "目录结构就位。"
      },
      {
        id: "flow-t-005-2",
        title: "写 5 类记录模板",
        detail: "为 01~05 记录各写一份带 frontmatter 的模板。",
        acceptance: "模板可复用到后续闭环。"
      },
      {
        id: "flow-t-005-3",
        title: "校验 frontmatter 合规",
        detail: "模板 frontmatter 满足 KB rulebook 必填字段。",
        acceptance: "title/tags/category/created/updated/source/type/status 齐全。"
      }
    ]
  },
  {
    id: "flow-t-006",
    title: "写 processRecord.vue 流程记录整合页 + 路由 + 菜单",
    role: "engineer",
    roleIcon: "⚡",
    roleName: "Engineer",
    goalId: "exec-001",
    skill: "vue",
    agent: "Engineer Agent",
    mcp: "github",
    listType: "sprint",
    priority: "P1",
    status: "Done",
    owner: "Engineering Lead",
    deadline: "2026-08-16",
    progress: 100,
    description: "新增「流程记录」页：通过 knowledgeService.scanKnowledge 读取 loop/ 目录，按闭环列出 4+1 类记录，深链到 KB 文件（复用 KnowledgePreviewDialog）。注册路由与菜单。",
    subtasks: [
      {
        id: "flow-t-006-1",
        title: "写 processRecord.vue",
        detail: "扫描 loop/ 目录，聚合每条闭环的 01~05 记录，卡片渲染 + 状态标签。",
        acceptance: "页面可列出全部闭环记录。"
      },
      {
        id: "flow-t-006-2",
        title: "注册路由",
        detail: "staticRouter.ts 加 /executiver/process 路由。",
        acceptance: "路由可达，无 404。"
      },
      {
        id: "flow-t-006-3",
        title: "加菜单项",
        detail: "authMenuList.json 加菜单入口，activeMenu 指向 /executiver。",
        acceptance: "侧边栏可见「流程记录」入口。"
      }
    ]
  },
  {
    id: "flow-t-007",
    title: "清零 23 个 vue-tsc 既有类型错误",
    role: "engineer",
    roleIcon: "⚡",
    roleName: "Engineer",
    goalId: "eng-005",
    skill: "vue",
    agent: "Engineer Agent",
    mcp: "github",
    listType: "risk",
    priority: "P0",
    status: "Done",
    owner: "Engineering Lead",
    deadline: "2026-08-16",
    progress: 100,
    description: "清零 23 个 vue-tsc 类型错误恢复 YiVad 可构建：knowledgeBase dashboard 17（TS2339 Refresh/Search、TS2345 DefaultRow→KnowledgeFileSummary）、rag 4（history/retrieval DefaultRow 收窄）、proTable 1（TS2344 泛型）、menuMange 1（TS2353 TreeOptionProps.value→node-key）。",
    subtasks: [
      {
        id: "flow-t-007-1",
        title: "修 knowledgeBase dashboard 17 错误",
        detail: "补 TS2339 Refresh/Search 引用，修正 TS2345 DefaultRow 类型。",
        acceptance: "该文件 vue-tsc 0 错误。"
      },
      {
        id: "flow-t-007-2",
        title: "修 rag history/retrieval 4 错误",
        detail: "DefaultRow 收窄为 HistoryEntry / RagSource。",
        acceptance: "两个文件 0 错误。"
      },
      {
        id: "flow-t-007-3",
        title: "修 proTable complexProTable 1 错误",
        detail: "修正泛型约束 TS2344。",
        acceptance: "该文件 0 错误。"
      },
      {
        id: "flow-t-007-4",
        title: "修 menuMange TreeOptionProps 1 错误",
        detail: "el-tree-select props.value 已从 TreeOptionProps 移除，改用 node-key。",
        acceptance: "该文件 0 错误。"
      }
    ]
  },
  {
    id: "flow-t-008",
    title: "跑门禁 + 产出测试报告与上线记录",
    role: "srer",
    roleIcon: "🔧",
    roleName: "SRE",
    goalId: "sre-001",
    skill: "lighthouse",
    agent: "SRE Agent",
    mcp: "github",
    listType: "sprint",
    priority: "P1",
    status: "Done",
    owner: "SRE Lead",
    deadline: "2026-08-16",
    progress: 100,
    description: "跑 vue-tsc + build 门禁，产出 04-test-report（typecheck/build 结果 + 手动验证）与 05-launch-record（artifact/version/env），上线可追溯。",
    subtasks: [
      {
        id: "flow-t-008-1",
        title: "跑 typecheck/build 门禁",
        detail: "vue-tsc --noEmit 与 pnpm build，确认 0 错误。",
        acceptance: "门禁通过，可构建。"
      },
      {
        id: "flow-t-008-2",
        title: "写测试报告",
        detail: "记录 typecheck/build 结果与手动验证结论。",
        acceptance: "04-test-report 落知识库。"
      },
      {
        id: "flow-t-008-3",
        title: "写上线记录",
        detail: "artifact/version/env 字段齐全，关联 goalId 与 taskId。",
        acceptance: "05-launch-record 落知识库。"
      }
    ]
  },
  {
    id: "flow-t-009",
    title: "补齐 7 角色三要素编排映射",
    role: "aier",
    roleIcon: "🤖",
    roleName: "AI Engineer",
    goalId: "aier-001",
    skill: "skill-creator",
    agent: "AI Engineer Agent",
    mcp: "yiai",
    listType: "weekly",
    priority: "P2",
    status: "Done",
    owner: "AI Engineer",
    deadline: "2026-08-16",
    progress: 100,
    description: "确认 7 角色 skill/agent/mcp 三要素确定性映射覆盖，AI 推荐按 WSJF 可复现，编排结果落盘可读回。",
    subtasks: [
      {
        id: "flow-t-009-1",
        title: "核对 7 角色三要素映射",
        detail: "ROLE_SKILL / ENGINEERING_ROLES 映射覆盖 7 角色。",
        acceptance: "每角色有缺省 skill/agent/mcp。"
      },
      {
        id: "flow-t-009-2",
        title: "校验 AI 推荐可复现",
        detail: "WSJF 评分 + 三要素解析走通，离线兜底可用。",
        acceptance: "推荐结果可复现、可落盘。"
      },
      {
        id: "flow-t-009-3",
        title: "校验编排落盘可读回",
        detail: "taskToMeta / taskFromMeta 往返一致。",
        acceptance: "三要素不丢失。"
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
    artifact: "OKR 自闭环 + 流程记录页",
    version: "v1.0.0",
    env: "prod",
    status: "live",
    deployedAt: "2026-08-16",
    goalId: "exec-001",
    taskId: "flow-t-006",
    description: "7 角色 OKR 重定义为「AI 全流程自闭环」，新增流程记录页聚合需求/技术/构建/测试/上线五类记录。"
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
