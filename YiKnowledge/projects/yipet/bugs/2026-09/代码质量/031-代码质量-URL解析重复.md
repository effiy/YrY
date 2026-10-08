---
title: popup/services/chrome.ts new URL 重复调用
tags: [yipet, code-quality, efficiency]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# popup/services/chrome.ts new URL 重复调用

## 现象

`popup/services/chrome.ts:72` 对同一 URL 调用了两次 `new URL()`：

```typescript
const urlKey = new URL(tabUrl).origin + new URL(tabUrl).pathname;
```

每次 `new URL()` 都会解析完整的 URL 字符串，这里解析了两次相同的 URL。应解析一次后复用：

```typescript
const u = new URL(tabUrl);
const urlKey = u.origin + u.pathname;
```

## 根因分析

- 代码简洁优先——`new URL(tabUrl).origin + new URL(tabUrl).pathname` 比先赋值再取属性少一行
- 但 `new URL()` 在频繁调用（popup 每次打开）时有不必要的解析开销

## 涉及文件

- `src/popup/services/chrome.ts:72` — 重复解析 URL

## 修复方案

```typescript
const u = new URL(tabUrl);
const urlKey = u.origin + u.pathname;
```


## 影响范围

**影响模块**：多处重复的 URL 解析和提取逻辑。
**影响用户**：不同模块对同一 URL 的解析结果可能不一致，导致状态管理混乱。
**影响范围**：Content Script、Chat Store、Popup 中的 URL 提取工具函数。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 将 URL 解析逻辑提取到 `src/shared/utils/url.ts` 公共模块 | 开发者 |
| 代码 | 所有 URL 解析操作使用相同的工具函数，保证行为一致 | 开发者 |
| 重构 | 全局搜索重复的 URL 解析代码，统一替换为公共函数 | 开发者 |


## 经验教训

重复的工具函数是代码异味的明确信号。URL 解析逻辑在 Content Script、Chat Store 和 Popup 中都有独立实现，细微的行为差异会导致难以追踪的 bug。DRY 原则在工具函数层面尤为重要。
