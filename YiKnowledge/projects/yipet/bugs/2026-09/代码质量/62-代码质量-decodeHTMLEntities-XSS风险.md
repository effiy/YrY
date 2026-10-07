---
title: decodeHTMLEntities使用innerHTML存在XSS风险
tags: [yipet, security, xss, bug]
category: projects/yipet/bugs/2026-09/代码质量
created: 2026-09-23
updated: 2026-09-23
source: YiPet
type: bug
status: resolved
severity: low
priority: p2
---

# decodeHTMLEntities 使用 innerHTML 存在 XSS 风险

## 现象

`src/shared/utility-tools.ts` 的 `decodeHTMLEntities` 函数直接使用 `div.innerHTML = html` 来解码 HTML 实体。虽然 div 元素未插入 DOM 树（脚本不会执行），但 `<img onerror>` 等事件处理器在特定浏览器中可能在元素创建时触发。

## 根因分析

```typescript
// 修复前
export function decodeHTMLEntities(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}
```

浏览器在解析 `innerHTML` 赋值时会创建完整的 DOM 元素，包括事件处理器。虽然多数浏览器不会在元素脱离 DOM 树时触发事件，但这种行为不是规范保证的，存在边缘情况风险。

## 涉及文件

- `YiPet/src/shared/utility-tools.ts:260-264` — `decodeHTMLEntities` 函数

## 修复方案

使用 `<textarea>` 替代 `<div>` 进行 HTML 实体解码。`<textarea>` 的内容被浏览器视为纯文本，不会解析 HTML 标签或执行脚本：

```diff
export function decodeHTMLEntities(html: string): string {
-  const div = document.createElement('div');
-  div.innerHTML = html;
-  return div.textContent || '';
+  const textarea = document.createElement('textarea');
+  textarea.innerHTML = html;
+  return textarea.value;
}
```

这是业界标准的 HTML 实体解码安全实践。

## 验证

- `npx tsc --noEmit` ✓
- `npm test` ✓（138/138）
- `npm run build` ✓