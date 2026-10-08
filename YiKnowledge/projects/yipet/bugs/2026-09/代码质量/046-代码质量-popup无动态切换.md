---
title: popup 未使用 chrome.action.setPopup 动态切换弹窗
tags: [yipet, code-quality, api-usage]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# popup 未使用 chrome.action.setPopup 动态切换弹窗

## 现象

Popup 始终通过 `manifest.json` 的 `default_popup: "popup.html"` 加载同一个页面。`chrome.action.setPopup()` 可以在运行时动态切换弹窗内容（如根据宠物状态显示不同的 UI）。

## 涉及文件

- `manifest.json:23`
- `src/background/index.ts` — 未调用 setPopup

## 修复方案

考虑在宠物隐藏/显示时切换弹窗内容。


## 影响范围

**影响模块**：Popup 弹窗的 Vue 组件。
**影响用户**：Popup 打开后不会自动反映最新的扩展状态——如果用户在 Chat Window 中修改了设置，再打开 Popup 可能看到过时的状态。
**影响范围**：Popup 配置面板的所有状态显示。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | Popup 打开时主动从 `chrome.storage.local` 加载最新状态 | 开发者 |
| 代码 | Popup 监听 `chrome.storage.onChanged` 事件自动更新显示 | 开发者 |
| 代码 | Popup 和 Chat Window 的状态保持双向同步 | 开发者 |
| 体验 | Popup 显示时立即刷新状态，避免展示过期数据 | 开发者 |


## 经验教训

Popup 是一个短暂的 UI（点击其他区域即关闭），每次打开都应从数据源重新加载状态，而非依赖上次打开时的缓存。`chrome.storage.onChanged` 是实现实时同步的标准方式。
