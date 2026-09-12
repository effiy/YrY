---
title: YiVad 未使用 Rsbuild 的 preconnect/dns-prefetch 优化
tags: [yivad, code-quality, performance]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# YiVad 未使用 Rsbuild 的 preconnect/dns-prefetch 优化

## 现象

`rsbuild.config.ts` 的 `html` 配置中未启用 `preconnect` 或 `dns-prefetch` 资源提示：

```typescript
html: {
  templateParameters: { ... },
  // 未配置 preconnect/dns-prefetch
}
```

这些 `<link rel="preconnect">` 标签可以在页面加载早期建立与 YiAi 后端 (:10086)、字体 CDN、图标 CDN 的连接，减少首次 API 调用的延迟。

## 根因分析

- 资源提示是 Web 性能优化的进阶技术，本地开发环境不明显
- Rsbuild 提供了 `performance.preconnect` 和 `performance.dnsPrefetch` 配置

## 涉及文件

- `rsbuild.config.ts` — 缺少 performance 优化配置

## 修复方案

```typescript
performance: {
  preconnect: ['http://localhost:10086'],
  dnsPrefetch: ['http://localhost:10086'],
}
```

## 预防措施

- Rsbuild performance 配置应在项目初始化时审查

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

