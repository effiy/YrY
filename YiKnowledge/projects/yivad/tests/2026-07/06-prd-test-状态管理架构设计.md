---
doc_type: test
title: "YV-07-06: 状态管理架构设计 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
project_id: yivad
prd_month: "202607"
prd_task_id: "YV-07-06"
source_prds: ["06-prd-状态管理架构设计"]
source_modules: ["06-prd-task-状态管理架构设计"]
---

# YV-07-06: 状态管理架构设计 — 测试用例

> 来源 PRD：[06-prd-状态管理架构设计.md](../../prds/2026-07/06-prd-状态管理架构设计.md)
> 开发方案：[06-prd-task-状态管理架构设计.md](../../devs/2026-07/06-prd-task-状态管理架构设计.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 覆盖目标 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | Vitest + jsdom | Store 状态初始化、computed 派生 | 每次提交 |
| L2 集成 | Vitest + Pinia + mock API | Store 动作（CRUD）、持久化恢复、跨 Store 协调 | 每次提交 |
| L3 组件 | Vitest + @vue/test-utils | Store 与组件集成 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | 5 个全局 Store（user/auth/global/tabs/keepAlive） | L1/L2 |
| COV-2 | 持久化策略（token/偏好保留，业务数据不持久化） | L2 |
| COV-3 | 跨 Store 协调（tabs↔keepAlive, auth↔router） | L2 |

---

## 二、测试用例

### 2.1 Store 初始化与派生（COV-1 · L1）

| 编号 | 用例 | 预期结果 | 优先级 |
|------|------|---------|--------|
| TC-STORE-001 | userStore 初始状态 | token 为空，userInfo 为 null | P0 |
| TC-STORE-002 | authStore 初始状态 | authMenuList=[], authButtonList={}, routeName="" | P0 |
| TC-STORE-003 | globalStore 初始状态 | language=zh, theme=light, isCollapse=false | P1 |
| TC-STORE-004 | projectStore 派生 | activeProjects = list 中 status=active 的项 | P1 |
| TC-STORE-005 | authStore 菜单派生 | flatMenuListGet 父先于子，showMenuListGet 过滤隐藏 | P0 |

### 2.2 Store 持久化（COV-2 · L2）

| 编号 | 用例 | 预期结果 | 优先级 |
|------|------|---------|--------|
| TC-PERSIST-001 | 主题持久化 | 切换暗色 → 刷新 → 保持暗色 | P0 |
| TC-PERSIST-002 | Token 持久化 | 登录 → 刷新 → 保持登录态 | P0 |
| TC-PERSIST-003 | 业务数据不持久化 | 加载列表 → 刷新 → 从 API 重新加载 | P0 |
| TC-PERSIST-004 | 侧边栏折叠持久化 | 折叠 → 刷新 → 保持折叠 | P1 |
| TC-PERSIST-005 | 标签页持久化 | 打开 3 个标签 → 刷新 → 3 个标签恢复 | P1 |

### 2.3 跨 Store 协调（COV-3 · L2）

| 编号 | 用例 | 预期结果 | 优先级 |
|------|------|---------|--------|
| TC-COORD-001 | 关闭标签→清理缓存 | tabs.closeTab → keepAlive.removeCache | P0 |
| TC-COORD-002 | 路由切换→更新权限上下文 | 导航 → auth.routeName 更新 | P0 |
| TC-COORD-003 | 退出登录→清理所有业务 Store | token 清空 → 业务 Store 重置 | P1 |

---

## 三、边缘场景

| 编号 | 场景 | 处理策略 | 优先级 |
|------|------|---------|--------|
| TC-EDGE-001 | localStorage 配额超限 | 大 Store (aiChat) 迁移到 IndexedDB | P0 |
| TC-EDGE-002 | Date 序列化/反序列化 | JSON reviver 自动恢复 Date 对象 | P0 |
| TC-EDGE-003 | Store 初始化竞态 | 多个 Store 并行从 localStorage 恢复 | P1 |
| TC-EDGE-004 | 跨 Store 级联更新检测 | 单操作 > 5 次 watch → console.warn | P2 |
| TC-EDGE-005 | 持久化写入阻塞 UI | 大对象 IndexedDB 异步写入 | P1 |
| TC-EDGE-006 | Options→Setup 迁移 key 冲突 | `persist.key` 显式设置兼容旧 key | P2 |

---

## 四、追溯矩阵

| 需求项 | 验收标准 | 覆盖用例 |
|--------|---------|---------|
| 16 个 Store 可用 | Setup Store 语法，功能正常 | TC-STORE-001~005 |
| 持久化策略 | token/偏好保留，业务数据不持久化 | TC-PERSIST-001~005 |
| 跨 Store 协调 | tabs→keepAlive, auth→router | TC-COORD-001~003 |

---

## 五、出口准则

- [ ] P0 用例 100% 通过
- [ ] 持久化关键路径通过（token/主题刷新不丢失）
- [ ] 跨 Store 协调通过（tabs↔keepAlive 同步）