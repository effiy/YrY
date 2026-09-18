# CLAUDE.md — YiKnowledge

> Markdown 知识库，围绕软件交付流水线组织。7 个角色目录、5 个流水线阶段、3 个贯穿层。同时服务于人类（文档）和 AI（YiAi 的 RAG 数据源）。

---

## 目录

- [基本信念](#基本信念)
- [铁律](#铁律)
- [项目概况](#项目概况)
- [目录结构](#目录结构)
- [流水线模型](#流水线模型)
- [角色边界](#角色边界)
- [文件约定](#文件约定)
- [Frontmatter 规范](#frontmatter-规范)
- [与 YiAi 集成](#与-yiai-集成)
- [治理规则](#治理规则)
- [知识生命周期](#知识生命周期)
- [引用指引](#引用指引)

---

## 基本信念

- **单一真相来源。** 每类知识在唯一位置存在。跨角色发现通过 frontmatter `roles:` 和领域索引实现，绝不通过复制内容。
- **流水线优先。** 知识按软件交付因果链组织 —— 从 `executiver` 的*为什么做*到 `srer` 的*怎么跑*。新增内容必先确定流水线阶段和角色归属。
- **人机双读。** 每篇文档既服务于人（清晰的标题、可操作的见解），也服务于 AI（YiAi 的 RAG 引擎解析 frontmatter 元数据构建向量索引）。

## 铁律

1. **绝不复制内容。** 跨角色知识通过 frontmatter `roles:` 字段标记，通过领域索引聚合。复制内容 = 技术债务。
2. **Frontmatter 必需。** 所有 `.md` 文件必须包含完整的 YAML frontmatter 块（title、tags、category、created、updated、source、type、status）。
3. **文件命名约束。** 角色子目录中：中文描述 + `{序号}-{描述}.md`。项目子目录中：中文描述。仅连字符，禁止下划线和数字作为独立文件名。
4. **最大 3 级目录。** `role/problem-domain/file.md`。更深层级拒绝合并。
5. **内容不可包含代码。** YiKnowledge 是文档库，非代码库。代码示例不超过 5 行，且必须标记语言。

## 项目概况

| 维度 | 值 |
|-----------|-------|
| 名称 | YiKnowledge |
| 类型 | Markdown 知识库 |
| 角色目录 | 7 个（executiver、producter、leader、engineer、srer、aier、curator） |
| 流水线阶段 | 5 个（需求 → 决策 → 设计+构建 → 交付+质量 → 运营+学习） |
| 贯穿层 | 3 个（业务战略、AI 赋能、知识治理） |
| 文件格式 | Markdown + YAML frontmatter |
| 命名约定 | kebab-case 目录，中文 + 序号文件名 |
| RAG 集成 | YiAi 知识监视器扫描 → MongoDB `knowledge_files` + llama_index 向量索引 |
| 项目中心 | `projects/` — 4 个子项目的缺陷/需求/规范/工作流 |
| 治理 | `curator/governance/` — 健康看板、治理规范、就绪检查清单 |

## 目录结构

```
YiKnowledge/
├── INDEX.md              # 全库导航索引（角色 × 阶段矩阵）
├── README.md             # 顶层概览（流水线叙事 + 角色决策树）
├── MEMORY.md             # 规则手册（命名、frontmatter、角色边界）
├── QUICKREF.md           # 快速参考（常用命令、检索策略）
├── executiver/           # 业务战略层 — 贯穿整个流水线
│   ├── strategy/         # 业务战略
│   ├── industry/         # 行业分析
│   └── roadmap/          # 组织路线图
├── producter/            # 阶段 1：需求 — "构建什么产品？"
│   ├── frameworks/       # 需求框架
│   ├── discovery/        # 需求发现
│   ├── delivery/         # 需求交付
│   └── strategy/         # 产品策略
├── leader/               # 阶段 2：决策 — "走哪条技术路线？"
│   ├── decisions/        # 架构决策记录（ADR）
│   ├── selection/        # 技术选型
│   ├── capacity/         # 容量规划
│   ├── risk/             # 风险评估
│   └── roadmap/          # 技术路线图
├── engineer/             # 阶段 3：设计+构建 — "如何实现？"
│   ├── architecture/     # 架构模式
│   ├── development/      # 开发规范
│   ├── quality/          # 质量保障
│   ├── data/             # 数据工程
│   ├── reliability/      # 可靠性设计
│   ├── processes/        # 工程流程
│   ├── learn/            # 经验教训 + 项目文档
│   ├── SECURITY.md       # 安全领域索引
│   └── ENGINEERING.md    # 工程领域索引
├── srer/                 # 阶段 4-5：交付+运营 — "如何保障稳定性？"
│   ├── incidents/        # 事件响应
│   ├── observability/    # 可观测性
│   └── releases/         # 发布管理
├── aier/                 # AI 赋能层 — 贯穿整个流水线
│   ├── foundations/      # LLM 基础
│   ├── methods/          # Agent 方法 + 提示词
│   ├── platform/         # 平台选型
│   ├── machine-learning/ # 传统 ML
│   └── okr/              # AI 团队 OKR
├── curator/              # 知识治理层 — 贯穿整个流水线
│   ├── governance/       # 治理规范、健康看板
│   ├── templates/        # 文档模板（PRD/ADR/复盘等 10 类）
│   ├── diagrams/         # 知识架构图
│   ├── okr/              # 治理 OKR
│   └── COLLABORATION.md  # 协作领域索引
├── projects/             # 项目知识中心
│   ├── yivad/            # YiVad 项目知识
│   ├── yiai/             # YiAi 项目知识
│   ├── yipet/            # YiPet 项目知识
│   └── shared/           # 跨项目共享知识
├── skills/               # Claude Code 自定义技能
├── rss/                  # RSS 聚合内容（自动生成）
└── static/               # 静态资源
```

## 流水线模型

```
业务战略层（贯穿整个流水线）
─────────────────────────────────────────────────────────
  executiver/ "为什么做这个业务"

软件交付流水线 —— 5 个阶段
─────────────────────────────────────────────────────────
  需求          决策          设计+构建       交付+质量       运营+学习
  ────────      ──────        ──────────     ───────────    ────────
  producter/    leader/       engineer/      srer/          srer/
  构建什么？     走哪条路线？    如何实现？      如何保障？      如何改进？

AI 赋能层（贯穿整个流水线）
─────────────────────────────────────────────────────────
  aier/ "AI 如何加速每个阶段？"

知识治理层（贯穿整个流水线）
─────────────────────────────────────────────────────────
  curator/ "知识库自身如何维护？"
```

## 角色边界

每个角色只回答一个问题，不越界：

| 角色 | 核心问题 | 典型内容 |
|------|----------|----------|
| `executiver` | 为什么做这个业务？ | 战略分析、行业趋势、路线图 |
| `producter` | 构建什么产品？ | PRD、用户故事、需求框架 |
| `leader` | 走哪条技术路线？ | ADR、技术选型、风险评估 |
| `engineer` | 如何实现？ | 架构模式、开发规范、经验教训 |
| `srer` | 如何保障稳定性？ | 事件响应、可观测性、发布流程 |
| `aier` | AI 如何加速？ | Agent 模式、提示词工程、平台选型 |
| `curator` | 知识库如何维护？ | 治理规范、模板、健康检查 |

**冲突裁决**：当内容适合多个角色时，放在**最早**的流水线阶段。如某项技术选型涉及需求和实现 —— 放在 `leader/selection/`，在 `engineer/` 中通过 frontmatter 交叉引用。

## 文件约定

### 命名

| 位置 | 约定 | 示例 |
|------|---------|--------|
| 角色子目录 | `{序号}-{中文描述}.md` | `01-方法-Agent架构模式.md` |
| 项目子目录 | `{序号}-{中文描述}.md` | `08-prd-task-命令面板.md` |
| 目录名 | kebab-case 英文 | `machine-learning/`、`prompts/` |
| 禁止 | 下划线 `_`、纯数字文件名、不含 frontmatter | — |

### 目录深度

严格 3 级：`role/problem-domain/file.md`

```
✓ aier/methods/01-方法-Agent架构模式.md
✓ engineer/learn/lessons/gotchas/macos-fsevents-silent-drop.md  ← 已超出，需合并到父级
✓ projects/yivad/specs/api-reference.md
✗ aier/methods/subcategory/deep/file.md                         ← 4 级，拒绝合并
```

## Frontmatter 规范

所有 `.md` 文件必须包含完整 frontmatter 块：

```yaml
---
title: "文档标题"                    # 必需：人类可读标题
tags: [tag1, tag2]                  # 必需：至少 1 个标签
category: "domain"                  # 必需：所属分类
created: 2026-01-01                 # 必需：创建日期 (YYYY-MM-DD)
updated: 2026-09-10                 # 必需：最后更新日期
source: internal | external | ...   # 必需：内容来源
type: summary | analysis | howto | reference | decision | report
status: draft | review | stable | archived
lifecycle: active | deprecated | superseded
review_cycle: weekly | monthly | quarterly | annual
roles: [engineer, leader]           # 可选：适用角色
benefit: "一句话说明价值"            # 可选：读者收益
acceptance_criteria:                # 可选：验收标准
  - 标准 1
  - 标准 2
related:                            # 可选：关联文件
  - ./path/to/related.md
---
```

**必需字段**：`title`、`tags`、`category`、`created`、`updated`、`source`、`type`、`status`

### 字段值约束

| 字段 | 允许值 |
|------|--------|
| `status` | `draft` \| `review` \| `stable` \| `archived` |
| `lifecycle` | `active` \| `deprecated` \| `superseded` |
| `review_cycle` | `weekly` \| `monthly` \| `quarterly` \| `annual` |
| `type` | `summary` \| `analysis` \| `howto` \| `reference` \| `decision` \| `report` |
| `source` | `internal` \| `external` \| `personal` \| `team` \| `community` |

## 与 YiAi 集成

YiKnowledge 是 YiAi RAG 的核心数据源：

```
YiKnowledge/ (markdown 目录树)
    │
    │  apscheduler 轮询 (config.yaml: knowledge.watcher_poll_seconds)
    ▼
YiAi domain/knowledge/watcher.py
    │  扫描文件树 → 解析 frontmatter → upsert MongoDB knowledge_files
    ▼
YiAi domain/rag/indexer.py
    │  llama_index 向量索引 (data/rag_store/)
    ▼
RAG 检索 → 混合检索 (向量 + BM25) → YiVad/YiPet 查询
```

**集成约束**：
- 新增文件后，知识监视器需在下一次轮询间隔内才能发现（默认 60s）
- frontmatter 格式错误会导致 RAG 元数据不完整，但不阻断扫描
- `status: draft` 的文件默认不被 RAG 索引（可通过 `config.yaml` 配置）
- 代码块超过 5 行的文件会降低 RAG 检索质量

## 治理规则

### 就绪检查清单

提交新文件前必须通过 [curator/governance/04-治理-就绪检查清单.md](curator/governance/04-治理-就绪检查清单.md)：

- [ ] Frontmatter 完整且有效
- [ ] 文件名符合约定
- [ ] 目录深度 ≤ 3 级
- [ ] 内容不重复已有知识
- [ ] 列出具体验收标准（如 applicable）
- [ ] 角色归属正确

### 健康看板

[curator/governance/01-治理-知识健康看板.md](curator/governance/01-治理-知识健康看板.md) 跟踪：
- stale 内容（超过 review_cycle 未审核）
- 缺失 frontmatter 的文件
- 孤立文件（无 incoming 链接）
- 重复内容检测

### 禁止操作

| 操作 | 原因 |
|------|------|
| 复制内容到多角色 | 破坏单一真相来源 |
| 文件名使用下划线 `_` | 约定冲突 |
| 超过 3 级目录 | RAG 路径解析约束 |
| 无 frontmatter 的文件 | RAG 元数据为空 |
| 包含大段代码 | 非代码库，降低 RAG 质量 |
| 直接修改 `rss/` 目录内容 | 自动生成，会被覆盖 |
| 修改其他角色的 README/INDEX | 需 curator 角色权限 |

## 知识生命周期

```
draft → review → stable → archived/deprecated/superseded
  │        │         │
  │        │         └── 定期审核 (review_cycle)
  │        └── curator 审核通过
  └── 作者创建，可自由编辑
```

- **active** — 当前有效，需按 `review_cycle` 定期审核
- **deprecated** — 仍可用但不推荐，保留作为历史参考
- **superseded** — 已被新内容替代，指向新文件的 `related` 链接

## 引用指引

| 资源 | 用途 |
|------|------|
| [README.md](./README.md) | 顶层概览 — 流水线叙事 + 角色决策树 |
| [INDEX.md](./INDEX.md) | 全库导航 — 角色 × 阶段矩阵 + 跨领域索引 |
| [MEMORY.md](./MEMORY.md) | 规则手册 — 命名约定、frontmatter 规范、角色边界 |
| [QUICKREF.md](./QUICKREF.md) | 快速参考 — 常用命令、检索策略 |
| [curator/governance/](./curator/governance/) | 治理规范、健康看板、就绪检查清单 |
| [curator/templates/](./curator/templates/) | 10 类文档模板 |
| [curator/diagrams/](./curator/diagrams/) | 知识架构图 |
| [projects/INDEX.md](./projects/INDEX.md) | 项目知识中心索引 |
| [skills/README.md](./skills/README.md) | 自定义技能说明 |
| [../CLAUDE.md](../CLAUDE.md) | 根级 CLAUDE.md — RPC 协议、跨项目关系 |
| [../YiAi/CLAUDE.md](../YiAi/CLAUDE.md) | YiAi RAG/知识监视器集成 |