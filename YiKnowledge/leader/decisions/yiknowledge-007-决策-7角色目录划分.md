---
title: "ADR: YiKnowledge 7 角色目录划分与流水线对应关系"
tags: [category/leader, 决策, adr, yiknowledge, roles, 7-roles, directory-structure, pipeline]
category: leader/decisions
created: 2026-10-07
updated: 2026-10-07
source: internal
type: decision
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, curator]
benefit: "YiKnowledge 200+ 文件按 7 角色目录唯一归属，新作者 1 分钟判定文件放哪，跨角色零重复，治理可按角色分工审查"
acceptance_criteria:
  - "7 角色完整定义：{executive, product, leader, engineer, sre, aier, curator}，每个角色有明确阶段定位与输入输出
  - "文件归属判定规则（决策树 ≤5 个问题）明确，任意新文件可在 1 分钟内判定目录
  - "Curator 治理按角色分工，每个角色有对应 Reviewer 责任人，季度审查可并行执行"
related:
  - ./README.md
  - ./yiknowledge-006-决策-Frontmatter字段规范.md
  - ../../curator/governance/00002-治理-治理规范.md
  - ../../README.md
  - ../../INDEX.md
  - ../../curator/INDEX.md
  - ../../curator/diagrams/00002-图表-目录蓝图.md
  - ../../curator/diagrams/00003-图表-知识地图.md
---

# ADR: YiKnowledge 7 角色目录划分与流水线对应关系

> **状态**：已接受 (2026-10-07)

---

## 上下文

当前 YiKnowledge 顶层目录（参考 `README.md:33-75`）有 7 个角色目录 + skills/projects 两个辅助目录，但：
1. **7 角色边界无书面化判定规则**：新作者写 ADR 时在 `leader/decisions` vs `product/delivery` vs `engineer/build` 之间犹豫，平均要问 Curator 1-2 次才找到正确目录
2. **文件归属漂移**：比如"排期估算"，有文件在 product/delivery/ 也有在 engineer/run/ 还有在 leader/roadmap/，重复知识 3 份且互相不一致
3. **角色责任人缺位**：curator/governance/00002-治理-治理规范.md:30-36 定义了 Author/Reviewer/Curator/Archivist 4 种治理角色，但没说"谁是 leader 目录的 Reviewer？谁是 aier 目录的 Reviewer？"——季度审查时 Curator 一个人审 200 文件，审不完
4. **7 角色和流水线阶段的映射不明确**：README.md 画了图（第 37-75 行），但各角色的具体输入/输出、"什么内容绝对不属于我"没有写死——边界模糊导致重复

为什么现在定：
- yiknowledge-06（Frontmatter）要求 `roles` 字段从 7 角色枚举取值，必须先有规范 7 角色定义
- Q3 Curator OKR 要求季度审查 ≤2 小时，必须按角色拆分 Reviewer 分工，否则 1 个人审不完

---

## 决策

**YiKnowledge 正式锁定 7 角色目录：{executive, product, leader, engineer, sre, aier, curator}，对应软件交付流水线 5 阶段 + 横切 AI 赋能 + 元层知识治理。每个角色明确「范围 / 输入输出 / 绝对不做的事 / 对应 Reviewer」，文件归属用 5 题决策树 1 分钟判定。**

### 7 角色完整定义表

| # | 角色目录 | 流水线位置 | 核心问题 | 典型子目录 | 对应 Reviewer 角色 | 绝对不做的事（红线） |
|---|---|---|---|---|---|---|
| 1 | **executive/** | 业务战略层（贯穿） | *为什么做*：业务价值、市场、组织目标 | `strategy/ industry/ roadmap/ okr/ reading-list/` | 战略负责人（executive 角色） | 绝不写任何"How to 技术实现"；绝不写 API 规范、代码模式、调试步骤——这些去 engineer |
| 2 | **product/** | 阶段 1：需求 | *做什么*：用户、需求、优先级、故事 | `discovery/ delivery/ frameworks/ strategy/ projects/` | 产品负责人（product 角色） | 绝不写技术选型、架构决策——这些去 leader；绝不写具体代码实现——去 engineer |
| 3 | **leader/** | 阶段 2：决策 | *走哪条路*：架构、ADR、技术选型、风险、路线图 | `architecture/ decisions/ capacity/ risk/ roadmap/ okr/` | 技术负责人（leader 角色） | 绝不写 API 细节、代码片段、调试教程——去 engineer/build；绝不写 OKR 具体执行排期——去 product/delivery |
| 4 | **engineer/** | 阶段 3：设计 + 构建 | *怎么做*：编码、架构模式、开发、入职、交付 | `build/ run/ ship/ learn/ projects/ SECURITY.md ENGINEERING.md` | 工程负责人（engineer 角色） | 绝不写业务战略、用户画像、商业模式——去 executive/product；绝不写 SLO、事故响应、值班流程——去 sre |
| 5 | **sre/** | 阶段 4+5：质量发布 + 运营学习 | *怎么跑*：发布、运维、可观测、事故、SLO | `release/ run/ observability/` | SRE 负责人（sre 角色） | 绝不写本地开发环境搭建、单元测试写法——去 engineer/run；绝不写架构决策——去 leader/decisions |
| 6 | **aier/** | AI 赋能层（贯穿） | *AI 如何加速*：LLM/RAG/Agent 模式、平台选型 | `foundations/ methods/ platform/ machine-learning/ prompts/` | AI 负责人（aier 角色） | 绝不写纯软件工程最佳实践（去 engineer）；绝不写纯业务战略（去 executive）；必须和 AI 至少沾边 |
| 7 | **curator/** | 元层：知识治理（横切） | *知识库本身如何维护*：规范、模板、图表、归档、治理 | `governance/ diagrams/ templates/ archive/ okr/ COLLABORATION.md` | Curator（知识库维护者） | **绝不创建领域内容**：curator 唯一不做业务/技术/产品内容，只维护 KB 结构本身——这是红线，跨了立即打回 |

### 辅助目录（非 7 角色）

| 目录 | 定位 | 规则 |
|---|---|---|
| **projects/** | 按项目聚合的视图层（和 7 角色正交） | `projects/yiai`、`projects/yipot` 等按项目组织的 PRD、Bug、OKR 镜像——镜像不算重复，知识源头仍在 7 角色；每篇 projects 下文件的 `related` 必须链接源头（7 角色中的主文档） |
| **skills/** | 可安装 Agent 技能包目录 | 纯技能资源，不属于知识叶子；skills 下文件不需要 Frontmatter，用技能自带 manifest |

### 5 题决策树（1 分钟判定文件归属）

```
Q1: 这个文件是维护"知识库本身的结构、模板、治理"的吗？
    → YES → curator/ （红线：仅元层）
    → NO  → Q2

Q2: 文件核心内容和 AI/LLM/RAG/Agent 相关吗？必须是 AI 本身的模式或平台选型？
    → YES → aier/（例：RAG 评估模式 / Agent Harness 架构）
    → NO  → Q3

Q3: 内容是"运维/发布/可观测/SLO/事故响应"吗？关心的是线上运行？
    → YES → sre/
    → NO  → Q4

Q4: 内容是"代码怎么写/怎么构建/怎么Debug/入职跑起来/怎么交付部署指南"吗？关心的是工程实现？
    → YES → engineer/
    → NO  → Q5

Q5: 内容是"为什么这样做（架构/技术选型/容量/风险/路线）"的决策文档？
    → YES → leader/（尤其 ADR 全放 leader/decisions）
    → NO（内容是"做什么：需求/用户/优先级/交付Sprint运作"）→ product/
    → 再 NO（纯战略/行业/组织/长期规划） → executive/
```

**例 1：排期估算方法** → Q1 否、Q2 否、Q3 否、Q4 是（工程怎么做规划估算）→ `engineer/run/010-运行-排期估算方法.md`（本任务要求）✓
**例 2：ADR 技术选型** → Q5 是 → `leader/decisions/yipot-xx-决策-xxx.md` ✓
**例 3：治理规范模板** → Q1 是 → `curator/governance/00002-治理-治理规范.md` ✓

---

## 备选评估

| 替代方案 | 优点 | 缺点 | 否决原因 |
|---|---|---|---|
| **方案 A：按主题分类（AI/Backend/Frontend/Product/DevOps/...）** | 符合传统笔记工具习惯，用户直觉强 | 和软件交付流水线不对应；同一功能的需求/决策/实现/运维散在 4 个主题目录，跨目录找关联很痛苦；主题数量膨胀（新增 Rust/WASM/移动端 每次加新目录） | 流水线阶段视图是 YrY 的核心价值，主题分类丢掉了因果链（为什么→做什么→怎么走→怎么干→怎么跑） |
| **方案 B：仅用 5 个流水线阶段目录，合并 executive→product、aier→engineer、curator→辅助** | 目录数少 7→5，结构更精简 | 战略层和需求层混在一起（executive 1-5 年战略 vs product 季度需求颗粒度差 10x）；AI 赋能被淹没在 engineer 中，AI 模式无人专门维护；Curator 无独立目录导致治理文档和领域内容混放 | 7 角色每个都有清晰红线，合并后边界模糊回到现状；aier 作为单独目录是 AI 时代的刚需 |
| **方案 C（已选择）：7 角色目录 + 2 辅助目录 + 5 题决策树** | 流水线因果链完整；每个角色有明确"绝对不做"红线避免重叠；5 题决策树新作者 1 分钟判定；Curator 季度审查按角色拆 Reviewer | 新作者第一次要学 7 角色定位（约 10 分钟阅读本 ADR）；projects/ 作为视图层镜像文件会有轻度重复 | 10 分钟学习成本极低，模板（curator/templates/00-INDEX.md）第 1 页就放决策树；projects/ 镜像带来的检索收益远大于轻度重复 |

---

## 后果

### 正面影响
- **归属判定 10 分钟 → 1 分钟**：新作者用 5 题决策树立即找到目录，不再频繁问 Curator → Curator 沟通量 -80%
- **跨角色零重复**：红线 + 决策树双保险，"排期估算"这类之前 3 目录重复的内容强制收敛到唯一归属
- **季度审查可并行**：7 角色对应 7 个 Reviewer，原本 Curator 1 人审 2 小时 → 7 人并行每人审 15 分钟 → 总工时从 2h → 1.75h 但 wall-clock 从 2h → 15min
- **Frontmatter roles 字段有依据**：yiknowledge-06 要求 roles 字段枚举取值，本 ADR 就是枚举定义的权威来源

### 负面影响
- **现有 200 文件漂移治理约 2 人天**：至少 10-15 个文件放错目录（例：决策类内容在 product/），需要 Curator 批量移动并更新所有 `related` 链接——约 2 人天
- **5 题决策树学习 10 分钟**：新作者入职需要先看本 ADR；把决策树做成"就绪检查清单 10 题"第一题，自动提醒
- **projects/ 镜像维护**：projects/yiai/、projects/yipot/ 下聚合视图需要人工维护和 7 角色源头的一致性；每季度审查时加 1 题"镜像文件的 related 链到源头了吗？"

### 中性影响
- **与 yiknowledge-06（Frontmatter）的协作**：yiknowledge-06 中 roles 合法取值枚举 = 本 ADR 7 角色；若未来新增第 8 角色（例：designer），必须先改本 ADR 再改 yiknowledge-06 枚举
- **与 yiknowledge-08（INDEX+README 双入口）的协作**：每个 7 角色目录都要 INDEX.md（结构化总览 + 新人路径 + 审查流程）+ README.md（角色定位 + 流水线位置 + 红线）共 14 份入口文档，本决策确定后统一补齐
- **Curator 红线的严格执行**：curator/ 下出现领域内容（例：curator/ 下放了一篇 API 设计）——Curator 有义务立即打回 Author 移到正确目录，否则视为 Curator 审查失职

---

## Status

**状态：accepted（已接受）**

**日期：2026-10-07**

**落地步骤：**
1. 立即：本 ADR + 本任务 13 份文档全部严格遵守 7 角色边界
2. 一周内：curator/templates/00-INDEX.md 首页放 5 题决策树；curator/governance/04-就绪检查清单第 1 题 = "目录归属对吗？跑决策树"
3. 两周内：现有 200 文件归属审查，标错目录的 10-15 份批量移动，批量更新 related 链接
4. 下季度审查：7 角色 Reviewer 责任人列表公开，7 人并行各自审查所属目录
