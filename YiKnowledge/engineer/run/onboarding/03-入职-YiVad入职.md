---
title: YiVad Onboarding — Day 1 Quick Start
tags: [onboarding, yivad, setup, quick-start]
category: engineer/run/onboarding
created: 2026-08-21
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "New YiVad engineers set up their dev environment and understand the architecture within the first day"
acceptance_criteria:
  - "Setup steps verified working"
  - "Key architectural concepts explained"
  - "Common gotchas documented"
  - "Day-1 task checklist included"
related:
  - ./README.md
  - ../../../../YiVad/CLAUDE.md
  - ../../../../YiVad/README.md
  - ../../learn/projects/yivad/README.md
---

# YiVad 入职指南 —— 第一天快速上手

> **目标**：在第一天结束时，你能够本地运行 YiVad、理解架构分层、做一个小的代码改动并验证。

## 前置条件

- Node.js 18+ 和 pnpm（推荐使用 corepack：`corepack enable && corepack prepare pnpm@latest --activate`）
- YiAi 后端需运行在 `http://localhost:10086`（参见 [YiAi 入职指南](./01-入职-YiAi入职.md)）
- Chrome 或 Edge（最新两个版本）

## 环境搭建（预计 30 分钟）

```bash
cd YiVad

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev        # 启动在 http://localhost:8848

# 类型检查（在另一个终端）
pnpm type:check # vue-tsc --noEmit --skipLibCheck
```

### 验证环境是否正常

| 验证项 | 操作 | 预期结果 |
|---|---|---|
| 应用可访问 | 打开 `http://localhost:8848` | 看到登录页或欢迎页 |
| 菜单加载 | 登录后查看左侧菜单 | 菜单项从 YiAi 后端 API 动态加载 |
| 数据展示 | 访问 Project/Issue 等页面 | ProTable 表格正常展示数据 |
| API 通信 | 打开 DevTools Network 面板 | 看到 POST 请求到 `http://localhost:10086/` |
| 类型检查 | `pnpm type:check` | 0 错误 |

### 常见启动问题排查

| 问题 | 原因 | 解决方案 |
|---|---|---|
| 页面白屏，菜单为空 | YiAi 后端未运行 | 启动 YiAi 后端：`cd ../YiAi && python main.py` |
| 菜单有但数据表格为空 | 种子数据未导入 | 首次启动 YiAi 会自动导入种子数据。重启 YiAi 等待 seeds 完成 |
| `pnpm dev` 端口 8848 被占用 | 已有 YiVad 实例运行 | 关闭旧实例或通过 `RSBUILD_ENV_PORT` 环境变量改端口 |
| `pnpm type:check` 报大量错误 | 依赖未安装或 node_modules 损坏 | 删除 `node_modules/`，重新 `pnpm install` |
| ProTable 加载失败 | RPC 参数名使用 `query` 而非 `filter` | 检查 `dataService.ts` 中的参数键名是否为 `filter` |
| 文件读取 422 错误 | 参数使用 `path` 而非 `target_file` | 检查 `fileService.ts` 中的参数字段名 |
| 构建失败 | Rsbuild 配置或插件问题 | 检查 `.env` 文件中环境变量是否有 `RSBUILD_ENV_` 前缀 |

## 架构概览

先阅读项目 [YiVad/CLAUDE.md](../../../../YiVad/CLAUDE.md)。以下是关键概念：

| 概念 | 是什么 | 在哪里 |
|---|---|---|
| ProTable | 声明式表格组件（搜索、分页、排序、列配置）——YiVad 的标准表格模式 | `src/components/ProTable/` |
| 动态路由 | 运行时从后端菜单 API 获取路由配置，按权限过滤 | `src/routers/modules/dynamicRouter.ts` |
| RequestHttp | Axios 包装器——拦截器、取消请求、RPC 信封、错误映射 | `src/api/index.ts` |
| v-auth | 按钮级权限指令——无权限时从 DOM 中移除元素 | `src/directives/modules/auth.ts` |
| Pinia Store | 状态管理（setup-function 语法） | `src/stores/modules/` |
| RPC 信封 | 所有 API 调用使用 `{module_name, method_name, parameters}` | 所有 `api/modules/*.ts` 文件 |

### 请求追踪：从点击到数据

```
用户在浏览器中点击操作
  → Vue 组件 (src/views/) 渲染页面
  → 组件挂载时调用 API 模块 (src/api/modules/) 的 http.post()
  → RequestHttp 附加 RPC 信封 + X-Token（如果启用认证）
  → POST http://localhost:10086/
  → YiAi FastAPI 根路由处理器 → 解析模块和方法 → 执行
  → MongoDB 查询 → 响应 {code: 0, data: {...}}
  → ProTable 消费 {list, total} 或 Store 更新状态
  → Vue 响应式重新渲染
```

## 关键陷阱

1. **`filter` 不是 `query`** —— 调用 `data_service.query_documents` 时，过滤参数是 `filter`。使用 `query` 会**静默返回错误结果**（没有过滤效果）。这是 YiVad 中最常见的 Bug 模式。
2. **`target_file` 不是 `path`** —— 调用 `/read-file` 或 `/write-file` 时，字段名是 `target_file`。使用 `path` 返回 HTTP 422。
3. **ProTable 是标准模式** —— 新表格页面必须使用 ProTable，不能直接使用 `el-table`。ProTable 封装了搜索、分页、排序、列配置、行选择、导出——这些是裸 `el-table` 需要手动实现的功能。
4. **Store 不能直接导入 axios** —— Store 调用 `@/api/modules/*` 导出的函数，这些函数调用 `http.post()`。**禁止**在 Store 中直接导入 axios。
5. **只用 `<script setup lang="ts">`** —— 禁止使用 Options API。使用 Composition API 配合 `defineProps<T>()` 和 `defineEmits<T>()`。

## 第一天任务清单

- [ ] 运行 `pnpm dev` 并在浏览器中打开 `http://localhost:8848`
- [ ] 阅读 `YiVad/CLAUDE.md`（约 30 分钟，认真读）——理解模块边界、约束和近期变更
- [ ] 打开 `src/api/index.ts`，追踪 `RequestHttp` 类的构造——理解请求拦截器（Token 注入、Loading）和响应拦截器（错误处理、登录过期）
- [ ] 打开 `src/components/ProTable/`，理解列配置模式（`ColumnProps[]`）和 `requestApi` 约定
- [ ] 打开 `src/routers/modules/dynamicRouter.ts`，理解动态路由注册流程——后端菜单 API → menu 转 route → `router.addRoute()`
- [ ] 打开 `src/directives/modules/auth.ts`，理解 `v-auth` 指令——从权限按钮列表匹配 → 无权限时 `remove()`
- [ ] 做一个小改动：在任意页面组件中添加 `console.log("Hello YiVad")`，验证热更新生效
- [ ] 运行 `pnpm type:check`，验证 0 新增错误
- [ ] 阅读跨项目 RPC 协议：`YiKnowledge/engineer/build/cross-project-rpc-protocol.md`
- [ ] 尝试`pnpm build:dev`，验证构建产出

## 后续学习

- [YiVad 工程文档](../../learn/projects/yivad/01-项目-架构设计.md) —— 深层架构、反模式、操作建议
- [YiVad CLAUDE.md](../../../../YiVad/CLAUDE.md) —— 模块边界、约束、近期变更的权威参考
- [跨项目 RPC 协议](../../build/cross-project-rpc-protocol.md) —— YiVad 与 YiAi 之间的完整 API 契约
- [YiVad 流水线闭环](../../learn/projects/yivad/04-项目-流水线闭环.md) —— PM 模块的需求到部署完整流程