---
title: "侧边栏菜单显示顺序未按 menuMange 中配置的 order 字段排序"
key: menu-order-not-sorted-by-order-field-20260912
tags:
- menu
- sort
- sidebar
- order
category: projects/yivad/bugs/router
created: "2026-09-12"
updated: 2026-09-12
source: internal
type: bug
status: resolved
severity: minor
priority: p1
project: YiVad
module: src/utils/index.ts, src/stores/modules/auth.ts, src/typings/global.d.ts
reporter: user
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-12)
frequency: always
source_prd: "YV-08-06"
---

## Description

侧边栏菜单和菜单管理页面（`/system/menuMange`）中的菜单显示顺序没有按照菜单管理中配置的 `order` 字段升序排列，而是按照 `meta.title` 字母顺序排序。用户在菜单管理页面设置的 order 值（0、1、2、8...）没有生效。

## Steps to Reproduce

1. 登录系统，访问 `http://localhost:8848/#/system/menuMange`
2. 观察菜单的 order 列值：Home(order=0)、System(order=8) 等
3. 查看左侧侧边栏菜单的实际显示顺序
4. 发现菜单没有按 order 值（0 < 8）排列，而是按标题字母顺序排列

## Expected Behavior

菜单的显示顺序应严格遵循 `order` 字段的升序排列：
- order 较小的菜单项排在前面
- 同一父级下的子菜单同样按 order 升序排列
- 当 order 相等或未定义时，退回到按标题字母顺序排列作为兜底

## Actual Behavior

所有菜单（包括顶级菜单和子菜单）都按 `meta.title` 的字母顺序排序，完全忽略了 `order` 字段的配置值。

## Root Cause

后端 `_build_menu_tree`（[auth.py](file:///Users/yi/YrY/YiAi/src/server/routes/auth.py#L133-L140)）已正确按 `order` 字段排序后返回数据，但前端 `sortMenuTree` 工具函数（[index.ts](file:///Users/yi/YrY/YiVad/src/utils/index.ts#L126-L137)）忽略了 `order` 字段，重新按 `meta.title` 做了字母排序，导致后端正确的排序结果被覆盖。

该排序函数在两处被调用：
1. `auth.ts` store 中 [showMenuListGet](file:///Users/yi/YrY/YiVad/src/stores/modules/auth.ts#L14) — 控制侧边栏菜单显示
2. `menuMange/index.vue` 中 [menuData](file:///Users/yi/YrY/YiVad/src/views/system/menuMange/index.vue#L199) — 控制菜单管理页面树状表格显示

此外 `Menu.MenuOptions` 类型缺少 `order` 字段定义（虽然运行时数据中存在该字段）。

## Fix

### 1. 修改 `sortMenuTree` 排序逻辑

在 [index.ts](file:///Users/yi/YrY/YiVad/src/utils/index.ts#L126-L137) 中将排序策略从"仅按标题字母排序"修改为"先按 order 数值升序，order 相同/缺失时再按标题字母兜底"：

```ts
export function sortMenuTree(nodes: any[]): any[] {
  if (!nodes?.length) return [];
  return [...nodes]
    .map(node => (node.children?.length ? { ...node, children: sortMenuTree(node.children) } : node))
    .sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return (a.meta?.title ?? "").localeCompare(b.meta?.title ?? "", "zh-CN-u-kf-lower");
    });
}
```

### 2. 补齐类型定义

在 [global.d.ts](file:///Users/yi/YrY/YiVad/src/typings/global.d.ts#L3-L11) 的 `Menu.MenuOptions` 接口中添加 `order?: number` 可选字段，与 `MenuDocument` 接口保持一致，避免 TS 类型警告。

## Verification

- `vue-tsc --noEmit --skipLibCheck` 类型检查通过（无错误）
- 侧边栏菜单顺序与 `/system/menuMange` 中 order 列配置一致（Home=0 在前，System=8 在后等）
- 菜单管理页面树状表格中同级菜单按 order 升序展示
- 同一父级下子菜单（如 System 下的 MenuMange=0、AccountManage=1、RoleManage=2）顺序正确

## 影响范围

- **影响组件/页面**：所有侧边栏菜单布局（LayoutVertical、LayoutClassic、LayoutColumns、LayoutTransverse）、Header 搜索菜单、菜单管理页面树状表格
- **影响用户**：所有登录用户（菜单显示顺序立即生效）
- **是否影响 API 契约**：否（未改动 API 接口，仅修正前端排序逻辑）
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 工具函数的 JSDoc 注释必须明确说明排序/过滤的字段与优先级，避免"注释描述按字母，实际业务需求按 order"的错位 |
| 代码审查 | 对涉及 sort/order 的变更，重点核对排序字段是否与数据模型和业务配置页面（menuMange）中使用的字段一致 |
| 测试 | 增加单测覆盖 sortMenuTree：构造 order 不同、order 相同、无 order 三类数据各一组，断言排序结果 |
| 类型 | 全局类型定义与 API 接口类型需保持双向同步（MenuDocument ↔ Menu.MenuOptions），减少运行时字段与类型不一致 |

## 经验教训

- **前后端排序语义一致性**：当后端已经按业务字段做过排序时，前端再次调用 sort 必须明确保留原字段的优先级，不能无差别地覆盖为"字母序"
- **兜底策略**：`order` 可能为 undefined（旧数据、fallback 扫描路径），排序函数需要安全处理——使用 `Number.MAX_SAFE_INTEGER` 将无 order 的项排到末尾，而不是让 `undefined - number = NaN` 导致排序错乱
- **命名信号**：菜单管理页面明确用 `order` 命名字段/列，工具函数排序时应先搜索数据中是否存在 `order/sort/rank` 等语义化字段，而不是直接按标题排序
