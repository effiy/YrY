/**
 * Role Knowledge Configuration — Single Source of Truth (SSOT)
 *
 * This file centralises all role/domain definitions so every knowledge
 * page reads from the same canonical source. It also bakes in
 * project-specific hard constraints / RED-LINES / Gold-Copy anchors
 * from YrY's six-project portfolio (YiPot, YiAi, YiVad, YiPet,
 * YiKnowledge, YiVad-Dashboard).
 *
 * Structure conventions (enforced by code review & linters):
 *   - subdir `id` MUST match the real YiKnowledge/<role>/<id> folder name
 *   - `color` MUST use semantic token names, NOT hardcoded hex — see below
 *   - `redLines` are rendered as immutable KPI cards per role
 *   - `goldCopyFiles` drive the Quick Reference / 5-Day onboarding rails
 *
 * Do NOT add a new role before adding its folder under YiKnowledge/.
 * Do NOT shadow these definitions inside individual pages.
 */

/* ──────────────────────────────────────────────────────────────────
 *  Semantic color tokens — NO numeric names per project memory rule
 *  (e.g. xs/sm/md rather than color-500/color-600).  Values are
 *  Element Plus semantic hues only.
 * ────────────────────────────────────────────────────────────────── */
export const ROLE_PALETTE = {
  primary: "#1677ff",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#7c3aed",
  pink: "#ec4899",
  slate: "#64748b"
} as const;

export type PaletteKey = keyof typeof ROLE_PALETTE;

/* ──────────────────────────────────────────────────────────────────
 *  Shared types
 * ────────────────────────────────────────────────────────────────── */
export interface SubdirDef {
  id: string;
  icon: string;
  label: string;
  color: string; // hex (resolved from ROLE_PALETTE above)
  desc: string;
}

export interface RedLineDef {
  /** short label like "YiPot 二进制体积" */
  label: string;
  /** numeric or text threshold like "≤ 18MB" */
  threshold: string;
  /** direction — bigger = worse or smaller = worse */
  direction: "max" | "min";
  /** unit — rendered next to the value on the dashboard */
  unit?: string;
  /** one-line rationale (shown in tooltip) */
  rationale: string;
  /** external reference anchor (YiKnowledge relative path or issue #) */
  ref?: string;
}

export interface QuickRefDef {
  want: string;          // "Design or optimize RAG"
  file: string;          // relative path inside the role folder
  icon: string;
  /** optional maturity / confidence badge (1–5 ★) */
  confidence?: 1 | 2 | 3 | 4 | 5;
}

export interface OnboardingStep {
  day: 1 | 2 | 3 | 4 | 5;
  title: string;
  /** 3–5 concrete items the newcomer MUST complete that day */
  checklist: string[];
  /** trap / gotcha — drawn from Lessons Learned in project_memory */
  pitfall?: string;
}

export interface RoleDef {
  id: string;
  title: string;
  /** singular noun used in "Knowledge <DomainsWord>" headings */
  domainsWord: string;
  description: string;
  structuralTags: string[];
  subdirs: SubdirDef[];
  /** Immutable quality-gate KPI cards rendered on the dashboard */
  redLines: RedLineDef[];
  /** Canonical Quick-Reference entries (maximum 10) */
  quickRefs: QuickRefDef[];
  /** 5-day onboarding / ramp-up checklist (industry proven Simon method) */
  onboarding: OnboardingStep[];
}

/* ──────────────────────────────────────────────────────────────────
 *  1 — Executive  (决策层)
 * ────────────────────────────────────────────────────────────────── */
const EXECUTIVE: RoleDef = {
  id: "executive",
  title: "Executive",
  domainsWord: "Decision Domains",
  description:
    "Strategy, industry radar, roadmap planning, reading-list orchestration, and cross-book decision framework (Drucker ↔ Grove ↔ Horowitz 'Iron Triangle').",
  structuralTags: ["resources", "product", "product-management", "product-strategy"],
  subdirs: [
    {
      id: "strategy",
      icon: "🎯",
      label: "Strategy",
      color: ROLE_PALETTE.danger,
      desc:
        "Porter's Five Forces · Blue Ocean · SWOT · VRIO · Business Model Canvas · Value Proposition Design — aligned with YrY OKR cadence."
    },
    {
      id: "industry",
      icon: "🏭",
      label: "Industry Radar",
      color: ROLE_PALETTE.primary,
      desc:
        "AI industry reports (Gartner, McKinsey, a16z, CAICT) · competitor landscape mapping · quarterly market briefing pack."
    },
    {
      id: "roadmap",
      icon: "🗺️",
      label: "Roadmap",
      color: ROLE_PALETTE.success,
      desc:
        "Annual planning · QBR cadence · OKR ↔ PRD ↔ Dev ↔ Test traceability · headcount & budget planning · 5-step verification flow."
    },
    {
      id: "reading-list",
      icon: "📚",
      label: "Reading List (v3.2)",
      color: ROLE_PALETTE.purple,
      desc:
        "Single Source of Truth for executive development — 9-field book records, RICE ≥ 60 admission, 12/12 5★ core insights (I-01~I-12)."
    },
    {
      id: "okr",
      icon: "🎯",
      label: "OKR Hub",
      color: ROLE_PALETTE.warning,
      desc: "Role-specific OKR dashboards, confirmation-gate metrics, and 5-step verification (KR→PRD→Dev→Test→Evidence)."
    },
    {
      id: "rss",
      icon: "📡",
      label: "RSS Briefing",
      color: ROLE_PALETTE.pink,
      desc: "Monthly-pruned RSS feed corpus · AI curation digest · executive 3-page weekly briefing."
    },
    {
      id: "process",
      icon: "🔁",
      label: "Process Records",
      color: ROLE_PALETTE.slate,
      desc: "8-stage AI loop lifecycle records · process KPIs · evidence chain for audit / retrospectives."
    }
  ],
  redLines: [
    {
      label: "跨书洞察 5★ 覆盖率",
      threshold: "≥ 12",
      direction: "min",
      unit: "条",
      rationale: "决策铁三角（Drucker 原则层 ↔ Grove 方法层 ↔ Horowitz 反模式层）+ 西蒙认知层的全交叉验证，12/12 = 100% 置信度。",
      ref: "executive/reading-list/001-阅读-阅读清单.md §跨书洞察矩阵"
    },
    {
      label: "阅读清单 RICE 准入分",
      threshold: "≥ 60",
      direction: "min",
      unit: "分",
      rationale: "RICE ≥ 60 才能纳入季度排期，防止低杠杆书籍挤占高管带宽。",
      ref: "executive/reading-list/001-阅读-阅读清单.md §准入规则"
    },
    {
      label: "QBR OKR 证据完整率",
      threshold: "≥ 90%",
      direction: "min",
      unit: "%",
      rationale: "每条 KR 必须追溯到具体的 PRD 编号，且具备测试/验收证据（5 步验证法 Step 5）。",
      ref: "projects/INDEX.md §质量门禁 Q-08"
    },
    {
      label: "每月 RSS 剪枝率",
      threshold: "≥ 80%",
      direction: "min",
      unit: "%",
      rationale: "严格遵循月份剪枝逻辑：仅当 rag.include_rss_current_month=true 时处理当月目录，防止历史 RSS 无限膨胀。"
    }
  ],
  quickRefs: [
    { want: "阅读清单主控 v3.2", file: "reading-list/001-阅读-阅读清单.md", icon: "📚", confidence: 5 },
    { want: "卓有成效的管理者笔记", file: "reading-list/010-阅读-读书笔记-卓有成效的管理者.md", icon: "🎯", confidence: 5 },
    { want: "西蒙学习法笔记", file: "reading-list/008-阅读-读书笔记-西蒙学习法.md", icon: "🧠", confidence: 5 },
    { want: "剑指前端 offer 笔记", file: "reading-list/009-阅读-读书笔记-剑指前端offer.md", icon: "💻", confidence: 5 },
    { want: "OKR 全链路追溯图", file: "projects/INDEX.md", icon: "🔗", confidence: 5 },
    { want: "项目质量门禁 (21项)", file: "projects/INDEX.md", icon: "🛃", confidence: 5 },
    { want: "决策铁三角框架", file: "reading-list/010-阅读-读书笔记-卓有成效的管理者.md", icon: "📐", confidence: 5 },
    { want: "RSS 月度剪枝规范", file: "rss/README.md", icon: "📡", confidence: 4 }
  ],
  onboarding: [
    {
      day: 1,
      title: "环境与角色认知",
      checklist: [
        "阅读 projects/README.md 六角色主线图并勾选",
        "在 YiVad 中开通 Executive 角色并确认可访问 /knowledge/executive",
        "克隆 YiKnowledge 仓库，确认 reading-list 目录可读写"
      ],
      pitfall: "不要直接用默认的 all 角色视图，必须按 Executive 视图过滤，否则 RSS 条目会混入导致 KPI 虚高。"
    },
    {
      day: 2,
      title: "阅读清单 SSOT 操作",
      checklist: [
        "完成 001-阅读-阅读清单.md 首页 Dashboard 指标校验",
        "为一本待办书籍补齐 RICE 9 字段并运行准入检查（RICE ≥ 60）",
        "将一条新笔记的跨书支撑至少关联 3 个 I-xx 洞察项"
      ],
      pitfall: "严禁在 001 之外再创建汇总文件，v3.2 已彻底废弃 003 汇总文件，否则会产生约 6200 字冗余。"
    },
    {
      day: 3,
      title: "OKR ↔ PRD 追溯练习",
      checklist: [
        "从 INDEX.md 的 Mermaid 全链路图中任选一条 KR → PRD 链路",
        "在 YiVad Project Detail 中定位对应 PRD 的 Dev 和 Test 证据",
        "将证据链 URL 填入 KR 的 `evidence` 字段"
      ],
      pitfall: "OKR 证据不得是截图或口头描述，必须是可点击的 Git 锚点。"
    },
    {
      day: 4,
      title: "决策铁三角实战",
      checklist: [
        "选取一项真实的产品决策（例：是否启用 Embedding 缓存）",
        "分别用 Drucker (原则层) + Grove (方法层) + Horowitz (反模式层) 写出三方论证",
        "产出 1 页 ADR 并提交到 YiKnowledge/projects/<project>/adr/"
      ],
      pitfall: "ADR 必须包含 8 个强制字段：类别 / 状态 / 生命周期 / 评审周期 / 角色 / 收益 / 验收标准 / 关联记录。"
    },
    {
      day: 5,
      title: "QBR 演练与交付",
      checklist: [
        "独立完成一份 15 分钟的 QBR 汇报材料，指标均引用 001 Dashboard",
        "同事扮演 CFO / Head-of-People 交叉质询 10 分钟",
        "将决策行动项按 6 大知识域映射归档（executive/roadmap/strategy/projects/leader/curator）"
      ],
      pitfall: "行动项必须满足「可证伪性」：场景 + DDL + 锚点 + 回退触发器，基线目标建议 90% 完成率。"
    }
  ]
};

/* ──────────────────────────────────────────────────────────────────
 *  2 — AI Engineer  (AI 工程化)
 * ────────────────────────────────────────────────────────────────── */
const AIER: RoleDef = {
  id: "aier",
  title: "AI Engineer",
  domainsWord: "Knowledge Areas",
  description:
    "AI foundations · agent engineering methods · platform selection · ML patterns · YiAi RPC contracts & RAG kill-switch governance.",
  structuralTags: ["prompts", "yiAi", "rag"],
  subdirs: [
    {
      id: "foundations",
      icon: "🧠",
      label: "Foundations",
      color: ROLE_PALETTE.primary,
      desc:
        "Transformer · Attention · KV-cache · MoE routing · long-context scaling · quantization · alignment · multimodal fusion · RAG pattern catalog."
    },
    {
      id: "methods",
      icon: "📐",
      label: "Methods",
      color: ROLE_PALETTE.success,
      desc:
        "Agent architecture · prompt engineering · 7 production prompt templates · LLM / Agent evaluation · YiAi Agent harness plugin architecture."
    },
    {
      id: "platform",
      icon: "🖥️",
      label: "Platform",
      color: ROLE_PALETTE.purple,
      desc:
        "LLM provider decision framework · embedding model evaluation · vector database trade-offs · BM25 ↔ Hybrid retrieval baseline."
    },
    {
      id: "machine-learning",
      icon: "🔬",
      label: "ML Alternatives",
      color: ROLE_PALETTE.warning,
      desc:
        "Classification · clustering · regression · anomaly detection — used when LLMs are overkill or latency budget ≤ 200ms."
    },
    {
      id: "okr",
      icon: "🎯",
      label: "AI OKR",
      color: ROLE_PALETTE.danger,
      desc:
        "AI team quarterly OKRs · orchestration coverage · agent completion rates · confirmation gates (YiAi RPC backend port 10086)."
    }
  ],
  redLines: [
    {
      label: "YiAi SSE 统一端口",
      threshold: "10086",
      direction: "max",
      unit: "端口",
      rationale: "所有 YiAi SSE 必须统一走 yiAiBaseUrl (默认 http://localhost:10086)，废弃 7777 / 8787 历史端口，防止前端竞态。",
      ref: "src/config/yiAi.ts"
    },
    {
      label: "Embedding 请求节流",
      threshold: "≥ 3000",
      direction: "min",
      unit: "ms",
      rationale: "两次 /api/embeddings HTTP 请求之间强制 ≥ 3s 间隔，防止 embedding 模型过载与突发费用高峰。",
      ref: "YiAi/src/domain/rag/settings.ts `embed_min_interval_ms`"
    },
    {
      label: "RAG Embedding 默认开关",
      threshold: "KILL-SWITCH = ON",
      direction: "min",
      rationale:
        "全局 RAG_EMBED_KILL_SWITCH 默认开启（默认走 BM25），仅在大手动触发路径下通过 allow_embed_scope 临时开启 Embedding。",
      ref: "YiAi/src/domain/rag/settings.ts `RAG_EMBED_KILL_SWITCH`"
    },
    {
      label: "kb_indexer Reader 类型",
      threshold: "禁止 SimpleDirectoryReader",
      direction: "min",
      rationale: "kb_indexer.py 必须使用内置二级缓存机制，禁止直接使用 LlamaIndex 的 SimpleDirectoryReader，否则每次索引会全量重算。",
      ref: "YiAi/src/domain/rag/kb_indexer.py"
    },
    {
      label: "Agent 编排覆盖率 (O-01)",
      threshold: "≥ 95%",
      direction: "min",
      unit: "%",
      rationale: "YiAi 平台入口 Agent 执行路径必须通过 orchestration 统一调度，避免业务方直接在 JS 侧写死 prompt。",
      ref: "YiKnowledge/aier/okr/2026-Q3/aier-001-orchestration"
    }
  ],
  quickRefs: [
    { want: "LLM 核心概念速查", file: "foundations/001-基础-LLM基础.md", icon: "🧠", confidence: 5 },
    { want: "RAG 设计模式 BM25↔Hybrid", file: "foundations/002-基础-RAG设计模式.md", icon: "🔍", confidence: 5 },
    { want: "Agent 架构模式 (YiAi)", file: "methods/001-方法-Agent架构模式.md", icon: "🤖", confidence: 5 },
    { want: "7 套生产级 Prompt", file: "methods/005-方法-提示词工程.md", icon: "✍️", confidence: 5 },
    { want: "LLM 评估框架", file: "methods/004-方法-LLM评估.md", icon: "📊", confidence: 4 },
    { want: "Agent 评估 (Completion/Gate)", file: "methods/002-方法-Agent评估.md", icon: "🎯", confidence: 5 },
    { want: "AI 安全与防护 (STRIDE)", file: "foundations/003-基础-AI安全与防护.md", icon: "🛡️", confidence: 4 },
    { want: "Embedding 模型选型", file: "platform/001-平台-Embedding模型选型.md", icon: "📐", confidence: 4 },
    { want: "向量数据库选型", file: "platform/003-平台-向量数据库选型.md", icon: "🗄️", confidence: 4 },
    { want: "YiAi RPC 契约清单", file: "methods/003-方法-Agent-Harness插件架构.md", icon: "🔌", confidence: 5 }
  ],
  onboarding: [
    {
      day: 1,
      title: "YiAi 环境与端口",
      checklist: [
        "启动 YiAi (uvicorn app:app --port 10086) 并验证 /health",
        "在 YiVad .env 中验证 RSBUILD_ENV_API_URL 指向 yiAiBaseUrl",
        "关闭后再打开一次 YiVad，确认前端没有残留的 7777 / 8787 硬编码请求"
      ],
      pitfall: "不要改前端的 yiAiBaseUrl，必须走环境变量。详见最近清理记录。"
    },
    {
      day: 2,
      title: "RAG 基线下探",
      checklist: [
        "关闭 RAG_EMBED_KILL_SWITCH 的旁路（即默认情况），验证一次 BM25-only 召回",
        "记录 recall@5、latency p95，写入 YiKnowledge/aier/foundations/002-基础-RAG设计模式.md",
        "尝试一次 allow_embed_scope 手动路径，对比缓存命中情况"
      ],
      pitfall: "两次 /api/embeddings 之间有 3s 节流，批量测试必须自己加队列延迟，否则会被 Abort。"
    },
    {
      day: 3,
      title: "Agent Harness 插件开发",
      checklist: [
        "阅读 methods/003-方法-Agent-Harness插件架构.md，了解 CAP 能力清单",
        "参照 Gold-Copy 模板写一个最小的 echo 插件",
        "用 Agent 评估框架跑一次 Task Completion Rate 基线"
      ],
      pitfall: "插件必须 Ed25519 三级签名后才能进入 PROD，沙箱 FS 访问受严格 RBAC 限制（禁读敏感 config/token，禁写 backup 目录）。"
    },
    {
      day: 4,
      title: "Evaluation 集成",
      checklist: [
        "将一个新任务加入 methods/002-方法-Agent评估.md 的测试集",
        "跑一次 confirmation-gate (aier-003) 并提交结果",
        "确认结果同步到 2026-Q3 OKR 目录 goal.md"
      ],
      pitfall: "confirmation-gate 必须是 3 次运行的 p95，单次通过不算。"
    },
    {
      day: 5,
      title: "PR 准备 & 质量门禁",
      checklist: [
        "在 YiAi 中跑 ruff + mypy + pytest (nextest 并行) + tarpaulin 覆盖率",
        "在 YiVad 中跑 vitest + e2e smoke.spec.ts",
        "写一条 ADR（如果是架构变更）并推送到 YiKnowledge"
      ],
      pitfall: "YiPot 二进制体积红线 18MB，超线必须提交裁剪方案（LTO / strip / 禁用 unused deps）。"
    }
  ]
};

/* ──────────────────────────────────────────────────────────────────
 *  3 — SRE  (站点可靠性工程)
 * ────────────────────────────────────────────────────────────────── */
const SRE: RoleDef = {
  id: "sre",
  title: "SRE",
  domainsWord: "Reliability Domains",
  description:
    "Incident response · observability · release engineering · Burn-Rate发布门禁 · 6 套季度 GameDay 演练方案.",
  structuralTags: ["yiPot", "yiAi", "yiVad", "slo", "sli"],
  subdirs: [
    {
      id: "incident-response",
      icon: "🚨",
      label: "Incident Response",
      color: ROLE_PALETTE.danger,
      desc:
        "War room protocol · blast radius analysis · rollback drills · oncall handover · postmortems · chaos engineering experiments (GameDays)."
    },
    {
      id: "observability",
      icon: "📊",
      label: "Observability",
      color: ROLE_PALETTE.primary,
      desc:
        "Logs / Metrics / Traces triad · K8s monitoring · GPU inference observability · CI/CD visibility · SLO burn-rate dashboards."
    },
    {
      id: "release",
      icon: "🚀",
      label: "Release Engineering",
      color: ROLE_PALETTE.success,
      desc:
        "Canary releases · hotfix protocol · release-freeze windows · progressive delivery · YiPot binary size ≤ 18MB hard gate."
    },
    {
      id: "runbooks",
      icon: "📕",
      label: "SRE Runbooks",
      color: ROLE_PALETTE.purple,
      desc:
        "12-steps for each common incident (memory leak, deadlock, macOS CGEventTap hang, Rust MutexGuard across await, etc.)."
    }
  ],
  redLines: [
    {
      label: "翻译 P95 延迟",
      threshold: "≤ 1000",
      direction: "max",
      unit: "ms",
      rationale: "YiPot 翻译 SLO：P95 ≤ 1s。超限触发 SRE 告警路由（企业微信 IM），2h 内必须响应。",
      ref: "YiKnowledge/sre/README.md §SLO 体系"
    },
    {
      label: "OCR P95 延迟",
      threshold: "≤ 2000",
      direction: "max",
      unit: "ms",
      rationale: "YiPot OCR SLO：P95 ≤ 2s。",
      ref: "YiKnowledge/sre/README.md §SLO 体系"
    },
    {
      label: "Crash Free 率",
      threshold: "≥ 99.9",
      direction: "min",
      unit: "%",
      rationale: "YiPot 桌面端 Crash Free ≥ 99.9%，对应约 1/1000 启动崩溃。",
      ref: "YiKnowledge/sre/README.md §SLA/SLO/SLI 指标体系"
    },
    {
      label: "RSS 24h 内存泄漏",
      threshold: "< 10",
      direction: "max",
      unit: "MB",
      rationale: "长期驻留的 RSS 聚合器 24h 内存增长 < 10MB，否则触发 Heap Profiler 复盘。"
    },
    {
      label: "发布 Burn-Rate 门禁",
      threshold: "≤ 14.4% / 1h",
      direction: "max",
      unit: "error budget",
      rationale:
        "窗口 1h Burn-Rate > 14.4% 自动暂停 Canary 并触发 SRE 人工介入，防止错误预算在短时间内耗尽（SRE Workbook Ch.5）。",
      ref: "YiKnowledge/sre/README.md §Burn Rate 发布门禁"
    },
    {
      label: "YiPot 二进制体积",
      threshold: "≤ 18",
      direction: "max",
      unit: "MB",
      rationale: "二进制体积红线，超线必须裁剪（strip/LTO/移除 unused features），否则 CI release job 失败。",
      ref: "YiPot/src-tauri/Cargo.toml profile.release"
    }
  ],
  quickRefs: [
    { want: "SLO / Burn-Rate 速算表", file: "observability/README.md", icon: "📉", confidence: 5 },
    { want: "GameDay 季度演练方案", file: "incident-response/README.md", icon: "🎲", confidence: 5 },
    { want: "Rust 死锁诊断 (锁序约定)", file: "runbooks/Rust-Deadlock-Diagnosis.md", icon: "🔐", confidence: 5 },
    { want: "macOS CGEventTap 自恢复 Runbook", file: "runbooks/macOS-CGEventTap-Self-Heal.md", icon: "⌨️", confidence: 4 },
    { want: "内存泄漏定位 (leaks/sanic)", file: "runbooks/Memory-Leak-Runbook.md", icon: "🧪", confidence: 4 },
    { want: "Canary 回滚 Runbook", file: "release/README.md", icon: "⏪", confidence: 5 },
    { want: "零信任插件沙箱安全模型", file: "observability/Plugin-Zero-Trust.md", icon: "🛡️", confidence: 5 },
    { want: "跨项目契约矩阵 (C-001)", file: "release/跨项目契约矩阵-C001.md", icon: "🔗", confidence: 5 }
  ],
  onboarding: [
    {
      day: 1,
      title: "SRE 工具链初始化",
      checklist: [
        "安装 nextest / tarpaulin / miri / clippy -Dw 工具链",
        "配置 YiPot 本地调试 — 启用 tauri.conf.json 中的 devtools",
        "熟悉 SRE KPI Dashboard (translation / OCR / crash-free) 的各 Panel"
      ],
      pitfall: "clippy -Dw 会把所有 warning 当错误，先本地修干净再提 PR。"
    },
    {
      day: 2,
      title: "SLO / Burn-Rate 实操",
      checklist: [
        "任选一个 SLI，手工计算 1h / 6h Burn-Rate",
        "尝试人为制造一个 Burn-Rate > 14.4% 的假告警，验证企业微信 IM 通路",
        "在 sre/observability/README.md 中补充一个未覆盖场景"
      ],
      pitfall: "错误预算不要按月均摊，突发流量会让 1h Burn-Rate 很高但月度没问题——必须设双窗口门禁。"
    },
    {
      day: 3,
      title: "YiPot 内存 / 死锁排障",
      checklist: [
        "按 Runbook 走完一遍 Rust Deadlock Diagnosis",
        "确认锁顺序约定：CONFIG < PLUGIN < BACKUP < WINDOW，任何反序加锁必须改代码",
        "阅读 YiPot 最近 3 份 postmortem 文件"
      ],
      pitfall: "跨 await 持有 MutexGuard 是 YiPot 死锁 #1 原因，parking_lot 提供了 const mutex 但仍需严格锁序。"
    },
    {
      day: 4,
      title: "GameDay 演练参与",
      checklist: [
        "加入当季 GameDay 日历（例：Q4 第 2 周的「翻译服务全断 + 插件沙箱逃逸」演练）",
        "担任 Incident Commander 或 Scribe 角色 1 次",
        "按 5 Whys 模板产出一份 postmortem 草稿"
      ],
      pitfall: "GameDay 必须在 staging 环境跑，严禁在 prod 模拟真实事故。"
    },
    {
      day: 5,
      title: "PR 门禁 + 发布流程",
      checklist: [
        "在本地尝试用 LTO + strip 编译 YiPot release，检查二进制体积",
        "如果超 18MB，输出裁剪方案（移除依赖 / 关闭 feature）",
        "独立执行一次 Canary 发布模拟 (10% → 30% → 100%)，每步检查 Burn-Rate"
      ],
      pitfall: "Release Freeze Window（重大节假日前 5 天）禁止发布非 hotfix，PR 会被合并按钮锁定。"
    }
  ]
};

/* ──────────────────────────────────────────────────────────────────
 *  4 — Tech Lead  (技术负责人)
 * ────────────────────────────────────────────────────────────────── */
const LEADER: RoleDef = {
  id: "leader",
  title: "Tech Lead",
  domainsWord: "Leadership Domains",
  description:
    "Architecture decisions · technology selection · capacity planning · risk management · technical roadmap & ADR discipline.",
  structuralTags: ["yivad", "yiai", "yipet", "yipot", "adr"],
  subdirs: [
    {
      id: "architecture",
      icon: "🏛️",
      label: "Architecture",
      color: ROLE_PALETTE.primary,
      desc:
        "Maturity model assessments · architecture decision records · technology selection evaluations · system coherence strategy."
    },
    {
      id: "decisions",
      icon: "📝",
      label: "ADR Library",
      color: ROLE_PALETTE.success,
      desc:
        "Architecture Decision Records (8 mandatory fields) organised by project — YiPot / YiAi / YiVad / YiPet / FDE."
    },
    {
      id: "risk",
      icon: "⚠️",
      label: "Risk",
      color: ROLE_PALETTE.danger,
      desc:
        "STRIDE threat modelling · risk register · dependency risk · outage communication protocol · postmortem methodology."
    },
    {
      id: "capacity",
      icon: "📈",
      label: "Capacity & FinOps",
      color: ROLE_PALETTE.warning,
      desc:
        "Capacity planning · cost management · FinOps reviews · cost-overrun handling · dependency audits across all four services."
    },
    {
      id: "roadmap",
      icon: "🗺️",
      label: "Tech Roadmap",
      color: ROLE_PALETTE.purple,
      desc:
        "SLO definition · tech-debt portfolio · PoC evaluation · service decommissioning · feature deprecation cadence."
    }
  ],
  redLines: [
    {
      label: "ADR 强制字段数",
      threshold: "8 / 8",
      direction: "min",
      unit: "项",
      rationale:
        "所有 ADR 必须包含 8 个字段：类别 / 状态 / 生命周期 / 评审周期 / 角色 / 收益 / 验收标准 / 关联记录。缺项打回。",
      ref: "YiKnowledge/projects/README.md §ADR 规范"
    },
    {
      label: "STRIDE 威胁建模覆盖",
      threshold: "≥ 100%",
      direction: "min",
      unit: "%",
      rationale: "任何插件接入 / 跨项目 API 新增 / 持久化层改造，必须附带 STRIDE 6 维分析。",
      ref: "YiKnowledge/leader/risk/README.md §STRIDE 模板"
    },
    {
      label: "Rust 代码 unwrap()",
      threshold: "0",
      direction: "max",
      unit: "处",
      rationale: "YiPot Rust 代码中禁止 unwrap()，tray 菜单 label 要用 unwrap_or(default)。clippy 会拦截。",
      ref: "YiPot/src-tauri/Cargo.toml clippy extra-restrictions"
    },
    {
      label: "YiPot 自动更新模块",
      threshold: "物理删除 updater.rs",
      direction: "min",
      rationale:
        "updater.rs、main.rs 及 window.rs 中所有自动更新引用必须物理删除 + 空挂桩移除，严禁在代码中保留。",
      ref: "YiPot/src-tauri/src/Cargo.toml (build-dependencies 无 tauri-plugin-updater)"
    },
    {
      label: "Rust 全局锁序约定",
      threshold: "CONFIG < PLUGIN < BACKUP < WINDOW",
      direction: "min",
      rationale: "任何全局 Mutex 必须遵循全局锁序，反向加锁 = 潜在死锁。代码审查阶段必须要求调序。",
      ref: "YiKnowledge/sre/runbooks/Rust-Deadlock-Diagnosis.md"
    }
  ],
  quickRefs: [
    { want: "ADR 8 字段 Gold Copy", file: "decisions/ADR-Template.md", icon: "📝", confidence: 5 },
    { want: "STRIDE 威胁建模模板", file: "risk/STRIDE-Template.md", icon: "🛡️", confidence: 5 },
    { want: "微前端 4×4×4 决策矩阵", file: "architecture/微前端决策矩阵-4x4x4.md", icon: "🧩", confidence: 5 },
    { want: "技术债务分层管理法", file: "roadmap/Tech-Debt-Portfolio.md", icon: "📉", confidence: 4 },
    { want: "PoC 评估 Checklist", file: "capacity/PoC-Evaluation-Checklist.md", icon: "🔬", confidence: 4 },
    { want: "跨项目锁序约定", file: "architecture/全局锁序约定-Rust.md", icon: "🔐", confidence: 5 },
    { want: "前端性能基线 (p95)", file: "architecture/前端性能红线-V3.md", icon: "⚡", confidence: 5 }
  ],
  onboarding: [
    {
      day: 1,
      title: "ADR 纪律与 5 项目全貌",
      checklist: [
        "通读 YiPot / YiAi / YiVad / YiPet / YiKnowledge 5 份 README 红线章节",
        "找出最近 3 份已合并 ADR，逐条对比 8 字段是否齐全",
        "在 /knowledge/leader 页面上试用 filters (Status = active, Lifecycle = evolving)"
      ],
      pitfall: "ADR 文件名要从简写映射到正式三位编号文件名，禁止 0001、禁止重复前缀如 yivad-yivad-003。"
    },
    {
      day: 2,
      title: "STRIDE 实战演练",
      checklist: [
        "选一个现有跨项目接口（例：YiVad → YiAi rag/search）",
        "写出 STRIDE 6 维 (S/T/R/I/D/E) 各自的威胁 + 缓解措施",
        "将结果追加到 risk/README.md 对应章节"
      ],
      pitfall: "跨项目接口必须同时走 C-001 契约矩阵（令牌桶限流 + 5 级回滚 L1-L5）。"
    },
    {
      day: 3,
      title: "容量规划 & 成本估算",
      checklist: [
        "选一个服务（例：YiAi embeddings 批量任务），估算月成本",
        "用 95 百分位而非均值做容量基线",
        "把 FinOps Review 项录入 capacity/FinOps-YYYY-QN.md"
      ],
      pitfall: "Embedding 缓存取消 2000 字符门槛后，embedding 批次数会涨 20~30%，容量估算要包含这个变化。"
    },
    {
      day: 4,
      title: "架构决策复盘 (ADR Review)",
      checklist: [
        "从 ADR 库中挑一份 deprecated 状态的旧决策",
        "写出为什么当时选了它、为什么现在弃用、迁移成本多少",
        "在团队 15 分钟 standup 中口头汇报，接受挑战"
      ],
      pitfall: "架构决策要保持「可证伪性」——每个 ADR 的 accept criteria 必须可量化，否则无法判断成功/失败。"
    },
    {
      day: 5,
      title: "Tech Lead 交付清单",
      checklist: [
        "产出 1 份 Tech Roadmap PRD（含 SLO、tech-debt 回收比例、PoC 试点列表）",
        "和 Executive 对 OKR，对齐 5 步验证法追溯",
        "签署本周所有 PR 的 merge request（核对锁序 + ADR 引用）"
      ],
      pitfall: "任何 merge 了的代码如果违反硬约束（unwrap / 锁序 / updater.rs 残留），Tech Lead 负直接责任，需要在 postmortem 上署名。"
    }
  ]
};

/* ──────────────────────────────────────────────────────────────────
 *  5 — Product Manager  (产品)
 * ────────────────────────────────────────────────────────────────── */
const PRODUCT: RoleDef = {
  id: "product",
  title: "Product Manager",
  domainsWord: "Product Domains",
  description:
    "Frameworks · discovery · delivery rituals · strategy & case studies · per-project product visibility.",
  structuralTags: ["product", "product-management", "yivad", "yiai", "yipet", "yipot"],
  subdirs: [
    {
      id: "frameworks",
      icon: "🧩",
      label: "Frameworks",
      color: ROLE_PALETTE.primary,
      desc:
        "RICE / ICE prioritisation · MoSCoW · JTBD · Kano model · story mapping · OKR design · dual-track agile · lean startup."
    },
    {
      id: "discovery",
      icon: "🔍",
      label: "Discovery",
      color: ROLE_PALETTE.success,
      desc:
        "PRD writing (Gold-Copy template) · Nielsen heuristics · accessibility · IA · AI product analytics · AARRR / NPS / DORA."
    },
    {
      id: "delivery",
      icon: "🚀",
      label: "Delivery",
      color: ROLE_PALETTE.purple,
      desc:
        "Sprint five rituals · async meetings · design reviews · retrospectives · quarterly planning · stakeholder cadence."
    },
    {
      id: "strategy",
      icon: "🎯",
      label: "Strategy & Cases",
      color: ROLE_PALETTE.danger,
      desc:
        "AI after-sales case studies · RAG agent deployments · PMF validation · competitive analysis · feature adoption playbook."
    },
    {
      id: "projects",
      icon: "📦",
      label: "Per-Project PM",
      color: ROLE_PALETTE.warning,
      desc: "YiPot / YiAi / YiVad / YiPet per-project product coordination · iteration planning · stakeholder visibility."
    }
  ],
  redLines: [
    {
      label: "PRD 字段完整率",
      threshold: "100%",
      direction: "min",
      unit: "%",
      rationale:
        "PRD 必须覆盖 15 Frontmatter 字段 + 5 天新人上手路线图，缺一不可。详见 YiKnowledge/projects/*/prds/ 模板。",
      ref: "YiKnowledge/projects/README.md §PRD 规范"
    },
    {
      label: "Frontmatter 强制字段",
      threshold: "15 / 15",
      direction: "min",
      unit: "项",
      rationale: "知识库文档 Frontmatter 必须遵循 15 字段规范，含 benefit 字段。",
      ref: "YiKnowledge/projects/README.md §Frontmatter 红线"
    },
    {
      label: "YiVad LCP 性能",
      threshold: "≤ 2.0",
      direction: "max",
      unit: "s",
      rationale: "YiVad 前端 LCP p95 ≤ 2.0s。超过必须触发 Rsbuild / Vite 切换回退机制。",
      ref: "YiKnowledge/projects/yivad/README.md §前端性能红线"
    },
    {
      label: "Rsbuild HMR",
      threshold: "≤ 650",
      direction: "max",
      unit: "ms",
      rationale: "YiVad 开发环境 HMR p95 ≤ 650ms，不达标默认禁用 tsChecker (tools.tsChecker: false)。",
      ref: "YiVad/rsbuild.config.ts tools.tsChecker"
    },
    {
      label: "前端性能测量方法",
      threshold: "p95 + ≥10 次",
      direction: "min",
      rationale: "前端性能测量必须是 p95 指标 + 至少 10 次测量均值，严禁「体感法」直接进入 PR 描述。",
      ref: "YiKnowledge/projects/yivad/README.md §前端性能测量标准"
    }
  ],
  quickRefs: [
    { want: "PRD Gold-Copy 模板", file: "discovery/01-发现-编写PRD.md", icon: "📝", confidence: 5 },
    { want: "RICE / ICE 优先级评分", file: "frameworks/06-框架-RICE-ICE优先级.md", icon: "📊", confidence: 5 },
    { want: "MoSCoW 四象限分法", file: "frameworks/04-框架-MoSCoW优先级.md", icon: "🎯", confidence: 4 },
    { want: "JTBD 框架", file: "frameworks/02-框架-JTBD框架摘要.md", icon: "🔧", confidence: 5 },
    { want: "Kano 模型", file: "frameworks/03-框架-Kano模型摘要.md", icon: "📈", confidence: 5 },
    { want: "OKR 设计原则 & 反模式", file: "frameworks/05-框架-OKR设计摘要.md", icon: "🎯", confidence: 5 },
    { want: "Sprint 5 大仪式", file: "delivery/01-交付-运作Sprint.md", icon: "🔄", confidence: 5 },
    { want: "Story Mapping 用户故事地图", file: "frameworks/07-框架-用户故事地图.md", icon: "🗺️", confidence: 4 },
    { want: "前端 4×4×4 决策矩阵", file: "frameworks/前端-4x4x4-决策矩阵.md", icon: "🧩", confidence: 5 }
  ],
  onboarding: [
    {
      day: 1,
      title: "角色 & 四项目全景",
      checklist: [
        "通读 YiPot / YiAi / YiVad / YiPet 四份 project README 的 §0.1 三阶入门红线",
        "在 YiVad 开通 Product 角色并确认能访问 4 个项目页",
        "熟悉 §0.2 六角色主线图：你在哪里、上下游是谁"
      ],
      pitfall: "项目的 aliases 至少 5 条（例如 YiPot 的 yipot / desktop / 翻译 等），命令面板要用别名匹配，不要只靠 menu path。"
    },
    {
      day: 2,
      title: "PRD 写作练习",
      checklist: [
        "选一个真实小功能（例：YiVad Knowledge 页面 Cmd+K 跳转）",
        "按 15 Frontmatter 字段 + 5 天路线图写出 PRD",
        "让一位 Engineer 评审，记录至少 3 条被打回的理由"
      ],
      pitfall: "benefit 字段要用「动词 + 可量化收益」，例如「HMR 时间从 900ms 降到 600ms」，不能写「提升体验」。"
    },
    {
      day: 3,
      title: "RICE / Kano / MoSCoW 组合拳",
      checklist: [
        "选 10 条 backlog，独立打出 RICE 分",
        "用 Kano 标 3 个 must-be / 3 个 performance / 4 个 attractive",
        "用 MoSCoW 映射到 Sprint，产出本期 Sprint backlog"
      ],
      pitfall: "RICE ≥ 60 是 Executive 层的准入线，产品层可以放宽到 40，但要标注 Executive review pending。"
    },
    {
      day: 4,
      title: "Sprint 仪式 & 跨团队沟通",
      checklist: [
        "主持一场 Sprint Planning（输入 = 上一步产出的 backlog）",
        "主持一场 Daily Standup (15 min)，用昨日/今日/阻塞三段式",
        "主持一场 Retro（Start / Stop / Continue 结构），产出 ≥ 3 条改进 Action"
      ],
      pitfall: "Retro 必须写 Action + Owner + DDL，光吐槽不行动就是浪费所有人时间。"
    },
    {
      day: 5,
      title: "前端性能 & 微前端决策",
      checklist: [
        "用 Rsbuild HMR 工具在本机测 10 次 YiVad HMR，取 p95",
        "若超 650ms，走禁用 tsChecker 优化回退并记录到 PRD",
        "对当前 YrY 架构做一次「反上马 5 条」审计，逐条记录结果"
      ],
      pitfall: "即使 5 条都达标，微前端也要先做 PoC，4 周后再评估是否正式引入——不能一步到位上生产。"
    }
  ]
};

/* ──────────────────────────────────────────────────────────────────
 *  6 — Engineer  (工程师)
 * ────────────────────────────────────────────────────────────────── */
const ENGINEER: RoleDef = {
  id: "engineer",
  title: "Engineer",
  domainsWord: "Delivery Phases",
  description:
    "Build → Ship → Run → Learn 全生命周期：设计 → 开发 → 质量 → 可靠性 → 运维 → 复盘.",
  structuralTags: ["yivad", "yiai", "yipet", "yipot"],
  subdirs: [
    {
      id: "build",
      icon: "🏗️",
      label: "Build",
      color: ROLE_PALETTE.primary,
      desc:
        "Architecture & Development · system design · API/RPC contracts · dev tools · DX · dependency management · vendor evaluation · bootstrapping."
    },
    {
      id: "ship",
      icon: "🚀",
      label: "Ship",
      color: ROLE_PALETTE.success,
      desc:
        "Quality, Security, Data & Reliability · supply-chain hardening · secrets management · DB migrations · resilience patterns."
    },
    {
      id: "run",
      icon: "🏃",
      label: "Run",
      color: ROLE_PALETTE.purple,
      desc:
        "Process & Onboarding — scenario-based journeys · cross-cutting guides · team workflows · 5-day onboarding paths · FDE operations."
    },
    {
      id: "learn",
      icon: "📖",
      label: "Learn",
      color: ROLE_PALETTE.pink,
      desc:
        "Lessons & projects — wins, failures, gotchas from real projects — plus YiAi / YiVad / YiPet / YiPot project-specific docs."
    }
  ],
  redLines: [
    {
      label: "Axios AbortSignal 合并规则",
      threshold: "AbortSignal.any()",
      direction: "min",
      rationale:
        "Axios 拦截器严禁直接覆盖 config.signal，必须 AbortSignal.any([config.signal, controller.signal]) 联合外部超时 & 内部去重两个 controller。",
      ref: "YiVad/src/api/helper/retry.ts"
    },
    {
      label: "API 服务 timeout/signal 透传",
      threshold: "100%",
      direction: "min",
      unit: "%",
      rationale:
        "YiVad 所有 API 服务 (knowledgeService / dataService / etc.) 必须支持并透传 { timeout, signal }，确保 AbortSignal 生效全链路。",
      ref: "YiVad/src/api/modules/knowledgeService.ts 签名"
    },
    {
      label: "Hook 看门狗超时",
      threshold: "Hook ≤ 12s · UI ≤ 22s",
      direction: "max",
      unit: "s",
      rationale:
        "异步竞态 Hook 中，所有 guard 分支必须显式重置 loading=false + headerReady=true，配合 12s/22s 双 Watchdog 强制跳骨架屏。",
      ref: "YiVad/src/hooks/useProjectDetail.ts §Watchdog"
    },
    {
      label: "DisposerBag 复用模式",
      threshold: "复用必须用 reset()",
      direction: "min",
      rationale:
        "清理后再复用的 DisposerBag 禁止调用 dispose()（会置 disposed=true 后续 AbortController 立刻 abort），改调用 reset() 清空条目。",
      ref: "YiVad/src/utils/disposer.ts §reset() 方法"
    },
    {
      label: "调试脚本入库限制",
      threshold: "0",
      direction: "max",
      unit: "个",
      rationale:
        "严禁一次性调试脚本（check_*, debug_*, scratch_*, play_*, tmp_*）入库，.gitignore 新增 17 条规则全覆盖。",
      ref: "YiVad/.gitignore §临时脚本块"
    }
  ],
  quickRefs: [
    { want: "DisposerBag 使用规范 (含 reset/dispose 区别)", file: "build/DisposerBag-GoldCopy.ts", icon: "🧹", confidence: 5 },
    { want: "API 服务 timeout+signal 模板", file: "build/API-Service-Template.ts", icon: "🔌", confidence: 5 },
    { want: "Watchdog Hook 模板 (12s/22s)", file: "build/Hook-Watchdog-Template.ts", icon: "🐕", confidence: 5 },
    { want: "Axios 拦截器 Signal 合并示例", file: "ship/Axios-AbortSignal-Merge.ts", icon: "🛡️", confidence: 5 },
    { want: "Rust null-safe 写作示例", file: "build/Rust-NullSafe-Examples.rs", icon: "🦀", confidence: 5 },
    { want: "YiVad 项目新人上手 (5 天)", file: "run/Onboarding-YiVad-5Days.md", icon: "🚀", confidence: 5 },
    { want: "YiPot 项目新人上手 (5 天)", file: "run/Onboarding-YiPot-5Days.md", icon: "🖥️", confidence: 5 },
    { want: "YiAi RPC 契约 (execution.router)", file: "build/YiAi-RPC-Execution-Router.md", icon: "🤖", confidence: 5 }
  ],
  onboarding: [
    {
      day: 1,
      title: "开发环境 + 代码规范",
      checklist: [
        "按对应项目 README 安装依赖 (YiPot=pnpm, YiPet/YiVad=yarn)",
        "确认本地 lint 能过 (eslint + stylelint + clippy -Dw)，至少提交一个 trivial fix",
        "配置 .git/hooks/commit-msg 指向 husky（YiPet/YiVad 会自动安装）"
      ],
      pitfall: "严禁在 YiPet/YiVad 提交 pnpm-lock.yaml（packageManager 写死 yarn），CI 会直接 fail。"
    },
    {
      day: 2,
      title: "API 服务开发 + 竞态处理",
      checklist: [
        "按 Gold Copy 模板为一个新 API 加 { timeout, signal } 参数",
        "在调用点把 AbortController 注册进 DisposerBag，并验证离开页面会 abort",
        "验证 cancel 不会触发 UI 错误提示（CanceledError 要静默）"
      ],
      pitfall: "DisposerBag.reset() vs dispose() 的混用是 #1 原因，参考 lessons learned：用 reset() 清空而不是 dispose()。"
    },
    {
      day: 3,
      title: "异步 Hook 看门狗",
      checklist: [
        "阅读 useProjectDetail.ts 的 Hook 12s + UI 22s 双 Watchdog",
        "在自己开发的 Hook 中套用同样结构",
        "手动模拟 30s 无响应，确认 Watchdog 会强制跳 loading 并显示 retry UI"
      ],
      pitfall: "watch(key, {flush: 'post'}) 首次 flush 要跳过，否则和 onMounted 初始化会对撞互相 cancel。"
    },
    {
      day: 4,
      title: "单元/集成测试",
      checklist: [
        "为自己写的 API 调用写 2 个 vitest case：成功路径 + 超时路径",
        "如果是 Rust 代码，跑 cargo nextest run + cargo tarpaulin 覆盖率 ≥ 80%",
        "本地跑 e2e smoke.spec.ts（需要 YiAi 本地启动）"
      ],
      pitfall: "测试脚本是允许入库的（e2e/、tests/），但临时的 check_*.mjs 必须清理。"
    },
    {
      day: 5,
      title: "PR 提交 & Code Review",
      checklist: [
        "Commit message 走 conventional commit (feat/fix/docs/refactor/test/chore)",
        "PR 描述必须包含：改动原因、对用户的影响、性能测量方法（如果涉及）",
        "Review 中如有争议，先看 projects/INDEX.md 21 项质量门禁是否触发"
      ],
      pitfall: "如果 PR 触发 21 项质量门禁中的任意红色项，需要立即去对应角色 Dashboard（SRE / Leader / Executive）留痕。"
    }
  ]
};

/* ──────────────────────────────────────────────────────────────────
 *  7 — Curator  (知识策展 / 知识库治理)
 * ────────────────────────────────────────────────────────────────── */
const CURATOR: RoleDef = {
  id: "curator",
  title: "Curator",
  domainsWord: "Governance Domains",
  description:
    "Knowledge base lifecycle · templates & diagrams · quality gates · archive · deduplication & bad-smell sweeps.",
  structuralTags: ["template", "governance", "knowledge", "adr", "prd"],
  subdirs: [
    {
      id: "governance",
      icon: "⚖️",
      label: "Governance",
      color: ROLE_PALETTE.primary,
      desc:
        "Lifecycle management · review cycles · quality gates · triage protocols · tacit-knowledge capture · readiness checklists."
    },
    {
      id: "templates",
      icon: "📝",
      label: "Templates (Gold Copy)",
      color: ROLE_PALETTE.success,
      desc:
        "Standardised document templates — ADR · PRD · Tech Design · Retro · Usability Test · Knowledge Leaf · Reading Note (7 chapters)."
    },
    {
      id: "diagrams",
      icon: "📊",
      label: "Diagrams & Maps",
      color: ROLE_PALETTE.purple,
      desc:
        "Directory blueprints · knowledge maps · user journey diagrams · cross-department flow charts · bottleneck identification."
    },
    {
      id: "archive",
      icon: "🗄️",
      label: "Archive",
      color: ROLE_PALETTE.warning,
      desc:
        "Deprecated / superseded content — preserved for historical traceability & forensic lookup, organised by original category."
    },
    {
      id: "skills",
      icon: "🧩",
      label: "Skills Registry",
      color: ROLE_PALETTE.pink,
      desc:
        "Reusable TRAE Workspace skills (e.g. dedup sweeps) — each skill has definition, input schema, contract, and fallback."
    }
  ],
  redLines: [
    {
      label: "知识库文件编号格式",
      threshold: "三位数字 001-999",
      direction: "min",
      rationale: "编号统一三位，禁止 0001 四位补零，禁止重复前缀（如 yivad-yivad-003）。",
      ref: "YiKnowledge/curator/governance/Naming-Convention.md"
    },
    {
      label: "新人路线图嵌入率",
      threshold: "100%",
      direction: "min",
      unit: "%",
      rationale: "每份 project README 必须包含 5 天上手路线图：Day1 环境 → Day2 架构 → Day3 调试 → Day4 开发 → Day5 PR。",
      ref: "YiKnowledge/curator/templates/Project-README-Template.md §0.3"
    },
    {
      label: "专业读书笔记 不学清单比",
      threshold: "≥ 50%",
      direction: "min",
      unit: "%",
      rationale:
        "读书笔记必须包含 ≥ 50% 的「不学清单」章节（Chase/Simon 认知科学实证：知道什么不要学 ≥ 知道要学什么）。",
      ref: "YiKnowledge/executive/reading-list/*.md §不学清单"
    },
    {
      label: "去重 & 坏味扫描频率",
      threshold: "≤ 每季度 1 次",
      direction: "max",
      unit: "季度",
      rationale:
        "每季度至少一次系统性 dedup + bad-smell 扫描：重复条目、空章节、死链、错编号、跨文件引用悬空。",
      ref: "YiKnowledge/curator/governance/Quarterly-Dedup-Checklist.md"
    },
    {
      label: "受限目录跳过规则",
      threshold: "rss / prds / devs 必跳",
      direction: "min",
      rationale:
        "知识库去重 & 坏味 & 编号 任务必须跳过 rss/、projects/*/prds/、projects/*/devs/ 三个目录，防止覆盖业务产出。",
      ref: "YiKnowledge/curator/governance/Dedup-Scope-Spec.md"
    }
  ],
  quickRefs: [
    { want: "Frontmatter 15 字段规范", file: "templates/Frontmatter-15-Fields.md", icon: "🏷️", confidence: 5 },
    { want: "ADR 8 字段模板", file: "templates/ADR-Template-8Fields.md", icon: "📝", confidence: 5 },
    { want: "PRD 模板 (含 5 天路线图)", file: "templates/PRD-Template.md", icon: "📋", confidence: 5 },
    { want: "读书笔记 7 章结构 + So-What", file: "templates/Reading-Note-7Chapters.md", icon: "📚", confidence: 5 },
    { want: "季度去重 & 坏味 Checklist", file: "governance/Quarterly-Dedup-Checklist.md", icon: "🧹", confidence: 5 },
    { want: "编号规范 + 冲突解决", file: "governance/Naming-Convention.md", icon: "🔢", confidence: 5 },
    { want: "技能定义规范 (TRAE)", file: "skills/Skill-Definition-Spec.md", icon: "🧩", confidence: 4 },
    { want: "跨文件 Grep 自检命令", file: "governance/Cross-Reference-Audit-Cmds.md", icon: "🔍", confidence: 5 }
  ],
  onboarding: [
    {
      day: 1,
      title: "目录结构 & 命名规范",
      checklist: [
        "通读 YiKnowledge 根 INDEX.md + projects/README.md + curator/README.md",
        "用 Curator Dashboard 按 Category 过滤查看每个 role 的文件分布",
        "手工核对 3 份文档的编号是否符合三位规则 + Frontmatter 15 字段"
      ],
      pitfall: "projects/*/prds、projects/*/devs、rss/ 三个目录在任何 dedup/编号 任务中必跳，不要误处理业务文档。"
    },
    {
      day: 2,
      title: "Frontmatter / 模板实战",
      checklist: [
        "从 templates/ 中挑一份模板（例如 ADR 或 PRD）",
        "为一份已存在但字段不全的旧文档补齐缺项",
        "用 Cross-Reference-Audit-Cmds 做全库 Grep，确保引用没有悬空"
      ],
      pitfall: "benefit 字段必须是可量化收益，「提升体验」「加强规范」这种抽象句是 Curator 的第一大坏味道。"
    },
    {
      day: 3,
      title: "Quarterly Dedup 演练",
      checklist: [
        "打开 reading-list/ 目录，尝试找一本重复出现的书",
        "按流程：保留排期最近的那一份，其余移到 Q4 队列并加 deprecated",
        "在 001 主控文件中更新 Dashboard 指标并跑自检命令"
      ],
      pitfall: "001-阅读-阅读清单.md 是 SSOT，严禁在任何其他地方复制 Dashboard/KPI 章节。"
    },
    {
      day: 4,
      title: "技能定义 & 注册",
      checklist: [
        "为「季度去重」这个动作写一份 Skill 规范（输入 / 输出 / 回退触发器 / 角色 4 项）",
        "在 YiVad /knowledge/skills 页面上验证技能卡片能被搜到",
        "把技能的 RICE 评分写入 skill metadata"
      ],
      pitfall: "技能必须声明「回退触发器」，例如：当 dedup 后跨书引用悬空数 > 5，则自动 revert。"
    },
    {
      day: 5,
      title: "发布季度 Curator 报告",
      checklist: [
        "产出一份 1 页 Curator 季度报告：覆盖率 / 去重条目数 / 坏味修复数",
        "将报告挂到 Executive Dashboard 的 Process Records 入口下",
        "在 INDEX.md 21 项质量门禁里勾选 Curator 相关门禁"
      ],
      pitfall: "报告里的数字必须来自 Curator Dashboard 的实时 API，不能手填——否则季度之间会有漂移。"
    }
  ]
};

/* ──────────────────────────────────────────────────────────────────
 *  Registry
 * ────────────────────────────────────────────────────────────────── */
export const ROLE_CONFIG: Record<string, RoleDef> = {
  executive: EXECUTIVE,
  aier: AIER,
  sre: SRE,
  leader: LEADER,
  product: PRODUCT,
  engineer: ENGINEER,
  curator: CURATOR
};

export const ROLE_IDS = Object.keys(ROLE_CONFIG);

export function getRole(id: string): RoleDef {
  return ROLE_CONFIG[id] ?? ENGINEER;
}

export default ROLE_CONFIG;
