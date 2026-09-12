---
title: routers/index.ts JSDoc 注释混用中文和英文
tags: [yivad, code-quality, documentation]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# routers/index.ts JSDoc 注释混用中文和英文

## 现象

`routers/index.ts` 中的路由配置注释混用中英文，且格式不统一：

```typescript
/**
 * @description 📚 Route parameter configuration reference
 * @param path ==> Route menu access path
 * @param name ==> Route name (对应页面组件名称，用于 KeepAlive 缓存标识 && 按钮权限筛选)
 * @param redirect ==> Route redirect address
 * @param component ==> View file path
 * @param meta ==> Route menu metadata
 * @param meta.icon ==> Icon for menu and breadcrumb
 * @param meta.title ==> Route title (用作 document.title || 菜单名称)
 * ...
 */
```

英文注释中使用中文说明（`用作`、`菜单名称`），而中文说明前又保留了英文描述。这种混合风格难以维护，尤其在团队国际化时容易造成理解偏差。

## 根因分析

- 路由配置最初使用英文注释，后续开发者直接在原注释中添加中文说明
- 没有统一的注释语言规范
- 中英文混用可能是因为不同开发者有不同偏好

## 涉及文件

- `src/routers/index.ts:17-55` — 混合中英文 JSDoc 注释

## 修复方案

1. 统一使用英文注释（面向所有开发者）
2. 或统一使用中文注释（如果团队全是中文使用者）
3. 移除冗余的双重说明：`用作 document.title || 菜单名称` → `used as document.title and menu name`

## 预防措施

- 确定注释语言规范（推荐英文），所有新代码遵守

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

