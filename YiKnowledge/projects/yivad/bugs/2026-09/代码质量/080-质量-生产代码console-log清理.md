---
title: "生产代码 console.log 调试语句泄漏：DEV-only 守卫"
key: yivad-console-log-production-leak-20260923
tags:
- production-quality
- console-log
- debugging
category: projects/yivad/bugs/代码质量
created: "2026-09-23"
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p3
project: YiVad
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (2026-09-23)
frequency: always
---

## Description

发现 3 处生产代码中的调试 `console.log` 语句，在每次交互时向控制台输出内部状态信息：

1. **aiChat.ts** — `setActiveMessages` 在每次消息更新时输出消息数组长度变化
2. **useStreaming.ts** — SSE 流完成时输出流长度和时间戳
3. **chatService.ts** — SSE 响应建立时输出 HTTP 状态码和 content-type

## Impact

- 用户控制台被调试信息污染（尤其 SSE 场景下每秒 50+ 帧的消息更新）
- 暴露内部状态细节（消息数组长度、petTime 戳追踪）
- 轻微性能影响（字符串拼接 + console 调用）

## Solution

三层修复 — 均用 `import.meta.env.DEV` 守卫：

```ts
// Before
console.log("[setActiveMessages] msgs ...");

// After  
if (import.meta.env.DEV) console.log("[setActiveMessages] msgs ...");
```

`console.error` 调用保留不变（错误日志有必要保留在各环境）。

## Files Changed

| File | Change |
|------|--------|
| `src/stores/modules/aiChat.ts:146` | 添加 `import.meta.env.DEV` 守卫 |
| `src/stores/modules/aiChat/useStreaming.ts:299` | 添加 `import.meta.env.DEV` 守卫 |
| `src/api/modules/chatService.ts:77` | 添加 `import.meta.env.DEV` 守卫 |

## Verification

- vue-tsc: 0 errors
- `grep -rn "console.log(" src/ | grep -v "import.meta.env.DEV"` → 仅剩 `webVitals.ts` 和 `performanceObserver.ts` 中的调用（已在上层被 `if (import.meta.env.DEV)` 包裹）

## Prevention

**规则**：所有 `console.log` 必须包裹在 `if (import.meta.env.DEV)` 中。`console.warn`/`console.error` 可以不包裹，但应通过统一的 error reporter 而非直接 console。lint 规则建议：`no-console: ["warn", { allow: ["warn", "error"] }]` 可自动捕获此类问题。