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
benefit: "缺陷记录：质量-commitlint缺少帮助链接"
lifecycle: active
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

- **错误消息应该是可操作的**：commitlint 拒绝不合规的 commit 时，如果只显示「不符合 Conventional Commits」，新开发者不知道什么是正确的格式。`helpUrl` 指向团队的 commit 规范文档，将阻塞性错误转化为学习机会

