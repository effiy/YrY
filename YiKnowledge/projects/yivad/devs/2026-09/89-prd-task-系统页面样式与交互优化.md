---
prd_task_id: "YV-09-89"
title: "系统页面样式与交互优化 — 开发方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-22
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.65
source_prd: "89-prd-系统页面样式与交互优化.md"
related_tests: ["YV-09-89"]
implementation_progress: "11/11 任务完成，25 文件修改，66 单元测试通过"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 系统页面样式与交互优化]
benefit: "开发方案：task-系统页面样式与交互优化"
lifecycle: active
---

# 系统页面样式与交互优化 — 开发方案

> 来源 PRD：[89-prd-系统页面样式与交互优化.md](../../prds/2026-09/89-prd-系统页面样式与交互优化.md)
> 需求编号：YV-09-89 · 优先级：P1 · 人天：0.65d · 状态：全部完成（11/11 任务，含首页数据看板优化）

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 行数 |
|------|------|------|
| `src/hooks/useTagHelpers.ts` | 共享 tag/color/time 辅助函数（新建） | +120 |
| `src/views/bug/index.vue` | Bug 列表页 — 重构使用共享 helpers | -80 / +1 |
| `src/views/notification/index.vue` | 通知中心 — 重构使用共享 helpers + PageHeaderCard | -25 / +15 |
| `src/views/system/account-manage/index.vue` | 账户管理 — PageHeaderCard + 状态切换确认 | +10 / -8 |
| `src/views/system/role-manage/index.vue` | 角色管理 — PageHeaderCard | +8 / -3 |
| `src/views/system/department-manage/index.vue` | 部门管理 — WIP→预览页（重写） | +60 / -10 |
| `src/views/system/dict-manage/index.vue` | 字典管理 — WIP→预览页（重写） | +60 / -10 |
| `src/views/system/timing-task/index.vue` | 定时任务 — WIP→预览页（重写） | +60 / -10 |
| `src/views/system/menu-manage/index.vue` | 菜单管理 — PageHeaderCard + 样式修复 | +10 / -6 |
| `src/views/system/system-log/index.vue` | 系统日志 — PageHeaderCard | +8 / -3 |
| `src/views/import/index.vue` | 数据导入 — PageHeaderCard | +6 / -10 |
| `src/views/import/sync/index.vue` | 文档同步 — 修复缺失 useI18n + .page 类 | +3 / -0 |
| `tests/hooks/useTagHelpers.test.ts` | useTagHelpers 单元测试（新建） | +230 |
| `src/views/home/index.vue` | 首页 — 正负指标平衡 + 今日摘要 + 侧边栏去重 + 完成率修正 | +35 / -8 |
| `src/hooks/useHomeData.ts` | HomeDeltas 扩展 overdueCount + NOT_DONE 排除 backlog | +4 / -1 |
| `src/languages/modules/home/zh.ts` | 首页 i18n 补充（doneToday/resolvedToday） | +2 / -0 |
| `src/languages/modules/home/en.ts` | 首页 i18n 补充（doneToday/resolvedToday） | +2 / -0 |

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、模块实现详情](#sec-3)
- [四、实施进度追踪](#sec-4)
- [五、全局 .page 标准化清单](#sec-5)
- [六、已知缺口](#sec-6)

---

<a id="sec-1"></a>
## 一、架构总览

### 分层结构

```
┌──────────────────────────────────────────────┐
│  Views (页面层) — 10 个模块                  │
│  PageHeaderCard 统一头部 + .page 统一布局     │
├──────────────────────────────────────────────┤
│  Hooks (逻辑层)                               │
│  useTagHelpers.ts — 15 个共享纯函数           │
│  severity/priority/status tag 映射            │
│  notification icon/color 映射                 │
│  formatRelativeTime / truncatePlainText       │
├──────────────────────────────────────────────┤
│  Consumers (消费者)                           │
│  bug/index.vue — 7 函数导入（重构）           │
│  notification/index.vue — 4 函数导入（重构）  │
│  kanban/index.vue — 后续迁移                  │
│  roadmap/index.vue — 后续迁移                 │
└──────────────────────────────────────────────┘
```

### 核心数据流

```
组件渲染 → useTagHelpers 纯函数 → 返回值（颜色/类型/文本）
  │                │
  │  无副作用      │  无 API 调用
  │  无状态        │  无外部依赖
  │                │
  └── 纯计算逻辑 ──┘
```

---

<a id="sec-2"></a>
## 二、关键技术决策

| 决策 | 选项 A | 选项 B | 选择 | 理由 |
|------|--------|--------|------|------|
| 辅助函数位置 | `hooks/` | `utils/` | hooks/ | 与现有 58 个 composables 一致，未来可扩展响应式能力 |
| WIP 页面处理 | 预览卡片 | 删除菜单/保持标签 | 预览卡片 | 保持菜单结构 + 预告功能 + 虚线边框暗示未完成 |
| 确认对话框范围 | 仅危险操作 | 所有变更操作 | 仅危险操作 | 避免过度打断用户流程 |
| 布局标准化 | 全局 `.page` 类 | 各页面内联样式 | `.page` 类 | 单一来源控制 padding/background，18 个页面复用 |
| 测试策略 | Vitest 纯函数测试 | 组件测试 | 纯函数测试 | useTagHelpers 无副作用，纯函数测试即完整覆盖 |

---

<a id="sec-3"></a>
## 三、模块实现详情

### 3.1 useTagHelpers.ts — 共享辅助函数模块

**设计原则**：
- 纯函数，无副作用，无外部依赖
- 完整 TypeScript 类型标注
- 所有函数有明确的 fallback 行为
- 颜色值统一使用标准 CSS hex

**导出清单**：

| 类别 | 导出 | 类型 | 说明 |
|------|------|------|------|
| 类型 | `TagType` | type alias | `"success" \| "warning" \| "info" \| "primary" \| "danger"` |
| 严重级别 | `SEVERITY_COLORS` | const | critical→#f56c6c, major→#e6a23c, minor→#409eff, trivial→#909399 |
| | `severityColor(s)` | function | 返回 hex 颜色，unknown→#909399 |
| | `severityTagType(s)` | function | critical→danger, major→warning, minor/trivial→info |
| 优先级 | `priorityTagType(p)` | function | p0/urgent→danger, p1/high→warning, p2/medium→info, p3/low→info |
| 状态 | `statusTagType(s)` | function | 覆盖 14 种状态 (open/in_progress/resolved/closed/done/cancelled/backlog/todo/completed/planned/active/archived/rejected/reopened) |
| 频率 | `frequencyTagType(f)` | function | always→danger, sometimes→warning, rarely/once→info |
| 进度 | `progressColor(pct)` | function | ≥80→#67c23a, ≥50→#e6a23c, else→#f56c6c |
| 通知 | `NOTIFICATION_ICONS` | const | system/user_action/ai/error → Element Plus Icons |
| | `NOTIFICATION_COLORS` | const | system→#409eff, user_action→#67c23a, ai→#e6a23c, error→#f56c6c |
| | `notificationIcon(t)` | function | 返回图标组件，unknown→Setting |
| | `notificationColor(t)` | function | 返回颜色，unknown→#909399 |
| 类型图标 | `TYPE_ICONS` | const | issue/project/module/bug/page → Element Plus Icons |
| | `typeIcon(t)` | function | 返回图标组件，unknown→Document |
| 工具 | `formatRelativeTime(iso)` | function | "just now" / "Nm ago" / "Nh ago" / "Nd ago" |
| | `truncatePlainText(t, n)` | function | 去除 Markdown 标记后截断，默认 160 字符 |
| 常量 | `SHORTCUTS` | const | globalSearch/focusSearch/newItem/save/escape 快捷键 |

### 3.2 bug/index.vue — 重构消除重复

**删除的本地定义（8 处，~80 行）**：

```
SEVERITY_COLOR 常量        → 改用导入的 severityColor()
qualityBarColor() 函数      → 改用导入的 progressColor()
truncateDesc() 函数          → 改用导入的 truncatePlainText()
severityColor() 函数         → 改用导入版本（同名）
severityTagType() 函数       → 改用导入版本（同名）
priorityTagType() 函数       → 改用导入版本（同名）
statusTagType() 函数         → 改用导入版本（同名）
frequencyTagType() 函数      → 改用导入版本（同名）
```

**模板引用更新（3 处）**：
- `qualityBarColor(c.pct)` → `progressColor(c.pct)` ×2
- `truncateDesc(bug.description)` → `truncatePlainText(bug.description)` ×1

### 3.3 notification/index.vue — 重构消除重复

**删除的本地定义（6 处，~25 行）**：
- `TYPE_ICONS` 常量 → 改用 `NOTIFICATION_ICONS`
- `TYPE_COLORS` 常量 → 改用 `NOTIFICATION_COLORS`
- `iconFor()` 函数 → 改用 `notificationIcon()`
- `iconColor()` 函数 → 改用 `notificationColor()`
- `TagType` 类型 → 改用共享 `TagType`
- `priorityTag()` 函数 → 改用 `priorityTagType()`

**保留的本地定义**（有中文特定逻辑）：
- `priorityLabel()` — 中文优先级标签（紧急/高/中/低）
- `formatTime()` — 中文相对时间（刚刚/N分钟前/N小时前）

### 3.4 系统管理页面 — PageHeaderCard 统一

**统一改造模式**（适用于所有 7 个系统管理页面）：

```
PageHeaderCard (图标 + 渐变色背景 + 标题 + 描述)
  ├── icon-bg: linear-gradient(135deg, {主题色}, {深色变体})
  ├── title: i18n key
  └── description: i18n key
```

**图标-语义映射**：

| 页面 | 图标 | 渐变色 | 语义 |
|------|------|--------|------|
| account-manage | UserFilled | #409eff→#2563eb | 用户=蓝色 |
| role-manage | Lock | #e6a23c→#ca8a04 | 权限=橙色 |
| department-manage | OfficeBuilding | #409eff→#6366f1 | 组织=蓝紫 |
| dict-manage | Notebook | #67c23a→#059669 | 配置=绿色 |
| menu-manage | Menu | #9b59b6→#7c3aed | 系统=紫色 |
| system-log | DocumentChecked | #909399→#4b5563 | 日志=灰色 |
| timing-task | Clock | #e6a23c→#d97706 | 任务=琥珀 |

### 3.5 WIP 占位页 — 预览卡片模式

**统一 HTML 结构**（3 个页面共用）：

```html
<div class="{page}__placeholder">         <!-- 虚线边框容器 -->
  <div class="{page}__placeholder-icon">  <!-- 大图标 -->
    <el-icon :size="48"><Icon /></el-icon>
  </div>
  <h3>功能规划中</h3>
  <p>该模块即将支持以下能力</p>
  <div class="{page}__features">          <!-- 功能预览区 -->
    <div class="{page}__feature">         <!-- 功能卡片 -->
      <el-icon><FeatureIcon /></el-icon>
      <span>功能名称</span>
    </div>
    <!-- ×3 -->
  </div>
</div>
```

---

<a id="sec-4"></a>
## 四、实施进度追踪

| 任务 | 文件 | 状态 | 完成时间 |
|------|------|------|---------|
| Task 1: 创建 useTagHelpers.ts | `src/hooks/useTagHelpers.ts` | ✅ 完成 | 2026-09-22 |
| Task 2: 重构 bug/index.vue | `src/views/bug/index.vue` | ✅ 完成 | 2026-09-22 |
| Task 3: 重构 notification/index.vue | `src/views/notification/index.vue` | ✅ 完成 | 2026-09-22 |
| Task 4: 增强 account-manage | `src/views/system/account-manage/index.vue` | ✅ 完成 | 2026-09-22 |
| Task 5: 增强 role-manage | `src/views/system/role-manage/index.vue` | ✅ 完成 | 2026-09-22 |
| Task 6: 改造 3 个 WIP 页面 | department/dict/timing-task (3 文件) | ✅ 完成 | 2026-09-22 |
| Task 7: 增强 menu-manage + system-log | menu-manage + system-log (2 文件) | ✅ 完成 | 2026-09-22 |
| Task 8: 增强 import + 修复 sync | import/index.vue + sync/index.vue (2 文件) | ✅ 完成 | 2026-09-22 |
| Task 9: 写单元测试 | `tests/hooks/useTagHelpers.test.ts` | ✅ 完成 | 2026-09-22 |
| Task 10: 全局 .page 标准化 | 8 个页面文件 | ✅ 完成 | 2026-09-22 |
| Task 11: 首页数据看板优化 | home/index.vue + useHomeData.ts + i18n (5 文件) | ✅ 完成 | 2026-09-23 |

### Task 11 实现详情

**子任务 11a — 正负指标平衡**：
- `index.vue`: `statCards` 从 3 卡扩展为 5 卡（Active | Done Today | Bugs | Resolved Today | Overdue），第 2/4 位为正向卡片
- 新增 `animDoneToday`/`animResolvedToday` 动画数字
- `StatCard` 接口新增 `good?: boolean`，正向卡片设 `good: true` → 绿色左边框 `.is-good`
- 逾期 delta 从 `delta: 0` 改为 `deltas.value.overdueCount`
- `useHomeData.ts`: `HomeDeltas`/`EMPTY_DELTAS`/`DELTA_KEYS` 新增 `overdueCount`
- i18n: 新增 `doneToday`、`resolvedToday`

**子任务 11b — 今日摘要横幅**：
- 统计卡片下方新增 `.ho-today-bar`，使用已有 `todaySummary` i18n key
- 样式：浅蓝背景 `var(--el-color-primary-light-9)`，圆角 8px

**子任务 11c — 侧边栏去重**：
- 右侧快照原来显示活跃 Issue + 缺陷数（与主卡片重复）
- 改为今日完成 (animDoneToday, 绿色) + 昨日完成 (yesterdayDoneCount, 灰色) + 文档 + 对话
- i18n: 新增 `yesterdayLabel` key

**子任务 11d — 积压项排除**：
- `NOT_DONE` 从 `["done","Done","cancelled","Cancelled"]` 扩展为追加 `"backlog"`/`"Backlog"`
- 影响范围：`activeIssueCount`、`blockedCount`、`assigneeGroups` 三处查询的 `$nin` 过滤器
- `index.vue`: `completionTotal = totalIssues - cancelledCount - backlogCount`
- 数据影响：活跃 Issue 531→353 (-34%)，完成率 18%→25% (+7pp)

---

<a id="sec-5"></a>
## 五、全局 .page 标准化清单

全局 CSS 类 `.page` 提供统一 `padding: var(--page-gutter)` + `background: var(--el-bg-color-page)`。

| 页面 | 标准化前 | 标准化后 |
|------|---------|---------|
| account-manage | `class="account-manage"` + 内联 24px padding | `class="account-manage page"` |
| role-manage | `class="role-manage"` + 内联 24px padding | `class="role-manage page"` |
| department-manage | `class="dept-page"` + 内联 24px padding | `class="dept-page page"` |
| dict-manage | `class="dict-page"` + 内联 24px padding | `class="dict-page page"` |
| menu-manage | `class="table-box"` (无统一布局) | `class="menu-manage page"` |
| system-log | `class="system-log"` + 内联 16px padding | `class="system-log page"` |
| timing-task | `class="task-page"` + 内联 24px padding | `class="task-page page"` |
| import (issues) | `class="import-page"` + 内联 24px padding | `class="import-page page"` |
| import (sync) | `class="sync"` + 内联 height/padding | `class="sync page"` |
| notification | `class="notif-center"` + 内联 24px padding | `class="notif-center page"` |
| bug list | `class="bug-list"` | `class="bug-list page"` |
| bug detail | `class="bug-detail"` | `class="bug-detail page"` |
| home | `class="ho-root"` (已有 --page-gutter) | `class="ho-root page"` |
| module detail | `class="md-page"` | `class="md-page page"` |
| roadmap | `class="roadmap"` | `class="roadmap page"` |
| search | `class="search-page"` | `class="search-page page"` |
| dashboard/knowledge-base | `class="knowledge-base-box"` | `class="knowledge-base-box page"` |
| dashboard/rss-content | `class="rss-content-box"` | `class="rss-content-box page"` |

---

<a id="sec-6"></a>
## 六、已知缺口

| 缺口 | 优先级 | 说明 |
|------|--------|------|
| kanban/index.vue 未迁移 | P1 | 内联的 `isUrgent`/`BUG_PRIORITY_TO_ISSUE_PRIORITY` 可改用 useTagHelpers |
| roadmap/index.vue 未迁移 | P1 | `formatRelative`/`formatAbsolute` 使用 dayjs，可改用共享函数 |
| ai-chat 模块未标准化 | P2 | 使用自定义布局，需评估是否适用 .page 类 |
| login 页面未标准化 | P3 | 全屏布局专用，不适合 .page 类 |
| WIP 页面完整 CRUD 实现 | P2 | department/dict/timing-task 的完整功能开发 |
| Playwright E2E 测试 | P2 | 当前仅 Vitest 单元测试，无浏览器端测试 |