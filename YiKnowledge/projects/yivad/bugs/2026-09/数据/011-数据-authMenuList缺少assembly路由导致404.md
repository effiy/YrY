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
benefit: "缺陷记录：数据-authMenuList缺少assembly路由导致404"
lifecycle: active
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
| 代码 | 新增路由模块后，同步更新 `authMenuList.json` 降级数据源，保持与后端菜单 API 返回结构一致 |
| 流程 | 路由变更的 PR 模板中增加检查项：「降级 JSON 是否已同步更新」 |
| 测试 | CI 中增加路由完整性校验：对比 `src/views/` 目录与 `authMenuList.json` 的路由覆盖差异 |

## 经验教训

- **降级数据源是隐式依赖**：`authMenuList.json` 在后端正常时不会被读取，仅在 API 不可用时生效。这种「平时不可见、故障时才暴露」的隐式依赖最容易在新增功能时遗漏同步
- **双写问题**：菜单数据存在两份（后端 MongoDB + 前端 JSON），任何菜单变更都是双写操作。如果双写不能自动化，至少需要 CI 检测不一致并阻断合并

