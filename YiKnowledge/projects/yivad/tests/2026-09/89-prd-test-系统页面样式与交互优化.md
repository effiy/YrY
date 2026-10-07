---
prd_task_id: "YV-09-89"
title: "系统页面样式与交互优化 — 测试用例"
status: 已完成
priority: 中
owner: Chengliang.Yi
source_prds: ["89-prd-系统页面样式与交互优化"]
source_modules: ["YV-09-89-1"]
source_okr: [yivad-003]
created: 2026-09-22
updated: 2026-09-23
project: YiVad
type: test
tags: [测试用例, 样式优化, 回归测试, 代码重构]
category: 项目/管理后台/测试
roles: [engineer]
test_coverage: "L1 单元测试 66 用例通过，L4 手动验证 29 用例通过"
test_execution_date: 2026-09-22
source: YiVad
benefit: "测试用例：系统页面样式与交互优化"
lifecycle: active
---

# 系统页面样式与交互优化 — 测试用例

> 来源 PRD：[89-prd-系统页面样式与交互优化](../../prds/2026-09/89-prd-系统页面样式与交互优化.md)
> 来源 Dev：[89-prd-task-系统页面样式与交互优化](../../devs/2026-09/89-prd-task-系统页面样式与交互优化.md)
> 需求编号：YV-09-89

> **文档职责**：本文档定义**如何验证、验证什么、验证结果**（VERIFY），独立于产品需求和开发方案。

---

## 目录

- [一、测试范围与策略](#sec-1)
- [二、L1 单元测试 — useTagHelpers.ts](#sec-2)
- [三、L4 端到端 — 页面视觉验证](#sec-3)
- [四、L4 端到端 — 交互行为验证](#sec-4)
- [五、边缘场景](#sec-5)
- [六、回归用例](#sec-6)
- [七、追溯矩阵](#sec-7)
- [八、覆盖缺口](#sec-8)
- [九、入口与出口准则](#sec-9)

---

<a id="sec-1"></a>
## 一、测试范围与策略

### 测试分层

| 层级 | 工具 | 覆盖内容 | 用例数 | 通过率 |
|------|------|---------|--------|--------|
| L1 单元 | Vitest | useTagHelpers.ts 所有 15 个导出 | 66 | 100% |
| L4 手动 | Chrome/Edge/Firefox | 10 个页面视觉 + 交互 | 29 | 100% |

### 测试环境

| 维度 | 配置 |
|------|------|
| 浏览器 | Chrome 128+, Edge 128+, Firefox 130+ |
| 分辨率 | 1920×1080（主）, 1440×900（窄屏） |
| 主题 | 亮色（主）, 暗色（回归） |
| 后端 | YiAi FastAPI :10086 运行中 |

---

<a id="sec-2"></a>
## 二、L1 单元测试 — useTagHelpers.ts

**测试文件**：`tests/hooks/useTagHelpers.test.ts`
**执行命令**：`npx vitest run tests/hooks/useTagHelpers.test.ts`
**执行结果**：66 passed, 0 failed

### 2.1 严重级别函数（8 用例）

| 编号 | 用例 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| TC-HELPER-001 | severityColor 已知值 | `"critical"`, `"major"`, `"minor"`, `"trivial"` | `#f56c6c`, `#e6a23c`, `#409eff`, `#909399` | ✅ |
| TC-HELPER-002 | severityColor fallback | `"unknown"`, `""` | `#909399` | ✅ |
| TC-HELPER-003 | severityTagType 映射 | `"critical"`, `"major"`, `"minor"`, `"trivial"` | `danger`, `warning`, `info`, `info` | ✅ |
| TC-HELPER-004 | severityTagType fallback | `"unknown"`, `""` | `info` | ✅ |
| TC-HELPER-005 | SEVERITY_COLORS 完整性 | — | 4 个 key: critical/major/minor/trivial | ✅ |

### 2.2 优先级函数（5 用例）

| 编号 | 用例 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| TC-HELPER-006 | priorityTagType p0/urgent | `"p0"`, `"urgent"` | `danger` | ✅ |
| TC-HELPER-007 | priorityTagType p1/high | `"p1"`, `"high"` | `warning` | ✅ |
| TC-HELPER-008 | priorityTagType p2/medium | `"p2"`, `"medium"` | `info` | ✅ |
| TC-HELPER-009 | priorityTagType p3/low/none | `"p3"`, `"low"`, `"none"` | `info` | ✅ |
| TC-HELPER-010 | priorityTagType fallback | `"unknown"` | `info` | ✅ |

### 2.3 状态函数（8 用例）

| 编号 | 用例 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| TC-HELPER-011 | statusTagType open/todo | `"open"`, `"todo"` | `primary` | ✅ |
| TC-HELPER-012 | statusTagType in_progress/review/reopened | `"in_progress"`, `"in_review"`, `"reopened"` | `warning` | ✅ |
| TC-HELPER-013 | statusTagType resolved/done/completed | `"resolved"`, `"done"`, `"completed"` | `success` | ✅ |
| TC-HELPER-014 | statusTagType closed/cancelled/backlog | `"closed"`, `"cancelled"`, `"backlog"` | `info` | ✅ |
| TC-HELPER-015 | statusTagType rejected | `"rejected"` | `danger` | ✅ |
| TC-HELPER-016 | statusTagType active/archived/planned | `"active"`, `"archived"`, `"planned"` | `success`, `info`, `info` | ✅ |
| TC-HELPER-017 | statusTagType fallback | `"unknown"` | `info` | ✅ |

### 2.4 进度/频率函数（7 用例）

| 编号 | 用例 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| TC-HELPER-018 | progressColor ≥80 | `100`, `80` | `#67c23a` | ✅ |
| TC-HELPER-019 | progressColor 50-79 | `79`, `50` | `#e6a23c` | ✅ |
| TC-HELPER-020 | progressColor <50 | `49`, `0`, `-1` | `#f56c6c` | ✅ |
| TC-HELPER-021 | frequencyTagType always | `"always"` | `danger` | ✅ |
| TC-HELPER-022 | frequencyTagType sometimes | `"sometimes"` | `warning` | ✅ |
| TC-HELPER-023 | frequencyTagType rarely/once/unable | `"rarely"`, `"once"`, `"unable"` | `info`, `primary`, `info` | ✅ |
| TC-HELPER-024 | frequencyTagType fallback | `""` | `info` | ✅ |

### 2.5 时间/文本函数（11 用例）

| 编号 | 用例 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| TC-HELPER-025 | formatRelativeTime empty | `""` | `""` | ✅ |
| TC-HELPER-026 | formatRelativeTime just now | `new Date()`, `Date.now()` | `"just now"` | ✅ |
| TC-HELPER-027 | formatRelativeTime minutes | `Date.now() - 90_000` | `"1m ago"` | ✅ |
| TC-HELPER-028 | formatRelativeTime hours | `Date.now() - 3_600_000` | `"1h ago"` | ✅ |
| TC-HELPER-029 | formatRelativeTime days | `Date.now() - 86_400_000` | `"1d ago"` | ✅ |
| TC-HELPER-030 | formatRelativeTime older | `Date.now() - 7*86_400_000` | locale date string | ✅ |
| TC-HELPER-031 | truncatePlainText markdown | `"## Title\n**bold**\`code\`[link](url)"` | 纯文本无标记 | ✅ |
| TC-HELPER-032 | truncatePlainText list markers | `"- item 1\n- item 2\n* item 3"` | 不含 `-` `*` | ✅ |
| TC-HELPER-033 | truncatePlainText truncation | 200 字文本, maxLen=20 | ≤23 字符 + `"..."` | ✅ |
| TC-HELPER-034 | truncatePlainText short text | `"Hello"`, maxLen=50 | `"Hello"` (不截断) | ✅ |
| TC-HELPER-035 | truncatePlainText default maxLen | `"Hello"` (无 maxLen) | `"Hello"` | ✅ |

### 2.6 通知/类型图标函数（12 用例）

| 编号 | 用例 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| TC-HELPER-036 | notificationIcon known | `"system"`, `"user_action"`, `"ai"`, `"error"` | Setting, User, Cpu, Warning | ✅ |
| TC-HELPER-037 | notificationIcon fallback | `"unknown"`, `""` | Setting | ✅ |
| TC-HELPER-038 | notificationColor known | `"system"`, `"user_action"`, `"ai"`, `"error"` | 对应 hex | ✅ |
| TC-HELPER-039 | notificationColor fallback | `"unknown"` | `#909399` | ✅ |
| TC-HELPER-040 | typeIcon known | `"issue"`, `"project"`, `"module"`, `"bug"`, `"page"` | 对应图标 | ✅ |
| TC-HELPER-041 | typeIcon fallback | `"unknown"` | Document | ✅ |
| TC-HELPER-042 | NOTIFICATION_ICONS keys | — | `["system","user_action","ai","error"]` | ✅ |
| TC-HELPER-043 | TYPE_ICONS keys | — | `["issue","project","module","bug","page"]` | ✅ |

### 2.7 快捷键常量（5 用例）

| 编号 | 用例 | 预期 | 结果 |
|------|------|------|------|
| TC-HELPER-044 | SHORTCUTS.globalSearch | 非空字符串 | ✅ |
| TC-HELPER-045 | SHORTCUTS.focusSearch | `"/"` | ✅ |
| TC-HELPER-046 | SHORTCUTS.newItem | `"N"` | ✅ |
| TC-HELPER-047 | SHORTCUTS.save | 包含 `"S"` | ✅ |
| TC-HELPER-048 | SHORTCUTS.escape | `"Esc"` | ✅ |

---

<a id="sec-3"></a>
## 三、L4 端到端 — 页面视觉验证

| 编号 | 页面 | 检查项 | 结果 |
|------|------|--------|------|
| TC-PAGE-001 | account-manage | PageHeaderCard (UserFilled 蓝色) + ProTable 正常 | ✅ |
| TC-PAGE-002 | role-manage | PageHeaderCard (Lock 橙色) + CRUD 功能正常 | ✅ |
| TC-PAGE-003 | department-manage | 预览卡片（3 功能） | ✅ |
| TC-PAGE-004 | dict-manage | 预览卡片（3 功能） | ✅ |
| TC-PAGE-005 | timing-task | 预览卡片（3 功能） | ✅ |
| TC-PAGE-006 | menu-manage | PageHeaderCard (Menu 紫色) + 树形表格正常 | ✅ |
| TC-PAGE-007 | system-log | PageHeaderCard (DocumentChecked 灰色) + 审计日志正常 | ✅ |
| TC-PAGE-008 | import (issues) | PageHeaderCard (UploadFilled 蓝色) + 导入向导正常 | ✅ |
| TC-PAGE-009 | import (sync) | 无 `t is not defined` 错误，Push/Pull 切换正常 | ✅ |
| TC-PAGE-010 | notification | PageHeaderCard (Bell 蓝紫) + 筛选/搜索正常 | ✅ |
| TC-PAGE-011 | bug list | 重构后所有视图/筛选/图表正常 | ✅ |
| TC-PAGE-012 | 布局一致性 | 18 个页面 `.page` 类 + 统一 padding | ✅ |
| TC-PAGE-013 | home 统计卡片 | 5 张卡片 + 1 仪表盘，正负指标交错排列 | ✅ |
| TC-PAGE-014 | home 正向指标 | "今日完成"和"今日修复"卡片有绿色左边框 | ✅ |
| TC-PAGE-015 | home 今日摘要 | 统计卡片下方显示今日摘要横幅 | ✅ |
| TC-PAGE-016 | home 侧边栏 | 今日快照显示今日完成+昨日完成，不再重复主卡片数据 | ✅ |
| TC-PAGE-017 | home 积压排除 | 活跃 Issue 数不含 backlog/Backlog 状态，完成率分母排除积压项 | ✅ |

---

<a id="sec-4"></a>
## 四、L4 端到端 — 交互行为验证

| 编号 | 页面 | 操作 | 预期 | 结果 |
|------|------|------|------|------|
| TC-INTERACT-001 | account-manage | 点击状态开关 | 弹出确认对话框 "确认启用/禁用用户 xxx？" | ✅ |
| TC-INTERACT-002 | account-manage | 确认对话框点取消 | 状态不变 | ✅ |
| TC-INTERACT-003 | account-manage | 确认对话框点确定 | 状态切换成功 | ✅ |
| TC-INTERACT-004 | role-manage | 删除有用户的角色 | 显示警告 "无法删除：角色仍有 n 个用户" | ✅ |
| TC-INTERACT-005 | menu-manage | ⌘S 保存菜单 | 表单提交 | ✅ |
| TC-INTERACT-006 | menu-manage | Reset Defaults | 确认后重置 | ✅ |

---

<a id="sec-5"></a>
## 五、边缘场景

| 编号 | 场景 | 步骤 | 预期 | 结果 |
|------|------|------|------|------|
| TC-EDGE-001 | 空用户列表 | account-manage 清空数据 | ProTable 空状态 + PageHeaderCard 正常 | ✅ |
| TC-EDGE-002 | 空菜单数据 | menu-manage 清空数据 | ProTable 空状态 + Reset Defaults 可用 | ✅ |
| TC-EDGE-003 | 暗色模式 | 切换暗色主题访问全部页面 | CSS 变量自动适配 | ✅ |
| TC-EDGE-004 | 窄屏 1440×900 | 访问全部页面 | 无横向溢出 | ✅ |
| TC-EDGE-005 | 快速页面切换 | <500ms 间隔切换 | 无组件卸载错误 | ✅ |

---

<a id="sec-6"></a>
## 六、回归用例

| 编号 | 范围 | 操作 | 预期 | 结果 |
|------|------|------|------|------|
| TC-REG-001 | bug 页面 | 所有视图/筛选/CRUD/图表 | 功能与重构前完全一致 | ✅ |
| TC-REG-002 | ProTable | account/role/menu/log 中搜索/排序/分页 | 正常 | ✅ |
| TC-REG-003 | 菜单导航 | 侧边栏菜单导航至所有系统页面 | 面包屑+标签页标题正确 | ✅ |
| TC-REG-004 | account 批量删除 | 选中多个用户 → 批量删除 | 确认后删除成功 | ✅ |
| TC-REG-005 | role CRUD | 创建/编辑/删除角色 | 正常 | ✅ |
| TC-REG-006 | menu CRUD | 创建/编辑/删除菜单（含子菜单） | 正常，含子菜单时 error 确认框 | ✅ |

---

<a id="sec-7"></a>
## 七、追溯矩阵

| PRD 需求项 | L1 用例 | L4 用例 |
|-----------|---------|---------|
| FR-1: 统一页面头部 | — | TC-PAGE-001~012 |
| FR-2: WIP 页面改造 | — | TC-PAGE-003~005 |
| FR-3: useTagHelpers.ts | TC-HELPER-001~048 | — |
| FR-4: bug 页面重构 | — | TC-REG-001 |
| FR-5: 操作确认增强 | — | TC-INTERACT-001~003 |
| FR-6: sync 页面修复 | — | TC-PAGE-009 |
| FR-7: 首页数据优化 | — | TC-PAGE-013~017 |

---

<a id="sec-8"></a>
## 八、覆盖缺口

| 缺口 | 严重程度 | 说明 | 建议 |
|------|---------|------|------|
| kanban/roadmap 迁移测试 | 低 | 两个页面使用内联函数而非共享 helpers | 迁移后补充回归测试 |
| Playwright E2E | 低 | 当前无浏览器自动化测试 | 补充关键路径 E2E 脚本 |
| i18n 完整性 | 低 | WIP 页面和 notification 使用硬编码中文 | 后续补充 i18n key |
| 无障碍测试 | 低 | 未进行 ARIA/screen reader 测试 | 后续迭代补充 |

---

<a id="sec-9"></a>
## 九、入口与出口准则

### 入口准则
- [x] 所有代码变更已完成
- [x] `vue-tsc --noEmit` 通过（0 新增错误）
- [x] 开发服务器正常启动，所有目标页面可访问
- [x] YiAi 后端运行中

### 出口准则
- [x] L1 单元测试 66/66 通过
- [x] L4 手动验证 29/29 通过
- [x] 回归用例 6/6 通过
- [x] 边缘场景 5/5 通过
- [x] 所有页面视觉检查一致

### 测试执行记录
- **执行日期**：2026-09-22
- **执行人**：Chengliang.Yi
- **L1 结果**：66 passed / 0 failed / 0 skipped
- **L4 结果**：29 passed / 0 failed
- **总通过率**：100%