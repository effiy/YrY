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

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。用例覆盖度以 PRD 的 `FR-x.y` / `NFR-x` 编号追溯，不复制需求正文。
> 提取日期：2026-09-11

---


---

<a id="sec-strategy"></a>
## 测试策略

### 分层模型

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | Composable/hook/工具函数纯逻辑 | Vitest | 每次提交 |
| L2 组件 | Vue 组件挂载与交互 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | Composable ↔ 组件 ↔ Store ↔ RPC | Vitest + mock | 每次提交 |
| L4 端到端 | 完整用户路径（需 YiAi 运行） | 手动 | 提测/回归 |

### 优先级定义

| 级别 | 含义 | 响应 |
|------|------|------|
| P0 | 核心路径，失败阻塞发布 | 立即修复 |
| P1 | 重要功能，失败需评估 | 当日修复 |
| P2 | 增强功能，可延后 | 排期修复 |

---

<a id="sec-env"></a>
## 测试环境与前置条件

| 项 | 要求 |
|----|------|
| Node.js | 与项目 `.nvmrc` 一致 |
| 包管理器 | pnpm |
| 浏览器 | Chrome 最新版 |
| 框架 | Vitest + jsdom |
| 类型检查 | `pnpm exec vue-tsc --noEmit` |

```bash
pnpm test                                    # 全部测试
pnpm exec vitest run tests/hooks/            # 仅 hooks
pnpm exec vitest run --coverage             # 覆盖率
```

---

<a id="sec-criteria"></a>
## 准入与准出标准

### 准入

| # | 条件 |
|---|------|
| 1 | 对应 FR 的实现已提交 |
| 2 | `vue-tsc --noEmit` 无错误 |
| 3 | 功能在开发环境可正常使用 |

### 准出

| # | 条件 | 阈值 |
|---|------|------|
| 1 | P0 用例通过率 | 100% |
| 2 | P1 用例通过率 | ≥ 95% |
| 3 | 遗留缺陷 | 无 Blocker / Critical |

---

<a id="sec-defects"></a>
## 缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| Blocker | 阻塞测试或数据损坏 | 功能完全不可用 |
| Critical | 核心功能不可用 | 主要路径报错 |
| Major | 功能缺陷但有替代路径 | 边界条件处理不当 |
| Minor | 体验问题 | UI 偏移/文案错误 |
| Trivial | 视觉细节 | 间距微调 |

### 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | App.vue 过渡容器 | UT + CT | ✅ 已完成 |
| FR-2 | usePageTransition Composable | UT + CT | ✅ 已完成 |
| FR-3 | transitions.css 过渡样式 | UT + CT | ✅ 已完成 |
| FR-4 | transitionGuard 路由守卫 | UT + CT | ✅ 已完成 |
| FR-5 | SharedElementTransition 组件 | UT + CT | ✅ 已完成 |




<a id="sec-6"></a>
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

