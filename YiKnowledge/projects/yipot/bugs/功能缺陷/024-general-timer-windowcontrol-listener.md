---
title: "General/index.jsx 模块级 timer 生命周期泄漏 + WindowControl listener 未清理"
tags: [bug, frontend, timer, lifecycle, listener, cleanup]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: trivial
priority: p3
project: yipot
module: src/window/Config/pages/General/index.jsx, src/components/WindowControl/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# General/index.jsx + WindowControl/index.jsx 生命周期问题

---

## 一、General — 模块级 timer

**问题**：`let timer = null` 在模块作用域。组件卸载时若 debounce 定时器未触发，回调仍会执行 `toast.success` 等操作。

**修复**：`let timer = null` → `const timerRef = useRef(null)`，所有引用改为 `timerRef.current`。

## 二、WindowControl — listener 未清理

**问题**：`listen('tauri://resize', ...)` 返回值（Promise<unlistenFn>）被丢弃。组件每次挂载添加新监听器，旧的不移除。

**修复**：赋值给 `unlisten`，在 useEffect cleanup 中调用 `unlisten.then(f => f())`。

## 三、验证

- [x] `pnpm build` 通过