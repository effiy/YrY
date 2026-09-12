---
title: 缺少 browserslist 配置
tags: [yivad, code-quality, build]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# 缺少 browserslist 配置

## 现象

Rsbuild 依赖 `browserslist` 来确定 JS/CSS 的 polyfill 和降级目标，但项目中无 `.browserslistrc` 或 `package.json` 中的 `browserslist` 字段。

## 涉及文件

- 缺少 `.browserslistrc`

## 修复方案

```json
{ "browserslist": ["> 1%", "last 2 versions", "not dead"] }
```

## 预防措施

前端构建项目应显式声明目标浏览器范围。

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

