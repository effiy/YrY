---
title: "项目详情页: 文档 Tab 计数与实际列表不一致"
key: doc-tab-count-off-by-one-20260907
tags:
- tab-count
- claude-md
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
module: views/project/components/DetailDocs.vue, hooks/useDetailTabs.ts
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-07)
frequency: always
source_prd: "YV-09-01"
benefit: "缺陷记录：数据-文档Tab计数不一致"
lifecycle: active
---

## Description

项目详情页文档 Tab 的计数徽章与实际列表项数不一致。`useDetailTabs.ts` 中的 `docCount` 仅统计 `knowledgeFiles` 中的条目数（N），但 `DetailDocs.vue` 和 `DetailOverview.vue` 的 `docItems` 列表额外添加了 CLAUDE.md 作为特殊条目（N+1）。Tab 标签显示 "N"，但表格/侧边栏显示 N+1 条。

## Steps to Reproduce

1. 访问 `http://localhost:8848/#/project/yivad`
2. 观察文档 Tab 的计数徽章
3. 切换到文档 Tab，查看实际列表条目数
4. 计数比列表少 1（缺少 CLAUDE.md）

## Root Cause

`useDetailTabs.ts:docCount` 仅过滤 `knowledgeFiles` 中的 `.md` 文件，未计入 `DetailDocs.vue` 和 `DetailOverview.vue` 中通过 `items.unshift()` 添加的 CLAUDE.md 特殊条目。

## Fix

在 `useDetailTabs.ts` 的 `docCount` 计算中 +1，计入 CLAUDE.md：

```ts
return count + 1; // +1 for CLAUDE.md
```

## Verification

- `vue-tsc --noEmit` 通过
- 文档 Tab 计数与实际列表条目数一致

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 计数逻辑与列表渲染使用同一数据源计算函数，消除手动同步偏移量 |
| 测试 | 为 Tab 计数徽章添加断言：`expect(badgeCount).toEqual(renderedRowCount)` |
| 流程 | 特殊条目（如 CLAUDE.md）的增删需同时更新所有引用点的计数逻辑 |

## 经验教训

- **单一数据源原则**：Tab 计数和列表渲染应共享同一个计算函数，而非各自独立计算再手动对齐。当特殊条目需要 `unshift` 插入时，计数逻辑必须同步感知
- **CLAUDE.md 特殊处理**：项目详情页多个组件对 CLAUDE.md 有特殊逻辑（Tab 计数 +1、Docs 列表首行、Overview 独立加载），应考虑统一封装为 `useClaudeMd()` composable 消除分散的特殊判断

