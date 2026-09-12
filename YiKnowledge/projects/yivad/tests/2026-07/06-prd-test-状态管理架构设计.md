---
doc_type: test
title: "YV-07-06: 状态管理架构设计 — 16 个 Pinia Store + 双语法模式 + 持久化策略 + 跨 Store 协调 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202607"
prd_task_id: "YV-07-06"
source_prds: ["06-prd-状态管理架构设计"]
source_modules: []
---
# YV-07-06: 状态管理架构设计 — 16 个 Pinia Store + 双语法模式 + 持久化策略 + 跨 Store 协调 — 测试规格

> 来源 PRD：[06-prd-状态管理架构设计.md](../../prds/2026-07/06-prd-状态管理架构设计.md)
> 提取日期：2026-09-11

---

### 4.5 边缘场景处理（Edge Cases）

| 场景 | 描述 | 处理策略 | 实现细节 |
|------|------|---------|---------|
| SSE ReadableStream 泄漏 | `useChatStore` 的 reader 被 `watch` 闭包持有，组件卸载后 GC 无法回收 | 新增 `cleanup()` 方法：`reader.cancel()` + `reader.releaseLock()` + `abortController.abort()`，在 `onBeforeUnmount` 和会话切换时调用 | `cleanup() { reader?.cancel(); reader?.releaseLock(); abortController?.abort() }` |
| localStorage 配额超限 | 5 个 Store 同时持久化时，`aiChat` Store（~2MB）先恢复，耗尽配额导致后续 Store 恢复失败 | 大体积 Store (`aiChat`) 的消息体迁移到 IndexedDB，仅元数据保留在 localStorage | `persist.storage = customIndexedDBStorage` |
| Options API → Setup 迁移 key 冲突 | 迁移后 `persist.key` 从 `$id`（如 `"auth"`）变为函数名（如 `"useAuthStore"`），旧数据无法读取 | 迁移时显式设置 `persist.key` 为旧值，`afterRestore` 中检测旧 key 数据并自动迁移 | `persist: { key: 'auth', afterRestore: (ctx) => { migrateOldKey(ctx) } }` |
| 侧边栏折叠跨设备同步 | 桌面端折叠侧边栏 → `localStorage` 同步 → 移动端打开时侧边栏默认折叠（错误行为） | getter 中添加响应式判断：`return window.innerWidth < 768 ? true : state._sidebarCollapsed` | `sidebarCollapsed: computed(() => isMobile.value ? true : _sidebarCollapsed.value)` |
| ProTable 筛选跨集合残留 | `filter` 是全局状态，从 Issue 页面切换 Bug 页面时 Issue 的 `status=open` 仍生效 | `watch(collection)` 中 `resetFilters()` + `resetSort()`，为每个集合维护独立的 `filter` 状态 | `filters: Record<string, FilterState> = ref({})` |
| v-auth 权限加载 "闪烁" | 路由守卫在权限加载前放行，v-auth 在 `mounted` 时权限列表为空，移除所有按钮 | `beforeEach` 中 `await authStore.init()` 确保权限加载完成后才放行 | `await authStore.init()` before `next()` |
| Date 序列化 | `JSON.stringify` 将 `Date` 转为字符串，恢复后 `dayjs(string).fromNow()` 返回 "Invalid date" | 自定义 serializer：`JSON.parse` + reviver 检测 ISO 8601 格式自动转 `new Date(value)` | `deserialize: (val) => JSON.parse(val, dateReviver)` |
| 跨 Store 级联更新 | Store A 的 `watch` 触发 Store B 更新 → Store B 的 `watch` 触发 Store C 更新 | 单操作触发 > 5 次 watch 时控制台 warn，帮助诊断级联链 | `watchEffect(() => { count++; if (count > 5) console.warn('cascade detection') })` |
| 持久化写入阻塞 UI | 大对象序列化（`JSON.stringify` 3MB+）在主线程阻塞 50ms+ | `aiChat` Store 消息体使用 IndexedDB 异步写入，不阻塞主线程 | `idbKeyval.set('chat-messages', messages)` |
| Store 初始化竞态 | 页面加载时多个 Store 同时从 localStorage 恢复，`pinia-plugin-persistedstate` 串行恢复 | 使用 `Promise.all` 并行恢复独立 Store，减少初始化耗时 | 自定义 `hydrateStore` 插件并行恢复 |

---


## 六、测试规格

### Requirement: Store 持久化

#### Scenario: 用户偏好持久化
- **Given** 用户切换主题为暗色模式
- **When** 刷新页面
- **Then** 主题保持暗色模式（从 localStorage 恢复）

#### Scenario: Token 持久化
- **Given** 用户登录成功
- **When** 刷新页面
- **Then** 用户保持登录状态（Token 从 localStorage 恢复）

#### Scenario: 业务数据不持久化
- **Given** 用户浏览项目列表
- **When** 刷新页面
- **Then** 项目列表从 YiAi 后端重新加载（不从 localStorage 恢复）

### Requirement: 跨 Store 协调

#### Scenario: 标签页关闭触发 KeepAlive 清理
- **Given** 用户打开了 3 个标签页
- **When** 关闭第 2 个标签页
- **Then** `keepAlive` Store 中移除对应组件名

#### Scenario: 路由切换更新权限上下文
- **Given** 用户在项目列表页
- **When** 导航到需求列表页
- **Then** `auth.routeName` 更新为新路由名，按钮权限列表更新

---

