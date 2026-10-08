---
title: "Backup/index.jsx 模块级定时器在组件卸载后可能更新状态"
tags: [bug, frontend, backup, timer, lifecycle, unmounted]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p3
project: yipot
module: src/window/Config/pages/Backup/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# Backup/index.jsx 模块级定时器生命周期问题

---

## 一、现象

> `refreshTimer`（模块级 `setInterval`）在 Backup 页面卸载后可能仍回调，尝试 `setAliyunAccessToken`/`toast.success` 到已卸载组件。

## 二、修复

将 `refreshTimer` 从模块级变量迁移为 `useRef`：

```js
// Before (module level):
let refreshTimer = null;

// After (component scope):
const refreshTimerRef = useRef(null);
```

所有引用改为 `refreshTimerRef.current`。已有 `useEffect` cleanup 正确清理定时器。

## 三、验证

- [x] `pnpm build` 通过
- [ ] 阿里云登录轮询中切换页面不报错