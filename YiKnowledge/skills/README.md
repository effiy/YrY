---
title: YiKnowledge Skills — 自定义技能集
tags: [skills, index, ai, workflow]
category: aier/skills
created: 2026-09-10
updated: 2026-09-23
source: internal
type: index
status: stable
---

# YiKnowledge Skills — 自定义技能集

> 14 个技能覆盖软件交付全流程：讨论 → 需求 → 规划 → 实现（TDD → 请求审查 → 审查 → 接收反馈 → 调试）→ 验证 → 收尾 → 追踪。
> 设计原则：渐进式披露、可组合、与项目知识库深度集成。
> 参考来源：obra/superpowers、worldflowai/everything-claude-code、othmanadi/planning-with-files。

## 技能总览

| # | 技能 | 阶段 | 灵感来源 | 核心产出 |
|---|------|------|---------|---------|
| 1 | [brainstorming](brainstorming/SKILL.md) | 讨论 | superpowers `/brainstorm` | 设计摘要 + 决策记录 |
| 2 | [prd-creator](prd-creator/SKILL.md) | 需求 | — | 9 章节 PRD 文档 |
| 3 | [task-planning](task-planning/SKILL.md) | 规划 | planning-with-files 三文件模式 | task_plan + findings + progress |
| 4 | [test-driven-development](test-driven-development/SKILL.md) | 实现 | superpowers TDD | Red-Green-Refactor 循环 |
| 5 | [code-review](code-review/SKILL.md) | 实现 | superpowers + everything-claude-code | 六维分级审查报告 |
| 6 | [debugging](debugging/SKILL.md) | 实现 | superpowers systematic-debugging | 根因分析 + 修复方案 |
| 7 | [verification-before-completion](verification-before-completion/SKILL.md) | 交付 | superpowers + planning-with-files | 确定性完成门禁报告 |
| 8 | [finishing-a-development-branch](finishing-a-development-branch/SKILL.md) | 收尾 | superpowers | 规范提交 + 文档更新 + PR |
| 9 | [issue-creator](issue-creator/SKILL.md) | 追踪 | — | 结构化 Issue + 健康报告 |
| 10 | [pretty-mermaid](pretty-mermaid/SKILL.md) | 可视化 | — | SVG/PNG/ASCII 图表 |
| 11 | [import](import/SKILL.md) | 同步 | — | 批量文件上传 |
| 12 | [skill-creator](skill-creator/SKILL.md) | 元技能 | Anthropic 官方 skill-creator | 新技能 + 基准测试报告 |

## 技能协作流

完整的开发工作流中，技能按以下顺序协作：

```
讨论阶段            需求阶段            规划阶段            实现阶段                        交付阶段
────────            ────────            ────────            ────────                       ────────
brainstorming  →   prd-creator    →   task-planning   →   test-driven-development   →   verification
   │                    │                    │             (TDD)                     before-completion
   │  设计摘要          │  PRD               │  执行计划    │  Red-Green-Refactor    →   ✅/❌
   │  决策记录          │  功能需求          │  三文件持久化 │  先写测试再写实现           │
   │                    │                    │  Crash-Proof  │                            │
   └──→ 方向确认 ──────→ 需求落地           │               │                            │
                                             │               ├──→ code-review ──→ 审查   │
                        └──→ 功能需求 ──────→ 拆解步骤       │    六维分级               │
                                             │               │                            │
                                             └──→ Bug 发现 ──┴──→ debugging ──→ 修复     │
                                                                  │                      │
                                                                  └──→ 根因分析          │
                                                                                         │
追踪（贯穿全流程）：issue-creator → Issue 管理 / 看板 / 诊断                             │
可视化（贯穿全流程）：pretty-mermaid → 架构图 / 流程图 / ERD                            │
同步（交付阶段）：import → 远程文档同步                                                 │
元技能（持续改进）：skill-creator → 技能创建和基准测试                                  │
```

## 工作流示例

### 示例 1：新功能开发（完整流程）

```
用户：「我想给 YiVad 加个暗色模式，但不确定怎么做比较好」

1. brainstorming           → 讨论需求边界、技术方案对比、确认方向
2. prd-creator             → 产出正式 PRD：9 章节需求文档
3. task-planning           → 将 PRD 拆解为 6 个执行步骤，创建三文件
4. TDD (每步)              → 每步先写测试（RED），再写实现（GREEN），最后重构（REFACTOR）
5. code-review             → 六维审查全部变更（含 RPC 契约检查）
6. verification            → 确定性完成门禁：自动化 + 人工 + 边界
7. finishing               → 最终验证 → 更新文档 → 生成提交 → 清理分支
8. issue-creator           → 如有遗留问题，创建 Issue 追踪
8. [归档]                  → task_plan → projects/yivad/devs/
```

### 示例 2：TDD 单步执行

```
用户：「开始执行步骤 4，先写测试」

1. TDD: RED               → 写 ThemeToggle 组件测试（渲染三种模式、emit toggle 事件）
2. 确认测试失败           → 组件不存在，测试红色
3. TDD: GREEN             → 写最小实现让测试通过
4. TDD: REFACTOR          → 提取主题常量，改善命名
5. progress.md            → 记录步骤 4 完成，测试 3/3 passed
```

### 示例 2：快速 Bug 修复

```
用户：「YiVad 项目列表分页后列头丢失，帮我看看」

1. debugging               → 观察→假设→实验→结论，对照 bug 模式库定位根因
2. code-review             → 审查修复代码，六维检查（重点是正确性和跨项目契约）
3. verification            → 类型检查 + 测试 + 人工验证
4. issue-creator           → 如值得记录，创建 Bug Issue 归档
5. [Bug 文档]              → 归档到 projects/yivad/bugs/
```

### 示例 3：代码审查

```
用户：「帮我 review 一下今天的改动」

1. code-review             → git diff → 六维审查（安全/正确性/性能/可维护性/架构/RPC契约）
2. [修复 P0/P1]            → 修复严重和重要问题
3. verification            → 确认修复后自动化检查通过
```

### 示例 4：模糊需求起步

```
用户：「我在想要不要给 YiAi 加个缓存层」

1. brainstorming           → 澄清动机和约束，方案 A（Redis）vs B（内存）vs C（不做）
2. [用户确认方案]          → 选择方案 A
3. prd-creator             → 撰写缓存层 PRD
4. task-planning           → 拆解为执行步骤
...
```

## 技能设计原则

### 渐进式披露

每个技能遵循三层加载模式：

1. **元数据层**（name + description）— ~100 词，始终在上下文中
2. **指令层**（SKILL.md 正文）— <500 行，技能触发时加载
3. **资源层**（references/、scripts/）— 按需加载

### 可组合

技能设计为可独立使用，也可按工作流串联。每个技能的「与项目文档协作」章节定义了上下游接口。

### 项目集成

所有技能通过以下方式与 `YiKnowledge/projects/` 深度集成：
- 产出的文档可归档到项目文档目录（PRD → devs/、Bug → bugs/）
- 参考项目已有的架构、Bug 历史、开发规范
- 使用项目统一的 frontmatter 和文件命名约定
- 专项检查基于真实 Bug 模式（如 RPC 参数契约检查、MongoDB 连接池检查）

## 参考来源与设计理念

| 来源 | 核心理念 | 在本技能集中的体现 |
|------|---------|------------------|
| **obra/superpowers** | Process over Prompt — 先问再做 | brainstorming（先讨论再编码）、verification（完成后验证） |
| **worldflowai/everything-claude-code** | 模块化、可插拔的 AI 协作系统 | code-review（六维审查）、技能协作链设计 |
| **othmanadi/planning-with-files** | 文件系统作为 AI 的外部长期记忆 | task-planning（三文件上下文持久化）、findings/progress 即时写入 |
| **YiKnowledge/projects** | 真实项目文档体系和 Bug 历史 | 所有技能的专项检查、模板对齐、知识归档 |

## 目录结构

```
skills/
├── README.md                             # 本文件 — 技能总览和工作流
├── brainstorming/                        # 需求澄清与方案探讨
│   ├── SKILL.md
│   └── references/
│       ├── clarification-framework.md
│       └── decision-record-template.md
├── prd-creator/                          # PRD 生成器
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       └── example-prd.md
├── task-planning/                        # 任务规划与上下文持久化
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── three-file-pattern.md
│       ├── integration-guide.md
│       └── project-templates.md
├── test-driven-development/              # 测试驱动开发（TDD）
│   ├── SKILL.md
│   └── references/
│       └── tdd-patterns.md
├── code-review/                          # 代码审查（六维）
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── review-checklist.md
│       └── severity-guide.md
├── debugging/                            # 系统化调试
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── diagnostic-patterns.md
│       ├── bug-taxonomy.md
│       └── bug-corpus.md
├── verification-before-completion/       # 完成前验证
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       └── verification-checklist-full.md
├── finishing-a-development-branch/       # 开发分支收尾
│   ├── SKILL.md
│   └── references/
│       └── conventional-commits.md
├── issue-creator/                        # Issue 追踪管理
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       └── issue-model.md
├── pretty-mermaid/                       # Mermaid 图表
│   ├── SKILL.md
│   ├── references/
│   │   ├── DIAGRAM_TYPES.md
│   │   ├── THEMES.md
│   │   └── api_reference.md
│   └── scripts/
├── import/                               # 文档同步
│   ├── SKILL.md
│   ├── sync.mjs
│   └── lib/
├── shared/                               # 共享资源
│   ├── glossary.md                       # 技能共享术语表
│   ├── decision-tree.md                  # 技能选择决策树
│   └── hooks-integration.md              # Hooks 集成指南
└── skill-creator/                        # 技能创建器（元技能）
    ├── SKILL.md
    ├── README.md
    ├── agents/
    ├── scripts/
    ├── eval-viewer/
    └── references/
```

## 技能成熟度

| # | 技能 | 状态 | 测试覆盖 | 参考文件数 | 最后更新 |
|---|------|------|---------|----------|---------|
| 1 | brainstorming | new | 待验证 | 2 | 2026-09-23 |
| 2 | prd-creator | stable | 人工审查 | 1 | 2026-09-23 |
| 3 | task-planning | new | 待验证 | 3 | 2026-09-23 |
| 4 | test-driven-development | new | 待验证 | 1 | 2026-09-23 |
| 5 | code-review | new | 待验证 | 2 | 2026-09-23 |
| 6 | debugging | new | 待验证 | 3 | 2026-09-23 |
| 7 | verification-before-completion | new | 待验证 | 1 | 2026-09-23 |
| 8 | finishing-a-development-branch | new | 待验证 | 1 | 2026-09-23 |
| 9 | issue-creator | stable | 人工审查 | 1 | 2026-09-23 |
| 10 | pretty-mermaid | stable | 冒烟测试 + 验证 | 3 | 2026-09-10 |
| 11 | import | stable | 集成测试 | — | 2026-09-10 |
| 12 | skill-creator | stable | eval 基准测试 | 1 | 2026-09-10 |

**共享资源**：[术语表](shared/glossary.md) — 一致术语 · [决策树](shared/decision-tree.md) — 技能选择 · [Hooks 集成](shared/hooks-integration.md) — 自动化触发

## 创建新技能

使用 **skill-creator** 创建新技能，遵循 4 步循环：

```
起草 → 测试（有/无技能）→ 审查（人工 + 量化）→ 改进 → 重复
```

新技能应：
1. 确定在技能协作流中的位置（上游/下游依赖哪些技能）
2. 设计与 `YiKnowledge/projects/` 的集成方式
3. 遵循渐进式披露原则（元数据 <100 词，正文 <500 行）
4. 包含至少 2 个参考文件（提供足够的领域知识）

## 参考

- [CLAUDE.md](../CLAUDE.md) — YiKnowledge 知识库规范
- [projects/INDEX.md](../projects/INDEX.md) — 项目知识中心索引
- [skill-creator](skill-creator/SKILL.md) — 技能创建和改进工具