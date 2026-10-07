---
title: 技能选择决策树
updated: 2026-09-23
tags: [skills, reference, decision-tree, workflow]
type: reference
status: stable
---

# 技能选择决策树 —— Which Skill When?

> 不知道用哪个技能？从你的情况出发，跟随决策路径找到正确的技能。

## 快速决策

```
你的情况是什么？
│
├── 「我有一个想法/需求，还不确定怎么做」
│   └── → brainstorming（先讨论方向）
│
├── 「需求已经明确，需要正式文档」
│   └── → prd-creator（撰写 PRD）
│
├── 「PRD 或需求已确认，要开始实现了」
│   └── → task-planning（拆解步骤 + 三文件持久化）
│
├── 「任务已拆解，开始写代码」
│   └── → test-driven-development（先写测试再实现）
│
├── 「代码写完了，需要检查质量」
│   └── → code-review（六维审查）
│
├── 「遇到 Bug/报错/非预期行为」
│   └── → debugging（科学方法定位根因）
│
├── 「感觉完成了，需要确认」
│   └── → verification-before-completion（质量门禁）
│
├── 「验证通过，可以提交了」
│   └── → finishing-a-development-branch（收尾交付）
│
├── 「需要追踪任务/Bug/需求状态」
│   └── → issue-creator（Issue 管理）
│
├── 「需要画架构图/流程图」
│   └── → pretty-mermaid（Mermaid 图表）
│
├── 「需要同步文档到远程」
│   └── → import（文档同步）
│
└── 「需要创建/改进技能本身」
    └── → skill-creator（元技能）
```

## 详细决策路径

### 路径 1：我要做新功能

```
「我要做新功能」
    │
    ├── 需求清晰吗？
    │   ├── 不清晰 → brainstorming
    │   │   └── 完成 → prd-creator
    │   └── 清晰 → prd-creator
    │
    └── PRD 完成后
        └── task-planning
            └── 每个步骤
                ├── TDD（先写测试）
                ├── 实现
                └── progress.md（记录）
            └── 全部步骤完成
                ├── code-review（审查）
                ├── verification（验证）
                └── finishing（提交）
```

### 路径 2：我遇到了 Bug

```
「有 Bug」
    │
    ├── 能稳定复现吗？
    │   ├── 能 → debugging（观察→假设→实验→结论）
    │   └── 不能 → debugging（先收集信息，建立复现条件）
    │
    └── 根因确认后
        ├── TDD（写复现测试 → 修复 → 测试通过）
        ├── code-review（审查修复）
        ├── verification（验证）
        └── 值得记录？
            ├── 是 → issue-creator（创建 Bug Issue）+ finishing（提交）
            └── 否 → finishing（提交）
```

### 路径 3：我要改现有代码

```
「我要改现有代码」
    │
    ├── 是重构（不改行为）？
    │   ├── 有测试覆盖？→ TDD（确认现有测试通过）→ 重构 → TDD（测试仍通过）
    │   └── 无测试覆盖？→ TDD（先加测试建立安全网）→ 重构
    │
    ├── 是性能优化？
    │   └── debugging（定位瓶颈）→ TDD（写性能基准）→ 优化 → verification
    │
    └── 是小修改（≤1 文件，≤20 行）？
        └── 直接修改 → code-review → verification → finishing
```

### 路径 4：我不知道该做什么

```
「我不知道该做什么」
    │
    ├── 有想法但不清晰？
    │   └── brainstorming（结构化澄清）
    │
    ├── 有多个 Bug/任务不知道先做哪个？
    │   └── issue-creator（看板模式 + 诊断模式）
    │
    ├── 想了解项目整体质量？
    │   └── issue-creator（诊断模式：健康仪表盘）
    │
    └── 想了解技能本身？
        └── 阅读 README.md + glossary.md
```

## 技能不应同时触发的场景

以下场景下，应明确优先级，避免多个技能竞争：

| 用户说 | 可能触发 | 应触发 | 原因 |
|--------|---------|--------|------|
| 「帮我规划这个功能」 | brainstorming / prd-creator / task-planning | **brainstorming** | 「规划」是模糊词，先澄清方向 |
| 「实现有问题，帮我看看」 | code-review / debugging | **debugging** | 「有问题」= Bug 信号，审查在后 |
| 「做完了，提交吧」 | verification / finishing | **verification** | 先验证再提交，顺序不可颠倒 |
| 「加个功能，先写测试」 | task-planning / TDD | **TDD** | 「先写测试」= 明确 TDD 意图 |
| 「代码写完了，检查下」 | code-review / verification | **code-review** | 「检查代码」= 审查意图，验证在后 |

## 技能链的隐式触发

某些技能完成时会自动提示下一个技能，形成流畅的工作流：

```
brainstorming 完成 → 提示「是否用 prd-creator 撰写 PRD？」
prd-creator 完成 → 提示「是否用 task-planning 拆解实现步骤？」
task-planning 步骤完成 → 提示「是否用 TDD 开始这一步？」
TDD 完成 → 提示「是否用 code-review 审查？」
code-review 完成 → 提示「是否用 verification 验证？」
verification 通过 → 提示「是否用 finishing 提交？」
debugging 完成 → 提示「是否用 code-review 审查修复？」
```