---
title: CDN catalog.ts 470 行资源清单无版本校验机制
tags: [yipet, code-quality, build]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# CDN catalog.ts 470 行资源清单无版本校验机制

## 现象

`src/content/cdn/catalog.ts` 文件达到 **470 行**，定义了大量 vendor 资源的清单：

```
cdn/
├── libs/       — 第三方库 (marked, mermaid, echarts, dayjs, highlight.js...)
├── styles/     — CSS 文件
├── vendor/     — 其他 vendor 资源
└── utils/      — 工具函数
```

没有机制验证：
- catalog 中声明的文件是否在 `public/cdn/` 目录中实际存在
- `public/cdn/` 中的文件是否都在 catalog 中声明（潜在的未使用文件）
- 第三方库版本是否与 `package.json` 中的版本一致

如果构建后删除了某个 CDN 资源文件但 catalog 中仍有引用，会静默注入失败。

## 根因分析

- catalog 是手动维护的静态列表
- 没有构建时验证步骤（如 Rsbuild 插件检查文件存在性）
- 没有版本锁定机制（catalog 中的路径不使用版本号）

## 涉及文件

- `src/content/cdn/catalog.ts` — 470 行资源清单
- `src/content/cdn/injector.ts` — 资源注入逻辑
- `public/cdn/` — 实际资源文件

## 修复方案

1. 在 `npm run build` 中添加验证步骤：遍历 catalog 确认每个文件存在
2. 遍历 `public/cdn/` 确认每个文件都在 catalog 中声明
3. 对第三方库在 catalog 路径中添加版本号
4. 考虑使用 `import.meta.glob` 自动生成 catalog


## 影响范围

**影响模块**：`src/content/cdn/catalog.ts`（470 行）和 `src/content/cdn/injector.ts`。
**影响用户**：如果构建后删除了某个 CDN 资源文件但 catalog 仍有引用，会静默注入失败，宠物和聊天窗口功能不完整。
**影响范围**：所有依赖 CDN 资源的功能（第三方库、工具函数、主题样式）。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 构建 | 构建流程中添加资源完整性检查——遍历 catalog 确认每个文件存在 | DevOps |
| 构建 | 遍历 `public/cdn/` 确认每个文件都在 catalog 中声明 | DevOps |
| 代码 | 第三方库在 catalog 路径中添加版本号，便于追踪 | 开发者 |
| 架构 | 考虑使用 `import.meta.glob` 自动生成 catalog，减少手动维护 | 架构师 |


## 经验教训

手动维护的资源清单是技术债——它与实际文件系统之间存在隐式契约。当文件被添加、删除或重命名时，清单很容易过时。构建时的自动验证（或自动生成）可以消除这类人为错误。
