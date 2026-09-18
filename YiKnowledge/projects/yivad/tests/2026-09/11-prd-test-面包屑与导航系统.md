---
doc_type: test
title: "面包屑与导航系统 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-31"
source_prds: ["11-prd-面包屑与导航系统"]
source_modules: []
---
# 面包屑与导航系统 — 测试规格

> 来源 PRD：[11-prd-面包屑与导航系统.md](../../prds/2026-09/11-prd-面包屑与导航系统.md)

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
| FR-1 | 导航状态 Store | UT + CT | ✅ 已完成 |
| FR-2 | 面包屑组件 | UT + CT | ✅ 已完成 |
| FR-3 | 标签页栏组件 | UT + CT | ✅ 已完成 |
| FR-4 | useTabManager Composable | UT + CT | ✅ 已完成 |
| FR-5 | 路由 Meta 扩展 | UT + CT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### 单元测试：导航 Store

#### Scenario: 打开新标签页
- **GIVEN** 标签页列表为空，activeTabId 为 null
- **WHEN** 调用 `openTab(route)` 传入路由对象
- **THEN** `tabs.length = 1`，`activeTabId` 不为 null，标签页持久化到 localStorage

#### Scenario: 重复打开相同页面
- **GIVEN** 标签页列表中已存在 `path="/project/PL"` 的标签页
- **WHEN** 再次调用 `openTab(route)` 传入相同路由
- **THEN** `tabs.length` 不变（不创建重复标签页），`activeTabId` 更新为该标签页

#### Scenario: 关闭标签页
- **GIVEN** 标签页列表有 3 个标签页，当前激活第 2 个
- **WHEN** 调用 `closeTab(tab2Id)`
- **THEN** `tabs.length = 2`，`activeTabId` 自动切换到相邻标签页

### 组件测试：面包屑组件

#### Scenario: 渲染基本面包屑
- **GIVEN** 当前路由为 `/project/PL/rag/config-1`
- **WHEN** 挂载 `BreadcrumbNav` 组件，mock route 对象
- **THEN** 面包屑显示 "首页 / 项目详情 / RAG 配置"

#### Scenario: 深度路径截断
- **GIVEN** 当前路由有 6 级深度
- **WHEN** 挂载 `BreadcrumbNav` 组件
- **THEN** 面包屑显示 "首页 / ... / 最后两级"，中间项可通过下拉展开

#### Scenario: 点击面包屑导航
- **GIVEN** 面包屑显示 "首页 / 项目列表 / 项目详情"
- **WHEN** 点击 "项目列表"
- **THEN** 路由导航到 `/project`，标签页切换到对应页面

---


## 补充：单元测试用例

### UT-BC01: useBreadcrumb

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 路由解析 | `/project/1/issue/2` | breadcrumbs: Project > Issue |
| 2 | 动态标题 | 路由 meta.title 含参数 | 面包屑显示解析后的标题 |
| 3 | 点击跳转 | 点击面包屑项 | 导航到对应路由 |

### UT-BC02: 标签页导航

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 新标签页 | 打开新页面 | tabs 数组新增 |
| 2 | 重复打开 | 打开已有标签页 | 切换到已有标签，不重复 |
| 3 | 关闭标签 | 点击关闭 | tabs 数组移除该标签 |
| 4 | 标签持久化 | 刷新页面 | 标签页列表恢复 |

