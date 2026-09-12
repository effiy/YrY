---
title: WOW.js 和 Magnific Popup 已停止维护但仍在 CDN catalog 中
tags: [yipet, code-quality, dependencies]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# WOW.js 和 Magnific Popup 已停止维护但仍在 CDN catalog 中

## 现象

`wow.js@1.1.3`（2016 年停止维护）和 `magnific-popup@1.1.0`（2016 年停止维护）仍在 CDN catalog 中。

## 涉及文件

- `src/content/cdn/catalog.ts`

## 修复方案

评估是否仍在使用这些库，如果使用则替换为维护中的替代品。


## 影响范围

**影响模块**：`src/content/cdn/catalog.ts` 和 `public/cdn/vendor/`。
**影响用户**：使用已停止维护的库意味着安全漏洞不会被修复，兼容性问题不会被解决。
**影响范围**：所有使用 CDN 第三方库的功能。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 流程 | 定期审查 CDN 中每个库的维护状态（是否有最近提交、是否已归档） | DevOps |
| 流程 | 已停止维护的库优先替换为活跃维护的替代品 | 开发者 |
| 安全 | 对未维护的库进行安全评估，记录已知漏洞 | 安全团队 |
| 代码 | 在 catalog 中标记每个库的维护状态（active/deprecated/archived） | 开发者 |


## 经验教训

开源库的维护状态是选择依赖的关键考量因素。一个功能完美但已停止维护的库，在一个月后可能仍然是好的，但在一年后几乎肯定会有未修复的安全漏洞。定期审查依赖的维护状态是技术债务管理的一部分。
