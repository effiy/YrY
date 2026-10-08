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
benefit: "缺陷记录：质量-缺少browserslist"
lifecycle: active
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

- **browserslist 影响构建产物但不影响本地开发**：缺少 browserslist 时 Rsbuild 使用默认值，polyfill 和 CSS 前缀可能与实际用户浏览器不匹配。这种差异在本地开发中不可见，只在生产环境中暴露

