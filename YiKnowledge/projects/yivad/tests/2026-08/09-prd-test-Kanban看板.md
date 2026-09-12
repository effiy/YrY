---
doc_type: test
title: "Kanban 看板 — 拖拽式项目任务管理 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
prd_task_id: "YV-08-09"
source_prds: ["09-prd-Kanban看板"]
source_modules: []
---
# Kanban 看板 — 拖拽式项目任务管理 — 测试规格

> 来源 PRD：[09-prd-Kanban看板.md](../../prds/2026-08/09-prd-Kanban看板.md)
> 提取日期：2026-09-11

---

### 4.4 边缘场景处理（Edge Cases）

| 场景 | 描述 | 处理策略 | 实现细节 |
|------|------|---------|---------|
| 拖拽到非法列 | 用户拖拽 Issue 卡片到不存在的列（如通过 devtools 修改） | `drop` 事件中校验 `targetStatus` 在 `STATUSES` 白名单中 (`['backlog', 'todo', 'in_progress', 'review', 'done']`)，不在白名单则忽略 | `if (!STATUSES.includes(targetStatus)) { e.preventDefault(); return }` |
| Issue status 为 null | 历史数据的 `status` 字段可能为 `null` | 为 `null` 状态的 Issue 创建 `unknown` 列（显示为 "未分类"），放置在最后 | `const status = issue.status \|\| 'unknown'` |
| 移动端横向滚动 | 5 列横向排列在移动端溢出，iOS Safari 滚动条不可见 | 添加横向滚动指示器 `← 滑动查看所有列 →`，使用 `@supports (-webkit-overflow-scrolling: touch)` 检测 iOS | `el-scrollbar` + CSS `-webkit-overflow-scrolling: touch` |
| Firefox dragstart | Firefox 要求 `dragstart` 中必须调用 `e.dataTransfer.setData('text/plain', value)`，否则 `drop` 中获取不到数据 | 在 `dragstart` 中设置两种格式：`e.dataTransfer.setData('text/plain', issue.key)` + `e.dataTransfer.setData('application/json', JSON.stringify(issue))` | 统一在 `dragstart` 中设置 |
| 拖拽幻影透明 (Safari) | Safari 的拖拽幻影不继承 CSS box-shadow 和 border-radius | `dragstart` 中使用 `e.dataTransfer.setDragImage` 自定义拖动图像，clone DOM → append to body → setDragImage → remove | `const ghost = el.cloneNode(true); ghost.style.position = 'absolute'; document.body.appendChild(ghost); e.dataTransfer.setDragImage(ghost, 0, 0); setTimeout(() => ghost.remove(), 0)` |
| 乐观更新回滚闪烁 | API 失败时 Issue 卡片从新列跳回原列，视觉闪烁 | 使用 `nextTick` 延迟 UI 更新：先调 API，成功后更新 UI；拖拽期间显示 `opacity: 0.5` 占位卡片 | `await updateIssue(params); nextTick(() => { sourceCol.issues.splice(fromIdx, 1); targetCol.issues.push(issue) })` |
| 空列徽章显示 | `el-badge` 的 `value: 0` 时默认隐藏徽章，用户无法区分"0 个 Issue"和"未加载" | 设置 `el-badge` 的 `:hidden="false"` 或使用 `el-tag` 替代显示计数 | `<el-tag size="small">{{ issues.length }}</el-tag>` |
| 权限制约 | viewer 角色不应拖拽 Issue | `draggable` 属性绑定到 `v-auth="'issue:edit'"` 判断，无权限时 `draggable="false"` | `:draggable="hasPermission('issue:edit')"` |
| Issue 过滤后空列 | 日期筛选后某列 Issue 变为 0，显示空状态而非隐藏列 | 空列显示 "此状态下暂无 Issue" + 新增按钮（如有权限） | `v-if="column.issues.length === 0"` 显示空状态 |
| 保存排序偏好 | 用户刷新后列内排序重置 | `localStorage` 持久化排序偏好 `{ kanbanSort: { columnId: 'date' \| 'progress' \| 'name' } }` | `onMounted` 中读取 `localStorage` 恢复排序 |

---


## 六、测试规格

| # | 测试用例 | GIVEN | WHEN | THEN |
|---|---------|-------|------|------|
| TC-KANBAN-01 | 数据加载 | 数据库中有 50 个 Issue，分布在 5 个状态 | 进入 Kanban 页面 | 5 列显示对应状态的 Issue，统计面板显示正确计数（Total=50, Urgent=0, Done=X） |
| TC-KANBAN-02 | 拖拽变更状态 | "todo" 列有一个 Issue | 拖拽该 Issue 到 "in_progress" 列 | Issue 出现在 "in_progress" 列，`updateIssue({ status: "in_progress" })` API 被调用 |
| TC-KANBAN-03 | 拖拽失败回滚 | 网络断开（mock service worker 模拟） | 拖拽 Issue 到新列 | API 调用失败，Issue 回滚到原列，`ElMessage.error('状态更新失败')` |
| TC-KANBAN-04 | 右键菜单 | Kanban 卡片存在 | 右键点击卡片 | 右键菜单出现在鼠标 `(x, y)` 位置，显示 8 个操作项（Open/Preview/Copy ID/4个状态切换/Delete） |
| TC-KANBAN-05 | 日期筛选 | 有 2026-08-01 和 2026-08-15 的 Issue | 选择日期 2026-08-01 | 仅显示该日期范围内有 Issue 的列 |
| TC-KANBAN-06 | 搜索过滤 | 有 Issue "Login bug" 和 "Payment feature" | 搜索 "login" | 仅显示标题匹配 "login" 的 Issue 卡片 |
| TC-KANBAN-07 | 优先级过滤 | 有 urgent/high/medium/low 优先级的 Issue | 勾选优先级过滤 "urgent" | 仅显示 urgent 优先级的 Issue |
| TC-KANBAN-08 | 空列状态 | `todo` 列有 0 个 Issue | 查看该列 | 列头显示 `0` 计数（非隐藏），列体显示 "No issues in todo" 空状态 |
| TC-KANBAN-09 | 逾期高亮 | Issue 截止日期为昨天，状态为 `in_progress` | 查看 Kanban 卡片 | 卡片显示红色边框（`.kanban-card--overdue`），日期显示红色文字 + "Overdue" 标签 |
| TC-KANBAN-10 | 进度条 | 列中有 4 个 Issue（2 done, 2 todo） | 查看统计面板 | 完成率显示 50%，进度条 50% 填充 |

---

