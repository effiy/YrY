---
title: popup/stores/popup.ts 中的 notify 函数未导出供复用
tags: [yipet, code-quality, code-reuse]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# popup/stores/popup.ts 中的 notify 函数未导出供复用

## 现象

`popup/stores/popup.ts` 中有一个本地 `notify` 工具函数，但 `chat/stores/chat.ts` 中实现了一个独立的 `notify` 函数（通过 `setNotifyHandler` 注入）：

```typescript
// popup/stores/popup.ts — 本地 notify
function notify(type: string, message: string) { ... }

// chat/stores/chat.ts — 独立的 notify 机制
let _notifyHandler: ((message: string, type: NotifyType) => void) | null = null;
function notify(message: string, type: NotifyType = 'info') { ... }
```

两个模块有相似的通知功能但实现不同、不可互相复用。如果未来有第三个 UI 界面（如 options page），需要实现第三套 notify。

## 根因分析

- Popup 和 Chat 是独立的 Vue 应用入口，通知机制各自实现
- 没有提取到 shared 模块

## 涉及文件

- `src/popup/stores/popup.ts` — 本地 notify
- `src/chat/stores/chat.ts` — 独立 notify
- `src/popup/services/notification.ts` — Chrome notification API 封装

## 修复方案

统一通知 API 到 `src/shared/notify.ts`：
```typescript
export type NotifyType = 'info' | 'success' | 'error' | 'warning';
export function createNotifier(handler: (msg: string, type: NotifyType) => void) { ... }
```


## 影响范围

**影响模块**：多处重复的 `notify` 通知工具函数实现。
**影响用户**：通知行为不一致（如不同的动画效果、位置、持续时间），用户体验碎片化。
**影响范围**：所有弹出通知的模块。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 将 `notify` 提取到 `src/shared/ui/notify.ts` 公共模块 | 开发者 |
| 代码 | 定义统一的通知 API（`notify.success/error/warning/info`） | 开发者 |
| 体验 | 确保所有通知具有一致的样式和行为 | 开发者 |
| 重构 | 全局搜索重复的 notify 实现，统一替换 | 开发者 |


## 经验教训

UI 工具函数的重复实现是用户体验不一致的根源。一处改了样式，另一处还是旧的。统一的通知模块不仅减少代码重复，更重要的是保证用户在不同场景下看到一致的反馈。
