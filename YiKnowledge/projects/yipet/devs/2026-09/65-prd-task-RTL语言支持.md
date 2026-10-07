---

doc_type: module
prd_task_id: "YP-09-58"
title: "YP-09-58: RTL 语言支持 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["65-prd-test-RTL语言支持.md"]
source_prd: "65-架构设计-RTL语言支持.md"

type: task
---

# YP-09-58: RTL 语言支持 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-58 · 状态：方案已编写

## RTL 适配

`direction: rtl` + `writing-mode` 适配阿拉伯语/希伯来语。

| 适配项 | CSS |
|--------|-----|
| 文字方向 | `direction: rtl` |
| 布局镜像 | `flex-direction: row-reverse` |
| 图标翻转 | `transform: scaleX(-1)` |
| 内边距 | `padding-inline-start/end` |

---

## 一、需求背景

来源 PRD：65-架构设计-RTL语言支持.md

### 用户痛点

1. **混合文本（阿拉伯语 + 英文）的 bidi 算法处理**：中
1. **图标/箭头方向错误——返回箭头在 RTL 下应指向右**：低
1. **输入框光标位置——RTL 下光标应在右侧**：低

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 适配项 | CSS |
| 文字方向 | `direction: rtl` |
| 布局镜像 | `flex-direction: row-reverse` |
| 图标翻转 | `transform: scaleX(-1)` |
| 内边距 | `padding-inline-start/end` |
| 步骤 | 任务 |
| 1 | Composable 核心逻辑开发与单元测试 |
| 2 | UI 组件开发 + Popup/Side Panel 集成 |

## 三、关键技术决策

| # | 决策 | 理由 |
|---|------|------|
| 1 | 纯前端浏览器 API 实现 | 无需服务端依赖，响应 < 50ms，离线可用 |
| 2 | 独立 Vue 3 Composable 封装 | 单一职责，可复用于 Popup + Side Panel |

## 四、实施步骤

| 步骤 | 任务 | 预估 |
|------|------|------|
| 1 | Composable 核心逻辑 + 状态管理 | 0.1d |
| 2 | Vue 3 UI 组件开发（含错误/空/加载状态） | 0.1d |
| 3 | 边界场景处理 + 集成测试 | 0.1d |

**总计：0.3d**

## 五、完成记录

> **状态**：方案已编写 · **日期**：2026-09-23 · 实施排期待定

## 六、技术债与缺口

| # | 项目 | 优先级 | 说明 | 状态 |
|---|------|--------|------|------|
| 1 | 物理 CSS 属性不支持 RTL 自动镜像 | P1 | 阿拉伯语用户看到的 UI 方向错误 | 待实施 |
| 2 | 消息气泡对齐方向错误——用户消息应在右侧、AI 在左侧 | P1 | RTL 下应镜像 | 待实施 |

