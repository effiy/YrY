---
title: YiVad 新人引导
tags: [新人, 引导, 前端, Vue, TypeScript, YiVad]
category: projects/YiVad
created: 2026-07-31
updated: 2026-07-31
source: internal
type: onboarding
status: stable
---

# YiVad 新人引导

> Vue 3.5 后台管理框架。ProTable、动态路由、按钮级权限、aicr 代码评审、aiChat、RAG playground 都在这里。

## 1. 项目定位

YiVad 是 Yi 家族的管理后台，端口 `8848`（dev）。给运营/开发提供 YiAi 数据可视化、AI 聊天、aicr 代码评审、RAG playground、故事/需求管理等界面。技术栈：Vue 3.5 + TypeScript 6 + Rsbuild 1 + Pinia 4 + Element Plus 2.14。

## 2. 首日 setup（30 分钟跑通）

### 前置依赖

- Node.js 18+ / pnpm 8+
- YiAi 后端在 `http://localhost:10086` 跑着（前端 dev 用 proxy 代理过去）

### 步骤

```bash
# 1. 克隆（如已在 YrY 仓库内可跳过）
cd /path/to/YrY/YiVad

# 2. 装依赖
pnpm install

# 3. 确认后端在跑
curl http://localhost:10086/health/observer
# 应返回 {"code":0,...}

# 4. 起前端（自动打开 http://localhost:8848）
pnpm dev

# 5. 类型检查 + 构建（可选，验证环境）
pnpm type:check      # vue-tsc --noEmit
pnpm build:dev       # dev 环境构建
```

### 验证清单

- [ ] 浏览器自动打开 `http://localhost:8848`，看到登录页
- [ ] DevTools Console 无 error
- [ ] DevTools Network 看到 `/api` 请求被 proxy 到 `localhost:10086`
- [ ] 跳到 `/rag` 页能看到 RAG playground
- [ ] `pnpm type:check` 退出码 0

## 3. 三个高频 workflow

### Workflow A：加一个菜单页（ProTable 列表）

例：新增「待办列表」页。

1. 在 `src/views/todo/` 下建 `index.vue`：
   ```vue
   <script setup lang="ts" name="TodoList">
   import ProTable from "@/components/ProTable/index.vue";
   import { callService } from "@/api/modules/dataService";
   const columns = [
     { prop: "title", label: "标题", search: { el: "input" } },
     { prop: "done", label: "状态", render: row => row.done ? "完成" : "未完" }
   ];
   const requestApi = params => callService("services.database.data_service", "query_documents",
     { cname: "todos", filter: { ...params }, pageNum: params.pageNum, pageSize: params.pageSize });
   </script>
   <template><ProTable :columns="columns" :request-api="requestApi" /></template>
   ```
2. 在后端菜单 API 加菜单项（path / name / component 路径），或直接改 `src/assets/json/authMenuList.json` 兜底
3. 重新登录 → 菜单出现 → 点开看到列表

### Workflow B：加一个 store + service

例：新增「待办」的 CRUD service。

1. `src/api/modules/todoService.ts`：导出 `listTodos / createTodo / updateTodo / deleteTodo`，全部走 `callService("services.database.data_service", ...)`
2. `src/stores/modules/todo.ts`：Pinia setup 风格 store，调 service
3. views 调 store，**不要直接 import axios**（store 禁止 import axios）

### Workflow C：在 aicr 评审代码 + RAG 对话

1. 路由到 `/aicr`
2. 左侧 FileTree 选要评审的文件 → 右侧 CodeViewer 展示
3. ChatPanel 顶部把 `RAG` 开关打开（图标变蓝）
4. 提问 → 后端走 llama_index 检索 YiKnowledge 中该项目的 `story.md` / `scene.md` 作为上下文
5. Sources 列在助手回答下方，点击可跳到对应知识文件

## 4. 新人坑速查

| 现象 | 原因 | 解决 |
|---|---|---|
| ProTable 列表返回空 / 全部 | RPC 参数用了 `query` | 改成 `filter`（铁律） |
| `/read-file` 422 | 字段名用了 `path` | 改成 `target_file`（铁律） |
| 按钮不显示 | 用 `v-if="hasPermission"` | 改成 `v-auth="'perm:xxx'"`（铁律） |
| `vue-tsc` 报 Options API 错 | 用了 `data()` / `methods` | 改 `<script setup>` + `ref/reactive` |
| `Cannot find module 'axios'` 在 store 里 | store 直接 import axios | 改用 `@/api/modules/*` 中的函数 |
| env 变量不生效 | 用了 `VITE_` 前缀 | Rsbuild 后改用 `RSBUILD_ENV_` 前缀 |
| SSE 流中断后内容还转发到企业微信 | `onDone` 没检查 `!aborted` | 参考 `aicr/chat.ts` 修复模式 |
| `useResizable` 报 scaffold 错 | 老脚手架残留 | 看 `src/hooks/useResizable.ts` 现状 |

## 5. 接下来读什么

| 文档 | 看什么 |
|---|---|
| `YiVad/CLAUDE.md`（仓库根） | 模块边界、跨项目协议、铁律 |
| `YiKnowledge/projects/YiVad/engineering/readme.md` | 架构图、数据流、目录结构 |
| `YiVad/.claude/rules/protable-patterns.md` | ProTable 用法 |
| `YiVad/.claude/rules/api-request-layer.md` | HTTP 层规范 |
| `YiVad/.claude/rules/vue-component-patterns.md` | Vue 3 SFC 规范 |
| `YiVad/src/api/index.ts` | `RequestHttp` Axios 封装 |

## 6. Day-1 任务清单

- [ ] `pnpm install` + `pnpm dev` 跑通，浏览器自动开 `localhost:8848`
- [ ] `pnpm type:check` 退出 0
- [ ] 读完 `YiVad/CLAUDE.md` 的 Module Boundaries + Cross-project protocol 两节
- [ ] 在 `src/views/` 下加一个 `/hello` 页（路由 + 组件），提交 PR
- [ ] 用 ProTable 跑一个空表，确认 RPC `filter` 非 `query`
- [ ] 找同事做一次 30 分钟走读

## 7. 负责人 / 联系人

| 角色 | 名字 | 联系方式 |
|---|---|---|
| 项目主负责人 | TBD | TBD |
| 前端架构 | TBD | TBD |
| ProTable / 组件库 | TBD | TBD |
| aicr / aiChat | TBD | TBD |
| Code review | TBD | TBD |

> 占位字段，请项目主负责人填入后删除本行。

## 8. 常见报错速查表

| 报错信息 | 原因 | 解决 |
|---|---|---|
| `Cannot find module '@/xxx'` | 路径别名失效 | 看 `tsconfig.json` 的 `paths`；用 `@/` 别名 |
| `ElementPlus is not defined` | 没全量注册 / 没按需 | 检查 `src/main.ts` 的 Element Plus 引入 |
| `ProTable ... requestApi is required` | 没传 `:request-api` | 看 `protable-patterns.md` 规范 |
| `401 Unauthorized` | token 过期 | 拦截器会跳登录；重新登录 |
| `Network Error` 调 `/api` | 后端没起 / proxy 没配 | 起 YiAi；看 `.env.development` 的 `RSBUILD_ENV_PROXY` |
| `vue-tsc` 报 `Type X is not assignable` | props 类型不匹配 | 用 `defineProps<{...}>()` 泛型 |
| SSE 流没收到 done | onDone 没调 / abort 过早 | 看 `streamChat` 实现，检查 `AbortController` |
| `pnpm type:check` 慢 | 全量 `vue-tsc --noEmit` | 正常，~30s；增量靠 IDE |

---

有疑问先看 §4 和 §8；找不到答案再问 §7 里的对应负责人。
