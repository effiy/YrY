---
doc_type: test
title: "首页仪表盘 — 快速导航 + OKR 推荐面板 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
prd_task_id: "YV-08-07"
source_prds: ["07-prd-首页仪表盘"]
source_modules: []
---
# 首页仪表盘 — 快速导航 + OKR 推荐面板 — 测试规格

> 来源 PRD：[07-prd-首页仪表盘.md](../../prds/2026-08/07-prd-首页仪表盘.md)
> 提取日期：2026-09-11

---

### 4.5 边缘场景处理

| # | 场景 | 描述 | 处理策略 | 实现细节 |
|---|------|------|---------|---------|
| 1 | 6 路统计查询中 1 路超时 | `bugs` 集合查询超时，导致 `Promise.all` 整体失败 | 使用 `Promise.allSettled` 替代 `Promise.all`，失败的卡片显示 `--` 并 Tooltip 提示"数据加载失败" | `const results = await Promise.allSettled(queries)` |
| 2 | 首页数据缓存过期 | 用户在首页停留超过 5 分钟，统计数据已过时 | 添加 5 分钟 TTL 缓存，过期后自动刷新 | `sessionStorage` 存储 `{ data, timestamp }` |
| 3 | 知识库 Popover 快速划过 | 鼠标快速划过知识库导航项，Popover 展开后立即关闭，但 API 请求已发出 | 200ms debounce + `AbortController` 取消未完成请求 | `onUnmounted(() => controller.abort())` |
| 4 | 统计 Pills 数字动画 | 数字从 0 增长到 9999 时，动画在 600ms 内完成（非预期 1000ms） | 使用 `easeInOutQuad` 缓动函数替代 `easeOutCubic` | `t < 0.5 ? 2*t*t : -1+(4-2*t)*t` |
| 5 | URL 项目参数无效 | `?project=deleted-project`，项目已删除，`el-select` 显示占位符 | 检测无效 key → `ElMessage.warning` + 清除 URL 参数 | `router.replace({ query: { ...route.query, project: undefined } })` |
| 6 | 移动端 DateRangePicker 溢出 | 移动端 `el-date-picker` 面板宽度 560px 超出屏幕 375px | 移动端使用 `type="monthrange"` 替代 `daterange`，面板宽度 280px | `@media (max-width: 768px) { .el-picker-panel { max-width: 100vw } }` |
| 7 | 首页组件卸载后 stats 更新 | `useHomeData` 的 `fetchAll` 在组件卸载后完成，触发 `stats` 响应式更新 | `onUnmounted` 中设置 `isActive = false`，`fetchAll` 完成后检查 | `if (!isActive) return;` |
| 8 | OkrRecommendPanel 初次加载无 roleCounts | P0 计数依赖 OkrRecommendPanel 的 `@update:counts` 事件，初始值为 0 | P0 Pill 使用 `v-show="roleCounts.p0 > 0"` 延迟显示 | `v-show` 避免初始 0 值闪烁 |
| 9 | 快速导航图标加载失败 | Element Plus 图标组件在 SSR/CSR 切换时加载失败 | 使用 `el-icon` 的 `fallback` 插槽，显示文字替代 | `<el-icon><FallbackIcon v-if="!iconLoaded" /></el-icon>` |
| 10 | 首页在暗色模式下样式异常 | CSS 变量在暗色模式下未正确切换 | PageHeaderCard 使用 Element Plus CSS 变量，自动适配暗色模式 | `background: var(--el-bg-color)` |


## 六、测试规格

### 6.1 数据加载

**TC-HOME-01: 正常加载**
- GIVEN 用户已登录，YiAi 后端正常运行
- WHEN 访问首页 `/home`
- THEN 骨架屏显示 → 数据加载完成 → 统计 Pills 显示正确数值，QuickNav 显示计数

**TC-HOME-02: 加载失败重试**
- GIVEN YiAi 后端不可用
- WHEN 访问首页
- THEN 显示错误页面（el-result error），点击"重试"按钮重新加载

**TC-HOME-03: 并行查询性能**
- GIVEN YiAi 后端正常运行
- WHEN 访问首页
- THEN Network 面板显示 6 个 `query_documents` 请求并行发出（非串行）

### 6.2 快速导航

**TC-QUICKNAV-01: 导航跳转**
- GIVEN 首页正常显示
- WHEN 点击 "Issue" 导航卡片
- THEN 路由跳转到 `/issue`

**TC-QUICKNAV-02: 知识库 Popover**
- GIVEN 首页正常显示
- WHEN 点击 "Knowledge" 导航卡片
- THEN Popover 展开，显示 9 个知识库子页面入口
- WHEN 点击 "engineer" 子页面
- THEN Popover 关闭，路由跳转到 `/engineer`

**TC-QUICKNAV-03: 计数显示**
- GIVEN 首页正常显示，数据库有 5 个 Bug
- WHEN 查看 QuickNav "Bug" 卡片
- THEN 计数 badge 显示 "5"

**TC-QUICKNAV-04: 响应式布局**
- GIVEN 浏览器宽度 800px
- WHEN 查看 QuickNav
- THEN 显示 2 列布局
- WHEN 浏览器宽度调整为 500px
- THEN 显示 1 列布局

### 6.3 统计 Pills

**TC-PILLS-01: 点击跳转**
- GIVEN 首页正常显示，totalIssues = 12
- WHEN 点击 "12 任务" Pill
- THEN 路由跳转到 `/issue`

**TC-PILLS-02: P0 跳转**
- GIVEN 首页正常显示，P0 计数 = 3
- WHEN 点击 "3 P0" Pill（红色高亮）
- THEN 路由跳转到 `/issue?priority=urgent`

**TC-PILLS-03: Bug 跳转**
- GIVEN 首页正常显示，bugCount = 5
- WHEN 点击 "5 Bug" Pill
- THEN 路由跳转到 `/bug`

### 6.4 日期筛选

**TC-DATE-01: 日期导航**
- GIVEN 首页正常显示
- WHEN 点击日期导航"上一天"
- THEN `filterDate` 更新，OkrRecommendPanel 根据新日期筛选

**TC-DATE-02: 清除日期**
- GIVEN 已设置日期筛选
- WHEN 点击"清除"按钮
- THEN `filterDate` 重置为 null，OkrRecommendPanel 显示全部数据

### 6.5 边缘场景

**TC-HOME-07: 部分查询失败**
- GIVEN `bugs` 集合查询超时，其他 5 路查询正常
- WHEN 访问首页
- THEN Bug 统计 Pill 显示 `--`，Tooltip 提示"数据加载失败"
- AND 其他 5 个统计 Pill 正常显示

**TC-HOME-08: 空数据首页**
- GIVEN 数据库无任何数据（新系统）
- WHEN 访问首页
- THEN 所有统计 Pill 显示 0，QuickNav 计数均为 0
- AND 无错误提示

**TC-HOME-09: 知识库 Popover 快速划过**
- GIVEN 首页正常显示
- WHEN 鼠标快速划过"知识库"导航项（停留 < 200ms）
- THEN Popover 不展开，无 API 请求发出

**TC-HOME-10: 网络断开后恢复**
- GIVEN 首页加载时网络断开
- WHEN 网络恢复后点击"重试"
- THEN 首页正常加载，所有数据正确显示

---


## 边缘场景处理

| # | 场景 | 触发条件 | 处理策略 | 优先级 |
|---|------|---------|---------|--------|
| 1 | 6 路统计查询中 bugs 集合不可用 | MongoDB 中 bugs 集合被删除或权限变更 | `Promise.allSettled` 模式下，bugs 查询失败但不影响其他 5 路，失败的卡片显示 `--` 并 Tooltip 提示 | P0 |
| 2 | 首页首次加载时 `projectStore.projects` 为空 | 用户首次登录或 projectStore 未初始化 | QuickNav 中 Project 计数显示 `0`，OkrRecommendPanel 项目下拉为空，待 projects 加载后自动更新 | P1 |
| 3 | 日期筛选时 OkrRecommendPanel 数据为空 | 选定日期无任何工作项 | 面板显示空状态提示"该日期无工作项"，不显示错误 | P1 |
| 4 | 知识库 Popover 在移动端触摸事件中误触发 | 移动端用户滑动页面时手指经过知识库导航项 | 移动端禁用 hover 触发 Popover，改为 click 触发，并添加 200ms 延迟防止误触 | P1 |
| 5 | `roleCounts.p0` 数据来源 OkrRecommendPanel 异步更新 | 首页已渲染但 OkrRecommendPanel 还在加载中 | P0 Pill 初始显示 `--`，OkrRecommendPanel `@update:counts` 事件触发后更新 | P1 |
| 6 | 用户连续快速点击多个 Pills | 快速点击 Issue Pill → Bug Pill → Module Pill | 使用 `router.push` 而非 `router.replace`，每次点击都压入历史记录，用户可通过浏览器后退回到首页 | P2 |
| 7 | QuickNav 计数 badge 数字过大（> 999） | 数据库中 Issue 数量超过 999 | 显示 `999+` 而非实际数字，避免 badge 宽度溢出 | P2 |
| 8 | 首页在 `position: fixed` 的布局中 `overflow` 异常 | 父级布局使用了 `overflow: hidden` | `PageHeaderCard` 和 `QuickNav` 使用 `overflow: visible`，确保 Popover 和 Tooltip 不被裁剪 | P2 |
| 9 | 浏览器最小字体设置导致 QuickNav 布局错乱 | 用户设置了最小字体 16px | 使用 `min-width` 而非固定 `width`，确保 grid 列在字体放大时不会重叠 | P2 |
| 10 | 首页在打印模式下布局异常 | 用户通过 `Ctrl+P` 打印首页 | 添加 `@media print` 样式隐藏 QuickNav、OkrRecommendPanel 和骨架屏，仅显示统计 Pills 和标题 | P3 |
| 11 | 首次加载时 `selectedProject` 从 URL query 恢复失败 | URL 中的 project key 已被删除或重命名 | `syncProjectFromQuery` 中检测无效 key，`ElMessage.warning` 提示并清除 URL 参数 | P2 |
| 12 | 首页长时间停留（> 1h）数据过期 | 统计数据在首页加载后不再更新 | 添加 `setInterval` 每 5min 静默刷新统计数据（不显示 loading），或用户手动点击刷新按钮 | P3 |

---


## 扩展测试规格

### 6.5 数据刷新

**TC-HOME-06: 自动刷新统计数据**
- GIVEN 首页已加载完成，统计数据已显示
- WHEN 等待 5 分钟
- THEN 统计数据自动刷新（不显示 loading），新数据替换旧数据

**TC-HOME-07: 手动刷新**
- GIVEN 首页正常显示
- WHEN 用户点击浏览器刷新按钮（F5）
- THEN 骨架屏显示 → 数据重新加载 → 所有统计和导航更新

### 6.6 边界情况

**TC-HOME-08: 所有统计为 0**
- GIVEN 数据库为空（新系统，无任何数据）
- WHEN 访问首页
- THEN 所有统计 Pills 显示 "0"，QuickNav 计数 badge 不显示或显示 "0"

**TC-HOME-09: 部分统计查询失败**
- GIVEN MongoDB 中 bugs 集合不可用
- WHEN 访问首页
- THEN Bug 统计显示 `--`，其他 5 个统计正常显示，QuickNav Bug 卡片无计数

**TC-HOME-10: 快速切换路由**
- GIVEN 首页数据正在加载中
- WHEN 用户点击 QuickNav 跳转到 `/issue`
- THEN `useHomeData` composable 的 `isActive` 设为 false，进行中的 API 回调被丢弃，无 "Can't perform state update on unmounted component" 警告

---

