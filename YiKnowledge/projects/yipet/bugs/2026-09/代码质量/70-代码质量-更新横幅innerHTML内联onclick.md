---
title: 更新横幅使用innerHTML注入内联onclick违反MV3 CSP
tags: [yipet, code-quality, csp, security]
category: projects/yipet/bugs/2026-09/代码质量
created: 2026-09-23
updated: 2026-09-23
source: YiPet
type: bug
status: resolved
severity: minor
priority: p2
---

# 更新横幅 innerHTML 内联 onclick 违反 CSP

## 现象

扩展更新通知横幅使用 `innerHTML` 注入 HTML 字符串，包含内联事件处理器 `onclick="location.reload()"`。在 MV3 严格 CSP 配置下，内联事件处理器不执行——"刷新页面"按钮点击无反应。

## 根因分析

`src/content/rendering/overlay.ts:472-484` 的 `showUpdateNotification` 函数直接拼接 HTML 字符串并通过 `innerHTML` 注入 DOM。MV3 的 `content_security_policy` 禁止内联脚本和事件处理器。

## 涉及文件

- `YiPet/src/content/rendering/overlay.ts:472-484`

## 修复方案

将 `innerHTML` 字符串拼接替换为 DOM API：

```diff
- banner.innerHTML = '<div>...<button onclick="location.reload()">刷新页面</button></div>';
+ const btn = document.createElement('button');
+ btn.textContent = '刷新页面';
+ btn.addEventListener('click', () => location.reload());
+ // ... createElement + appendChild 构建完整 DOM
```

## 验证

- 按钮在所有页面正常触发页面刷新
- `npm run typecheck` ✓
- `npm test` ✓（138/138）
- `npm run build` ✓