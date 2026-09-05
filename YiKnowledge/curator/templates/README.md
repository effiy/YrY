---
title: template / Templates
aliases: [templates, resources-templates]
tags: [leaf, resources, templates, moc]
category: curator/templates
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: quarterly
roles: [curator, engineer, producter, leader, aier]
benefit: "Content creators find the right template quickly, ensuring consistent structure across all knowledge entries"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ./knowledge-leaf.md
  - ./tech-design.md
  - ./retrospective.md
  - ./meeting-notes.md
  - ./one-on-one.md
  - ./user-research-interview.md
  - ./usability-test-report.md
  - ./adr.md
  - ./tech-selection-evaluation.md
  - ./prd.md
  - ./brd.md
  - ../../engineer/build/find-templates-and-prompts.md
  - ../../aier/方法/提示词/README.md
---

# template / 模板

> **作为**知识 curator，**我希望**快速找到合适的模板，**以便**创建一致、结构良好的知识条目。

> 收集可复用的文档模板：PRD、BRD、技术设计、复盘、用户研究、ADR 等。所有模板叶子遵循 `knowledge-leaf-template.md` 七段结构；正文包含"模板正文 + 字段说明 + 使用建议 + 反模式"。

## 范围

- 需求文档（PRD / BRD）
- 技术设计、选型评估、架构决策（ADR）
- 复盘与审查
- 用户研究与可用性测试
- 会议记录、1on1

## 已包含

### 模板（直接复制填写）

| 文件 | 一句话描述 |
|---|---|
| [knowledge-leaf-template.md](./knowledge-leaf.md) | 库中所有叶子的统一模板（SSOT，请勿修改） |
| [tech-design-template.md](./tech-design.md) | 技术设计（业务/架构/详细/非功能性） |
| [retrospective-template.md](./retrospective.md) | 复盘（Keep / Problem / 5-Why / Action） |
| [meeting-notes-template.md](./meeting-notes.md) | 会议记录（议程/决策/行动项） |
| [one-on-one-template.md](./one-on-one.md) | 1on1（员工主导 + 双向反馈） |
| [user-research-interview-template.md](./user-research-interview.md) | 半结构化用户研究访谈提纲 |
| [usability-test-report-template.md](./usability-test-report.md) | 可用性测试报告 |
| [prd.md](./prd.md) | 产品需求文档 |
| [brd.md](./brd.md) | 业务需求文档 |
| [adr-template.md](./adr.md) | 架构决策记录表 |
| [tech-selection-evaluation-template.md](./tech-selection-evaluation.md) | 技术选型评估表 |

### 总结（方法论）

| 文件 | 一句话描述 |
|---|---|
| [adr-summary.md](./adr.md) | ADR 是什么、何时写、如何写好 |
| [tech-selection-evaluation-summary.md](./tech-selection-evaluation.md) | 选型方法论与权衡 |

## 推荐结构

每个模板叶子应包含：

1. **Summary**：一句话说明何时使用此模板
2. **模板正文**：Markdown + 占位符（代码块）
3. **字段说明**：字段名、是否必填、规范表
4. **使用建议**：填写规范、配套 prompt、上下游文档
5. **反模式**：常见误用及修复方法
6. **Related**：相关模板、prompt、流程

## 相关叶子

- [../../aier/方法/提示词](../../aier/方法/提示词) — 配套 prompt
- [../../producter/discovery/prd](../../producter/discovery/prd) — PRD 实例
- [../../producter/delivery](../../producter/delivery) — 会议模板实例
- [../../engineer/learn/lessons/failures/incident-postmortem.md](../../engineer/learn/lessons/failure-incident-postmortem.md) — 事故复盘模板
- [../../engineer/build/find-templates-and-prompts.md](../../engineer/build/find-templates-and-prompts.md) — 场景入口