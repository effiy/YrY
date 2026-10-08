---
title: YiKnowledge 项目知识库
aliases: [yiknowledge, knowledge-base, knowledge-hub, knowledge-curator]
tags: [yiknowledge, knowledge-base, markdown, frontmatter, yaml, curator, governance, rag, vector-index, watcher]
category: engineer/projects
created: 2026-10-07
updated: 2026-10-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, product, leader, curator, executive]
benefit: "YiKnowledge 统一知识中台完整参考：快速开始、目录蓝图、7 角色地图、4×5 治理流水线、Frontmatter 15 强制字段、RAG 索引构建与 Watcher 更新流程、5 项目依赖拓扑、FAQ"
acceptance_criteria:
  - "新成员可在 10 分钟内理解 YiKnowledge 目录分层与治理四阶段"
  - "任意新增文档 Frontmatter 15 强制字段可对照规范自查完成"
  - "RAG 索引构建流程、Watcher 更新机制、5 项目消费链路清晰可查"
related:
  - ../../INDEX.md
  - ../../README.md
  - ../../curator/INDEX.md
  - ../../curator/governance/0001-治理-知识健康看板.md
  - ../../curator/governance/0002-治理-治理规范.md
  - ../../curator/governance/0004-治理-就绪检查清单.md
  - ../../aier/foundations/0002-基础-RAG设计模式.md
  - ../../projects/yiknowledge/okrs/2026-Q4/README.md
---

# YiKnowledge — 统一知识中台（Markdown + Frontmatter + Curator 治理 + RAG 索引）

> **类型**: 知识库 / YiKnowledge 根目录 | **技术栈**: Markdown + YAML Frontmatter、YAML 元数据、Curator 四阶段治理、RAG 向量索引（YiAi Watcher 增量更新）| **角色覆盖**: 7 种（Curator / Author / Reviewer / Architect / Product / SRE / Executive）| **被依赖项目**: 5（YiAi、YiPot、YiPet、YiVad、YiKnowledge 自消费）

YiKnowledge 是 5 项目统一知识底座：以 `Markdown + YAML Frontmatter` 为唯一存储载体，通过 `curator` 四阶段治理流水线（收件箱→分类处理→就绪检查→归档）保证质量，配合 `YiAi Watcher` 监听文件变更并构建 RAG 向量索引，向 YiAi（RAG 问答）、YiVad（项目看板）、YiPet（聊天注入知识）三端提供语义检索与引用溯源能力。

---

## 快速开始

```bash
cd YiKnowledge

# 1. 了解目录结构与治理规范
cat curator/governance/0002-治理-治理规范.md
cat curator/governance/0004-治理-就绪检查清单.md

# 2. 新建专业文档（复制知识叶子模板）
cp curator/templates/0002-模板-知识叶子模板.md \
   projects/<yours>/<topic>/YYYY-MM/NN-prd-<主题>.md

# 3. 填写 Frontmatter 15 强制字段（见下文规范）
#    type / title / status / created / updated / category / tags / roles /
#    benefit / acceptance_criteria(3+) / related(3+真实) / source / lifecycle / aliases / project_id

# 4. 自检 Frontmatter 合规
#    - benefit: 一句话业务价值
#    - acceptance_criteria: ≥3 条可量化
#    - related: ≥3 条真实相对路径文件

# 5. 提交 PR 进入治理流水线：
#    收件箱(curator/governance/03) → 分类(07) → 就绪检查(04) → 归档(archive/01)

# 6. 索引自动构建：YiAi Watcher 监听 git push → 增量索引 → RAG 可检索
```

**前置条件**：
- Git + GitHub/GitLab PR 流程（治理状态基于 PR Label 流转）
- YiAi Watcher 服务已部署（见下文「索引构建&更新流程」）
- 本地任意 Markdown 编辑器（支持 Frontmatter 高亮，如 VS Code + YAML 插件）
- Node.js 18+（若需本地运行 Frontmatter Lint 脚本 `curator/.scripts/lint-frontmatter.mjs`）

---

## 目录结构树

```
YiKnowledge/
├── INDEX.md                  # 全站知识地图入口（Top Nodes）
├── README.md                 # 项目简介 + 导航 + 贡献指南
├── QUICKREF.md / MEMORY.md   # 速查卡与跨会话记忆
├── CLAUDE.md                 # AI 辅助编码系统提示词（.cursorrules 同级）
│
├── aier/                     # AI 工程研究域
│   ├── foundations/          # LLM基础、RAG设计模式、AI安全
│   ├── methods/              # Agent架构、评估、提示词工程
│   ├── platform/             # Embedding、LLM对比、向量库选型
│   ├── prompts/              # 场景化 Prompt 模板库
│   ├── machine-learning/     # 传统 ML 模式
│   └── INDEX.md / README.md
│
├── books/                    # 非结构化资产（PDF/EPUB 原始书籍）
│
├── curator/                  # 治理中枢（Curator 工作域）
│   ├── governance/           # 四阶段治理文件
│   │   ├── 0001-治理-知识健康看板.md      # 8 项核心指标仪表盘
│   │   ├── 0002-治理-治理规范.md          # 四阶段定义 + SLA
│   │   ├── 0003-治理-收件箱.md            # 待认领文档池
│   │   ├── 0004-治理-就绪检查清单.md      # 15 字段 + 质量门槛
│   │   ├── 0005-治理-审查日志.md          # Review 留痕
│   │   ├── 0006-治理-隐性知识待办.md      # 专家经验沉淀池
│   │   ├── 0007-治理-分类处理.md          # 分类/打标/归属
│   │   └── 0008-治理-操作速查卡.md        # Curator 口袋指南
│   ├── templates/            # 9 类文档模板（ADR/PRD/叶子/会议/1v1/回顾 等）
│   ├── archive/              # 已归档文档（只读，≥180 天未触碰）
│   ├── diagrams/             # 知识地图、目录蓝图、看板索引、用户旅程
│   ├── okr/                  # 治理域 OKR 复盘
│   └── INDEX.md / README.md / COLLABORATION.md
│
├── engineer/                 # 工程域（工程师视角）
│   ├── projects/             # 01~06 项目总览（YiAi/YiKnowledge/YiPet/YiVad/YiPot/YiKnowledge）
│   ├── build/                # 构建/API/调试/性能/环境变量
│   ├── learn/                # 经验教训库（lessons + projects 子域）
│   ├── run/                  # 入职/工作流/Git/Code Review/排期
│   ├── ship/                 # 交付/容量/迁移/技术债/CI-CD/部署
│   └── INDEX.md / README.md / ENGINEERING.md / SECURITY.md
│
├── executive/                # 高管域
│   ├── strategy/             # 50+ 战略框架（蓝海/BCG/SWOT/OKR 方法 等）
│   ├── roadmap/              # 年度/预算/OKR追踪/季度回顾
│   ├── industry/             # 行业报告/市场趋势/竞品分析
│   ├── reading-list/         # 高管读书清单与笔记
│   ├── risk/                 # 风险/事故/灾难恢复
│   └── INDEX.md / CHECKLIST.md / README.md
│
├── leader/                   # 技术管理域
│   ├── architecture/         # ADR、选型、技术写作、可观测、Feature Flag
│   ├── decisions/            # 5 项目决策记录（yiai-0x / yipot-0x 等）
│   ├── capacity/             # FinOps、预算、依赖审计、自建 vs 采购
│   ├── roadmap/              # 看板/容量/SLO/技术债/估算/入职
│   ├── risk/                 # 上线评估/事后复盘/Runbook/备份
│   ├── okr/                  # 管理层 OKR 汇总
│   └── INDEX.md / QUICKREF.md / README.md
│
├── product/                  # 产品域
│   ├── discovery/            # PRD/数据驱动/用户画像/访谈/北极星
│   ├── frameworks/           # JTBD/Kano/MoSCoW/OKR设计/RICE/故事地图
│   ├── delivery/             # Sprint/发布清单/干系人/Beta/跨项目协作
│   ├── strategy/             # 竞品/路线图/PMF/功能采用/AI客服案例
│   ├── projects/             # 5 项目产品管理 + 指标度量
│   └── INDEX.md / README.md
│
└── projects/                 # 5 项目独立工作域（研发 PRD/OKR/Bugs/Devs 等）
    ├── yiai/                 # prds/YYYY-MM(200+), okrs/, bugs/, devs/, tests/, workflows/
    ├── yipot/                # prds/YYYY-MM(99), okrs/, bugs/(6分类), workflows/
    ├── yipet/                # prds/YYYY-MM(200+), okrs/, bugs/, devs/, tests/, workflows/
    ├── yivad/                # (engineer/learn/projects/yivad 互补)
    ├── yiknowledge/          # okrs/, bugs/
    └── INDEX.md / README.md
```

---

## 7 角色地图

| 角色 | 典型人群 | 核心动作 | 主要目录/文件 | 输入 | 输出 |
|------|---------|---------|--------------|------|------|
| **Curator**（治理员） | 知识管理员、PMO | 收件箱认领、分类、打标、就绪检查、归档触发 | curator/governance/*、templates/ | PR 新建文档、专家 Review 意见 | 治理状态流转、健康看板更新 |
| **Author**（作者） | 工程师、产品、设计师、专家 | 按模板撰写文档、填 Frontmatter、响应 Review | projects/*/prds/、engineer/、product/ | 业务需求、技术方案、数据 | 文档初稿 + Frontmatter 合规 |
| **Reviewer**（评审人） | TL、架构师、资深 IC | 就绪检查清单 15 项逐项过、质量批注 | curator/governance/04、审查日志 05 | Author 提交的 PR | Review 意见 + Label 通过/驳回 |
| **Architect**（架构师） | 首席、架构组 | 决策记录（ADR）、Frontmatter 规范升级、目录结构演进 | leader/architecture/、leader/decisions/、templates/ | 技术战略、跨项目痛点 | ADR、目录蓝图、规范升级 |
| **Product**（产品） | 5 项目 PM、PO | PRD 撰写、需求追溯、指标度量、OKR 对齐 | product/projects/*、projects/*/prds/、product/frameworks/ | 用户反馈、业务目标 | PRD、指标面板、OKR 进度 |
| **SRE / Index Platform**（运维/索引） | SRE、平台工程师 | YiAi Watcher 部署、索引增量、RAG 质量监控、健康看板数据接入 | aier/platform/、aier/foundations/02-RAG、curator/governance/01-健康看板 | Git webhook、文档变更、向量库 SLO | 索引版本、RAG MRR、看板指标 |
| **Executive**（高管） | CTO、VP、总监 | 季度 OKR Review、战略框架选用、路线图决策 | executive/strategy/、executive/roadmap/、leader/roadmap/10-审查-Q4 | 治理健康度、RAG 复用率、项目 OKR | 战略输入、预算、优先级排序 |

---

## 4×5 流水线映射（治理四阶段 × 5 项目归属）

| 阶段 \ 项目 | **YiAi**（AI 服务） | **YiPot**（桌面翻译） | **YiPet**（浏览器助手） | **YiVad**（项目平台） | **YiKnowledge**（自治理） |
|-------------|---------------------|----------------------|------------------------|----------------------|--------------------------|
| **① 收件箱**<br>`curator/governance/03` | `projects/yiai/prds/YYYY-MM/NN-*` 新建 PR，Label=`待认领` | `projects/yipot/prds/YYYY-MM/NN-*` Bugs 关联 PRD | `projects/yipet/prds/YYYY-MM/NN-*` 扩展新功能 PR | `engineer/learn/projects/yivad/NN-*` 流水线文档 | `curator/*` 规范/模板/看板升级 PR |
| **② 分类处理**<br>`curator/governance/07` | 打标签：`aier`/`检索`/`Agent`/`RAG`；归属 `projects/yiai/prds` | 打标签：`桌面`/`翻译`/`OCR`/`Tauri`；关联 Bugs | 打标签：`扩展`/`MV3`/`聊天`/`工具`；归属 Chrome/Edge/Firefox | 打标签：`效能`/`CI-CD`/`MongoDB`/`Rsbuild` | 打标签：`治理`/`模板`/`目录`；推进 04 就绪 |
| **③ 就绪检查**<br>`curator/governance/04` | 15 字段 + RAG 可消费性（语义分块/引用锚点） | 15 字段 + Bug 关联（功能缺陷/平台兼容/性能） | 15 字段 + MV3 兼容清单（三端差异备注） | 15 字段 + 数据一致性/MongoDB Schema 校验 | 15 字段 + 全库扫描 + 影响面评估 |
| **④ 归档**<br>`curator/archive/01` | 文档稳定 ≥180 天、RAG 引用量 Top 20% 标记「经典」 | v4.0 发版后冻结 PRD，迁移至 `yipot/archive` | v3.0 扩展发布后冻结，MV4 规划引用此基线 | 季度结束归档该季流水线文档 | 季度治理报告 + 模板历史版本归档 |
| **⑤ 索引（横切）**<br>YiAi Watcher | 增量入库 → Embedding → 向量库，RAG MRR 周评估 | 划词/翻译/OCR PRD 知识注入 YiPot 推荐链路 | 聊天弹框注入上下文 → 知识引用跳转 | 项目数据 5 条目一致性校验文档入 RAG | 治理规范/模板入 RAG，Author 自助问答 |

---

## Frontmatter 规范（15 强制字段）

所有 Markdown 文档 **必须** 以 YAML Frontmatter 开头，以下 15 字段 **强制齐全**，缺失即阻塞就绪检查（curator/governance/04）。

| # | 字段 | 类型 | 说明 | 示例值 |
|---|------|------|------|--------|
| 1 | `type` | string enum | 文档类型：`okr-summary` / `summary` / `prd` / `adr` / `template` / `lesson` / `decision` / `guide` | `okr-summary` |
| 2 | `title` | string | 标题，≤50 字，含项目/季度/主题 | `"YiPot 2026-Q3 OKR → PRD 可追溯矩阵"` |
| 3 | `status` | string enum | 生命周期状态：`draft` / `active` / `stable` / `archived` / `deprecated` | `active` |
| 4 | `created` | ISO date | 文档创建日期，YYYY-MM-DD | `2026-10-07` |
| 5 | `updated` | ISO date | **最近更新日期**，每次修改必填（YiAi Watcher 新鲜度判定来源） | `2026-10-07` |
| 6 | `category` | string | 目录路径分类，对应顶层文件夹 | `engineer/projects` |
| 7 | `tags` | string[] | 检索标签，≥3 个 | `[yipot, tauri, rust, desktop, translation]` |
| 8 | `roles` | string[] | 目标角色：`engineer` / `product` / `leader` / `curator` / `executive` / `sre` / `architect` | `[engineer]` |
| 9 | `benefit` | string | **一句话业务价值**（≤80 字），明确收益 + 对象 | `"YiPot 桌面翻译应用完整开发参考：快速开始、架构、Commands、API、配置"` |
| 10 | `acceptance_criteria` | string[] | **≥3 条可量化验收标准**，SMART 原则 | `- "新开发者 10 分钟启动"` / `- "Tauri invoke 契约明确"` |
| 11 | `related` | string[] | **≥3 条真实相对路径**（用 `../../`，不能写占位符），grep 校验文件存在 | `- ../../curator/governance/0001-治理-知识健康看板.md` |
| 12 | `source` | string enum | 来源：`internal`（内部原创） / `external`（外部整理） / `mixed` | `internal` |
| 13 | `lifecycle` | string enum | 项目/文档所处：`active` / `maintenance` / `sunset` / `incubating` | `active` |
| 14 | `aliases` | string[] | 别名/反向链接关键词，RAG 召回增强（可选但推荐，强制字段集内占位空数组也可） | `[yipot-knowledge, tauri-desktop-translator]` |
| 15 | `project_id`? / `period`? | string | **条件强制**：OKR 文档强制 `period`（如 `"2026 Q4"`）+ `project_id`（`yiai/yipot/yipet/yivad/yiknowledge`）；项目文档强制 `project: XXX` | `period: "2026 Q4"` / `project_id: yipot` |

---

## 健康仪表盘引用

详见 [curator/governance/0001-治理-知识健康看板.md](../../curator/governance/001-治理-知识健康看板.md)，YiKnowledge 实时监控 8 项核心指标：

| # | 指标名 | 目标值 | 计算口径 | 数据来源 |
|---|--------|--------|---------|---------|
| 1 | **文档新鲜度**（近 30 天占比） | ≥ 95% | `count(updated ≥ TODAY-30) / total_count` | Frontmatter `updated` 全库扫描（每日 03:00） |
| 2 | **Frontmatter 合规率**（15 字段） | ≥ 99% | `count(15字段齐全) / total_count` | `curator/.scripts/lint-frontmatter.mjs` CI |
| 3 | **治理 SLA 达标率**（四阶段） | ≥ 95% | 各阶段耗时 ≤ SLA 文档数 / 总数 | curator/governance 03/07/04/01 流转记录 |
| 4 | **RAG MRR@5**（黄金集 500 条） | ≥ 0.64 | 标准问答集评估，每周三 02:00 跑批 | YiAi RAG 评估流水线（213-prd-RAG评估基准） |
| 5 | **RAG Recall@10** | ≥ 0.82 | Top10 命中相关文档占比 | 同上 |
| 6 | **知识复用率**（5 项目消费占比） | ≥ 70% | 被 YiAi 引用 / YiVad 展示 / YiPet 注入文档数 / 总数 | 三端引用日志 + 锚点回链计数 |
| 7 | **收件箱积压（>24h 未认领）** | ≤ 5 份 | `count(收件箱停留>24h)` | curator/governance/03-收件箱.md |
| 8 | **文档月度净增长**（新增 - 归档） | 40~60 份 | `count(本月created) - count(本月archived)` | 全库 created/archived 时间戳 |

---

## 索引构建 & 更新流程（YiAi Watcher）

YiAi Watcher 是 YiKnowledge → RAG 向量库的增量同步通道，基于 `inotify + git webhook` 双保险。

```
        作者本地编辑                    GitHub/GitLab                    YiAi 集群
 ┌──────────────────────┐      ┌──────────────────────┐     ┌─────────────────────────────┐
 │ vim/VS Code 写 MD    │─PR──▶│  push → webhook POST │────▶│  Watcher Receiver (队列)    │
 │ Frontmatter 15 字段  │  CI  │  CI lint-frontmatter │     │                             │
 └──────────────────────┘  OK  └──────────┬───────────┘     │  ┌───────────────────────┐  │
                                          │                 │  │  Diff Parser          │  │
                                          │                 │  │  - 新增/变更文件清单  │  │
                ┌─────────────────────────┘                 │  │  - Frontmatter Δ 解析 │  │
                │                                           │  └──────────┬────────────┘  │
                ▼                                           │             ▼               │
   ┌──────────────────────────┐                            │  ┌───────────────────────┐  │
   │  inotify 本地镜像同步    │─── FS 事件批处理 ─────────▶│  │  Chunker (语义分块)   │  │
   │  (容灾：webhook 丢失时)  │   每 5min 或批次 ≥50       │  │  - 按 ## / ### 切      │  │
   └──────────────────────────┘                            │  │  - 每块 512 tokens ±  │  │
                                                           │  └──────────┬────────────┘  │
                                                           │             ▼               │
                                                           │  ┌───────────────────────┐  │
                                                           │  │  Embedding (YiAi 151) │  │
                                                           │  │  - batch ≤32 并发     │  │
                                                           │  └──────────┬────────────┘  │
                                                           │             ▼               │
                                                           │  ┌───────────────────────┐  │
                                                           │  │  向量库 upsert/delete │  │
                                                           │  │  - Milvus / Qdrant     │  │
                                                           │  │  - payload: 标题/标签/│  │
                                                           │  │    roles/updated/路径 │  │
                                                           │  └──────────┬────────────┘  │
                                                           │             ▼               │
                                                           │  ┌───────────────────────┐  │
                                                           │  │  黄金集 MRR 周评估    │  │
                                                           │  │  - RAG 劣化自动报警   │  │
                                                           │  └───────────────────────┘  │
                                                           └─────────────────────────────┘
```

**关键保障**：
- **增量延迟**：Webhook 路径 P95 ≤ 60s；inotify 兜底 ≤ 6min
- **一致性**：每次索引写入带 `commit_sha`，回滚可按 SHA 删向量
- **新鲜度**：`updated > 90天` 文档向量 tag=`stale`，RAG 排序降权 30%
- **可观测**：索引吞吐、分块数、Embedding 失败率接入 健康看板 #7 扩展位

---

## 依赖关系图（被 5 项目依赖 + 三消费端）

```
                          ┌────────────────────────────────────────────────────┐
                          │              YiKnowledge 知识中台                   │
                          │  Markdown + Frontmatter + Curator 四阶段治理        │
                          │  ├─ aier/       (AI 研究域)                         │
                          │  ├─ curator/    (治理中枢)                          │
                          │  ├─ engineer/   (工程域)                            │
                          │  ├─ executive/  (高管域)                            │
                          │  ├─ leader/     (技术管理域)                        │
                          │  ├─ product/    (产品域)                            │
                          │  └─ projects/   (5 项目工作域)                      │
                          └────────────┬───────────────────┬───────────────────┘
                                       │  被依赖/被消费     │ 被消费
                    ┌──────────────────┼─────────────┐     │
                    │                  │             │     │
          ┌─────────▼──────┐  ┌───────▼──────┐  ┌───▼───────┐   ┌──────────────────┐
          │   **YiAi**     │  │  **YiVad**   │  │ **YiPet** │   │  YiPot（弱依赖） │
          │   RAG 消费端    │  │  项目数据     │  │ 聊天注入  │   │  PRD/Bug 归档   │
          │                │  │  看板渲染     │  │ 知识引用  │   │  推荐训练语料   │
          │ 问答 RAG 检索  │  │  5 项目       │  │ 锚点跳转  │   │                  │
          │ 引用溯源(锚点) │  │  MongoDB      │  │ 选中文本  │   └──────────────────┘
          │ 黄金集 MRR     │  │  一致性校验   │  │ → RAG 问答│
          │                │  │  OKR 指标聚合 │  │ MV3 SW    │
          │ Watcher 构建者  │  │ 效能度量     │  │ 缓存      │
          └────────────────┘  └──────────────┘  └───────────┘
                    │                  │                 │
                    └──────────────┬───┴────────────┬────┘
                                   │                 │
                                   ▼                 ▼
                        统一 RAG 向量库          统一锚点回链日志
                     (Milvus / Qdrant)         (PostgreSQL / ClickHouse)
                      - 50w+ 语义分块            - 5 项目消费路径
                      - payload: Frontmatter    - SLA 归因 Curator
```

**关键依赖方向**：
| 消费者 | 消费内容 | 调用方式 | SLA |
|--------|---------|---------|-----|
| **YiAi**（强依赖） | 全库分块向量、Frontmatter payload、锚点 | Embedding API + 向量检索 | 99.9% |
| **YiVad**（强依赖） | OKR/PRD 元数据、5 项目文档数量/新鲜度指标 | Frontmatter Lint API + 看板聚合 | 99.5% |
| **YiPet**（中依赖） | 用户选中文本 → Top3 知识卡片 + 锚点跳转 | RAG 轻量检索接口（Recall@3） | 99% |
| **YiPot**（弱依赖） | 翻译/OCR 历史 PRD 语料 → 推荐模型训练 | 文档批量导出 + 离线训练 | 98% |
| **YiKnowledge 自消费** | Curator 自助问答（规范/模板/ADR） | YiAi 白标 RAG 入口 | 99% |

---

## 常见问题 FAQ（8 条）

### Q1. 新建文档 Frontmatter 写完后，如何快速自检 15 字段齐全？
本地跑 Lint 脚本（依赖 Node 18+）：
```bash
node curator/.scripts/lint-frontmatter.mjs engineer/projects/0002-项目-YiKnowledge项目.md
# 输出 OK / 缺失字段清单 / related 不存在的文件
```
CI 中已接入，PR 不合规则 `blocking`。

### Q2. related 字段写相对路径，如何快速确认目标文件真的存在？
```bash
# 任一文档路径，cd YiKnowledge 后执行：
while read p; do [ -f "$p" ] && echo "OK $p" || echo "MISSING $p"; done \
  < <(grep '^\s*-\s' <your-doc.md> | head -20 | sed 's/^\s*-\s*//')
```
或者 VS Code 安装 `Markdown Links` 插件，Ctrl+Click 跳转验证。

### Q3. 文档已归档，想更新但怕破坏"冻结"状态怎么办？
归档文档路径前缀 `curator/archive/`，按规范 **复制一份** 到 `projects/<域>/prds/YYYY-MM/`，递增版本号（如 `v2`），原归档保留只读，在新文档 `related` 中加原归档路径，注明「 supersedes: <归档路径> 」。

### Q4. Frontmatter 中 `updated` 忘改，Watcher 会把文档误判为 stale 吗？
会——新鲜度 **唯一判定来源** 就是 Frontmatter `updated`（而非文件 mtime/git time）。补救：
1. 手动改 `updated` 为当日，提交 PR；
2. 或在文档正文末尾加「 Changelog: YYYY-MM-DD 修正 updated 」方便 Review。

### Q5. RAG 引用的段落锚点怎么加？才能让 YiAi 点击跳转准确定位？
在目标标题上方加锚点（Markdown 兼容）：
```markdown
<a id="section-frontmatter-spec"></a>
## Frontmatter 规范（15 强制字段）
```
然后在 YiAi 引用模板中写 `related`：`#section-frontmatter-spec`，Watcher 会解析锚点写入向量 payload。

### Q6. 同一知识同时属于 engineer + product，放哪个顶层目录？tags 怎么打？
**单一事实源原则**：以 **编写者主要视角** 选主目录，另一域通过 `related` 链接 + 双 tags 解决。例：API 设计主归 `engineer/build/0002-构建-API设计模式.md`，同时 `tags: [engineer, product, api-design]`，`product/discovery/0001-发现-编写PRD.md` → `related` 回链。

### Q7. 文档敏感（如内部定价、人员 1v1），不想入 RAG 索引怎么办？
Frontmatter 加可选开关：`index: false`（第 16 字段，非强制但标准）。Watcher Diff Parser 识别 `index: false` 直接跳过分块，**不入向量库**。合规文件（个人 1v1、法务合同）**必须** 加此开关。

### Q8. 5 项目 `projects/*/okrs/YYYY-QN/README.md` 的 benefit 条数要求？
**统一要求**：6 份 OKR 总结文档 **总 benefit=6 条**，即每份 exactly 1 条 benefit 字段（Frontmatter 顶部 `benefit:`），合计 6。禁止一份写多条 benefit，也禁止缺漏。可通过下文「验证命令」核对：`grep -Hc '^benefit:'` 6 份文件都应为 1，总和 6。

---
