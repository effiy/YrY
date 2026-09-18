---
doc_type: module
prd_task_id: "YP-09-02"
title: "YP-09-02: Service Worker 生命周期 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-16
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "09-稳定性-ServiceWorker.md"
source_okr: [yipet-004]
related_tests: ["09-prd-test-ServiceWorker"]
---

# YP-09-02: Service Worker 生命周期 — 开发方案

> 来源 PRD：[09-稳定性-ServiceWorker.md](../../prds/2026-09/09-稳定性-ServiceWorker.md)
> 需求编号：YP-09-02 · 优先级：P0 · 人天：1.0d · 状态：已完成
> 测试方案：[09-prd-test-ServiceWorker.md](../../tests/2026-09/09-prd-test-ServiceWorker.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW）。

---

## 一、架构总览

Chrome MV3 Service Worker 在空闲 30s 后被浏览器终止。本方案通过心跳保活、长连接唤醒、消息队列和崩溃恢复四重机制保障 SW 可靠性。

### 状态机

```
install → activate → running → idle(20s)→ terminated
                       ↑                      │
                       └── wake via connect ──┘
```

### 四重保障

| 机制 | 实现 | 解决 |
|------|------|------|
| 心跳保活 | `setInterval` 每 20s 自 ping | 防止空闲终止 |
| 唤醒恢复 | `chrome.runtime.onConnect` 长连接 | Content Script 主动唤醒 SW |
| 消息队列 | `chrome.storage.local` 暂存 | SW 休眠期间不丢消息 |
| 崩溃恢复 | try/catch + 状态保存到 storage | SW 崩溃后恢复上下文 |

## 二、关键技术决策

### D-01：心跳 20s 而非 Chrome 默认 30s

Chrome 在 SW 空闲 30s 后终止，心跳 20s 留有 10s 安全余量。过于频繁（<10s）会增加电池消耗。

### D-02：消息队列持久化到 storage 而非内存

内存队列在 SW 终止时全部丢失。`chrome.storage.local` 持久化确保休眠期间消息不丢失，唤醒后批量出队。

## 三、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 生命周期状态机 | 0.2 |
| 2 | 心跳保活 (20s ping) | 0.2 |
| 3 | 唤醒恢复 (onConnect 长连接) | 0.2 |
| 4 | 消息队列 (storage 持久化) | 0.2 |
| 5 | 崩溃恢复 + 集成测试 | 0.2 |

**总计：1.0d**

## 四、实现完成记录

> **完成日期**：2026-09-10 · **状态**：已完成

## 五、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | 心跳与省电模式冲突 | P2 | 设备休眠时心跳暂停，SW 可能被终止 | 待评估 |
| 2 | 消息队列未限制大小 | P3 | 长期离线后队列可能堆积大量消息 | 待实施（max 1000 条） |

---