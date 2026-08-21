---
title: Bug 管理中心
tags: [bugs, management, index]
category: bugs
created: 2026-08-21
updated: 2026-08-21
source: internal
type: index
status: active
lifecycle: active
review_cycle: weekly
roles: [engineer, leader]
benefit: "统一管理项目中发现的 bugs，按日期和分类归档，每个 bug 包含问题描述、复盘分析和解决方案"
---

# Bug 管理中心

项目 bugs 的统一归档和复盘管理。按日期和分类组织，每个 bug 文件包含问题描述、根因分析和解决方案。

## 目录结构

```
bugs/
├── README.md              # 本文件
├── YYYY-MM-DD/            # 发现日期
│   ├── data/              # 数据类 bug
│   ├── style/             # 样式类 bug
│   ├── logic/             # 逻辑类 bug
│   ├── compatibility/     # 兼容性类 bug
│   ├── performance/       # 性能类 bug
│   └── security/          # 安全类 bug
```

## 分类说明

| 分类 | 英文目录 | 说明 |
|------|----------|------|
| 数据 | `data` | 数据获取、存储、转换、展示错误 |
| 样式 | `style` | UI 样式、布局、响应式问题 |
| 逻辑 | `logic` | 业务逻辑、状态管理、流程控制错误 |
| 兼容性 | `compatibility` | 浏览器兼容、API 兼容、版本兼容问题 |
| 性能 | `performance` | 加载慢、内存泄漏、渲染卡顿 |
| 安全 | `security` | 权限、注入、数据泄露 |

## Bug 文件模板

每个 bug 文件需包含 YAML frontmatter 和以下章节：

- **Description** — 问题描述
- **Steps to Reproduce** — 复现步骤
- **Expected Result** — 期望结果
- **Actual Result** — 实际结果
- **Cause** — 根因分析
- **Solution** — 解决方案
- **Review** — 复盘总结（可选）