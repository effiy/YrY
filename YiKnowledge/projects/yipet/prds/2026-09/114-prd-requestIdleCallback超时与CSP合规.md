---

doc_type: module
prd_id: "YP-09-114"
title: "YP-09-114: 运行时可靠性 — requestIdleCallback 超时兜底 + 更新横幅 CSP 合规"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
tags: [reliability, csp, performance, hardening]
related_tasks: ["114-prd-task-requestIdleCallback超时与CSP合规.md"]
related_tests: ["114-prd-test-requestIdleCallback超时与CSP合规.md"]
related_modules: ["content/bootstrap.ts", "content/rendering/overlay.ts"]

type: 需求
---

# YP-09-114: 运行时可靠性修复

> **PRD 版本**：v1.0 · **状态**：已完成

---

## 1. 背景

YiPet 内容脚本在页面加载时通过 `requestIdleCallback` 延迟非紧急的宠物覆盖层恢复操作。当前未设置 `timeout` 参数，在页面持续繁忙时（大量动画、持续滚动、密集 DOM 操作），回调可能被无限期推迟。

同时，扩展更新通知横幅使用 `innerHTML` 注入 HTML 字符串，其中包含内联 `onclick="location.reload()"` 事件处理器——这违反 MV3 CSP（Content Security Policy）要求，且在某些严格 CSP 配置的页面上不会触发。

## 2. 用户问题

- **目标用户**：在内容密集型页面（SaaS 仪表盘、社交媒体、图表页面）上使用 YiPet 的用户
- **问题陈述 1**：用户在繁忙页面刷新后，宠物覆盖层可能延迟数秒甚至数十秒才出现（`requestIdleCallback` 无限等待空闲）
- **问题陈述 2**：扩展更新后弹出的"刷新页面"横幅上的按钮在某些 CSP 严格的页面上无响应

### 证据质量级别

| 级别 | 证据类型 | 可信度 |
|------|---------|--------|
| 强 | MDN 文档推荐 `requestIdleCallback` 始终设置 `timeout` | 高 |
| 强 | MV3 CSP 禁止内联事件处理器（`onclick="..."`） | 高 |
| 中 | 用户尚未报告具体延迟事件（低流量项目） | 中 |

## 3. 范围

### 修复项

| 缺陷 | 文件 | 当前行为 | 修复后 |
|------|------|----------|--------|
| `requestIdleCallback` 无超时 | `bootstrap.ts:65` | `requestIdleCallback(fn)` | `requestIdleCallback(fn, { timeout: 2000 })` |
| Polyfill 超时 | `bootstrap.ts:66` | `setTimeout(fn, 0)` | `setTimeout(fn, 50)` |
| 更新横幅内联 onclick | `overlay.ts:472` | `innerHTML` + `onclick="location.reload()"` | DOM API + `addEventListener` |

### 用户故事

| 优先级 | 故事 | 验收标准 |
|--------|------|---------|
| P2 | 繁忙页面宠物最迟 2 秒出现 | `requestIdleCallback` 含 `timeout: 2000` |
| P2 | 更新横幅按钮在所有页面正常工作 | 无内联 `onclick`，使用 `addEventListener` |

## 4. 成功指标

| 指标 | 基线值 | 目标值 | 测量方法 |
|------|--------|--------|---------|
| idle callback 最晚执行 | 无限期 | ≤ 2000ms | 代码审查 |
| 横幅按钮 CSP 合规 | `onclick` 内联 | `addEventListener` | 代码审查 |
| 类型检查 | 0 error | 0 error | `vue-tsc --noEmit` |
| 回归测试 | 138/138 | 138/138 | `npm test` |

## 5. 风险与依赖

| 风险 | 可能性 | 影响 | 缓解 |
|------|--------|------|------|
| `timeout: 2000` 在极端繁忙页面仍不够 | 极低 | 低 | 2000ms 覆盖绝大多数场景（main thread 任务 >2s 的情况极少） |
| DOM API 横幅与 innerHTML 版本样式差异 | 极低 | 低 | 逐属性复制 CSS，零样式变化 |

## 6. 时间线

| 里程碑 | 日期 | 负责人 |
|--------|------|--------|
| requestIdleCallback 修复 | 2026-09-23 | Claude |
| 更新横幅 CSP 合规修复 | 2026-09-23 | Claude |
| 类型检查 + 测试 + 构建 | 2026-09-23 | Claude |