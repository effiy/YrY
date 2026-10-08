---
title: console.error 直接使用无统一错误报告抽象
tags: [yivad, code-quality, logging]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-console-error无统一日志"
lifecycle: active
---

# console.error 直接使用无统一错误报告抽象

## 现象

多个 Store、hook 和组件直接使用 `console.error` 记录错误，无统一抽象：

```typescript
// WangEditor/index.vue — 直接 console.error
console.error(error);

// story.ts — 带有消息前缀
console.error("Failed to save AI coding history:", e);

// aiChat.ts — 带有来源标记
console.error("[aiChat] persistActive failed:", e?.message ?? e);
```

日志格式不统一：有些带 `[module]` 前缀，有些不带；有些输出 `e.message`，有些输出整个 error 对象。在生产环境中，这些日志输出到浏览器控制台，用户看不到也无法收集。

## 根因分析

- 没有统一的错误报告工具函数（如 `reportError(module, message, error)`）
- 开发者各自选择日志格式
- 无法在生产环境中收集前端错误

## 涉及文件

- `stores/modules/story.ts:516`
- `stores/modules/aiChat.ts:634`
- `components/WangEditor/index.vue:103,128`
- `directives/modules/copy.ts:33`

## 修复方案

```typescript
// utils/logger.ts
export function logError(module: string, message: string, error?: unknown) {
  if (import.meta.env.DEV) console.error(`[${module}] ${message}`, error);
  // 生产环境可接入错误收集服务
}
```

## 预防措施

- 所有错误日志通过统一的 logger 函数输出

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **日志格式的熵增**：没有统一 logger 时，每个开发者各自选择格式（`console.error(error)` / `console.error("msg:", e)` / `console.error("[module]", e?.message)`），日志在生产环境中既不可搜索也不可聚合
- **日志的双重目的**：开发阶段的 `console.error` 可以随意，但生产环境需要：(1) 错误分类（按 module）、(2) 上下文信息（用户操作路径）、(3) 可上报到外部服务。统一 logger 是这三者的前提

