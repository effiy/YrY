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
benefit: "缺陷记录：质量-JSDoc注释中英文混用"
lifecycle: active
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

- **混合注释是渐进式熵增**：最初是全英文注释，后续开发者在原注释上追加中文说明而非替换。结果是每个 `@param` 同时有两种语言——阅读成本翻倍而信息冗余。应选择一种语言并保持一致
- **`@description` 中的 emoji 也是风格问题**：`📚 Route parameter configuration reference` 中的 emoji 在非 Mac 平台上渲染效果差异大，且在代码审查 diff 中不可检索

