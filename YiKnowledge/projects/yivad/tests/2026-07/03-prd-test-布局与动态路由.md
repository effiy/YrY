---
doc_type: test
title: "YV-07-03: 布局与动态路由 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
project_id: yivad
prd_month: "202607"
prd_task_id: "YV-07-03"
source_prds: ["03-prd-布局与动态路由"]
source_modules: ["03-prd-task-布局与动态路由"]
---

# YV-07-03: 布局与动态路由 — 测试用例

> 来源 PRD：[03-prd-布局与动态路由.md](../../prds/2026-07/03-prd-布局与动态路由.md)
> 开发方案：[03-prd-task-布局与动态路由.md](../../devs/2026-07/03-prd-task-布局与动态路由.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 覆盖目标 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | Vitest + jsdom | 菜单工具函数（flatMenuList/showMenuList/sortMenuTree） | 每次提交 |
| L2 集成 | Vitest + Pinia + 内存路由 | 动态路由注册、路由守卫 | 每次提交 |
| L3 组件 | Vitest + @vue/test-utils | MainLayout/Sidebar/Breadcrumb 渲染 | 每次提交 |
| L4 端到端 | Playwright | 完整导航链路 | 发布前 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | 菜单工具函数（扁平化/过滤/排序/面包屑） | L1 |
| COV-2 | 动态路由注册（initDynamicRouter） | L2 |
| COV-3 | 路由守卫（beforeEach 编排） | L2 |
| COV-4 | MainLayout 三栏渲染 | L3 |
| COV-5 | Sidebar 菜单渲染 | L3 |

### 1.3 不覆盖范围

| 不覆盖 | 原因 |
|--------|------|
| 后端菜单 API 正确性 | 属 YiAi 测试范围 |
| CSS Grid 像素级布局 | 视觉回归，非逻辑测试 |
| 响应式断点视觉 | 属 E2E 视觉测试 |

---

## 二、测试用例

### 2.1 菜单工具函数（COV-1 · L1）

> 自动化落点：`tests/utils/index.test.ts`

| 编号 | 用例 | 预期结果 | 优先级 |
|------|------|---------|--------|
| TC-UTIL-001 | 扁平化父先于子 | 输出顺序中父节点索引 < 子节点索引 | P0 |
| TC-UTIL-002 | 扁平化含全部节点 | 输出长度 = 树中节点总数 | P0 |
| TC-UTIL-003 | 扁平化不污染原树 | 入参菜单树结构不变（深拷贝） | P1 |
| TC-UTIL-004 | 隐藏项被过滤 | `getShowMenuList` 结果不含 `meta.isHide: true` 项 | P0 |
| TC-UTIL-005 | 排序按标题 | 兄弟节点按 `meta.title` 升序 | P0 |
| TC-UTIL-006 | 面包屑按路径索引 | 结果为 `{ path: [祖先链] }` | P0 |
| TC-UTIL-007 | 空输入不报错 | 四个函数传 `[]` 均返回空数组/空对象 | P1 |

### 2.2 动态路由注册（COV-2 · L2）

> 自动化落点：`tests/routers/dynamicRouter.test.ts`

| 编号 | 用例 | 预期结果 | 优先级 |
|------|------|---------|--------|
| TC-ROUTE-001 | 常规菜单注册 | `router.hasRoute(name)` 为 true，挂于 layout 下 | P0 |
| TC-ROUTE-002 | 全屏菜单注册于顶层 | `meta.isFull: true` → 顶层路由，非 layout 子路由 | P0 |
| TC-ROUTE-003 | 组件缺失被跳过 | 缺失项未注册，其余菜单正常（不中断） | P0 |
| TC-ROUTE-004 | 纯重定向不注册组件 | 有 `redirect` 无 `component` → 不注册 | P1 |
| TC-ROUTE-005 | 子节点 children 已清理 | 注册路由无 `children` 残留 | P0 |
| TC-ROUTE-006 | 菜单为空 → 清态跳登录 | token 清空 + `clearPersistedState` + `router.replace(LOGIN_URL)` | P0 |
| TC-ROUTE-007 | 接口异常 → 清态跳登录 | 同上三项动作发生 | P0 |

### 2.3 路由守卫（COV-3 · L2）

> 自动化落点：`tests/routers/guard.test.ts`

| 编号 | 用例 | 预期结果 | 优先级 |
|------|------|---------|--------|
| TC-GUARD-001 | 未登录 → 登录页 | 无 token，受保护路由 → `/login` | P0 |
| TC-GUARD-002 | 白名单放行 | 无 token，`/500` → 放行 | P0 |
| TC-GUARD-003 | 已登录访问登录页→退回 | 有 token，`/login` → 退回来源页 | P0 |
| TC-GUARD-004 | 菜单未加载→初始化 | `initDynamicRouter` 调用，二次导航命中 | P0 |
| TC-GUARD-005 | 仅初始化一次 | 连续导航两次，`initDynamicRouter` 调用一次 | P0 |
| TC-GUARD-006 | 未下发路由不可达 | 手工输入未下发路径 → 404 | P0 |
| TC-GUARD-007 | 初始化失败不白屏 | `initDynamicRouter` reject → 落登录页 | P0 |

### 2.4 布局组件（COV-4/COV-5 · L3）

> 自动化落点：`tests/components/MainLayout.test.ts`

| 编号 | 用例 | 预期结果 | 优先级 |
|------|------|---------|--------|
| TC-LAYOUT-001 | 三栏渲染 | Sidebar + Header + Main 三个区域存在 | P0 |
| TC-LAYOUT-002 | 侧边栏折叠 | 折叠后宽度 64px，展开后 240px | P0 |
| TC-LAYOUT-003 | 折叠持久化 | 刷新后折叠状态保持 | P1 |
| TC-LAYOUT-004 | 菜单递归渲染 | 多级菜单正确嵌套 | P0 |
| TC-LAYOUT-005 | 当前菜单高亮 | 当前路由对应菜单项 `is-active` | P1 |
| TC-LAYOUT-006 | 面包屑动态生成 | 路径 `/project/list` → 首页 > 项目管理 | P1 |

---

## 三、边缘场景

| 编号 | 场景 | 处理策略 | 优先级 |
|------|------|---------|--------|
| TC-EDGE-001 | 菜单 API 不可用 | 降级到 `authMenuList.json` | P0 |
| TC-EDGE-002 | 菜单项组件缺失 | 跳过该项，其余正常注册 | P0 |
| TC-EDGE-003 | 菜单项与静态路由重名 | try/catch 捕获，控制台 warn | P1 |
| TC-EDGE-004 | 侧边栏折叠跨设备 | 移动端 (<768px) 强制折叠 | P1 |
| TC-EDGE-005 | 深层嵌套菜单 (≥3级) | 全部扁平化注册，父先于子 | P1 |
| TC-EDGE-006 | 菜单项为 null 而非 [] | `authMenuListGet.length` 判定不抛错 | P0 |

---

## 四、追溯矩阵

| 需求项 | 验收标准 | 覆盖用例 |
|--------|---------|---------|
| 三栏布局渲染 | 布局正确 | TC-LAYOUT-001~003 |
| 侧边栏递归菜单 | 多级展开/折叠 | TC-LAYOUT-004~005 |
| 动态路由注册 | 菜单→路由 | TC-ROUTE-001~007 |
| 路由守卫 | 登录态/白名单/初始化 | TC-GUARD-001~007 |
| 菜单工具函数 | 扁平化/过滤/排序 | TC-UTIL-001~007 |

---

## 五、出口准则

- [ ] P0 用例 100% 通过
- [ ] 菜单工具函数覆盖率 ≥ 90%
- [ ] 路由守卫关键路径（TC-GUARD-001~004）通过
- [ ] 边缘场景 TC-EDGE-001（降级）通过