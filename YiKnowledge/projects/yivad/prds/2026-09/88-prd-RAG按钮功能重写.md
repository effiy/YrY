---
prd_task_id: "YV-09-88"
title: "YV-09-88: RAG 按钮功能重写"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-22
updated: 2026-09-22
project: YiVad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: null
related_devs: [88-prd-task-RAG按钮功能重写]
related_tests: [88-prd-test-RAG按钮功能重写]
tags: [RAG, UI重写, 按钮, 状态指示, 检索反馈, 体验优化]
category: 项目/管理后台/体验优化
source: internal
type: 需求
issue_type: 体验优化
related_modules: ["88-prd-task-RAG按钮功能重写"]
benefit: "产品需求：RAG按钮功能重写"
lifecycle: active
---

# YV-09-88: RAG 按钮功能重写

> **文档职责**：本文档定义**要做什么、为什么做、做到什么程度算完成**（WHAT / WHY）。

> 需求编号：YV-09-88 · 优先级：P1 · 人天：0.5d · 状态：已完成

实现方案见[开发方案](../../devs/2026-09/88-prd-task-RAG按钮功能重写.md)，验证方式见[测试用例](../../tests/2026-09/88-prd-test-RAG按钮功能重写.md)。

---

## 背景

### 问题描述

当前 `/#/ai-chat` 的 RAG 按钮是一个纯二元开关：
- 仅显示 `RAG` 标签 + 开关
- 所有高级设置（混合检索、重排序、HyDE、引文）隐藏在齿轮弹窗中
- 无检索实时反馈（检索中状态、来源数量、延迟）
- 范围 (Scope) 下拉的角色选项与实际 YiKnowledge 目录不匹配
- 无索引健康状态视觉指示
- Fast Mode 功能在 composable 中存在但未暴露到 UI

### 影响范围

| 问题 | 影响 |
|------|------|
| 检索过程无反馈 | 用户不知道系统正在检索还是卡住 |
| 设置不可见 | 用户不知道存在混合检索/重排序等优化选项 |
| 角色选项错误 | 选择错误 scope 导致检索结果为空 |
| 无健康指示 | 索引未构建时用户看到空结果不知原因 |

---

## 需求描述

### 核心需求

1. 三态视觉 RAG pill：关闭 / 开启（空闲） / 检索中
2. 索引健康指示器：绿色（正常）/ 橙色（异常）/ 红色（未构建）
3. 设置面板分为「快速设置」和「高级设置」两组
4. Scope 角色选项修正为 YiKnowledge 实际角色
5. Fast Mode 暴露到 UI
6. 删除未使用的独立 `RagPill.vue` 组件

### 验收标准

- [x] 点击 RAG pill 可开关 RAG
- [x] RAG 开启时 pill 显示蓝色高亮 + 健康圆点
- [x] RAG 检索中 pill 显示橙色脉冲动画 + "Retrieving"
- [x] Fast Mode 开启时 pill 显示虚线边框 + "FAST" 徽章
- [x] 齿轮弹窗中 Scope 选项为 YiKnowledge 实际角色
- [x] 齿轮弹窗中设置分「Quick Settings」和「Advanced」两组
- [x] 每个设置项带 tooltip 说明
- [x] `vue-tsc --noEmit` 通过无新增错误
- [x] `RagPill.vue` 已删除且无残留引用

### 非目标

- 不修改 RAG Web Search 的联合检索逻辑
- 不修改后端 `/rag-chat` 接口

---

## 涉及模块

| 文件 | 操作 |
|------|------|
| `ChatToolbar/index.vue` | 重写 RAG pill 模板 + script |
| `ChatToolbar/styles/toolbar.scss` | 新增 RAG 状态样式 |
| `ChatToolbar/styles/global.scss` | 替换设置弹窗样式 |
| `stores/modules/aiChat.ts` | 暴露 `ragFast` |
| `ChatInput.vue` | 传递 `ragFast` + `streamingPhase` prop |
| `ChatToolbar/RagPill.vue` | **删除**（死代码） |
| `stores/.../useStreaming.ts` | `streamRagChat` 调用传递 `fast` |