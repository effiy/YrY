---
title: "Recognize/index.jsx 变量名冲突 — 同 Translate 窗口模式"
tags: [bug, frontend, recognize, variable-collision, blur-listener]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p3
project: yipot
module: src/window/Recognize/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: always
roles: [engineer]
---

# Recognize/index.jsx 变量名冲突

---

## 一、现象

> 与 Translate 窗口相同模式：`unlisten` 变量名不够具体，pin 切换时重新赋值模块级变量。

## 二、修复

重命名为 `blurUnlisten` 保持一致性：

```js
// Before
let unlisten = listenBlur();

// After  
let blurUnlisten = listenBlur();
```

同步更新 `unlistenBlur()` 和 pin toggle 中的引用。

## 三、验证

- [x] `pnpm build` 通过