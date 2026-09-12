---
title: connect-src CSP 硬编码为 localhost 限制生产部署
tags: [yipet, code-quality, config]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: minor
priority: p2
---

# connect-src CSP 硬编码为 localhost 限制生产部署

## 现象

`manifest.json` 中的 Content Security Policy 将 `connect-src` 硬编码为 `http://localhost:10086`：

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'none'; connect-src http://localhost:10086"
}
```

这意味着：
- 扩展无法连接到任何非 localhost 的 YiAi 后端
- 生产环境部署需要手动修改 manifest.json
- `host_permissions` 也仅包含 `http://localhost:10086/*`

## 根因分析

- YiPet 目前仅用于本地开发环境
- CSP 在生产构建时没有变量替换机制
- 没有 Rsbuild 构建时的 manifest 转换插件

## 涉及文件

- `manifest.json:12` — CSP `connect-src`
- `manifest.json:8-10` — `host_permissions`

## 修复方案

1. 添加环境变量 `YIPET_API_BASE` 控制 API 基础 URL
2. 在 Rsbuild 构建时通过自定义插件替换 manifest 中的占位符
3. 支持多个 host_permissions 以便连接 staging/production 后端
4. 为严格模式保留 `connect-src 'self'` 选项（仅通过 Service Worker 代理请求）


## 影响范围

**影响模块**：`manifest.json` Content Security Policy 配置。
**影响用户**：扩展无法在生产环境中连接到非 localhost 的 YiAi 后端，限制了部署灵活性。
**影响范围**：所有网络请求（API 调用、CDN 资源加载），仅影响扩展页面（Popup、Chat Window），不影响 Content Script。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 构建 | manifest.json 中的硬编码 URL 应在构建时由环境变量注入 | DevOps |
| 配置 | 使用 `RSBUILD_API_BASE` 环境变量控制 API 基础 URL | 开发者 |
| 架构 | 支持多环境配置（dev/staging/production），每个环境有独立的 CSP 规则 | 架构师 |
| 文档 | 在部署指南中记录各环境的 CSP 配置要求 | 开发者 |


## 经验教训

开发环境和生产环境的配置差异是常见的坑点。开发时为了方便使用 `localhost`，但生产部署时这些硬编码值会变成障碍。构建时应使用环境变量替换机制，确保同一份代码可以部署到不同环境。
