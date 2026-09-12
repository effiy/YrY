---
title: CDN catalog 中部分第三方库版本过旧
tags: [yipet, code-quality, dependencies]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: minor
priority: p2
---

# CDN catalog 中部分第三方库版本过旧

## 现象

`src/content/cdn/catalog.ts` 中引用的部分 vendor 库版本严重过时：

| 库 | 使用版本 | 最新版本 | 发布时间 |
|------|---------|---------|------|
| swiper | 7.0.3 | 11.x | 2021 |
| bootstrap | 5.2.3 | 5.3.x | 2022 |
| anime.js | 3.0.0 | 3.2.x | 2019 |
| wow.js | 1.1.3 | — | 2016 (unmaintained) |
| animate.css | 3.5.1 | 4.x | 2017 |
| magnific-popup | 1.1.0 | — | 2016 (unmaintained) |

过时的库版本可能包含已知漏洞（尤其是 DOM 操作库如 jQuery 3.7.1、Bootstrap 5.2.3），且在 Chrome 新版本中可能存在兼容性问题。

## 根因分析

- 这些库来自 YiPett（前身项目）的 CDN 依赖，未随项目迁移而更新
- 部分库（wow.js、magnific-popup）已停止维护，但 catalog 中仍保留
- 没有定期依赖审计流程

## 涉及文件

- `src/content/cdn/catalog.ts` — vendor 库版本声明
- `public/cdn/vendor/` — 实际文件

## 修复方案

1. 升级可更新的库（swiper → 11.x、bootstrap → 5.3.x、anime → 3.2.x、animate.css → 4.x）
2. 评估 wow.js 和 magnific-popup 是否仍被使用——未使用则移除
3. 添加 `npm run audit:cdn` 脚本检查 vendor 库版本
4. 对不再维护的库寻找替代品或移除


## 影响范围

**影响模块**：`src/content/cdn/catalog.ts` 和 `public/cdn/vendor/` 中的第三方库文件。
**影响用户**：使用过旧版本的库可能包含已知安全漏洞或 bug，影响聊天窗口（Mermaid、marked）和宠物覆盖层（动画库）的功能和安全性。
**影响范围**：所有依赖 CDN 第三方库的功能（Markdown 渲染、Mermaid 图表、ECharts 可视化）。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 流程 | 定期（每月）检查 CDN 中第三方库的版本更新和安全公告 | DevOps |
| 代码 | 在 catalog 中记录每个库的版本号和升级日期 | 开发者 |
| 工具 | CI 中自动检查 CDN 库版本是否为最新稳定版 | DevOps |
| 安全 | 优先使用官方 CDN（如 cdnjs、unpkg）而非自托管过时版本 | 安全团队 |


## 经验教训

自托管的第三方库需要主动维护——它们不会自动获得安全补丁。在 catalog 中记录版本号是第一步，但关键是建立定期升级机制。过时的依赖是安全漏洞的温床。
