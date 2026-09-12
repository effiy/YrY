---
title: AiChatBox 组件 provide 的 key 使用字符串而非 Symbol
tags: [yivad, code-quality, dependency-injection]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# AiChatBox 组件 provide 的 key 使用字符串而非 Symbol

## 现象

`components/AiChatBox/AiChatBox.vue` 使用字符串作为 `provide/inject` 的 key，而非 `Symbol` 或 `InjectionKey`：

```typescript
// AiChatBox.vue:117 — 字符串 key
provide("aiChatBoxCollapse", { ... });

// AiChatBox.vue:164 — 字符串 key  
provide("aiChatSessionSidebar", { ... });
```

对比 `project/detail.vue` 正确使用了 `InjectionKey`：
```typescript
provide(PROJECT_DETAIL_KEY, { ... });  // PROJECT_DETAIL_KEY 类型为 InjectionKey
```

字符串 key 的问题：无类型安全（inject 返回 `unknown`）、可能与其他组件的 key 冲突。

## 根因分析

- AiChatBox 是较早的组件，当时未建立 `InjectionKey` 模式
- project/detail 是后来的组件，遵循了新约定

## 涉及文件

- `components/AiChatBox/AiChatBox.vue:117,164` — 字符串 provide key

## 修复方案

```typescript
// 在组件顶部或单独的 types 文件中
export const AI_CHAT_BOX_COLLAPSE_KEY = Symbol('aiChatBoxCollapse') as InjectionKey<...>
export const AI_CHAT_SESSION_SIDEBAR_KEY = Symbol('aiChatSessionSidebar') as InjectionKey<...>
```

## 预防措施

- 所有 provide/inject 必须使用类型化的 Symbol/InjectionKey

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

