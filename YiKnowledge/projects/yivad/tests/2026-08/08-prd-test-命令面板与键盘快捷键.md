---
doc_type: test
title: "命令面板与键盘快捷键系统 — Cmd+K 全局快速导航 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
prd_task_id: "YV-08-08"
source_prds: ["08-prd-命令面板与键盘快捷键"]
source_modules: []
---
# 命令面板与键盘快捷键系统 — Cmd+K 全局快速导航 — 测试规格

> 来源 PRD：[08-prd-命令面板与键盘快捷键.md](../../prds/2026-08/08-prd-命令面板与键盘快捷键.md)
> 提取日期：2026-09-11

---

### 4.4 边缘场景处理（Edge Cases）

| 场景 | 描述 | 处理策略 | 实现细节 |
|------|------|---------|---------|
| 输入框聚焦时触发快捷键 | 用户在 `<input>` 或 `<textarea>` 中按 `Cmd+K` 本想输入字符，却被快捷键拦截 | `globalKeydown` 中检查 `e.target.tagName`，输入元素中跳过快捷键：`if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) \|\| e.target.isContentEditable) return` | `globalKeydown` 函数入口处添加检查 |
| IME 输入状态 | 中文输入法 composition 期间的键盘事件不应触发快捷键 | 检查 `e.isComposing \|\| e.keyCode === 229`，IME 中跳过 | `if (e.isComposing \|\| e.keyCode === 229) return` |
| 搜索结果为空 | 用户搜索关键词无匹配的 Issue 或 Project | 显示 "No results for '{query}'" + 建议"尝试不同的关键词" | `v-if="resultGroups.every(g => g.items.length === 0)"` |
| Project 数据未加载 | 用户打开命令面板时 `projectStore.projects` 为空（首次访问） | 懒加载：`open()` 中检测 `projects` 为空时自动调用 `projectStore.fetchProjects()` | `if (projectStore.projects.length === 0) { await projectStore.fetchProjects({ pageSize: 100 }) }` |
| Issue 搜索 API 超时 | `getIssueList` 超过 5s 未返回 | `AbortController` 设置 5s 超时，超时后显示 "搜索超时，请稍后重试" | `const controller = new AbortController(); setTimeout(() => controller.abort(), 5000)` |
| 搜索防抖未清理 | 组件卸载时 `searchTimer` 仍在等待中，卸载后触发搜索回调 | `onUnmounted` 中 `clearTimeout(searchTimer)` | `onUnmounted(() => { clearTimeout(searchTimer); window.removeEventListener('keydown', globalKeydown) })` |
| `el-dialog` z-index 冲突 | Element Plus 的 `el-popover`/`el-dialog` 与命令面板的 z-index 竞争 | 命令面板设置 `:z-index="3000"`，高于 Element Plus 默认的 2000-2100 范围 | `el-dialog` 组件 `:z-index="3000"` |
| 搜索关键词包含正则特殊字符 | 用户输入 `*.test` 或 `(abc)` 等包含正则特殊字符的内容 | `highlight()` 中先转义正则特殊字符再构建 RegExp | `query.value.replace(/[.*+?^${}()\|[\]\\]/g, '\\$&')` |
| 屏幕边界处理 | 搜索结果很多时，面板可能超出屏幕底部 | 设置 `max-height: 60vh` + `overflow-y: auto`，结果列表内部滚动 | `.cmd-palette__results { max-height: 60vh; overflow-y: auto }` |
| 重复快速打开/关闭 | 用户快速按 `Cmd+K` 两次（打开→关闭→打开），`setTimeout` 聚焦可能延迟 | 使用 `nextTick` + `requestAnimationFrame` 确保在 DOM 渲染后聚焦 | `await nextTick(); requestAnimationFrame(() => { inputRef.value?.focus() })` |
| `destroy-on-close` 导致 autofocus 失效 | `el-dialog` 的 `destroy-on-close` 重新创建组件时 `autofocus` 不触发 | `@opened` 事件中手动聚焦：`nextTick(() => searchInputRef.value?.focus())` | `@opened="() => nextTick(() => searchInputRef.value?.focus())"` |
| 移动端键盘遮挡 | 移动端弹窗打开时虚拟键盘可能遮挡命令面板 | 命令面板固定在视口顶部 10% 位置，不受键盘影响 | `.cmd-palette { top: 10vh; max-height: 60vh }` |
| 搜索结果含重复 key | 两个不同实体（如 Issue 和 Module）有相同的 key | 使用组合 id（`iss-{key}` vs `mod-{key}`）区分，`v-for` 的 `:key` 使用完整 `item.id` | `id: \`iss-${issue.key}\``，`:key="item.id"` |
| 命令面板执行期间路由切换 | 用户在面板中选择导航项后，面板关闭但路由守卫中的异步操作导致面板短暂残留 | `close()` 中立即设置 `visible = false`，`action()` 中 `close()` 后再执行 `router.push` | `function executeCurrent() { const item = flatResults.value[activeIdx.value]; close(); closePromise.then(() => item.action()) }` |
| 浏览器原生 `Cmd+K` 行为 | Chrome 中 `Cmd+K` 默认聚焦地址栏，`preventDefault` 是否生效取决于事件阶段 | 在 `capture: true` 阶段监听，确保在浏览器默认行为前拦截 | `window.addEventListener('keydown', globalKeydown, { capture: true })` |
| CSS :focus-visible 样式丢失 | `el-dialog` 的 `focus-trap` 可能在 `@opened` 聚焦后再次抢夺焦点 | 添加 100ms 延迟避免与 focus-trap 竞争：`setTimeout(() => inputRef.value?.focus(), 100)` | `@opened="() => { setTimeout(() => searchInputRef.value?.focus(), 100) }"` |

---


## 六、测试规格

### 6.1 命令面板

**TC-CMD-01: 打开/关闭**
- GIVEN 用户在任意页面
- WHEN 按下 `Cmd+K`（Mac）或 `Ctrl+K`（Windows）
- THEN 命令面板打开，输入框自动聚焦
- WHEN 按下 `Esc` 或点击遮罩
- THEN 命令面板关闭，焦点返回到打开前的元素

**TC-CMD-02: Quick Actions 导航**
- GIVEN 命令面板打开，搜索框为空
- WHEN 使用 `↓` 键移动高亮到 "Open Kanban Board"
- THEN 该项高亮显示，背景色变为 `--el-color-primary-light-9`
- WHEN 按下 `Enter`
- THEN 面板关闭，路由跳转到 `/kanban`

**TC-CMD-03: Issue 搜索**
- GIVEN 命令面板打开
- WHEN 输入 "login"
- THEN 200ms 防抖后发起 Issue 搜索 API `getIssueList({ search: 'login', pageSize: 10 })`
- AND 防抖期间连续输入 "log"→"login"→"login-bug"，仅最后一次输入触发 API 调用
- THEN 结果列表显示匹配的 Issue（标题包含 "login"）
- THEN 匹配关键词被 `<mark>` 高亮（黄色背景）

**TC-CMD-04: Project 搜索**
- GIVEN 命令面板打开，Store 中有 10 个项目
- WHEN 输入项目名称片段
- THEN 匹配的 Project 立即显示（本地过滤，无 API 调用）
- AND DevTools Network 面板确认无新 API 请求
- THEN 过滤逻辑：`name.includes(query)` 或 `identifier.includes(query)`，大小写不敏感

**TC-CMD-05: 无结果**
- GIVEN 命令面板打开
- WHEN 输入不匹配任何内容的搜索词 "xyz123"
- THEN 显示 "No results for 'xyz123'"
- AND 显示建议文案 "尝试不同的关键词"

**TC-CMD-06: 鼠标交互**
- GIVEN 命令面板打开，显示搜索结果
- WHEN 鼠标 hover 某一项
- THEN 该项高亮显示，`activeIdx` 更新为 hover 项的索引
- WHEN 点击该项
- THEN 面板关闭，执行导航或操作

**TC-CMD-07: 输入框内不触发快捷键**
- GIVEN 用户正在 `<input>` 中编辑文本
- WHEN 按下 `Cmd+K` 本想输入字符 "K"
- THEN 快捷键不拦截，字符 "k" 正常输入到 input 中
- AND 命令面板不弹出

**TC-CMD-08: IME 输入不触发**
- GIVEN 用户使用中文输入法（IME），正在 composition 中
- WHEN 按下 `Cmd+K`
- THEN 检查 `e.isComposing === true`，快捷键不触发

**TC-CMD-09: 搜索 API 超时处理**
- GIVEN Issue 搜索 API 响应时间超过 5s
- WHEN 200ms 防抖后发起搜索，5s 后 AbortController 触发超时
- THEN 显示 "搜索超时，请稍后重试"
- AND 结果列表清空，返回 Quick Actions 视图

**TC-CMD-10: 组件卸载时防抖 timer 清理**
- GIVEN 命令面板打开，用户刚输入搜索词（防抖 timer 250ms 等待中）
- WHEN 路由切换导致组件卸载（`onUnmounted` 触发）
- THEN `clearTimeout(searchTimer)` 被调用
- AND 搜索回调不会在组件卸载后执行（控制台无 Vue warn）

### 6.2 安全

**TC-XSS-01: XSS 防护 — 搜索高亮转义**
- GIVEN 命令面板打开
- WHEN 输入 `<script>alert(1)</script>`
- THEN 搜索正常执行，`<script>` 标签被 `highlight()` 先转义为 `&lt;script&gt;`，再插入 `<mark>` 标签
- AND 渲染为文本 `<mark>&lt;script&gt;alert(1)&lt;/script&gt;</mark>`，不执行脚本

**TC-XSS-02: HTML 实体双重转义**
- GIVEN 数据库中 Issue 标题为 "Fix & Enhance login page"
- WHEN 搜索 "login"
- THEN `highlight()` 先将 `&` 转义为 `&amp;`，再将 `login` 高亮
- AND 渲染结果：`Fix &amp; Enhance <mark>login</mark> page`

---

