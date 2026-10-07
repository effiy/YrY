---
title: "Updater/index.jsx 下载进度 listener 未清理"
tags: [bug, frontend, updater, listener, cleanup]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: trivial
priority: p3
project: yipot
module: src/window/Updater/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# Updater 下载进度 listener 未清理

---

## 一、现象

> 更新窗口组件卸载时 `tauri://update-download-progress` 监听器未移除。

## 二、修复

在 useEffect 中添加 cleanup 函数：

```js
return () => {
    if (typeof unlisten !== 'number') {
        unlisten.then((f) => f());
        unlisten = 0;
    }
    eventId = 0;
};
```

## 三、验证

- [x] `pnpm build` 通过