---
title: "YP-08-04: 跨项目桥接 — YiVad 聊天植入、Bug 报告与页面感知"
tags: [需求文档, 跨项目, 桥接, YiVad, Bug报告, Chrome扩展]
category: 项目/浏览器扩展/需求
created: 2026-08-05
updated: 2026-09-16
source: 内部
type: 需求
status: 已完成
priority: P1
project: YiPet
project_id: yipet
owner: 陈铭
prd_month: "202608"
prd_task_id: YP-08-04
estimate_frontend: 2.0
review_status: 已评审
issue_type: 功能
roles: [engineer]
source_okr: [yipet-003]
related_modules: [04-prd-task-跨项目桥接]
related_tests: [04-prd-test-跨项目桥接]
---

# YP-08-04: 跨项目桥接

> 需求编号：YP-08-04 · 优先级：P1 · 人天：2.0d · 状态：已完成
> 依赖：YP-08-01（API Services 就绪）、YiVad 前端运行中

---

## 一、背景

YiPet 运行在任意网页上，是唯一能同时触达 YiAi、YiVad、YiKnowledge 的 UI 入口。但八月前 YiPet 与 YiVad 之间无桥接——无法跳转 YiVad 继续对话、无法快速记录 Bug、无页面感知。

### 痛点

| 痛点 | 严重度 | 案例 |
|------|--------|------|
| 无法跳转 YiVad | 中 | 对话无法从 YiPet 延续到 YiVad aiChat |
| 无法记录 Bug | 高 | 发现缺陷后需手动切换页面、填写表单（约 1 分钟） |
| 无页面感知 | 中 | 不知道当前页面类型，无法提供上下文快捷操作 |
| 无文本选中集成 | 低 | 需手动复制粘贴页面文本 |

---

## 二、用户故事

| ID | 作为 | 我想要 | 以便 | 优先级 |
|----|------|--------|------|--------|
| US-01 | 用户 | 从 YiPet 一键跳转到 YiVad aiChat 继续对话 | 在更大的界面继续复杂讨论 | P1 |
| US-02 | 用户 | 在任意网页快速提交 Bug 报告 | 缺陷不遗漏到追踪系统 | **P0** |
| US-03 | 用户 | YiPet 识别当前页面类型 | 提供上下文相关的快捷操作 | P1 |
| US-04 | 用户 | 选中网页文本一键发送到聊天 | 无需手动复制粘贴 | P2 |

---

## 三、功能需求

### FR-01：YiVad 桥接

| 属性 | 描述 |
|------|------|
| 跳转 | `window.open(yivadUrl + "#/aiChat?session=" + key, "_blank")` |
| 桥接 Token | 一次性 `bridgeToken` 生成 → `services/bridge_service.py` → YiVad 验证 |
| 消息同步 | 跳转前将当前消息持久化到 MongoDB |

### FR-02：Bug 报告

| 属性 | 描述 |
|------|------|
| 入口 | BugReportDialog 模态框 — 自动填充 URL + 页面标题 |
| 字段 | title, project, module, severity, description, steps |
| 存储 | `data_service.create_document("bugs", bug)` → MongoDB |

### FR-03：页面感知

| 属性 | 描述 |
|------|------|
| 检测 | URL 模式匹配：`/bug/`、`/project/`、`/aiChat`、`/code-review/` |
| 快捷操作 | QuickButtons 根据页面类型动态展示：Bug 详情 → "分析此 Bug"；代码审查 → "审查此文件" |

### FR-04：文本选中集成

| 属性 | 描述 |
|------|------|
| 获取 | Content Script 通过 `window.getSelection().toString()` 获取选中文本 |
| 传递 | `chrome.runtime.sendMessage` → Service Worker → ChatWindow |
| 插入 | `store.input = selectedText` |

---

## 四、验收标准

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | 用户在 YiPet 聊天中 | 点击 "Discuss in YiVad" | 新标签页打开 YiVad aiChat，自动恢复当前会话 |
| AC-02 | 用户在任意网页发现 Bug | 点击 "Report Bug" | BugReportDialog 弹出，URL/标题自动填充 |
| AC-03 | 用户在 YiVad Bug 详情页 | 打开 YiPet | QuickButtons 显示 "分析此 Bug" |
| AC-04 | 用户选中网页文本 | 点击 YiPet 的 "Send Selection" | 选中的文本插入到聊天输入框 |

---

*关联：[开发方案](../../devs/2026-08/04-prd-task-跨项目桥接.md) · [测试规格](../../tests/2026-08/04-prd-test-跨项目桥接.md)*