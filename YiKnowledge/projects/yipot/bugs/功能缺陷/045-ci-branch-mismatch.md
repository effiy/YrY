---
title: "CI workflow 分支配置指向 master 而非 main"
tags: [bug, ci, github-actions, build]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: acknowledged
severity: minor
priority: p3
project: yipot
module: .github/workflows/package.yml
reporter: Claude
environment: all
affected_version: 3.0.7
---

# CI workflow 分支配置不匹配

---

## 一、现象

`.github/workflows/package.yml` `on.push.branches: [master]`，但仓库主分支为 `main`。CI 工作流在 push 到 main 时不会触发。

## 二、修复

```yaml
on:
    push:
        branches: [main]  # was: [master]
```

## 三、事件系统审计

Rust emit ↔ JS listen 全部一致：`new_text` · `new_image` · `success` · `translate_auto_copy_changed` · `reload_plugin_list`