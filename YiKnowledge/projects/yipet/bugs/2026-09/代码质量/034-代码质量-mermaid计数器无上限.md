---
title: chat/utils.ts 中 mermaid 序列计数器无上限
tags: [yipet, code-quality, resource-management]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# chat/utils.ts 中 mermaid 序列计数器无上限

## 现象

`chat/utils.ts` 中的 `_mermaidSeq` 计数器在每次渲染 mermaid 图表时递增，无上限保护：

```typescript
let _mermaidSeq = 0;

// 每次 mermaid 渲染
const { svg } = await mermaid.render(`yipet-mmd-${++_mermaidSeq}`, code);
```

如果在一个会话中渲染了大量 mermaid 图表（AI 生成的技术文档），计数器会持续增长。虽然数字溢出需要极长时间（`Number.MAX_SAFE_INTEGER`），但 mermaid 内部可能对频繁的 render 调用有内存管理问题。

## 根因分析

- `_mermaidSeq` 用作 mermaid DOM 元素的唯一标识符
- 在 SPA 中页面不刷新，计数器在整个会话期间持续增长
- mermaid 库可能在内部保持对旧 DOM 元素的引用

## 涉及文件

- `src/chat/utils.ts` — `_mermaidSeq` 计数器

## 修复方案

定期重置计数器（如会话切换时）或使用 `timestamp + random` 替代递增计数器：
```typescript
const id = `yipet-mmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
```


## 影响范围

**影响模块**：`src/chat/utils.ts` 中 Mermaid 渲染的 `_mermaidSeq` 计数器。
**影响用户**：在长时间聊天会话中，计数器可能溢出或产生大量无用的递增 ID。
**影响范围**：所有包含 Mermaid 图表的聊天消息渲染。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 使用更安全的 ID 生成策略（如 `crypto.randomUUID()` 或时间戳+随机数） | 开发者 |
| 代码 | 添加计数器上限兜底（达到上限后重置） | 开发者 |
| 性能 | 避免使用全局递增计数器作为 DOM ID | 开发者 |


## 经验教训

全局递增计数器用于 DOM ID 生成是一种简单但脆弱的做法。在长时间运行的单页应用中，计数器可能变得非常大。使用随机 ID 可以消除计数器溢出的风险。
