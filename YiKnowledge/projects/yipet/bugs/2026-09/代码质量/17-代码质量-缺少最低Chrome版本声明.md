---
title: manifest.json 缺少 minimum_chrome_version 声明
tags: [yipet, code-quality, compatibility]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# manifest.json 缺少 minimum_chrome_version 声明

## 现象

`manifest.json` 未声明 `minimum_chrome_version` 字段：

```json
{
  "manifest_version": 3,
  "name": "__MSG_extName__",
  "version": "1.2.0",
  ...
}
```

YiPet 使用了以下 Chrome MV3 特性，这些特性有最低版本要求：
- `chrome.scripting.executeScript` — Chrome 88+
- `chrome.commands` — Chrome 25+
- `chrome.storage.local` + `storage.managed` — Chrome 88+
- Service Worker (`background.service_worker`) — Chrome 92+
- `manifest_version: 3` — Chrome 88+

如果用户在 Chrome 87 或更早版本安装此扩展，上述 API 静默出错，扩展行为不可预测。

## 根因分析

- 开发者仅在最新版 Chrome 上进行开发测试
- 未评估 API 的浏览器兼容性矩阵
- `minimum_chrome_version` 是可选字段但推荐声明

## 涉及文件

- `manifest.json` — 缺少 `minimum_chrome_version`

## 修复方案

```json
"minimum_chrome_version": "92"
```

92 是 Service Worker 作为 `background.service_worker` 稳定支持的最低版本。所有 YiPet 使用的其他 API 在 92 中均已支持。


## 影响范围

**影响模块**：`manifest.json` 扩展清单。
**影响用户**：在旧版 Chrome（< 88）上安装时，扩展行为不可预测——API 可能静默失败或返回 undefined。
**影响范围**：少量使用旧版 Chrome 的用户，以及企业环境中受控更新的 Chrome 版本。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 配置 | 使用新 Chrome API 前检查兼容性矩阵 | 开发者 |
| 配置 | 在 `manifest.json` 中声明 `minimum_chrome_version` | 开发者 |
| 流程 | 新增 API 使用时评估最低 Chrome 版本要求 | Reviewer |


## 经验教训

`minimum_chrome_version` 是可选的但强烈推荐的字段。它让 Chrome Web Store 在用户安装前检查兼容性，避免用户安装一个无法正常工作的扩展。声明最小版本是对用户的基本尊重。
