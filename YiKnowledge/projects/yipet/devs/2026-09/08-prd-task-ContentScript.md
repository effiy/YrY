---
doc_type: module
prd_task_id: "YP-09-01"
title: "YP-09-01: Content Script 稳定性 — 开发方案"
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
source_prd: "08-稳定性-ContentScript.md"
source_okr: [yipet-004]
related_tests: ["08-prd-test-ContentScript"]
---

# YP-09-01: Content Script 稳定性 — 开发方案

> 来源 PRD：[08-稳定性-ContentScript.md](../../prds/2026-09/08-稳定性-ContentScript.md)
> 需求编号：YP-09-01 · 优先级：P0 · 人天：1.0d · 状态：已完成
> 测试方案：[08-prd-test-ContentScript.md](../../tests/2026-09/08-prd-test-ContentScript.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW）。

---

## 一、架构总览

Chrome 扩展 Content Script 在 SPA 页面中面临注入时机、路由变化、DOM 隔离三大挑战。本方案通过 MutationObserver + 重试机制 + Shadow DOM 封装解决稳定性问题。

### 核心策略

| 挑战 | 策略 | 实现 |
|------|------|------|
| SPA 路由变化 | MutationObserver + popstate 监听 | URL 变化或 DOM 突变 → 重新注入 Pet |
| 注入失败 | 指数退避重试（500ms/1s/2s） | 3 次后放弃 + 错误日志 |
| 宿主页面干扰 | Shadow DOM 封装 | 样式隔离 + 事件不冒泡 |
| 资源加载慢 | CDN prefetch + 关键资源内联 | `<link rel="prefetch">` |

## 二、关键技术决策

### D-01：MutationObserver 而非定时轮询

`setInterval` 轮询 DOM 消耗 CPU。MutationObserver 仅在 DOM 变更时触发，通过 `debounce(200ms)` 合并连续变更，避免频繁注入。

### D-02：Shadow DOM 而非 iframe

iframe 隔离度最高但通信复杂（postMessage）。Shadow DOM 提供样式隔离 + 轻量事件边界，性能开销 < iframe（无独立渲染进程）。

## 三、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | SPA 路由监听（MutationObserver + popstate） | 0.3 |
| 2 | 注入重试（指数退避 3 次） | 0.2 |
| 3 | Shadow DOM 封装 + 事件隔离 | 0.3 |
| 4 | 资源预加载 + 集成测试 | 0.2 |

**总计：1.0d**

## 四、实现完成记录

> **完成日期**：2026-09-10 · **状态**：已完成

## 五、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | iframe 嵌入场景兼容 | P2 | 某些网站将主内容放在 iframe 中，Shadow DOM 层级更深 | 待实施 |
| 2 | 注入失败无监控上报 | P3 | 重试 3 次后静默放弃，无 Dashboard 统计 | 待实施 |

---