---
title: "overlay.ts 生产代码中遗留大量 styled console.log 调试输出"
tags: [yipet, code-quality, logging, production]
category: projects/yipet/bugs/code-quality
created: 2026-09-10
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
resolution: |
  - list(): console.group/table/log 包裹在 import.meta.env.DEV 守卫中
  - help(): 整个函数体包裹在 import.meta.env.DEV 守卫中
  - 生产构建中不再输出调试信息
severity: trivial
priority: p3
project: YiPet
module: src/content/rendering/overlay.ts
reporter: Claude
environment: development
affected_version: 1.2.0
frequency: always
---

# overlay.ts 生产代码中遗留大量 styled console.log 调试输出

## 现象

`src/content/rendering/overlay.ts` 的 `list()` 和 `help()` 函数（第 537-610 行）包含大量带样式的 `console.log` 输出，这些代码随扩展一起发布到用户浏览器中。

```typescript
// list() 方法 — 第 537-561 行
console.log('%c[YiPet]%c No resources matching ...', ...);
console.group('%c[YiPet]%c CDN Resources ...', ...);
console.table(rows, ['Key', 'Type', 'Status', 'Description']);
console.log('%c  Usage: YiPet.load("key")%c ...', ...);
console.groupEnd();

// help() 方法 — 第 564-609+ 行
console.group('%c🐾 YiPet CDN Bootstrap %c v1.2.0', ...);
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', ...);
// ... 20+ 行样式化帮助文本
```

## 根因分析

- `list()` 和 `help()` 是 CDN bootstrap 的开发者诊断工具，通过 `window.YiPet.list()` / `YiPet.help()` 调用
- 这些 console 输出在设计上是诊断功能的一部分，但在生产环境中对所有用户可见
- `console.table` 在某些浏览器控制台中有性能开销

## 修复方案

**方案 A**（推荐）：使用构建时条件编译，仅在开发模式下保留详细输出：

```typescript
list(filter?: string): void {
  // ... build rows ...
  if (import.meta.env.DEV) {
    console.group('%c[YiPet]%c CDN Resources ...', ...);
    console.table(rows, ...);
    console.groupEnd();
  }
}
```

**方案 B**：保持 `help()` 函数不变（用户主动调用，期望看到输出），但将 `list()` 中的 `console.group`/`console.table` 替换为简洁的单行 `console.log`。

## 影响范围

- **影响模块**：src/content/rendering/overlay.ts
- **是否影响 API 契约**：否（`YiPet.list()` / `YiPet.help()` 行为不变）
- **是否影响其他项目**：否


## 经验教训

生产环境的 `console.log` 不仅影响性能，还可能成为信息泄露渠道。调试日志应在开发阶段使用，生产构建中应被自动移除或降级为静默模式。`import.meta.env.DEV` 是区分开发/生产环境的标准方式。
## 验证方法

- [ ] `npm run typecheck` 通过
- [ ] `npm run build` 通过
- [ ] 构建后 `YiPet.list()` 在控制台输出简化