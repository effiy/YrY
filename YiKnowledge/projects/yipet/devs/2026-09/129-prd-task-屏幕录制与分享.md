---

doc_type: module
prd_task_id: "YP-09-122"
title: "YP-09-122: 屏幕录制与分享 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
estimate_frontend: 0.5
roles: [engineer]
prd_month: "202609"
related_tests: ["129-prd-test-屏幕录制与分享.md"]
source_prd: "129-功能实现-屏幕录制与分享.md"

type: task
---

# YP-09-122: 屏幕录制与分享 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-122 · 状态：方案已编写

## 录制功能

`chrome.desktopCapture` + `MediaRecorder` API。

| 功能 | API |
|------|-----|
| 屏幕录制 | `chrome.desktopCapture.chooseDesktopMedia` |
| 音频录制 | `getUserMedia({ audio: true })` |
| 导出 WebM | `MediaRecorder` |
| 分享链接 | 上传 + 生成链接 |

---

## 一、需求背景

来源 PRD：129-功能实现-屏幕录制与分享.md

### 用户痛点

1. **录制屏幕需要切换工具，操作繁琐**：用户想录制网页操作步骤发给 AI 分析
1. **录制视频无法关联到会话**：录制的 bug 演示视频与 bug 讨论上下文分离
1. **录制内容意外包含隐私信息**：全屏录制时捕捉到聊天窗口外的密码输入框

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 屏幕录制 | `chrome.desktopCapture.chooseDesktopMedia` |
| 音频录制 | `getUserMedia({ audio: true })` |
| 导出 WebM | `MediaRecorder` |
| 分享链接 | 上传 + 生成链接 |
| 步骤 | 任务 |
| 1 | Composable 核心逻辑开发与单元测试 |
| 2 | UI 组件开发 + Popup/Side Panel 集成 |
| 3 | 边界场景处理 + 集成验证 |

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
| 1 | 10 分钟录制 > 500MB，上传耗时过长 | P1 | ### 挑战 | 待实施 |
| 2 | Chrome 权限限制 | P1 | `chrome.tabCapture` 需要在 Manifest 中声明，且仅支持前台标签页 | 待实施 |

