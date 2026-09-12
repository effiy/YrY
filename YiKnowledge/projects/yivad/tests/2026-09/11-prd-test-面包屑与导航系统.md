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
> 提取日期：2026-09-11

---

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

