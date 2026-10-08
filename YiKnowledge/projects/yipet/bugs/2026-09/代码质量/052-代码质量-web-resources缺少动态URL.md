---
title: 缺少 web_accessible_resources use_dynamic_url 配置
tags: [yipet, code-quality, security]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# 缺少 web_accessible_resources use_dynamic_url 配置

## 现象

`manifest.json:48-69` 的 `web_accessible_resources` 使用 `<all_urls>` 匹配，未启用 MV3 的 `use_dynamic_url` 选项。启用后资源仅在 `chrome.runtime.getURL()` 调用时暴露，而不是预先注册。

## 涉及文件

- `manifest.json:48-69`

## 修复方案

```json
"web_accessible_resources": [{
  "resources": [...],
  "matches": ["<all_urls>"],
  "use_dynamic_url": true
}]
```


## 影响范围

**影响模块**：`manifest.json` 中的 `web_accessible_resources` 配置。
**影响用户**：如果资源 URL 在构建时静态写入，当构建配置变更时（如资源路径改变），旧版 Content Script 无法访问新资源。
**影响范围**：所有通过 `web_accessible_resources` 暴露给页面的扩展资源。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 构建 | `web_accessible_resources` 应使用通配符模式（如 `cdn/**/*`）而非逐个列举 | DevOps |
| 构建 | 构建时验证 `web_accessible_resources` 中声明的资源是否存在 | DevOps |
| 代码 | 资源 URL 通过 `chrome.runtime.getURL()` 动态获取，不硬编码 | 开发者 |


## 经验教训

静态的 `web_accessible_resources` 配置在资源目录结构变化时很容易过时。使用通配符匹配（如 `"resources": ["cdn/**/*"]`）可以减少维护负担，同时确保新资源自动可访问。
