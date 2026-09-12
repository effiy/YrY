---
doc_type: test
title: "Roadmap 路线图 — 多项目模块进度可视化 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
prd_task_id: "YV-08-11"
source_prds: ["11-prd-Roadmap路线图"]
source_modules: []
---
# Roadmap 路线图 — 多项目模块进度可视化 — 测试规格

> 来源 PRD：[11-prd-Roadmap路线图.md](../../prds/2026-08/11-prd-Roadmap路线图.md)
> 提取日期：2026-09-11

---

### 4.6 边缘场景处理（Edge Cases）

| 场景 | 描述 | 处理策略 | 实现细节 |
|------|------|---------|---------|
| Safari ISO 日期解析 | Safari 的 `Date.parse` 不支持 `YYYY-MM-DD` 格式，返回 `Invalid Date` | 使用 `dayjs` 统一日期解析：`dayjs(dateString).toDate()`，替换所有 `new Date()` 调用 | `import dayjs from 'dayjs'; dayjs(dateString).toDate()` |
| 空项目列 | 某项目没有关联的 Module，列中仅显示"No modules in this project" | 空列显示空状态组件，与整体空状态区分 | `v-if="col.items.length === 0"` → 显示列内空状态 |
| Module 进度无法达到 100% | `issue_keys` 中的 Issue 被删除后，分母仍包含已删除的 Issue | 删除 Issue 时 Hook 清理所有 Module 的 `issue_keys`：`$pull: { issue_keys: deletedKey }` | 后端 Hook: `modules_collection.update_many({"issue_keys": deleted_key}, {"$pull": {"issue_keys": deleted_key}})` |
| endDate < startDate | 数据录入错误导致截止日期早于开始日期 | `sort` 前过滤无效日期，对异常数据标记 `⚠ 日期异常` 并置顶显示 | `milestones.filter(m => m.startDate && !isNaN(dayjs(m.startDate).valueOf()))` |
| 甘特图单日项目 | `projectEnd === projectStart` 时 `duration = 0`，位置计算除零错误 | 添加分母保护：`Math.max(projectDuration, 24 * 60 * 60 * 1000)`（最小 1 天）+ `isNaN` 检查 | `const duration = Math.max(projectEnd - projectStart, 86400000)` |
| Issue 展示顺序错乱 | `issue_keys` 数组顺序与 MongoDB `$in` 查询返回顺序不一致 | 查询后按 `issue_keys` 顺序重排：`sorted = issue_keys.map(k => issueMap[k]).filter(Boolean)` | 在 `loadData` 中排序对齐 |
| 链式渲染闪烁 | `watch(projectId)` 触发了 3 次数据加载（project → module → issue → module progress），页面闪烁 | `Promise.all` 批量加载：`const [modules, issues] = await Promise.all([loadModules(id), loadIssues(id)])` | 改动 `loadData` 逻辑 |
| type 字段名不一致 | `modules` 集合用 `kind`，`issues` 集合用 `type`，统一过滤失败 | 后端搜索 API 统一字段映射：`{issue: 'issue_type', module: 'kind', bug: 'bug_type'}` | 根据 `collection` 自动映射字段名 |
| 右键菜单超出视口 | 鼠标靠近屏幕右边缘/底边缘时菜单被截断 | 使用 `Math.min(clientX, innerWidth - 200)` 和 `Math.min(clientY, innerHeight - 320)` 约束位置 | `x = Math.min(e.clientX, window.innerWidth - 200)` |
| 关联 Issue 非 Module 项目 | Module 的 `issue_keys` 中的 Issue 可能属于其他项目 | 仅在 `issue_keys` 在当前 `issues` 列表中存在的 Issue 才计入进度 | `const issue = issueMap.get(key); if (issue && issue.project_key === currentProjectKey) { ... }` |
| 搜索高亮残留 | 用户搜索后清除搜索框，`searchText` 清空但卡片的高亮样式未移除 | `computed` 中 `searchText` 为空时不在 title/detail 中标记高亮 span | `const highlight = (text: string) => searchText.value ? text.replace(new RegExp(searchText.value, 'gi'), '<mark>$&</mark>') : text` |
| 右键菜单在 iframe 中 | YiVad 嵌入 iframe 时，`document.click` 事件冒泡到父窗口，右键菜单无法关闭 | 使用 `window.addEventListener('blur', closeContextMenu)` 作为补充关闭手段 | `window.addEventListener('blur', closeContextMenu); onBeforeUnmount(() => window.removeEventListener('blur', closeContextMenu))` |
| Module kind 字段动态扩展 | 后续新增 `epic`/`initiative` 等 kind 类型时，颜色映射和图标映射缺失 | `KIND_COLORS` 使用 `Record<string, string>` 而非字面量联合类型，默认回退到 `#909399` (灰色) | `const color = KIND_COLORS[item.kind] ?? '#909399'` |

---


## 六、测试规格

### 6.1 数据加载

**TC-RM-01: 基本加载**
- GIVEN 数据库中有 3 个项目的 10 个 Module
- WHEN 进入 Roadmap 页面
- THEN 显示 3 列（按项目分组），每列包含对应 Module 卡片

**TC-RM-02: 进度计算**
- GIVEN Module A 关联 3 个 Issue（2 done, 1 in_progress）
- WHEN 加载 Roadmap
- THEN Module A 进度显示 67%（2/3），进度条颜色为蓝色（≥75% → 黄色 50-75%）

### 6.2 筛选

**TC-RM-03: 日期筛选**
- GIVEN 有 2026-08-01 和 2026-08-15 的 Module
- WHEN 选择日期 2026-08-01
- THEN 仅显示该日期范围内的 Module

**TC-RM-04: 文本搜索**
- GIVEN 有 Module "User Authentication" 和 "Payment Gateway"
- WHEN 输入 "auth"
- THEN 仅显示 "User Authentication"

**TC-RM-05: Kind 筛选**
- GIVEN kindFilter 激活 "module"
- WHEN 切换 el-check-tag
- THEN 仅显示 Module 类型的卡片

### 6.3 交互

**TC-RM-06: 右键菜单**
- GIVEN Roadmap 卡片存在
- WHEN 右键点击卡片
- THEN 右键菜单出现在鼠标位置，显示 8 个操作项

**TC-RM-07: 快速状态切换**
- GIVEN 右键菜单打开
- WHEN 点击 "Mark as Completed"
- THEN 调用 `moduleStore.editModule(id, { status: "completed" })`，卡片状态更新

**TC-RM-08: 列内排序**
- GIVEN 列中有 5 个 Module
- WHEN 点击排序下拉 → "By Progress"
- THEN Module 按进度降序排列

**TC-RM-09: 逾期高亮**
- GIVEN Module 截止日期为昨天，状态为 in_progress
- WHEN 加载 Roadmap
- THEN 卡片显示红色边框（`roadmap__item--overdue`）

**TC-RM-10: 清除筛选**
- GIVEN 已设置搜索词、日期筛选、Kind 筛选
- WHEN 点击 "Total" 统计 Pill
- THEN 所有筛选清除，显示全部数据

**TC-RM-11: 类型分布条渲染**
- GIVEN 有 10 个 Module（4 milestone, 3 phase, 2 sprint, 1 release）
- WHEN 加载 Roadmap
- THEN 分布条显示 4 个分段（milestone=40%, phase=30%, sprint=20%, release=10%），各段颜色与 kind 对应

**TC-RM-12: 右键菜单边界约束**
- GIVEN 浏览器窗口 1920x1080，鼠标在 (1900, 1000) 处右键
- WHEN 右键菜单弹出
- THEN 菜单出现在 (1720, 680) 位置（x 不超过 1720=1920-200, y 不超过 680=1000-320），不被截断

---

