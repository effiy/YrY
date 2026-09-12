---
title: 页面刷新后 content script 状态从 chrome.storage 异步加载无加载指示
tags: [yipet, code-quality, ux]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# 页面刷新后 content script 状态从 chrome.storage 异步加载无加载指示

## 现象

`content/state/persistence.ts` 在页面刷新后从 `chrome.storage.local` 异步恢复宠物状态（可见性、角色、颜色），但加载期间无任何加载指示：

```typescript
// persistence.ts — 异步加载状态
const result = await chrome.storage.local.get(PET_URL_STATE_KEY);
```

在 `chrome.storage.local.get` 完成之前（50-200ms），宠物覆盖层使用默认状态渲染：默认角色、默认颜色、默认可见性。状态加载完成后覆盖层突然切换，用户体验突兀。

## 根因分析

- `chrome.storage.local` 是异步 API，有 50-200ms 的读取延迟
- Content script 在 `document_end` 时注入，此时页面内容可能已开始渲染
- 没有"加载中"的过渡状态

## 涉及文件

- `src/content/state/persistence.ts` — 状态恢复
- `src/content/rendering/overlay.ts` — 覆盖层渲染

## 修复方案

1. 初始渲染使用占位样式（opacity: 0），状态恢复后再淡入
2. 或使用 `sessionStorage` 缓存上次状态（同标签页内同步读取）
3. 首次加载时保存默认状态到 storage 以便下次读取更快


## 影响范围

**影响模块**：Content Script 状态加载逻辑。
**影响用户**：页面加载时宠物覆盖层出现闪烁——先隐藏再显示，或先显示默认状态再切换到用户偏好状态。
**影响范围**：所有页面的 Content Script 初始化和状态恢复流程。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 状态加载应在 DOM 渲染之前完成，避免中间状态的视觉闪烁 | 开发者 |
| 代码 | 使用 CSS `visibility: hidden` + 加载完成后切换为 `visible` 的策略 | 开发者 |
| 代码 | 初始状态与最终状态差异大时使用过渡动画平滑切换 | 开发者 |
| 体验 | 关键视觉元素（宠物覆盖层）应在状态就绪后再显示 | 开发者 |


## 经验教训

Content Script 的状态恢复是异步的（需要从 chrome.storage 读取），但 DOM 注入是同步的。时序差导致用户看到"默认状态 → 用户偏好状态"的闪烁。解决方案是将初始渲染设为不可见，等状态加载完成后再显示。
