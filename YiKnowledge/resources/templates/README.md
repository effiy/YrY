# 模板 / Templates

收录可复用文档模板：PRD、BRD、复盘、用研、竞品分析等。

## 收录范围

- 需求文档（PRD / BRD / FRD）
- 复盘与回顾
- 用研与可用性测试
- 竞品分析、技术调研
- 会议纪要、1on1

## 文件类型与命名

- `{用途}-template.md` 或 `{用途}.md`：模板文件
- 命名采用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: 某模板
tags: [模板, 用途]
category: resources/templates
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: internal
type: template
status: stable
---
```

## 写作推荐结构

1. 使用场景说明
2. 字段定义与示例
3. 模板正文（Markdown + 占位符）
4. 填写规范（必填 / 选填、字数、格式）
5. 配套 Prompt 或工具链

## 已收录

- `prd.md` — 产品需求文档模板
- `brd.md` — 业务需求文档模板
- `tech-design-template.md` — 技术方案模板
- `adr-template.md` — 架构决策记录模板（ADR，含 changes / risks / rollback）
- `adr-summary.md` — ADR 摘要（决策原则与生命周期）
- `tech-selection-evaluation-template.md` — 技术选型评估模板（Candidate options / Evaluation dimensions / Constraints）
- `tech-selection-evaluation-summary.md` — 技术选型评估摘要（方法论）
- `retrospective-template.md` — 复盘模板（Keep / Problem / 5-Why / Action）
- `meeting-notes-template.md` — 会议纪要模板（议程 / 决议 / Action Items / Parking Lot）
- `1on1-template.md` — 1on1 模板（员工主导 / 反馈 / 成长）
- `user-research-interview-template.md` — 用研访谈大纲模板（半结构化）
- `usability-test-report-template.md` — 可用性测试报告模板

## 待收录
