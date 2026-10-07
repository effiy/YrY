---
title: "Caiyun/Niutrans config 解构无默认值 + updater.mjs Linux ARM 平台 URL 错误"
tags: [bug, frontend, translate, caiyun, niutrans, build, updater]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/services/translate/{caiyun,niutrans}/index.jsx, updater/updater.mjs
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# Caiyun/Niutrans config + updater.mjs 构建问题

---

## 一、Caiyun/Niutrans — config 无默认值

两服务 `const { config } = options` → `const { config = {} } = options`。

## 二、updater.mjs — Linux ARM 平台 URL 错误

**问题** (L37-39): `linux-i686`/`linux-aarch64`/`linux-armv7` 三个平台复用 `darwin_aarch64_sig` 和 `darwin_aarch64` URL。

**影响**：CI 生成的 `update.json` 中 Linux ARM 条目指向 macOS ARM 下载链接。因无 Linux ARM 构建分发，这些条目实际为死条目，无运行时影响。

**建议**：移除不支持的平台条目或添加正确 URL。

## 三、验证

- [x] `pnpm build` 通过