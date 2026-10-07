---
title: "Screenshot/index.jsx 嵌套 Promise 无错误处理 + imgRef null 安全"
tags: [bug, frontend, screenshot, error-handling, null-safety]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/window/Screenshot/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: occasional
roles: [engineer]
---

# Screenshot/index.jsx 嵌套 Promise 无错误处理

---

## 一、现象

> 截图初始化时若 `currentMonitor()`/`screenshot()`/`appCacheDir()` 任一失败，错误被静默吞噬。截图窗口停留在空白状态，不关闭也无提示。

## 二、根因

**useEffect** 使用 4 层嵌套 `.then()` 无 `.catch()`：

```js
currentMonitor().then(monitor => {
    invoke('screenshot', ...).then(() => {
        appCacheDir().then(path => {
            join(path, ...).then(filePath => ...)
        })
    })
})  // ← 任何一步失败 → 静默异常
```

**onMouseUp** 直接访问 `imgRef.current.naturalWidth` 无 null 检查。

## 三、修复

**useEffect** — 转为 async/await + try/catch：

```js
useEffect(() => {
    (async () => {
        try {
            const monitor = await currentMonitor();
            await invoke('screenshot', { x: monitor.position.x, y: monitor.position.y });
            const path = await appCacheDir();
            const filePath = await join(path, 'pot_screenshot.png');
            setImgurl(convertFileSrc(filePath));
        } catch (e) {
            warn('Screenshot init failed: ' + e);
            await appWindow.close();
        }
    })();
}, []);
```

**onMouseUp** — 添加 `if (!imgRef.current)` null 守卫。

## 四、验证

- [x] `pnpm build` 通过
- [ ] 截图初始化失败时窗口自动关闭