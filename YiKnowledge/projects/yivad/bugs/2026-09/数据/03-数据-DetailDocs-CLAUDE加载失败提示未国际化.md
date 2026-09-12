---
title: "项目详情页: DetailDocs CLAUDE.md 加载失败提示未国际化"
key: detail-docs-claude-load-error-i18n-20260907
tags:
- i18n
- hardcoded-string
- project-detail
category: projects/yivad/bugs/data
created: "2026-09-07"
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: views/project/components/DetailDocs.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-07)
frequency: always
---

## Description

`DetailDocs.vue` 中 CLAUDE.md 加载失败时的错误提示为硬编码英文字符串 `"Failed to load CLAUDE.md"`，而 `DetailOverview.vue` 中相同场景使用了 i18n 键 `t('project.docs.loadError')`。在中文环境下，用户看到的是英文错误提示。

## Steps to Reproduce

1. 访问 `http://localhost:8848/#/project/yivad`
2. 切换到文档 Tab
3. 点击 CLAUDE.md 行（在 YiAi 后端未运行时）
4. 错误提示显示为英文 "Failed to load CLAUDE.md"

## Root Cause

`DetailDocs.vue` 未导入 `useI18n`，错误消息直接硬编码为英文字符串。

## Fix

1. 在 `DetailDocs.vue` 中添加 `useI18n` 导入和 `const { t } = useI18n()`
2. 将 `ElMessage.warning("Failed to load CLAUDE.md")` 改为 `ElMessage.warning(t("project.docs.loadError"))`

## Verification

- `vue-tsc --noEmit` 通过
- 中文环境下显示 "加载 CLAUDE.md 失败"
- 英文环境下显示 "Failed to load CLAUDE.md"

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

