---
title: viewsGlobPlugin 自定义构建插件缺少文档和错误处理
tags: [yivad, code-quality, build-infra]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# viewsGlobPlugin 自定义构建插件缺少文档和错误处理

## 现象

YiVad 使用自定义 Rsbuild 插件 `viewsGlobPlugin` 代替 Vite 的 `import.meta.glob` 来实现视图文件的自动发现：

```typescript
// dynamicRouter.ts — 通过构建插件注入的全局模块
import viewsGlob from "@yivad/views-glob";

// 运行时查找
const resolved = modules["/src/views" + item.component + ".vue"];
if (!resolved) return; // 跳过找不到的文件
```

但该插件存在以下问题：
- 插件的源码（`build/views-glob-plugin.ts`）功能未被文档化
- 如果插件在构建时失败（如找不到 views 目录），运行时静默跳过——无构建警告
- 测试中使用 mock（`tests/mocks/viewsGlob.ts`），mock 可能与实际行为不同步
- 插件无回退或验证机制——如果构建时生成空的 viewsGlob，所有动态路由静默失败

## 根因分析

- 插件是 Vite → Rsbuild 迁移时的临时实现
- 缺少构建时验证（插件应在找不到文件时发出警告）
- Mock 在测试中覆盖了真实行为，无法检测插件问题

## 涉及文件

- `build/views-glob-plugin.ts` — 插件源码
- `src/routers/modules/dynamicRouter.ts:9-11` — 运行时使用
- `tests/mocks/viewsGlob.ts` — 测试 mock

## 修复方案

1. 为插件添加文档（README 或代码注释说明生成规则）
2. 构建时验证：插件应 emit warning 当发现空的 views glob
3. 运行时：当 `resolved` 未命中时记录 console.warn
4. 测试 mock 与插件输出格式保持同步（添加 snapshot 测试）

## 预防措施

- 所有自定义 Rsbuild 插件必须有错误处理和文档

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

