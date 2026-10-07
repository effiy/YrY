---

doc_type: module
prd_task_id: "YP-09-25"
title: "YP-09-25: 通知提醒系统 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["32-prd-test-通知提醒系统.md"]
source_prd: "32-架构设计-通知提醒系统.md"

type: task
---

# YP-09-25: 通知提醒系统 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-25

## chrome.notifications 集成

| 通知类型 | 触发条件 |
|---------|---------|
| AI 回复完成 | SSE 流结束 |
| 会话创建 | 新会话开始 |
| Bug 状态变更 | 跨项目同步 |
| 更新提醒 | 新版本发布 |

## 通知配置

| 设置 | 默认值 |
|------|--------|
| 通知开关 | 开启 |
| 声音提醒 | 关闭 |
| 桌面通知 | 开启 |

---

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |

---

## 一、需求背景

来源 PRD：32-架构设计-通知提醒系统.md

### 用户痛点

1. **2;
  requireInteraction: boolean;
  icon?: string;
}

class NotificationManager {
  private _enabled = true;
  private _preferences: Record<NotificationType, boolean> = {
    ai_response: true,
    agent_task: true,
    rag_index: false,
    error: true,
  };
  // 频率控制：每类通知的最近发送时间
  private _lastSentTimes: Map<NotificationType, number> = new Map();
  private readonly THROTTLE_MS = 60_000; // 1 分钟

  async init() {
    const result = await chrome.storage.local.get([
      'yipet:notifications:enabled',
      'yipet:notifications:preferences',
    ]);
    this._enabled = result['yipet:notifications:enabled'] ?? true;
    if (result['yipet:notifications:preferences']) {
      this._preferences = {
        ...this._preferences,
        ...result['yipet:notifications:preferences'],
      };
    }
  }

  /** 发送通知——带频率控制和偏好检查。 */
  async notify(
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      priority?: 0**：2;
      requireInteraction?: boolean;
    }
  ): Promise<boolean> {
    // 全局开关
    if (!this._enabled) return false;

    // 类型偏好
    if (!this._preferences[type]) return false;

    // 频率控制
    const lastSent = this._lastSentTimes.get(type) ?? 0;
    if (Date.now() - lastSent < this.THROTTLE_MS) {
      console.debug(`[YiPet:Notify] ${type} 通知已限流`);
      return false;
    }

    this._lastSentTimes.set(type, Date.now());

    return new Promise((resolve) => {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: options?.icon
1. **添加 `notifications` 权限**：权限声明正确
1. **实现 NotificationManager 核心**：单元测试（限流、偏好）

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 通知类型 | 触发条件 |
| AI 回复完成 | SSE 流结束 |
| 会话创建 | 新会话开始 |
| Bug 状态变更 | 跨项目同步 |
| 更新提醒 | 新版本发布 |
| 设置 | 默认值 |
| 通知开关 | 开启 |
| 声音提醒 | 关闭 |

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
| 1 | 用户频繁切换 Tab 查看回复 | P1 | 60% 活跃用户 | 待实施 |
| 2 | 等待数分钟不知任务状态 | P1 | 30%（使用 Agent 功能） | 待实施 |

