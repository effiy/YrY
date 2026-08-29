---
title: YiKnowledge 知识库项目
aliases: [yiknowledge-project, knowledge-base, kb]
tags: [yiknowledge, knowledge-base, markdown, rag, frontmatter]
category: engineer/projects
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, curator]
benefit: "YiKnowledge 知识库的完整参考：结构、规范、治理、AI 集成"
acceptance_criteria:
  - "知识库的目录结构和命名规范清晰可查"
  - "frontmatter 规范和内容生命周期明确"
  - "AI 检索策略和治理流程完整"
related:
  - ../../../README.md
  - ../../../INDEX.md
  - ../../../MEMORY.md
  - ../../../../YiAi/config.yaml
---

# YiKnowledge — Markdown 知识库

> **类型**: Knowledge Base | **格式**: Markdown + YAML Frontmatter | **用途**: 人类文档 + AI RAG 数据源

YiKnowledge 是 YrY 微前端的**共享知识库**，按照软件交付流水线组织 (需求 → 决策 → 设计构建 → 质量发布 → 运营学习)，同时服务于人类查阅和 AI (YiAi BRD Agent 的 RAG 数据源)。

---

## 快速开始

### 查阅知识

```bash
# 浏览知识库
cd YiKnowledge

# 按角色查看
ls engineer/ leader/ producter/ srer/ executiver/ aier/ curator/

# 按标签搜索
rg "^tags:.*keyword" YiKnowledge -l

# 快速预览 (读取 frontmatter)
head -15 engineer/build/implement-an-api.md
```

### 添加知识

```bash
# 1. 确定角色目录 (参见角色边界决策树)
# 2. 创建文件 (kebab-case, 无下划线和数字)
# 3. 填写 YAML frontmatter (参见规范)
# 4. 运行 readiness checklist
```

### AI 集成

YiAi 的知识库监听器每 60 秒扫描 `YiKnowledge/` 目录树，解析 frontmatter 并同步到 MongoDB `knowledge_files` 集合。RAG 检索引擎基于此索引进行混合检索。

---

## 目录结构

```
YiKnowledge/
├── README.md                # 知识库概述 + 流水线架构
├── INDEX.md                 # 全库导航索引
├── MEMORY.md                # 知识库规则手册
├── producter/               # 角色 1: 需求 (Requirements)
│   ├── README.md            # 角色概述
│   ├── INDEX.md             # 角色索引
│   ├── frameworks/          # 框架 (JTBD, RICE/ICE, 用户研究)
│   ├── discovery/           # 发现 (PRD, 指标, 用户画像)
│   ├── delivery/            # 交付 (Sprint, 发布计划)
│   └── strategy/            # 策略 (产品路线图)
├── leader/                  # 角色 2: 决策 (Decisions)
│   ├── README.md
│   ├── INDEX.md
│   ├── architecture/        # 架构设计
│   ├── decisions/           # ADR 存档 (按项目组织)
│   ├── capacity/            # 容量规划
│   ├── risk/                # 风险管理
│   └── roadmap/             # 技术路线图
├── engineer/                # 角色 3: 设计构建 (Design + Build)
│   ├── README.md
│   ├── INDEX.md
│   ├── SECURITY.md          # 安全领域索引
│   ├── ENGINEERING.md       # 工程领域索引
│   ├── build/               # 构建 (架构模式, 开发实践, API 设计)
│   ├── ship/                # 交付 (质量安全, 数据, 可靠性)
│   ├── run/                 # 运营 (协作, 知识共享, 入职)
│   ├── learn/               # 学习 (经验教训, 失败, 陷阱, Bug)
│   └── projects/            # 项目文档 (YiVad, YiAi, YiPet, YiKnowledge)
├── srer/                    # 角色 4: 运营学习 (Operate + Learn)
│   ├── README.md
│   ├── INDEX.md
│   ├── observability/       # 可观测性 (监控, 告警, 仪表盘, SLO)
│   ├── incident-response/   # 事件响应 (流程, 复盘)
│   └── release/             # 发布 (发布, 回滚, 金丝雀)
├── executiver/              # 跨角色层: 业务策略 (Business Strategy)
│   ├── README.md
│   ├── INDEX.md
│   ├── strategy/            # 企业战略
│   ├── industry/            # 行业分析
│   ├── roadmap/             # 组织目标
│   └── reading-list/        # 阅读清单
├── aier/                    # 跨角色层: AI 赋能 (AI Enablement)
│   ├── README.md
│   ├── INDEX.md
│   ├── foundations/         # AI 基础
│   ├── methodology/         # AI 方法论 (RAG, Agent, Prompt, 评估)
│   ├── platform/            # AI 平台 (Vector DB, Embedding, LLM)
│   └── ml/                  # 传统 ML
├── curator/                 # 治理层: 知识库维护 (Knowledge Governance)
│   ├── README.md
│   ├── INDEX.md
│   ├── COLLABORATION.md     # 协作领域索引
│   ├── governance/          # 治理 (生命周期, 分类标准, 就绪检查)
│   ├── diagrams/            # 架构图 (知识地图, 用户旅程, 目录蓝图)
│   ├── templates/           # 文档模板
│   └── archive/             # 已归档内容索引
├── okr/                     # OKR 目标管理
├── demos/                   # 示例项目 (可在 YiVad 实例化)
├── skills/                  # Claude Code Skills
├── bugs/                    # Bug 报告按日期组织
└── rss/                     # RSS 聚合内容按日期组织
```

---

## 项目规范

### 文件命名

- **格式**: kebab-case (小写字母 + 连字符)
- **禁止**: 下划线 `_`、数字
- **语义**: 中文语义保留在 frontmatter `title:` 和 `aliases:` 中

### 目录层级

- 最多 **3 层**: `role/problem-domain/file.md`
- 禁止嵌套子目录

### YAML Frontmatter 规范

```yaml
---
title: 文件标题                      # 必填
aliases: [别名1, 别名2]              # 推荐
tags: [标签1, 标签2, 标签3]           # 必填, 3-5 个
category: root | <role>/<subdir>     # 必填
created: YYYY-MM-DD                  # 必填
updated: YYYY-MM-DD                  # 必填
source: internal | url               # 必填
type: summary | original | template | prompt  # 必填
status: draft | stable | deprecated  # 必填
lifecycle: inbox | triage | active | reference | archive  # 推荐
review_cycle: weekly | monthly | quarterly | yearly  # 外部内容必填
last_verified: YYYY-MM-DD            # 外部内容必填
roles: [role1, role2]                # 推荐
benefit: "简短描述"                   # 推荐
acceptance_criteria:                 # 推荐
  - "可验证的条款"
related:                             # 推荐
  - relative/path/to/file.md
---
```

### 内容结构

```
# 标题
## Summary (摘要)
## Core viewpoints (核心观点)
## Key information (关键信息)
## Action recommendations (行动建议)
## Anti-patterns (反模式)
## Related links (相关链接)
```

### 知识生命周期

```
inbox → triage → active → reference → archive
  ↓        ↓        ↓         ↓          ↓
 新入库   分类中   活跃使用   参考归档   已废弃
```

### 外部内容处理

- 双文件策略: `*-original.md` (原文) + `*-summary.md` (合成)
- 必须设置 `review_cycle` 和 `last_verified`
- 超过 6 个月未验证 → `status: deprecated`

---

## 角色边界

### 角色职责

| 角色 | 流水线阶段 | 核心问题 |
|------|-----------|----------|
| executiver/ | 业务策略 (跨阶段) | 为什么做？ |
| producter/ | 1. 需求 | 做什么？ |
| leader/ | 2. 决策 | 选哪个方案？ |
| engineer/ | 3. 设计构建 | 怎么实现？ |
| srer/ | 4. 质量发布 + 5. 运营学习 | 怎么运行？ |
| aier/ | AI 赋能 (跨阶段) | 怎么用 AI 加速？ |
| curator/ | 知识治理 (元层) | 怎么维护 KB？ |

### 角色边界决策树

```
内容属于哪个角色？
├── 业务策略、市场、竞品？ → executiver/
├── 产品需求、用户故事、优先级？ → producter/
├── 技术决策、架构选择、ADR？ → leader/
├── 实现模式、开发工具、代码？ → engineer/
├── 发布流程、监控、事件响应？ → srer/
├── AI/ML 理论和实践？ → aier/
└── KB 结构和规则？ → curator/
```

### 高频边界冲突

| 冲突 | 归属 | 原因 |
|------|------|------|
| 架构决策 vs 架构模式 | leader/ | 决策 = 为什么选 A 不选 B |
| 安全加固 vs 安全策略 | engineer/ | 加固 = 代码层面实现 |
| 事件响应 vs 风险预防 | srer/→ 中, leader/→ 前后 | 时间线区分 |
| 产品路线图 vs 技术路线图 | producter/→ 功能, leader/→ 技术 | 做什么 vs 用什么 |

---

## 架构设计

### 软件交付流水线

```
                    ┌──────────────────────────────────┐
                    │  Business Strategy (executiver/)  │
                    │  战略 / 行业 / 路线图              │
                    └──────────────────────────────────┘
                                      ↓
  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ 1.需求    │ → │ 2.决策    │ → │ 3.设计构建 │ → │ 4.质量发布 │ → │ 5.运营学习 │
  │ producter │    │ leader   │    │ engineer  │    │ srer      │    │ srer      │
  │ PRD/用户  │    │ ADR/技术 │    │ 架构/开发  │    │ 发布/监控  │    │ SLO/复盘   │
  │ 故事/优先级│    │ 选择/容量 │    │ 质量/数据  │    │ 事件响应   │    │ 经验教训   │
  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
       ↑               ↑               ↑               ↑               ↑
       └───────────────┴───────────────┴───────────────┴───────────────┘
                    ┌──────────────────────────────────┐
                    │  AI Enablement (aier/)            │
                    │  基础 / 方法论 / 平台 / ML         │
                    └──────────────────────────────────┘
```

### AI 检索架构

```
YiKnowledge (Markdown 文件树)
  ↓ apscheduler 每 60s 轮询
YiAi Knowledge Watcher
  ↓ 解析 frontmatter + 正文
MongoDB knowledge_files 集合
  ↓ llama_index 索引构建
Vector Index (data/rag_store/)
  ↓ 混合检索 (向量 + BM25)
RAG 查询 → 用户
```

### 前端检索策略

1. **流水线阶段优先** — 从你所在的阶段开始，进入对应角色目录
2. **角色目录** — 按角色索引找到具体问题域
3. **角色内 INDEX** — 每个角色都有 INDEX.md 导航
4. **跨角色** — 使用领域索引 (SECURITY, COLLABORATION, ENGINEERING)
5. **文件名 grep** — `rg "^tags:.*keyword" YiKnowledge -l`
6. **Frontmatter 扫描** — `head -15 file.md` 快速判断相关性

### 设计原则

1. **角色优先，边界清晰** — 每条知识属于唯一角色目录，多角色覆盖用 frontmatter `roles:`
2. **描述性文件名** — 动词短语 slug，连字符分隔
3. **外部内容双文件** — `*-original.md` + `*-summary.md`
4. **YAML frontmatter 必填** — `tags`/`category`/`type`/`status` 是检索信号
5. **统一正文结构** — Summary / Core viewpoints / Key information / Action recommendations / Anti-patterns
6. **新鲜度标记** — 外部内容要求 `last_verified` + `review_cycle`
7. **最多 3 层目录** — `role/problem-domain/file.md`

---

## 知识治理

### 治理角色

| 角色 | 职责 | 频率 |
|------|------|------|
| 内容作者 | 创建和更新知识 | 按需 |
| 角色维护者 | 维护角色目录结构和索引 | 每月 |
| 策展人 (Curator) | 知识库整体健康和质量 | 每季度 |
| AI 训练者 | 优化 frontmatter 以提高 RAG 检索质量 | 每月 |

### 就绪检查清单

添加新内容前运行 10 个问题：
1. 内容属于哪个角色目录？
2. 文件名是否符合 kebab-case 规范？
3. frontmatter 是否完整 (必填字段)？
4. `tags` 是否 3-5 个相关标签？
5. `lifecycle` 是否设置正确？
6. 外部内容是否设置了 `review_cycle` 和 `last_verified`？
7. 正文结构是否完整 (Summary / Core viewpoints / Key information / Action recommendations / Anti-patterns)？
8. 是否有重复内容？检查 `related` 链接
9. 是否更新了角色 INDEX.md？
10. 前端导航是否可达？

### 定期维护

```bash
# 查找过期内容
rg "^last_verified: 2025" YiKnowledge -l

# 查找已废弃内容
rg "^status: deprecated" YiKnowledge -l

# 查找未分类内容
rg "^lifecycle: inbox" YiKnowledge -l

# 查找缺失 frontmatter 字段
rg -L "^title:" YiKnowledge/**/*.md
rg -L "^tags:" YiKnowledge/**/*.md
```

---

## 3 个跨领域索引

| 领域索引 | 聚合内容 | 回答 |
|----------|----------|------|
| [SECURITY.md](../SECURITY.md) | 供应链, 应用安全, 风险, 事件响应, 合规 | 所有安全相关内容在哪里？ |
| [COLLABORATION.md](../../curator/COLLABORATION.md) | 团队流程, 会议, 知识共享, 入职, PM | 所有协作相关内容在哪里？ |
| [ENGINEERING.md](../ENGINEERING.md) | 架构, 质量, 数据, 工具, 经验教训 | 所有工程相关内容在哪里？ |

---

## 4 个架构图

| 图表 | 位置 | 回答 |
|------|------|------|
| 知识地图 | [curator/diagrams/knowledge-map.md](../../curator/diagrams/knowledge-map.md) | 有哪些知识？显性 vs 隐性？持有者和消费者？ |
| 用户旅程图 | [curator/diagrams/user-journey.md](../../curator/diagrams/user-journey.md) | 知识在哪里？如何流动？断点在哪里？ |
| 目录蓝图 | [curator/diagrams/directory-blueprint.md](../../curator/diagrams/directory-blueprint.md) | 用户如何快速找到内容？ |
| 治理流程 | [curator/governance/governance.md](../../curator/governance/governance.md) | 谁维护？多频繁？ |

---

## 核心配置

### YiAi 知识库配置 (`YiAi/config.yaml`)

```yaml
knowledge:
  base_dir: "../YiKnowledge"          # 知识库根目录
  watcher_enabled: true               # 启用文件监听
  watcher_poll_seconds: 60            # 轮询间隔 (macOS FSEvents 不可靠)

rag:
  embed_model: "nomic-embed-text"     # Embedding 模型
  llm_model: "qwen3.5:4b"            # RAG 回答模型
  persist_dir: "./data/rag_store"     # 索引持久化目录
  top_k: 3                            # 检索返回条数
  chunk_size: 512                     # 分块大小
  chunk_overlap: 40                   # 分块重叠
  hybrid_retrieval_enabled: true      # 混合检索 (向量 + BM25)
  rerank_enabled: true                # LLM 重排序
  inline_citations_enabled: true      # 内联引用
  sentence_window_enabled: true       # 句子窗口检索
  hyde_enabled: true                  # HyDE 查询增强
```

### 关键文件

| 文件 | 说明 |
|------|------|
| `README.md` | 知识库概述 + 流水线架构 |
| `INDEX.md` | 全库导航索引 (7 角色 + 4 领域索引) |
| `MEMORY.md` | 规则手册 (命名规范, frontmatter 规范, 检索策略) |
| `curator/governance/readiness-checklist.md` | 就绪检查清单 |
| `curator/governance/governance.md` | 治理流程 |
| `curator/templates/` | 文档模板 (PRD, ADR, 复盘) |