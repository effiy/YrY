---
title: background/index.ts 中 onInstalled 未处理 reason=install
tags: [yipet, code-quality, edge-case]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# background/index.ts 中 onInstalled 未处理 reason=install

## 现象

`background/index.ts:22-40` 的 `chrome.runtime.onInstalled` 仅处理 `reason === 'update'`：

```typescript
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'update') {
    // 向所有标签页广播更新通知
  }
  // reason === 'install' 时无任何逻辑
});
```

首次安装扩展时（`reason === 'install'`），没有执行任何初始化——如设置默认配置、注入首次使用指南、请求可选权限等。用户安装后打开的第一个标签页上，popup 和宠物可能需要手动激活。

## 根因分析

- 扩展设计为"安装即可用"，不需要显式初始化
- 但缺少首次安装的引导体验（onboarding）

## 涉及文件

- `src/background/index.ts:22-40` — onInstalled 处理

## 修复方案

添加 `install` 事件处理：
```typescript
if (details.reason === 'install') {
  // 设置默认配置
  await chrome.storage.local.set({ petRole: 'cat', ... });
  // 打开欢迎页面或显示首次使用提示
}
```


## 影响范围

**影响模块**：`src/background/index.ts` 中的 `chrome.runtime.onInstalled` 监听器。
**影响用户**：扩展首次安装时缺少初始化引导——没有欢迎页面、没有权限说明、没有初始设置。
**影响范围**：所有首次安装 YiPet 的用户。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 体验 | `onInstalled` 的 `install` 事件中打开欢迎/引导页面 | 开发者 |
| 代码 | 首次安装时初始化默认配置到 `chrome.storage.local` | 开发者 |
| 体验 | 提供首次使用引导（功能介绍、快捷键提示） | 开发者 |
| 文档 | 在发布流程中检查首次安装体验 | DevOps |


## 经验教训

`chrome.runtime.onInstalled` 是扩展给用户留下第一印象的唯一机会。没有安装引导，用户可能在不知情的情况下错过重要功能。首次安装体验是产品成功的关键因素。
