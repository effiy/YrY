---
doc_type: module
prd_task_id: "YV-09-68"
title: "YV-09-68: 全局搜索命令面板 — Ctrl+K 全局操作、模糊搜索、快速导航、计算器、AI 查询 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "34-prd-全局搜索命令面板.md"
---

# YV-09-68: 全局搜索命令面板 — Ctrl+K 全局操作、模糊搜索、快速导航、计算器、AI 查询 — 开发任务

> 来源 PRD：[34-prd-全局搜索命令面板.md](../prds/2026-09/34-prd-全局搜索命令面板.md)
> 需求编号：YV-09-68 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现 CommandRegistry 和 Composable | `src/composables/useCommandPalette.ts` | 注册/搜索正常 | 0.05 |
| 2 | 实现命令面板 UI 组件 | `src/components/command-palette/` | 打开/关闭/搜索/键盘导航 | 0.08 |
| 3 | 实现计算器/转换器 | `src/composables/useCalculator.ts` | 数学表达式/单位转换 | 0.03 |
| 4 | 实现实体搜索集成 | `src/components/command-palette/` | 搜索 Issue/Bug/文档 | 0.05 |
| 5 | 实现 AI 查询集成 | `src/components/command-palette/` | ? 前缀触发 AI 查询 | 0.03 |
| 6 | 各页面注册命令 | 各 View 页面 | 导航/操作命令可用 | 0.03 |
| 7 | 注册全局快捷键 Ctrl+K | `src/App.vue` | 任意页面可触发 | 0.03 |

**总人天：0.3d**

---
