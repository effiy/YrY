---
title: Issue 追踪管理技能说明
tags: [issue, skill, readme, tracking, management]
category: skills/issue-creator
created: 2026-08-20
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
related:
  - ./SKILL.md
  - ./references/issue-model.md
---

# Issues —— Issue 追踪管理技能

Issue 追踪管理方法论，与 PRD 技能同级，指导如何创建、分类、追踪和交付工作项。

## 适用场景

- 创建和管理 Issue（任务/需求/Bug/改进）
- 按多维度筛选和搜索 Issue
- 看板可视化管理工作流
- 分析 Issue 数据质量（诊断模式）
- 理解 Issue 与 PRD 的关系和转换流程
- 排查 Issue 管理中的常见问题

## 为什么采用多模式架构？

不同意图需要不同的交互方式。创建 Issue 需要逐项引导以确保信息完整，查看进度需要看板视图以获得全局视野，数据诊断需要批量检查和统计。五种模式各自独立、专注于一类任务，按用户意图自动选择。

| 模式 | 解决的问题 | 适合场景 |
|---|---|---|
| 创建模式 | 如何规范化创建 Issue？ | 新增 Bug/任务/需求/改进项 |
| 流转模式 | 如何正确变更 Issue 状态？ | 推进工作进度、评审通过/驳回 |
| 筛选模式 | 如何快速找到目标 Issue？ | 按条件查询、快捷视角 |
| 看板模式 | 当前整体工作流状态如何？ | 每日站会、Sprint 评审 |
| 诊断模式 | 数据质量是否健康？ | Sprint 回顾、质量审计 |

## 与其他技能的协作

| 技能 | 协作关系 |
|---|---|
| PRD 技能 | PRD 拆解为 Issue（PRD → 多个 requirement/feature Issue） |
| Bug 追踪技能 | 线上 Bug → 创建 bug 类型 Issue → 追踪修复进度 |
| 项目管理技能 | Issue 看板 ← 项目里程碑、Sprint 计划 |

## 文件结构

```
issue-creator/
├── SKILL.md                    # 技能主文件（5 种模式详解 + 核心概念 + 故障排查）
├── README.md                   # 本文件 —— 技能说明、适用场景、文档结构
└── references/
    └── issue-model.md          # 数据模型参考（枚举定义、完整字段、流转规则、质量指标）
```

## 快速开始

1. **创建 Issue** —— 告诉助手你要创建什么类型的 Issue，助手会逐项引导填写
2. **查看进度** —— 使用「看板」命令查看整体工作流状态
3. **筛选查找** —— 使用自然语言描述筛选条件，如「@张三 本周截止的高优先级 Bug」
4. **推进状态** —— 告诉助手要将哪个 Issue 从什么状态改为什么状态
5. **健康诊断** —— 使用「诊断」命令检查数据质量和异常项

## 相关资源

- [SKILL.md](./SKILL.md) —— 完整技能定义（五种模式、核心概念、配置选项、故障排查）
- [references/issue-model.md](./references/issue-model.md) —— Issue 数据模型与枚举定义
- [../../projects/INDEX.md](../../projects/INDEX.md) —— 各项目实际缺陷列表与分类