---
title: popup.html 直接引用 CDN 资源而非通过 catalog 注入
tags: [yipet, code-quality, build-consistency]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# popup.html 直接引用 CDN 资源而非通过 catalog 注入

## 现象

`src/popup/popup.html` 直接 `<link>` 引用 `reset.css`，而非通过 `content/cdn/injector.ts` 的 catalog 系统：

```html
<!-- popup/popup.html:8 — 直接引用 -->
<link rel="stylesheet" href="/cdn/styles/reset.css" />
```

而内容脚本的 CDN 资源通过 `catalog.ts` 和 `injector.ts` 管理（470 行 catalog），有目录验证和依赖排序。Popup 的静态 HTML 绕过了这个系统——如果 `reset.css` 被移动或删除，popup 的样式会静默丢失。

## 根因分析

- Popup 是静态 HTML 页面（不是注入的 content script），无法通过 `injector.ts` 管理资源
- `reset.css` 在 catalog 中声明（`{ key: 'reset-css', path: 'styles/reset.css' }`），但 popup.html 使用了原始路径

## 涉及文件

- `src/popup/popup.html:8` — 硬编码 CDN 路径
- `src/content/cdn/catalog.ts:433` — catalog 中的 reset.css

## 修复方案

1. 在 Rsbuild 构建时将 `reset.css` 内容内联到 `popup.html` 的 `<style>` 标签中
2. 或通过 Rsbuild 的 `html.template` 参数替换路径变量
3. 确保 popup.html 中的 CDN 路径与 catalog 保持同步


## 影响范围

**影响模块**：`popup.html` 构建输出。
**影响用户**：Popup HTML 绕过了 CDN 资源的目录管理，可能导致资源引用不一致。
**影响范围**：Popup 弹窗的构建输出和资源引用。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 构建 | 确保 popup.html 的 CDN 资源引用与其他入口保持一致 | DevOps |
| 代码 | Popup 使用的第三方资源也应通过 catalog.ts 管理 | 开发者 |
| 构建 | 构建时验证 popup.html 引用的所有资源都存在 | DevOps |


## 经验教训

当项目有多个入口（Popup、Chat Window、Content Script）时，资源管理的统一性至关重要。不同入口使用不同的资源加载方式会导致维护困难和潜在的不一致问题。
