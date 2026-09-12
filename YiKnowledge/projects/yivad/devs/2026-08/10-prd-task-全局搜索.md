---
doc_type: module
prd_task_id: "YV-08-10"
title: "全局搜索 — 7 集合跨域全文检索 — 开发任务"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
estimate_frontend: 2.0
source_prd: "10-prd-全局搜索.md"
---

# 全局搜索 — 7 集合跨域全文检索 — 开发任务

> 来源 PRD：[10-prd-全局搜索.md](../prds/2026-08/10-prd-全局搜索.md)
> 需求编号：YV-08-10 · 优先级：P1 · 人天：2.0d

## 五、实施步骤

### 步骤 1: 搜索核心（0.75d）

- [x] 实现搜索输入框 + 建议下拉 + 历史记录
- [x] 实现 250ms 防抖 + `searchSeq` 竞态控制
- [x] 实现 5 种实体类型的并行搜索
- [x] 实现 `highlight()` XSS 安全高亮

**验证：** 输入搜索词，5 种类型结果正确显示，多次快速输入仅最后一次生效

### 步骤 2: 结果展示（0.5d）

- [x] 实现可折叠分组 + 类型分布条
- [x] 实现类型筛选 + 项目筛选 + 排序切换
- [x] 实现 Badge 生成（Issue/Bug/Module/Project）
- [x] 实现骨架屏加载态 + 无结果空状态

**验证：** 搜索结果按类型分组，可折叠/筛选/排序，Badge 颜色正确

### 步骤 3: 键盘导航（0.25d）

- [x] 实现 `↑`/`↓`/`Enter` 全局键盘导航
- [x] 实现 `Ctrl+K` 全局聚焦搜索框
- [x] 实现 `scrollIntoView` 跟随高亮项

**验证：** 键盘完整操作搜索→选择→导航流程

### 步骤 4: 集成与优化（0.5d）

- [x] URL 查询参数同步（`?q=xxx`）
- [x] 搜索历史持久化（localStorage）
- [x] 空状态：最近搜索 + 快速导航 + 快速创建链接
- [x] 搜索耗时显示

**验证：** 刷新页面保留搜索词，搜索历史跨会话保持

---
