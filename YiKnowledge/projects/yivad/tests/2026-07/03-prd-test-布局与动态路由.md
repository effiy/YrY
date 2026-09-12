---
doc_type: test
title: "YV-07-03: 布局与动态路由 — 三栏布局 + 菜单驱动的动态路由 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202607"
prd_task_id: "YV-07-03"
source_prds: ["03-prd-布局与动态路由"]
source_modules: []
---
# YV-07-03: 布局与动态路由 — 三栏布局 + 菜单驱动的动态路由 — 测试规格

> 来源 PRD：[03-prd-布局与动态路由.md](../../prds/2026-07/03-prd-布局与动态路由.md)
> 提取日期：2026-09-11

---

### 4.3 边缘场景处理（Edge Cases）

| 场景 | 描述 | 处理策略 | 实现细节 |
|------|------|---------|---------|
| 菜单 API 加载失败 | YiAi 不可用时菜单列表为空，侧边栏白屏 | 降级到本地 `authMenuList.json` 兜底菜单，包含基础导航项 | `catch { menus = localFallbackMenus }` |
| 动态路由 addRoute 白屏 | `addRoute` 后路由匹配器未重建，新路由匹配失败 | `addRoute` 循环后 `router.replace({ path: to.path })` 触发匹配器重编译 | `router.replace({ ...to, replace: true })` |
| 菜单项 component 未找到 | 后端 menu 的 `component` 字段指向不存在的组件路径 | `componentMap` 查找失败时回退到 `ErrorPage` 占位组件 | `component: componentMap[path] ?? ErrorPage` |
| 路由守卫死循环 | `initDynamicRouter()` 后 `next({...to, replace: true})` 重试 → `beforeEach` 再次触发 | `menuLoading` 锁：加载中返回不做任何操作，加载完成后 `next()` 放行 | `if (menuLoading) return` |
| 嵌套路由子菜单未展开 | 直接访问 `/knowledge/ai/foundations`，`el-menu` 的 `default-active` 仅匹配一级 | `useLayoutStore.openedMenus` 根据 `route.matched` 计算所有父级路径 | `default-openeds` 绑定到 `openedMenus` |
| 侧边栏折叠跨设备 | 桌面端展开侧边栏 → localStorage 持久化 → 移动端打开也展开（遮挡 80% 屏幕） | getter 响应式判断：`return window.innerWidth < 768 ? true : state._sidebarCollapsed` | `sidebarCollapsed: computed(() => isMobile ? true : persisted)` |
| 面包屑空白 | 动态路由 `/chat/:sessionKey` 的 `route.matched[last].meta.title` 未设置 | `beforeEach` 中从后端获取会话标题设置 `to.meta.title = session.title` | `if (!to.meta.title && to.params.sessionKey) { fetchSessionTitle(...) }` |
| Date 序列化 | `session.updated` 在 localStorage 中从 Date 变为 string，`dayjs().fromNow()` 返回 "Invalid date" | 自定义 `serializer.deserialize` 使用 JSON.parse + reviver 自动恢复 Date | `JSON.parse(val, (k, v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) ? new Date(v) : v)` |
| 菜单项重名 | 后端菜单与静态路由有同名 `name`，`addRoute` 报错 `Duplicate named routes` | `try/catch` 捕获，自动追加后缀 `Chat_1`, `Chat_2`，控制台 warn | `catch (e) { if (e.message.includes('Duplicate')) route.name += '_' + count++ }` |
| 路由组件懒加载超时 | `() => import()` 的文件过大，网络慢时加载超时 | 添加 loading 组件 + 错误重试：`() => import().catch(() => import('./ErrorComponent.vue'))` | `component: () => import('...').catch(e => { console.error(e); return import('@/views/error/LoadError.vue') })` |
| 动态路由注册顺序 | `addRoute` 注册的子路由必须先注册父路由 | 按菜单树的广度优先顺序注册：先访问父节点 → 注册路由 → 再访问子节点 | `flatMenuList` 确保父级在子级之前 |

---

## 五、测试规格

### Requirement: 三栏布局渲染

#### Scenario: 布局正常渲染
- **GIVEN** 用户已登录
- **WHEN** 访问任意业务页面
- **THEN** 页面渲染为三栏布局：Header + Sidebar + Main
- **AND** Header 显示面包屑和用户信息
- **AND** Sidebar 显示菜单列表

#### Scenario: 侧边栏折叠/展开
- **GIVEN** 用户点击侧边栏折叠按钮
- **WHEN** 侧边栏折叠
- **THEN** Sidebar 宽度从 240px 缩小到 64px（仅图标）
- **AND** Main 区域自动扩展
- **AND** 折叠状态持久化到 localStorage

### Requirement: 动态路由

#### Scenario: 菜单数据加载后动态注册路由
- **GIVEN** 用户首次访问业务页面
- **WHEN** 路由守卫检测到菜单未加载
- **THEN** 自动调用 `loadMenus()` 获取菜单数据
- **AND** 调用 `addRoute()` 动态注册业务路由
- **AND** 重试当前导航，页面正常渲染

#### Scenario: 数据库新增菜单后前端自动生效
- **GIVEN** 管理员在 MongoDB `menus` 集合中新增一条菜单记录
- **WHEN** 用户刷新页面
- **THEN** 新菜单出现在侧边栏中
- **AND** 新路由自动注册，点击菜单可访问对应页面

### Requirement: 权限控制

#### Scenario: 未登录用户访问受保护页面
- **GIVEN** 用户未登录
- **WHEN** 直接访问 `/chat`
- **THEN** 路由守卫拦截，重定向到 `/login`

#### Scenario: 无权限用户访问受限页面
- **GIVEN** 用户角色为 `viewer`
- **WHEN** 访问仅 `admin` 可访问的页面
- **THEN** 路由守卫拦截，重定向到 `/403`

### Requirement: 面包屑

#### Scenario: 面包屑动态生成
- **GIVEN** 用户访问 `/chat/session/abc123`
- **WHEN** 页面渲染
- **THEN** 面包屑显示：首页 > AI Chat > 会话名称

---

