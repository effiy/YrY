---
title: 多个 Pinia Store 持久化未在注销时清理
tags: [yivad, code-quality, security]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: minor
priority: p2
resolution: |
  - persist.ts: _PERSISTED_KEYS 新增 6 个 localStorage key (export-templates, export-history,
    notification-preferences, table-states, tags, aiChat.activeKey)
  - Avatar.vue logout(): 调用 clearPersistedState() 清理所有持久化数据
  - dynamicRouter.ts 已有 clearPersistedState() 调用，但注销流程缺失，现已补齐
benefit: "缺陷记录：质量-持久化store退出登录未清除"
lifecycle: active
---

# 多个 Pinia Store 持久化未在注销时清理

## 现象

16 个 Pinia Store 中使用 `piniaPersistConfig` 持久化了会话数据到 localStorage。用户注销时，`dynamicRouter.ts` 仅清除 token 和重定向到登录页：

```typescript
// routers/modules/dynamicRouter.ts:57-59
userStore.setToken("");
router.replace(LOGIN_URL);
```

但以下持久化 Store 的数据在注销后仍然保留在 localStorage：
- `aiChat` — AI 对话历史和草稿
- `knowledge` — 知识库搜索结果
- `knowledgeTree` — 展开状态
- `rag` — RAG 查询状态
- `bug` — 缺陷过滤器状态
- `story` — 故事板状态
- `issue` — Issue 筛选条件
- `tabs` — 标签页状态
- `global` — 主题、布局偏好

## 根因分析

- `pinia-plugin-persistedstate` 将状态持久化到 localStorage
- 注销逻辑只清除 token，不清理其他持久化数据
- 新用户登录后可能看到上一个用户的筛选状态、展开节点等

## 涉及文件

- `src/stores/modules/` — 16 个持久化 Store
- `src/routers/modules/dynamicRouter.ts` — 注销逻辑
- `src/stores/helper/persist.ts` — 持久化配置

## 修复方案

1. 实现 `clearAllStores()` 函数，注销时调用 `localStorage.clear()` 或选择性清理
2. 在 `piniaPersistConfig` 中设置 `afterRestore` 钩子验证 token 有效性
3. 区分"用户数据"（需清理）和"偏好设置"（可保留），选择性清理
4. 使用 sessionStorage 替代 localStorage 存储敏感会话数据

## 预防措施

- 注销流程必须有 store 清理步骤
- 每个持久化 Store 明确数据生命周期

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **注销不是只清除 token**：用户注销意味着会话结束，所有该会话关联的本地数据（筛选状态、搜索历史、展开节点）都应清理。只清除 token 是「认证层面注销」，不是「数据层面注销」
- **localStorage 的数据归属问题**：`pinia-plugin-persistedstate` 持久化的数据没有用户隔离——如果两个用户在同一浏览器先后登录，后登录者会看到前者的持久化状态。sessionStorage 或多 profile key 是更好的选择
- **区分用户数据 vs 偏好设置**：主题、语言等偏好可以跨会话保留，但 AI 对话历史、搜索结果、筛选状态属于用户会话数据，必须在注销时清除

