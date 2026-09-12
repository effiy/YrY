---
title: "authMenuList.json 缺少 assembly 路由导致 batchImport 404"
tags: [yivad, bug, routing, menu-data, fallback]
category: projects/yivad/bugs/数据
created: 2026-09-10
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: src/assets/json/authMenuList.json
---

# authMenuList.json 缺少 assembly 路由导致 batchImport 404

## Description

访问 `http://localhost:8848/#/assembly/batchImport` 返回 404。路由对应的组件 `src/views/assembly/batchImport/index.vue` 存在，views-glob 缓存也包含该组件，但页面 404。

## Steps to Reproduce

1. 启动 YiVad 开发服务器（`pnpm dev`）
2. 访问 `/#/assembly/batchImport`
3. 页面显示 404

## Expected Result

正常显示「批量添加数据」页面

## Actual Result

显示 404 页面

## Cause

`src/assets/json/authMenuList.json` 是菜单 API 不可用时的降级数据源。该文件仅包含 `tech-leadership` 路由，缺少 `assembly` 及其子路由（包括 `batchImport`）。

动态路由注册流程：`getAuthMenuListApi()` → 后端 `/auth/menu/list` 失败 → 降级为 `authMenuList.json` → `authStore.flatMenuListGet` → `initDynamicRouter()` 遍历注册。因为降级数据中无 `assembly/batchImport`，路由未注册 → 404。

## Solution

在 `authMenuList.json` 中补充完整的 `assembly` 路由节点（guide、tabs、selectIcon、selectFilter、treeFilter、svgIcon、uploadFile、batchImport、wangEditor、draggable），确保降级场景下 assembly 模块可用。

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

