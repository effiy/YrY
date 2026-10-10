# readingList.vue 去重与冗余精简实施方案

## 仓库调研结论
当前文件共 1081 行（模板 ~420 / 脚本 ~650 / 样式 ~2）。识别出以下**可安全删除或合并的冗余点**（按影响降序）：

1. **模板操作按钮（三栏视图重复）**
   - List / Card / Table 三处几乎相同的 4 按钮行：`📖 Open/Edit/Del`。
   - List/Card 视图内多处 `hasValidLinkContract(row)` 判断 + 相同的 📖 标签。
   - **策略**：抽单一组件 `RowActions`（同文件内私有组件即可，不外泄）；标签部分可抽 `ReadingLinkTag`。
   > 注：同内存偏好「倾向于单入口组件脚本」→ 不在仓库新增独立组件文件，在当前文件中抽取 `<script>` 内组件即可（通过 defineComponent 或内联模板私有 helper 组件化）。

2. **脚本 - RICE 四元组 4 键 watch 的冗余循环**
   - 写了 4 次闭包 watch，核心逻辑完全一致：`riceEditGuard 锁 → recomputeRiceFinalFromFour()`。
   - **策略**：合并为一次 watch 多源数组 `[()=>form.reach, ()=>form.impact, ()=>form.confidence, ()=>form.effort]`。

3. **脚本 - 过滤交互函数的「模式重复」**
   - 6 个 toggle：`onToggleDimension / onToggleRole / onToggleMonth / onTogglePriority / onSetStatus / onSetDoneGroup / toggleRiceFilter`。
   - 共性：`A = (A===X? default: X)` + `proTable.value?.getTableList?.()`。
   - **策略**：抽 `setQueryField<K>(key, value, defaultVal)` 统一翻转逻辑 + 刷新。
   - 保留 6 个函数壳以便模板绑定，但内部共享同一 setter。

4. **脚本 - `filteredBy` 中对 `status === "done-group"` 的两次分支**
   - 第 615 行赋值 `q.status = "all"`，然后 621 行再次判断并过滤，逻辑散列。
   - **策略**：统一在 `store.filter(q)` 返回后，追加一次 done-group 过滤；不再提前篡改 `q.status`。

5. **脚本 - `switchSourceMode / onSetStatus` 等中调用 `proTable.value?.getTableList?.()` 存在但未暴露对应 UI 按钮（历史遗留）**
   - `handleRefresh`、`seedIntoDb`、`switchSourceMode`、`isSourceKB`、`toggleDashboardCollapse`、`liveQueueStats`、`dimensionBarWidth`、`segmentStyle`、`funnelStyle`、`distillSteps`、`scheduledMonthList`、`daysUntilMonth`、`queuedLiveItems`、`syncing` 等在 **模板中从未引用**（Dashboard/面板已移除，见项目记忆 v3.3 SSOT）。
   - **策略**：批量删除 15+ 个孤立函数 / ref / computed，释放 ~120 行。

6. **脚本 - `metaMap` 查找 + 回退表达式重复**
   - 模板中 6 处写 `metaMap.xxx[row.xxx ?? "default"] ?? metaMap.xxx.default`。
   - **策略**：抽 3 个 helper `resolveTypeLabel / resolveRoleLabel / resolveDimensionLabel`，内部封装默认查找。

7. **脚本 - `markRowError` / `isRowFailed` 重复的 `row.key ?? row._id ?? ...`**
   - **策略**：抽 `rowKeyOf(row)` 统一入口。

8. **脚本 - `resetForm` / `openEditDialog` / `saveForm` 中的表单载荷构造重复**
   - 3 处写了 `{ title, subtitle, author, ... riceFinal, tags, summary }` 字段序列。
   - **策略**：抽 `EMPTY_FORM` 常量（makeRice(70) 基础），`resetForm` 直接 assign；抽 `buildPayloadFromForm()` 函数；抽 `assignFormFromRow(row)` 供编辑使用。

9. **脚本 - 未使用 import**
   - `Connection`, `Plus`, `Refresh` 图标未在模板使用；`ComputedRef`/`shallowRef`（仅 `kbPreviewRef` 用一次，可用 `ref` 统一）。
   - 类型 `DistillStep` 在模板未引用。
   - **策略**：清理未用导入。

10. **脚本 - `watch(query/...)` 在 table 模式才 `getTableList`，但所有 toggle 内部也已手动刷 —— 重复刷新**
    - **策略**：移除手动 toggle 尾部的 `getTableList()`，完全交给底部统一 watch（这样 List/Card 视图靠 computed 自然响应，Table 由 watch 驱动）。验证「过滤结果变化 → 数据变更」一致性。

11. **模板 - List/Card/Table 三处 `is-failed` 判定、`progress` 调用、`riceScoreClass` 调用保留（不是冗余，不合并）**
    - 三处布局差异大，硬合并不易维护，保持现状。

## 文件与模块
- 仅改：`/Users/yi/YrY/YiVad/src/views/knowledge/executive/readingList.vue`
- 不触碰：`composables/`、`styles/readingList.scss`（除非模板类名改名；本方案不改 CSS）。

## 实施步骤（依赖顺序）
1. **清理未用 import 和孤立变量/函数**（先减负，便于后续合并）
   - 移除 `Connection/Plus/Refresh/DistillStep`；
   - 删除：`dashboardCollapsed / syncing / distillSteps / liveQueueStats / daysUntilMonth / queuedLiveItems / scheduledMonthList / dimensionBarWidth / segmentStyle / funnelStyle / isSourceKB / switchSourceMode / toggleDashboardCollapse / handleRefresh / seedIntoDb / sum`。

2. **抽 RICE 四元组字段 watch 合并**
   - 删除 `RICE_FOUR_KEYS for 循环 watch`；
   - 新建 `watch([reach,impact,confidence,effort], handler)` 共用 guard。

3. **抽通用 query setter 与统一刷新**
   - 建 `setQueryField`、`delete proTable.getTableList 手动调用`；
   - 保留底部 `watch(query/...)` 驱动 table 刷新。

4. **抽表单「常量 / payload / 编辑回填」辅助函数**
   - `EMPTY_FORM_MAKE() → base`；
   - `assignFormFromRow(row)`、`buildPayloadFromForm()`；
   - `resetForm / openEditDialog / saveForm` 内部复用。

5. **模板私有行组件与辅助函数**（因为不新增文件，用 `defineComponent` 在同一 script 内暴露并在模板中使用）
   - `RowActions`（接收 row + variant: "list"|"card"|"table"；因为三场景按钮文案略有差异，variant 控制）；
   - `ReadingLinkTag`（封装 `hasValidLinkContract + el-tag + click.stop`）；
   - 抽 `rowKeyOf / resolveXxxLabel` 并替换模板内 6 处 ?? 链。

6. **合并 `filteredBy` done-group 双分支**
   - 去掉第一次篡改 `q.status = "all"`；统一在末尾做一次 post-filter。

7. **运行 TypeScript 校验 + 手动审阅**
   - `yarn type-check` 或 `vue-tsc --noEmit`（按项目实际脚本）；
   - 逐点验证：三栏渲染、过滤、编辑回填、RICE 联动。

## 依赖与注意事项
- **禁止引入新文件**（遵循「单入口组件脚本」偏好）；
- `RowActions/ReadingLinkTag` 必须通过 `components: {}` 注册或 setup 内直接 export（Vue 3 `<script setup>` 下顶层 `const Foo = defineComponent(...)` 即可自动识别）；
- `proTable.value?.getTableList?.()` 的完全移除以 watch 驱动兜底；若 ProTable 内部有缓存/排序分页状态问题，保留 toggle 函数内调用即可（此为风险点，见下）。
- 删除 `handleRefresh` 前确认模板确实没有按钮引用（已核对模板无 ⟳ 按钮）。
- `shallowRef` 在 `kbPreviewRef`：其实例是真实组件实例，不影响性能；保留也可，或统一为 `ref`。

## 验证
- `vue-tsc --noEmit` 零错误；
- 在 List / Card / Table 三个视图中：
  - 点击 📖 → `openReadingLink` 正常；
  - 点击 Edit / Del / Open → 行为同旧；
  - 切换 role/priority/status/RICE chips → 结果列表立即更新；
  - 新建/编辑对话框 RICE 四元组 ↔ Final 双向同步；
  - Done 按钮过滤出 distilled/reviewed/archived 三类；
- 快捷键 `⌥1/2/3 ⌘N ⌥K ⌘K ⌘D` 保留（`⌘D` 原绑定 `toggleDashboardCollapse` 已删：映射为 no-op 或提示「面板已精简」，需处理）。
  → ⚠ 处理：`⌘D` 改为聚焦搜索以避免无效键，或保留 toggleDashboardCollapse 作为空函数（不抛错）。**方案：保留 `toggleDashboardCollapse` 为 no-op（一行 log/空实现），避免快捷键契约破坏**。

## 风险
| 风险 | 概率 | 处理 |
|---|---|---|
| 移除 `getTableList()` 手动调用后，Table 视图过滤键变化但 watch 深度丢失 | 中 | 用 `watch([()=>({...query}), riceFilterTier, viewMode], { deep:false })` + 手动 `JSON.stringify` 比对；若失败则回退保留手动调用 |
| `defineComponent` 定义的 RowActions 类型在模板中丢失 Props 推断 | 低 | 显式 `defineProps` 写成独立 SFC 私有子组件（仍在同文件通过片段写法：`<template #default>...</template>` 不行，Vue3 单文件单模板；改用渲染函数组件或在模板中直接使用组件传 props）。**实际方案**：由于单一 `<script setup>` 文件中定义第二个组件有工程限制，**退化为抽渲染 helper 组件 + 显式注册**；若仍困难则改为「将 4 按钮逻辑抽 3 行模板宏，按钮内部的删除/编辑函数调用保持不变」→ 减少代码重复但不强行组件化 |
| 快捷键 ⌘D 无响应 | 低 | 保留 `toggleDashboardCollapse` no-op |
| `filteredBy` 合并后与旧行为不一致（如 done-group 叠 tier 时） | 中 | 对 tier filter 场景单独验证：当 `done-group + elite` → 返回 状态 in done-group 集 **AND** tier === elite |
