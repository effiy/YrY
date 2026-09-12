---
doc_type: test
title: "页面过渡动画 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-39"
source_prds: ["15-prd-页面过渡动画"]
source_modules: []
---
# 页面过渡动画 — 测试规格

> 来源 PRD：[15-prd-页面过渡动画.md](../../prds/2026-09/15-prd-页面过渡动画.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 单元测试：usePageTransition

#### Scenario: 前进导航使用 slide-left
- **GIVEN** 当前路由 `/project`，目标路由 `/project/PL`
- **WHEN** 调用 `getTransitionName(to)`
- **THEN** 返回 `"transition-slide-left"`

#### Scenario: 后退导航使用 slide-right
- **GIVEN** 路由历史 `["/project", "/project/PL"]`，当前路由 `/project/PL`，目标路由 `/project`
- **WHEN** 调用 `getTransitionName(to)`
- **THEN** 返回 `"transition-slide-right"`

#### Scenario: 同级导航使用 fade
- **GIVEN** 当前路由 `/project/PL`，目标路由 `/project/DS`
- **WHEN** 调用 `getTransitionName(to)`
- **THEN** 返回 `"transition-fade"`

### 组件测试：App.vue 过渡容器

#### Scenario: 页面切换时应用过渡动画
- **GIVEN** 挂载 App.vue 组件，`route.meta.transition = "slide-left"`
- **WHEN** 触发路由切换
- **THEN** `<Transition>` 组件的 `name` 属性为 `"transition-slide-left"`

#### Scenario: prefers-reduced-motion 禁用动画
- **GIVEN** `prefersReducedMotion = true`
- **WHEN** 触发路由切换
- **THEN** `<Transition>` 组件的 `name` 属性为 `"transition-none"`

#### Scenario: 异步组件显示加载骨架屏
- **GIVEN** 路由组件为异步加载（`defineAsyncComponent`），网络延迟 500ms
- **WHEN** 触发路由切换
- **THEN** 在组件加载完成前显示 `<el-skeleton>` 骨架屏

---


## 补充：单元测试用例

### UT-TA01: usePageTransition

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 淡入淡出 | 路由切换 | fade 动画执行 |
| 2 | 滑动过渡 | slide-left/slide-right | 正确方向滑动 |
| 3 | 动画禁用 | prefers-reduced-motion | 跳过动画直接切换 |
| 4 | 过渡时长 | duration=300ms | 动画在 300ms 内完成 |

