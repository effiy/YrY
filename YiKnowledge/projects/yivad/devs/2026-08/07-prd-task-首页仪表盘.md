---
doc_type: module
prd_task_id: "YV-08-07"
title: "首页仪表盘 — 快速导航 + OKR 推荐面板 — 开发任务"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
estimate_frontend: 3.0
source_prd: "07-prd-首页仪表盘.md"
---

# 首页仪表盘 — 快速导航 + OKR 推荐面板 — 开发任务

> 来源 PRD：[07-prd-首页仪表盘.md](../prds/2026-08/07-prd-首页仪表盘.md)
> 需求编号：YV-08-07 · 优先级：P0 · 人天：3.0d

## 五、实施步骤

### 步骤 1: 数据加载层（0.5d）

- [x] 实现 `useHomeData` hook：6 路并行查询 + 三态管理（loading/error/data）
- [x] 集成 `useDateFilter` 日期筛选
- [x] 实现 URL query → `selectedProjects` 同步

**验证：** 浏览器 DevTools Network 面板显示 6 个 `query_documents` 请求并行发出

### 步骤 2: 可复用组件（0.5d）

- [x] 实现 `PageHeaderCard`：图标、标题、描述、日期导航、Pills 插槽
- [x] 实现 `HomeSkeleton`：骨架屏加载态

**验证：** 首页加载时先显示骨架屏，数据加载完成后切换为正常内容

### 步骤 3: QuickNav 快速导航（0.75d）

- [x] 实现 4 组 12 个导航卡片
- [x] 实现知识库 Popover（9 个子页面入口）
- [x] 实现响应式 grid 布局
- [x] 实现计数 badge 显示

**验证：** 所有导航卡片点击跳转正确，知识库 Popover 展开/收起正常

### 步骤 4: 首页编排（0.5d）

- [x] 实现三态渲染（loading/error/normal）
- [x] 实现统计 Pills 点击跳转
- [x] 集成 OkrRecommendPanel（角色/项目筛选 + 日期联动）

**验证：** 首页正常加载，统计数字正确，所有导航和跳转功能正常

### 步骤 5: i18n 国际化（0.25d）

- [x] 首页标题、描述、导航标签、知识库子页面标签
- [x] 错误提示、重试按钮

**验证：** 切换中/英文，首页所有文本正确翻译

### 步骤 6: 响应式适配（0.25d）

- [x] 3 个断点的 grid 布局适配
- [x] Pills 移动端等宽分布

**验证：** Chrome DevTools 设备模拟器测试各断点

---
