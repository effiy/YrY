---
title: "项目详情页: 移除 Milestones 和 Tags Tab"
key: project-detail-remove-milestones-tags-tabs-20260910
tags:
- ui-refinement
- tabs
- project-detail
category: projects/yivad/bugs/data
created: "2026-09-10"
updated: 2026-09-10
source: internal
type: improvement
status: resolved
severity: minor
priority: p3
project: YiVad
module: hooks/useDetailTabs.ts
reporter: Claude
environment: Chrome / macOS
affectedVersion: main
fixedVersion: main (post-fix 2026-09-10)
frequency: always
benefit: "缺陷记录：数据-移除Milestones和Tags-Tab"
lifecycle: active
---

## Description

项目详情页 Tab 栏包含 Milestones 和 Tags 两个 Tab，当前功能未完善且对项目详情页实用价值有限，移除以简化导航。

### 移除的 Tab

| Tab | 组件 | 原因 |
|-----|------|------|
| Milestones | `MilestoneList` | 里程碑功能尚未完善，暂不展示 |
| Tags | `TagAdmin` | 标签管理在项目详情页中非核心功能 |

## Fix

### hooks/useDetailTabs.ts

移除 `milestones` 和 `tags` 两个 Tab 定义及对应的组件导入：

```diff
- import MilestoneList from "@/components/milestone/MilestoneList.vue";
- import TagAdmin from "@/components/tag/TagAdmin.vue";

  const tabs = computed<TabConfig[]>(() => [
    ...
-   { name: "milestones", label: t("project.detail.tabs.milestones"), component: MilestoneList },
-   { name: "tags", label: t("project.detail.tabs.tags"), component: TagAdmin },
  ]);
```

## Verification

- [ ] 项目详情页 Tab 栏不再显示 Milestones 和 Tags
- [ ] 其余 6 个 Tab（Overview、Requirements、Modules、Docs、Bugs、Members）正常显示和切换
- [ ] `vue-tsc --noEmit` 通过

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 功能未就绪的 Tab 应在配置中标记 `enabled: false` 而非直接删除代码，避免未来启用时需要还原 |
| 流程 | 移除 UI 元素前确认：是否有用户依赖此入口？是否有其他页面仍在使用被移除的组件？ |

## 经验教训

- **删除 vs 禁用**：对于「功能未完善」的 Tab，隐藏（保留代码但不注册到 tabs 数组）优于删除。若后续 Milestones/Tags 功能完善，只需在配置中启用即可恢复，无需 git 考古
- **组件导入清理**：移除 Tab 定义时必须同步清理对应的 `import` 语句，否则 `vue-tsc` 不会报错但会产生未使用的导入警告

