---
title: 缺少 commitlint 的 helpUrl 和说明注释
tags: [yivad, code-quality, tooling]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# 缺少 commitlint 的 helpUrl 和说明注释

## 现象

commitlint 强制 Conventional Commits 但缺少 helpUrl 指向团队的 commit 规范文档。

## 涉及文件

- `YiVad/commitlint.config.js`

## 修复方案

添加 `helpUrl: 'https://example.com/docs/commits'`。

## 预防措施

工具配置应包含帮助链接指向团队规范文档。

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

