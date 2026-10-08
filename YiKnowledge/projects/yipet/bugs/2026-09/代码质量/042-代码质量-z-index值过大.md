---
title: chat 窗口 z-index 固定为 2147483647
tags: [yipet, code-quality, css]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# chat 窗口 z-index 固定为 2147483647

## 现象

`content/rendering/overlay.ts:881` 中更新横幅的 z-index 使用 `2147483647`（32 位有符号整数的最大值）：

```typescript
banner.style.cssText = '...z-index:2147483647;...';
```

这是典型的"比所有元素都高"的模式，但最大值意味着：
- 任何其他元素无法覆盖此横幅（包括浏览器的内置 UI）
- 如果多个 YiPet 扩展实例或元素使用相同策略，堆叠顺序不可预测

## 涉及文件

- `src/content/rendering/overlay.ts:881` — 极端 z-index 值

## 修复方案

使用合理的 z-index 值（如 `999999`），配合 CSS 变量统一的 z-index 体系。


## 影响范围

**影响模块**：宠物覆盖层和聊天窗口的 z-index CSS 样式。
**影响用户**：过大的 z-index 值（如 2147483647）可能与页面的其他固定元素（模态框、通知横幅）产生视觉层级冲突。
**影响范围**：所有页面上的宠物覆盖层和聊天窗口渲染。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 使用语义化的 z-index 变量（`--yipet-z-pet`、`--yipet-z-chat`），而非魔法数字 | 开发者 |
| 代码 | z-index 值只需大于页面常见元素的最大层级（通常 10000 足够） | 开发者 |
| 代码 | 在 CSS 中定义 z-index 层级系统，记录每个层级对应哪些元素 | 开发者 |


## 经验教训

`z-index: 2147483647`（32 位有符号整数最大值）是一个常见的反模式。它试图"压倒一切"但实际上制造了新的问题——当页面的其他元素也使用类似策略时，层级冲突无法避免。使用语义化的 z-index 变量和合理的层级系统是更可持续的做法。
