---
title: popup 打开时未先检查 content script 是否存在
tags: [yipet, code-quality, robustness]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# popup 打开时未先检查 content script 是否存在

## 现象

Popup 打开时直接向当前标签页发送消息，未先检查 content script 是否已注入。如果用户在 `chrome://` 页面或扩展刚安装的标签页上打开 popup，`sendMessage` 失败且用户看到错误状态。

## 涉及文件

- `src/popup/stores/popup.ts` — 初始化逻辑

## 修复方案

发送消息前使用 `chrome.scripting.executeScript` 检查或注入 content script。


## 影响范围

**影响模块**：`src/popup/services/chrome.ts` 消息发送逻辑。
**影响用户**：当当前标签页没有注入 Content Script 时（如 chrome:// 页面），Popup 发送消息会失败，用户看到错误提示但不知道为什么。
**影响范围**：所有通过 Popup 控制宠物状态的操作。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 发送消息前检查当前标签页是否已注入 Content Script | 开发者 |
| 代码 | 在不可注入的页面（chrome://、chrome-extension://）上禁用 Popup 操作按钮 | 开发者 |
| 体验 | 在不可操作的页面上显示提示说明原因 | 开发者 |
| 体验 | 提供"在新标签页打开宠物"的替代操作 | 开发者 |


## 经验教训

Content Script 只能注入到 `http://`、`https://` 和 `file://` 页面上。在 `chrome://` 或 `chrome-extension://` 页面打开 Popup 时，应提前告知用户当前页面不支持宠物功能，而非等操作失败后才报错。
