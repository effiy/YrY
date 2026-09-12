---
title: chrome.storage.local 存储键分散且命名不一致
tags: [yipet, code-quality, naming]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# chrome.storage.local 存储键分散且命名不一致

## 现象

`chrome.storage.local` 的存储键分散在 7 个文件中，命名风格不一致（snake_case vs camelCase）：

```typescript
// shared/storage/state.ts — 常量定义
GLOBAL_STATE_KEY = 'yipet_global_state'
PREFS_KEY = 'yipet_prefs'

// content/state/persistence.ts — 另一套键
PET_URL_STATE_KEY = 'pet_url_state'
ROLE_STORAGE_KEY = 'petRole'          // camelCase
'petColorTheme'                        // 硬编码字符串

// popup/services/chrome.ts — 再一套键
'pet_state_by_url'                     // snake_case
'petRole'                              // camelCase

// chat/stores/chat.ts
'sidebarWidth', 'sidebarCollapsed'     // 无前缀
'promptHistory', 'chatColorIndex'      // 无前缀
```

## 根因分析

- 存储键由不同开发者在不同时期添加，缺乏统一约定
- 部分使用常量定义，部分使用硬编码字符串字面量
- 无命名空间前缀（如 `yipet:`）防止与其他扩展或页面脚本冲突

## 涉及文件

- `src/shared/storage/state.ts` — `yipet_global_state`, `yipet_prefs`
- `src/content/state/persistence.ts` — `pet_url_state`, `petRole`, `petColorTheme`
- `src/popup/services/chrome.ts` — `pet_state_by_url`, `petRole`
- `src/chat/stores/chat.ts` — `sidebarWidth`, `promptHistory` 等
- `src/shared/i18n/locale.ts` — `yiPet_locale`
- `src/shared/i18n/timezone.ts` — `yiPet_timezone`
- `src/content/ipc/relay.ts` — `petRole`, `petColorTheme`

## 修复方案

1. 创建 `src/shared/storage/keys.ts` 统一管理所有存储键常量
2. 使用一致的命名约定：`yipet:{domain}:{key}` (如 `yipet:chat:sidebarWidth`)
3. 所有存储键使用 `UPPER_SNAKE_CASE` 常量，禁止硬编码字符串
4. 添加键名文档注释说明用途和数据结构


## 影响范围

**影响模块**：7 个文件中的 `chrome.storage.local` 存储键定义。
**影响用户**：键名不一致增加了维护成本，新开发者难以理解存储结构。最严重的情况是不同模块使用不同键名存储同一数据，导致状态不一致。
**影响范围**：所有使用 `chrome.storage.local` 的模块（Chat Store、Content Script、Popup、i18n）。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 创建 `src/shared/storage/keys.ts` 统一管理所有存储键常量 | 开发者 |
| 代码 | 使用命名空间前缀格式：`yipet:{domain}:{key}` | 开发者 |
| 代码 | 所有存储键使用 `UPPER_SNAKE_CASE` 常量，禁止硬编码字符串 | 开发者 |
| 工具 | ESLint 规则禁止在业务代码中直接写存储键字符串字面量 | DevOps |


## 经验教训

存储键是跨模块的隐式契约。当多个模块独立定义存储键时，命名冲突和数据覆盖的风险会随模块数量增长。统一管理存储键是低成本、高收益的架构改进。
