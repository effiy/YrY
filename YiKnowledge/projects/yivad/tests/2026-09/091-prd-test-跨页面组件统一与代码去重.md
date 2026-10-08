---
prd_task_id: "YV-09-91"
title: "跨页面组件统一与代码去重 — 测试用例"
status: 已完成
priority: 中
owner: Chengliang.Yi
source_prds:
- "YV-09-91"
source_modules:
- "YV-09-91-1"
- "YV-09-91-2"
- "YV-09-91-3"
- "YV-09-91-4"
source_okr:
- yivad-003
created: '2026-09-23'
updated: '2026-09-23'
project: YiVad
type: test
tags:
- 测试用例
- 回归测试
- 代码重构
- 组件化
category: 项目/管理后台/测试
roles:
- engineer
test_coverage: "L1 类型检查零新增错误，L4 手动验证 48 文件变更无回归"
test_execution_date: '2026-09-23'
source: YiVad
benefit: "测试用例：跨页面组件统一与代码去重"
lifecycle: active
---

# 跨页面组件统一与代码去重 — 测试用例

> 来源 PRD：[91-prd-跨页面组件统一与代码去重](../../prds/2026-09/91-prd-跨页面组件统一与代码去重.md)
> 来源 Dev：[90-prd-task-跨页面组件统一与代码去重](../../devs/2026-09/90-prd-task-跨页面组件统一与代码去重.md)
> 需求编号：YV-09-91

> **文档职责**：本文档定义**如何验证、验证什么、验证结果**（VERIFY），独立于产品需求和开发方案。

---

## 目录

- [一、测试范围与策略](#sec-1)
- [二、L1 静态检查 — TypeScript 类型检查](#sec-2)
- [三、L1 静态检查 — CSS 去重验证](#sec-3)
- [四、L4 端到端 — 页面视觉验证](#sec-4)
- [五、L4 端到端 — 交互行为验证](#sec-5)
- [六、边缘场景](#sec-6)
- [七、回归用例](#sec-7)
- [八、追溯矩阵](#sec-8)

---

<a id="sec-1"></a>
## 一、测试范围与策略

本次优化涉及 48 个文件变更，核心目标为**代码去重与组件化**，不改变现有业务逻辑。因此测试策略为：

| 测试层级 | 范围 | 通过标准 |
|---------|------|---------|
| L1 vue-tsc | 全量类型检查 | 零新增 TS 错误 |
| L1 grep 扫描 | CSS 重复检测 | 无 `.page` 适用页面含重复 `background` |
| L4 视觉验证 | 核心页面渲染 | 与优化前视觉一致 |
| L4 交互验证 | 共享组件行为 | Filter Pills / Recently Viewed 正常 |

<a id="sec-2"></a>
## 二、L1 静态检查 — TypeScript

### TC-1.1：vue-tsc --noEmit

```
pnpm type:check
```

**通过标准**：除 pre-existing 的 `reports/`、`languages/` 等错误外，无新增 TS 错误。

**验证结果**：✅ 通过 — 零新增 TS 错误。

### TC-1.2：共享组件 import 正确性

验证 FilterPills、RecentlyViewed、BugSidebar 的 import 在所有消费方中正确解析：

| 消费方 | FilterPills | RecentlyViewed | BugSidebar |
|-------|-----------|---------------|-----------|
| bug/index.vue | ✅ | ✅ | ✅ |
| issue/index.vue | ✅ | ✅ | N/A |
| module/index.vue | ✅ | ✅ | N/A |
| skills/index.vue | ✅ | ✅ | N/A |

**验证结果**：✅ 全部通过。

<a id="sec-3"></a>
## 三、L1 静态检查 — CSS 去重

### TC-3.1：全局 `.page` 类生效

```
grep -rn 'padding: 24px;.*background: var(--el-bg-color-page)' src/views/
```

**通过标准**：零结果（所有页面级容器使用 `.page` 类）。

**验证结果**：✅ 零重复。

### TC-3.2：@keyframes skeleton-shimmer 唯一定义

```
grep -rn '@keyframes skeleton-shimmer' src/
```

**通过标准**：仅在 `src/styles/skeleton.scss` 中定义一次。

**验证结果**：✅ 唯一定义于 `styles/skeleton.scss`。

### TC-3.3：formatAbsolute 去重

```
grep -rn 'new Date(ts).toLocaleString()' src/views/
```

**通过标准**：仅保留无法替换的自定义格式化逻辑（如 notification 的中文相对时间）。

**验证结果**：✅ 5 处已替换，剩余为合适的自定义实现。

<a id="sec-4"></a>
## 四、L4 端到端 — 页面视觉验证

### TC-4.1：核心列表页面渲染

| 页面 | 状态 | 检查项 |
|------|------|-------|
| /project | ✅ | 工具栏含 `[··· More ▼]` 下拉，freshness dot 显示 |
| /bug | ✅ | FilterPills + RecentlyViewed + BugSidebar 渲染 |
| /issue | ✅ | FilterPills + RecentlyViewed + IssueSidebar 渲染 |
| /module | ✅ | FilterPills + RecentlyViewed 渲染 |
| /skills | ✅ | FilterPills + RecentlyViewed 渲染 |

### TC-4.2：系统管理页面

| 页面 | 状态 | 检查项 |
|------|------|-------|
| /system/account-manage | ✅ | PageHeaderCard + .page 类生效 |
| /system/role-manage | ✅ | PageHeaderCard + .page 类生效 |
| /system/menu-manage | ✅ | PageHeaderCard + .page 类生效 |
| /system/system-log | ✅ | PageHeaderCard + .page 类生效 |
| /system/department-manage | ✅ | .page 类生效 |
| /system/dict-manage | ✅ | .page 类生效 |
| /system/timing-task | ✅ | .page 类生效 |

### TC-4.3：知识库页面

| 页面 | 状态 | 检查项 |
|------|------|-------|
| /knowledge/curator | ✅ | background 由 .page 提供 |
| /knowledge/goals | ✅ | background 由 .page 提供 |
| /knowledge/metrics | ✅ | background 由 .page 提供 |
| /knowledge/resume | ✅ | background 由 .page 提供 |
| /executive/rssOverview | ✅ | background 由 .page 提供 |

<a id="sec-5"></a>
## 五、L4 端到端 — 交互行为验证

### TC-5.1：FilterPills 行为

| 测试场景 | 操作 | 预期结果 | 状态 |
|---------|------|---------|------|
| 筛选 pill 显示 | 在 bug 页面选择 "Critical" filter | FilterPills 显示 "Critical" pill | ✅ |
| pill 清除 | 点击 pill 的 × 按钮 | pill 消失，数据刷新 | ✅ |
| 全部清除 | 点击 "Clear all" | 所有 pill 消失，数据刷新 | ✅ |
| issue 页面兼容 | 在 issue 页面应用 quick filter | FilterPills 显示对应 pill | ✅ |

### TC-5.2：RecentlyViewed 行为

| 测试场景 | 操作 | 预期结果 | 状态 |
|---------|------|---------|------|
| 显示最近查看 | 在 bug 页面点击查看详情后返回 | RecentlyViewed 显示刚查看的 bug | ✅ |
| 点击跳转 | 点击芯片 | 跳转到对应详情页 | ✅ |
| 清除 | 点击 ✕ 按钮 | 所有芯片消失 | ✅ |
| 最多 8 条 | 查看 10 个不同项 | 仅显示最近 8 条 | ✅ |

### TC-5.3：项目工具栏溢出菜单

| 测试场景 | 操作 | 预期结果 | 状态 |
|---------|------|---------|------|
| 下拉菜单打开 | 点击 `[··· More ▼]` | 显示 poll interval + health filter + export | ✅ |
| Poll interval 切换 | 在下拉中选择 "30s" | 自动刷新激活，每 30s 刷新 | ✅ |
| Health filter | 在下拉中选择 "Good" | 仅显示健康状态为 good 的项目 | ✅ |

### TC-5.4：对话框自动聚焦

| 对话框 | 操作 | 预期结果 | 状态 |
|--------|------|---------|------|
| 新建项目 | 点击 "New Project" | 名称输入框自动聚焦 | ✅ |
| 新建 Issue | 点击 "Create" | 标题输入框自动聚焦 | ✅ |
| 新建/编辑 Bug | 打开 BugFormDialog | 标题输入框自动聚焦 | ✅ |
| 编辑会话 | 打开 SessionEditDialog | 标题输入框自动聚焦 | ✅ |

<a id="sec-6"></a>
## 六、边缘场景

### TC-6.1：空数据状态

| 场景 | 预期 | 状态 |
|------|------|------|
| RecentlyViewed 无数据 | 组件不渲染（`v-if` 隐藏） | ✅ |
| FilterPills 无 active 筛选 | 组件不渲染 | ✅ |
| 项目页面无 dashboard 数据 | freshness dot 不渲染 | ✅ |

### TC-6.2：共享组件在 projectKey 上下文

| 场景 | 预期 | 状态 |
|------|------|------|
| bug 页面在 project 上下文中 | Sidebar 隐藏，FilterPills 可显示 | ✅ |
| issue 页面在 project 上下文中 | Sidebar 隐藏 | ✅ |
| module 页面在 project 上下文中 | RecentlyViewed 隐藏 | ✅ |

<a id="sec-7"></a>
## 七、回归用例

| 编号 | 测试项 | 验证方式 | 状态 |
|------|-------|---------|------|
| R-1 | 所有页面正常加载 | 手动遍历 | ✅ |
| R-2 | 筛选功能正常 | 应用/清除筛选 | ✅ |
| R-3 | CRUD 操作正常 | 创建/编辑/删除 | ✅ |
| R-4 | 暗色模式切换正常 | 切换主题 | ✅ |
| R-5 | 响应式布局正常 | 缩放浏览器窗口 | ✅ |

<a id="sec-8"></a>
## 八、追溯矩阵

| 需求编号 | 测试用例 | 结果 |
|---------|---------|------|
| FR-1 (.page 类) | TC-3.1, TC-4.2, TC-4.3 | ✅ |
| FR-2 (FilterPills) | TC-1.2, TC-5.1 | ✅ |
| FR-3 (RecentlyViewed) | TC-1.2, TC-5.2 | ✅ |
| FR-4 (BugSidebar) | TC-1.2, TC-4.1 | ✅ |
| FR-5 (骨骼动画) | TC-3.2 | ✅ |
| FR-6 (工具栏) | TC-4.1, TC-5.3 | ✅ |
| FR-7 (日期格式化) | TC-3.3 | ✅ |
| FR-8 (自动聚焦) | TC-5.4 | ✅ |
| FR-9 (Tooltip) | TC-4.1 | ✅ |
| AC-9 (vue-tsc) | TC-1.1 | ✅ |

---

**测试结论**：全部测试用例通过，48 个文件变更零回归。