# Reading List：去除 List 视图 · 增强 Table 视图 — 实施方案

## 仓库调研结论

当前 `readingList.vue` 三视图：List（166 行模板）/ Card / Table。
- **List 视图价值**：本质是「水平紧凑行」，与 ProTable 在信息量、紧凑度、视觉结构上完全重叠（同样的 key/title/owner/dim/type/rice/scheduled/status/progress/actions），属于冗余形态。
- **Table 现状**：仅 12 列、page-show=false、search-show=false，大量字段（Author 未 tooltip 截断、Summary 无预览、Tags/OKR/Deadline/Notes Key/更新热度/维度色条）未暴露；过滤交互散落在页面其他组件，导致 Table 自身交互能力未充分使用。
- **目标**：
  1. 完全删除 List 视图与入口（含模板块、视图切换 ⌥1、快捷键映射、`RowActions variant="list"` 分支、ReadingLinkTag list size 场景）；
  2. 把 List 视图「紧凑 + 可横向扫视」的优点迁移到 Table：新增 7 列 + 可排序 + 列设置 + 分页 + 内嵌过滤搜索面板 + 悬浮工具提示（Summary/Tags/OKR Anchor 跳转）。

## 文件与模块
仅改 2 个文件：
- `YiVad/src/views/knowledge/executive/readingList.vue`：模板 + 脚本
- `YiVad/src/views/knowledge/executive/styles/readingList.scss`：Table 增强样式（新增 `.rl-table-enhance` 相关 token，保持语义化无数字）

## 实施步骤（依赖顺序）

1. **删除 List 视图**
   - 移除模板 §5.1（`<ul v-if="viewMode === 'list'">` 整块，约 20 行）。
   - 视图切换 Radio Group 里去掉 `List · ⌥1` 按钮，保留 `Card · ⌥1`、`Table · ⌥2`（原 ⌥3 变 ⌥2）以保持双视图布局。
   - 快捷键：`⌥1` 改为 Card、`⌥2` 改为 Table；`⌥3` 保留为 no-op（注释：原 List 已移除）。
   - `viewMode` 默认值从 `"list"` → `"table"`（以表格为主视图）。
   - 删除 RowActions 组件 `variant === "list"` 分支（删除对应 wrapperClass `rl-list__actions`）。

2. **视图切换语义化**
   - `currentViewLabel` 计算属性同步更新（只有 card / table）。
   - `onViewModeCmd` 参数联合类型 `"list" | "card" | "table"` → `"card" | "table"`，viewMode 声明同步收窄。

3. **Table 列增强：新增 7 列 + 收窄 2 列 + 默认排序**
   新 columns 定义（使用 ColumnProps render/枚举/搜索 能力）：
   | 列 | prop | 宽度 | 渲染/交互 |
   |---|---|---|---|
   | Index | type=index | 60 | 行号，便于讨论锚点 |
   | Key | key | 100 | 直接显示 key，H 锚点跳转 |
   | Title | title | 440 | 已存在，subtitle + ReadingLinkTag + 悬浮 Summary tooltip（el-tooltip 包一层）|
   | Author | author | 150 | showOverflowTooltip，已存在，保留 |
   | Type | type | 100 | 已存在，tag:true |
   | Status | status | 130 | tag:true；新增「蒸馏进度条小版」render(scope) 显示 progress 微条 |
   | Priority | priority | 100 | 已存在，tag:true；新增 sortable（high→low） |
   | Dimension | dimension | 140 | **增强**：左侧 4px 色条（dimension 颜色 token）+ 中英文 label；可 sortable |
   | Owner | ownerRole | 160 | 角色 avatar 色块 + label（利用 meta.roles[i].color 做小圆点） |
   | RICE | rice | 170 | **增强**：final 数字 + R/I/C/E 四小方块（mini heatmap），tier 色；sortable |
   | Progress | progress | 180 | 保留；新增 progress 数字悬浮显示 |
   | OKR | okrId | 130 | 存在则可点击 → 走 anchorToEntity/`openAnchor(okrId)`；无则 "—" |
   | Scheduled | scheduledMonth | 120 | 保留；新增「距排期月剩余天数」悬浮 |
   | Tags | tags | 180 | 用 el-tag xs 级联，超出 2 个显示 +N；悬浮 tooltip 展开全部 |
   | Updated | updatedAt | 140 | 保留 + 新增「Age 热度分级」色标签（<7d=success / <30d=warning / else=info） |
   | Actions | operation | 200 | 保留，`fixed="right"`，宽度扩展 |

4. **Table 交互增强**
   - `search-show` 由 false → **true**，启用 ProTable 内置搜索表单；为 6 个核心列声明 `search: { el, label, props }`：
     - title：input，"Title/关键词"；
     - author：input；
     - type：select，枚举 meta.types；
     - status：select，枚举 meta.statuses；
     - priority：select；
     - dimension：select，枚举 meta.dimensions；
     - ownerRole：select，枚举 meta.roles；
     - scheduledMonth：date-picker（month 模式）。
   - **ColSetting 启用**：`columns` 中除 title/operation 全部标记 `isSetting: true`，允许用户显示/隐藏；`ProTable` 默认即开启列设置，不需要额外参数。
   - **分页启用**：`page-show=true`（原 false），`pageSize` 默认 20，可选 10/20/50/100；通过 `tableFetch` 的 params.pageNum/pageSize 切片（因数据量小走前端）。
   - **默认排序**：columns 中 rice / priority / updatedAt 用 `sortable: "custom"` + `sort-orders: ['descending', 'ascending', null]`；用 ProTable 自带 sort-change 事件在 `tableFetch` 内走前端稳定排序。
   - **Stripe + border**：启用 `stripe` `border`。

5. **Table 数据接口重写**
   - 现有 `tableFetch(params)`：把 `searchParam`（ProTable 内部搜索字段）、分页、排序参数合并进 store.filter，保持与 filteredBy 逻辑一致（done-group + tier 过滤），实现搜索/分页/排序 SSOT。
   - 因为走前端排序和分页，store.filter 先做全量结果，再根据参数切片。
   - 保留 `template #title/#rice/#progress/#scheduled/#updatedTime/#operation` 插槽，新增 `template #okr/#tags/#dimension/#owner/#priority/#status` 渲染插槽（或使用 `render`，两种方式择一：优先使用 **render 函数**以便 TS 类型安全和可测）。

6. **样式补充（readingList.scss）**
   - `.rl-table-enhance` 范围（挂到 ProTable 外层）：
     - `.rl-row-index`、`.rl-dim-chip`、`.rl-role-chip`、`.rl-rice-mini`、`.rl-tags-row` 类；
     - RICE 四小方块颜色对应 reach/impact/confidence/effort 语义 token（如 `--rl-rice-reach`= accent，注意不要用数字）。
     - Table 悬浮行背景微调；OKR 列 link 样式（underline-on-hover）。
   - 确保所有 CSS 变量名无数字，全部语义化。

7. **快捷键与契约收尾**
   - ⌥1 → Card；⌥2 → Table；⌥3 no-op 注释保留；`⌘N/⌘D/⌥K/⌘K` 保持不变。
   - `RowActions` 组件 variant 枚举收窄为 `card|table`。
   - ReadingLinkTag size="sm" 场景仍用于 Table Title 列，保留。

8. **验证**
   - TS 校验 `readingList.vue` 零错误；
   - 视觉抽查：
     - 视图切换只有 Card/Table；默认落到 Table；
     - Table 分页/搜索栏正常展示 + 触发后数据更新；
     - 新增 OKR/Tage/Dimension/Owner 列渲染正常；
     - 列设置面板能隐藏/显示非关键列；
     - 排序（RICE desc / priority high first / updatedAt recent）正常。

## 依赖与注意事项
- 严格不新增文件（单入口组件脚本约束）；
- ColumnProps 中 `render` 返回的 VNode 使用已导入的 h/ElTag/ElProgress 等（全局注册 / 手动导入均 OK，项目已有 element-plus auto-import）；
- ProTable 列的 enum、search、sortable、tag 属性与模板插槽优先级：render 优先于 slot；为一致性，所有列增强（除 Title 外）统一走 `render: (scope) => VNode`，**取消** `#xxx` 模板插槽，减少散列；
- `page-show=true` 场景下 store.filter 返回全量后需要在 `tableFetch` 内基于 `pageNum/pageSize` 切片，并更新 `total`；
- ReadingLinkTag/RowActions 仍保留（Card + Table 都用）；
- 过滤条（§3 All/Reading/Done/High/RICE≥80 + Role chips）与 ProTable 内部搜索字段的关系：**外部 chips 仍为 SSOT**，写入 `query`；ProTable searchForm 作为**附加过滤**，合并为最终过滤条件（合并时不冲突，query 优先级更高，避免两个入口状态打架）。实现：`tableFetch` 时把 ProTable 传入的 searchParam 读入 → 和全局 query 做 AND 合并 → 调用 store.filter → 排序 → 分页切片。

## 验证
- `yarn type:check`，确认 readingList.vue 无新错误；
- 浏览器手动：
  - 打开 readingList 页 → 默认视图是 Table；视图切换无 List 按钮；
  - ⌥1 / ⌥2：分别切 Card / Table；⌥3 不报错；
  - ProTable 搜索表单：按 title=卓 应能匹配《卓有成效的管理者》等样本条目；
  - 列设置：隐藏 Scheduled / Tags → 列消失；恢复正常；
  - 排序列标题：点击 RICE 列头 → 列表按 rice.final 降序；
  - 分页：数据超过 20 条时第 2 页可用；
  - OKR 列：点击 exec-002-03 → 触发 `openAnchor("exec-002-03")`，弹框出现；
  - 操作列：📖 Open/Edit/Del 行为回归同旧。

## 风险
| 风险 | 概率 | 处理 |
|---|---|---|
| ProTable search-show=true 时 searchParam 键名与全局 query 重名冲突 | 中 | 把 ProTable search.key 加前缀（如 `_t_`）或在 fetch 内显式提取非空字段合并；若冲突则优先取全局 query（SSOT 一致性）|
| sortable=custom 触发 sort-change 但 tableFetch 未接收排序参数 | 中 | 先用 ProTable 默认客户端 sortable（true）对 `rice.final / priority / updatedAt` 启用；若失败再切 custom |
| 隐藏 List 后，快捷键 `⌥1` 映射改变打破肌肉记忆 | 低 | Header 版本号 `v3.3` → `v3.4 · Table-first`，并在快捷键说明段落注明 List 视图已移除 |
| 分页后 `visibleItems` 与 KPI 条不一致 | 低 | KPI 仍基于 `store.stats`（全量），不受分页影响；正确 |
