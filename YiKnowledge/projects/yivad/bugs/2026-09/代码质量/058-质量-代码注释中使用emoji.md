---
title: 路由配置中部分 meta 字段使用了 emoji 图标而非 Icon 组件
tags: [yivad, code-quality, consistency]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-代码注释中使用emoji"
lifecycle: active
---

# 路由配置中部分 meta 字段使用了 emoji 图标而非 Icon 组件

## 现象

`staticRouter.ts` 中所有路由的 `meta.icon` 使用字符串图标名（如 `"Guide"`、`"Cpu"`），这些名称来自 `@element-plus/icons-vue`：

```typescript
{ meta: { title: "Pipeline", icon: "Guide", isKeepAlive: true } }
```

但部分视图中的注释仍包含 emoji 作为"视觉图标"（如 `📚` Route parameter configuration），在渲染环境中不可见但影响代码可读性。

## 涉及文件

- `src/routers/index.ts:17` — emoji 注释
- `src/routers/modules/staticRouter.ts` — icon 字符串

## 修复方案

移除注释中的 emoji，使用纯英文或中文描述。

## 预防措施

- 代码注释不使用 emoji 作为文档装饰

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **Emoji 作为文档装饰的问题**：`📚 Route parameter configuration` 中的 emoji 在不同平台渲染差异大（macOS 彩色、Linux 黑白、某些终端乱码），且在 `grep` 和 `git diff` 中不可检索。代码注释应依赖文字而非图标传达信息

