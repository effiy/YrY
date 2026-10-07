---
title: "Translate/index.jsx 模块级变量名冲突导致 plugin reload 监听器未注册"
tags: [bug, frontend, react, state-leak, variable-collision, translate-window]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/window/Translate/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: always
roles: [engineer]
---

# Translate/index.jsx 模块级变量名冲突

---

## 一、现象

> 翻译窗口中 `reload_plugin_list` 事件的监听器永远不会被注册。当用户安装新插件后，翻译窗口不会自动刷新插件列表，必须手动重启应用。

## 二、根因

**问题代码** (L41, L194):

```js
let unlisten = listenBlur();  // L41: Promise<unlistenFn> — 永远 truthy

// ...
useEffect(() => {
    loadPluginList();
    if (!unlisten) {                           // ← 永远为 false！
        unlisten = listen('reload_plugin_list', loadPluginList);  // ← 永远不执行
    }
}, []);
```

`unlisten` 变量被 `listenBlur()` 的返回值（一个 Promise）占用。JavaScript 中 Promise 对象永远 truthy，因此 `if (!unlisten)` 永远为 false，插件重载监听器注册代码永远不执行。

## 三、修复

将两个监听器使用独立变量：

```js
let blurUnlisten = listenBlur();           // blur 监听器
let pluginReloadUnlisten = null;           // 插件重载监听器

// useEffect 中：
if (!pluginReloadUnlisten) {
    pluginReloadUnlisten = listen('reload_plugin_list', loadPluginList);
}
```

## 四、验证

- [x] `pnpm build` 通过
- [ ] 安装插件后翻译窗口立即刷新插件列表