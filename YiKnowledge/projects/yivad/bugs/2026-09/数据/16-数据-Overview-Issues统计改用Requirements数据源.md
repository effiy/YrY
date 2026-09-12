---
title: "项目详情页: Overview Issues 统计改用 Requirements 数据源"
key: overview-stats-requirements-datasource-20260910
tags:
- data-consistency
- overview
- requirements
- project-detail
category: projects/yivad/bugs/data
created: "2026-09-10"
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: medium
priority: p2
project: YiVad
module: views/project/components/DetailOverview.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main
fixedVersion: main (post-fix 2026-09-10)
frequency: always
---

## Description

Overview 侧边栏 Issues 统计数与 Requirements Tab 表格数据不一致。根因为 Overview 使用 `useProjectDetail.allIssues`（API 全量 Issue），而 Requirements Tab 使用 `useRequirements`（YiKnowledge markdown 文件）——两个数据源完全不同。

### 数据源对比

| 统计项 | Overview 旧数据源 | Table 实际数据源 | 是否一致 |
|--------|-----------------|-----------------|---------|
| Issues 总数 | `allIssues`（API，全类型） | `reqItems`（markdown，仅需求） | **不一致** |
| Modules 总数 | `allModules`（API） | `ModuleStore`（API） | 基本一致 |
| Bugs 总数 | `allBugs`（API） | `BugStore`（API） | 基本一致 |

## Steps to Reproduce

1. 访问 `http://localhost:8848/#/project/yivad`
2. 观察 Overview 侧边栏 Issues 统计数
3. 切换到 Requirements Tab，查看表格行数
4. 两个数字不一致

## Root Cause

`DetailOverview.vue` 的 `overviewStats.totalIssues` 统计的是 `allIssues.value.length`（API 中所有类型的 Issue），而 Requirements Tab 渲染的是 `reqItems`（YiKnowledge 中 `projects/{key}/requirements/` 目录下的 markdown 文件）。

## Fix

### views/project/components/DetailOverview.vue

**1. 引入 useRequirements composable (line 207)**

```diff
+ import { useRequirements } from "@/views/project/composables/useRequirements";
```

**2. 初始化并获取需求数据**

```diff
+ const { items: reqItems, fetch: fetchRequirements } = useRequirements();

  onMounted(() => {
    loadDescFile();
+   if (project.value?.key) fetchRequirements(project.value.key);
  });

  watch(() => project.value?.key, (key) => {
    loadDescFile();
+   if (key) fetchRequirements(key);
  });
```

**3. totalIssues 改用 reqItems 计数**

```diff
  return {
-   totalIssues: issues.length,
+   totalIssues: reqItems.value.length,
-   totalRequirements: issues.filter(i => i.issue_type === "requirement").length,
+   totalRequirements: reqItems.value.length,
    ...
  };
```

> `inProgressIssues` 和 `overdueIssues` 仍使用 `allIssues`（API 数据），两者代表项目整体健康度，不过滤类型。

## Verification

- [ ] Overview 侧边栏 Issues 统计数与 Requirements Tab 表格行数一致
- [ ] 项目切换后统计数正确更新
- [ ] Modules 和 Bugs 统计数正常

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

