---

doc_type: module
prd_task_id: "YP-09-27"
title: "YP-09-27: 语音输入合成 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["34-prd-test-语音输入合成.md"]
source_prd: "34-架构设计-语音输入合成.md"

type: task
---

# YP-09-27: 语音输入合成 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-27 · 状态：方案已编写

## Web Speech API

| API | 功能 |
|-----|------|
| SpeechRecognition | 语音→文字 |
| SpeechSynthesis | 文字→语音 |

## 使用场景

| 场景 | API |
|------|-----|
| 语音输入消息 | SpeechRecognition |
| AI 回复朗读 | SpeechSynthesis |
| 页面内容朗读 | SpeechSynthesis |

---

## 一、需求背景

来源 PRD：34-架构设计-语音输入合成.md

### 用户痛点

1. **实现 SpeechService 核心**：浏览器 API 可用性检测
1. **集成语音输入到 ChatInput**：按住说话 → 文字填充
1. **集成语音朗读到 MessageBubble**：点击朗读 → 语音播放

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| SpeechRecognition | 语音→文字 |
| SpeechSynthesis | 文字→语音 |
| 场景 | API |
| 语音输入消息 | SpeechRecognition |
| AI 回复朗读 | SpeechSynthesis |
| 页面内容朗读 | SpeechSynthesis |
| 步骤 | 任务 |
| 1 | Composable 核心逻辑开发与单元测试 |

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
| 1 | 小屏幕键盘输入效率低 | P1 | 20-30%（移动端） | 待实施 |
| 2 | 特性检测 + 降级隐藏 | P1 | ---

<a id="sec-3"></a>
## 三、设计决策

### 3.1 D-01：语音引擎选择 | 待实施 |

