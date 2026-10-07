---
title: 项目知识中心 — 全项目文档体系索引
aliases: [projects-index, 项目索引]
tags: [index, projects, yivad, yiai, yipet]
category: projects
created: 2026-09-23
updated: 2026-09-24
source: internal
type: index
status: stable
---

# 项目知识中心 — 全项目文档体系

> 统计: 2026-09-24 | 3 应用 | 2,180+ 文件 | 0 type errors

## 文档层级

```
PRD (需求) → dev (开发方案) → task (实施清单) → test (测试用例) → dev-log (实施日志)
```

## 项目概览

| 项目 | 类型 | dev | task | test | PRD | 文档总计 |
|------|------|-----|------|------|-----|---------|
| **YiAi** | FastAPI 后端 | 258 | 254 | 254 | 238+ | 1,004+ |
| **YiVad** | Vue 3.5 前端 | 108 | 104 | 104 | — | 316 |
| **YiPet** | Chrome MV3 扩展 | 261 | 257 | 258 | 84+ | 860+ |
| **合计** | — | **627** | **615** | **616** | **322+** | **2,180+** |

## 质量门禁

| 门禁 | YiVad | YiAi | YiPet |
|------|-------|------|-------|
| Type Check | 0 errors | — | 0 errors |
| Tests | 41/41 | 144/144 | — |

## 目录导航

- [YiAi 开发文档](./yiai/devs/2026-09/) — [进度索引](./yiai/devs/2026-09/INDEX.md) — [完成报告](./yiai/devs/2026-09/COMPLETION-REPORT.md)
- [YiVad 开发文档](./yivad/devs/2026-09/)
- [YiPet 开发文档](./yipet/devs/2026-09/)

## 技能集成

本目录中的项目文档与 [YiKnowledge Skills](../skills/README.md) 12 技能协作链深度集成。各项目 README 含完整技能映射。

| 技能 | 用途 | 参考 |
|------|------|------|
| [prd-creator](../skills/prd-creator/SKILL.md) | 9 章节 PRD | `prds/` 目录 |
| [task-planning](../skills/task-planning/SKILL.md) | 三文件 Crash-Proof | `devs/` 目录 |
| [code-review](../skills/code-review/SKILL.md) | 六维分级审查 | 质量门禁 |
| [verification-before-completion](../skills/verification-before-completion/SKILL.md) | 确定性完成门禁 | `tests/` 目录 |
| [debugging](../skills/debugging/SKILL.md) | Bug 模式库匹配 | `bugs/` 目录 |
| [finishing-a-development-branch](../skills/finishing-a-development-branch/SKILL.md) | Conventional Commits | 分支收尾 |