---
doc_type: test
title: "YV-08-12: 自定义指令系统 — 8 个 Vue 3 指令的声明式行为增强 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
prd_task_id: "YV-08-12"
source_prds: ["12-prd-自定义指令系统"]
source_modules: []
---
# YV-08-12: 自定义指令系统 — 8 个 Vue 3 指令的声明式行为增强 — 测试规格

> 来源 PRD：[12-prd-自定义指令系统.md](../../prds/2026-08/12-prd-自定义指令系统.md)
> 提取日期：2026-09-11

---

### 5.3 边缘场景处理（Edge Cases）

| 场景 | 描述 | 处理策略 | 实现细节 |
|------|------|---------|---------|
| v-auth: store 未初始化 | 页面刷新后 `authStore` 权限列表为空，`v-auth` 在 `mounted` 时误移除按钮 | 在 `mounted` 中检查权限列表是否为空，为空时保留元素并添加类名 `v-auth-loading`（透明度 0.3 + pointer-events: none），权限加载完成后 `updated` 中重新检查 | `if (!authStore.authButtonListGet || Object.keys(authStore.authButtonListGet).length === 0) { el.classList.add('v-auth-loading'); return }` |
| v-auth: 权限变更后恢复 | 管理员提升用户角色后，已移除的按钮需恢复 | 在 `updated` 中检查是否曾被移除，若当前有权限则通过 `parentNode.insertBefore` 恢复元素 | `el._vAuthChecked && hasPermission → el.parentNode?.insertBefore(el._vAuthPlaceholder || el)` |
| v-copy: Clipboard API 不可用 | HTTP 环境或浏览器不支持 `navigator.clipboard.writeText` | 降级为 `document.execCommand('copy')` + 手动创建 textarea，再失败则显示手动复制提示 | 三级降级链：Clipboard API → execCommand → ElMessage.info('请手动复制') |
| v-copy: 复制内容动态变化 | `v-copy="dynamicRef"` 绑定的值在 `updated` 时需要同步 | `updated` 钩子中 `el._copyData = binding.value` | `updated(el, binding) { el._copyData = binding.value }` |
| v-waterMarker: Canvas 不可用 | 浏览器禁用 Canvas 或 Canvas 被指纹保护扩展拦截 | `mounted` 中 `try/catch` 包裹 Canvas 创建，失败时跳过水印（仅控制台 warn） | `try { canvas = document.createElement('canvas') } catch { console.warn('v-waterMarker: Canvas not available') }` |
| v-waterMarker: ResizeObserver 频繁重绘 | 窗口 resize 时每秒触发 60 次重绘，CPU 占用高 | 使用 `requestAnimationFrame` 节流：ResizeObserver 回调仅标记 `dirty = true`，在 rAF 中统一重绘 | `observer = new ResizeObserver(() => { dirty = true; requestAnimationFrame(() => dirty && redraw()) })` |
| v-debounce: 组件卸载后回调执行 | 用户输入后快速切换页面，debounce 的 `setTimeout` 在组件卸载后触发回调 | 在 `beforeUnmount` 中 `clearTimeout(el._debounceTimer)` | `beforeUnmount(el) { clearTimeout(el._debounceTimer) }` |
| v-draggable: touch 事件坐标 | 移动端 `touchmove` 事件的 `e.clientX` 为 `undefined` | 使用 `e.touches[0].clientX` 代替 | `const clientX = e instanceof TouchEvent ? e.touches[0].clientX : (e as MouseEvent).clientX` |
| v-draggable: 移动距离检测 | 用户点击（误触）时不应视为拖拽 | 仅在鼠标/触摸移动距离 > 3px 时开始拖拽 | `if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return` |
| v-longpress: 触摸滑动误触发 | 移动端用户触摸滑动时，误触发长按 | 添加移动距离阈值 10px：移动超过 10px 时取消长按计时器 | `if (Math.abs(e.clientX - startX) > 10 \|\| Math.abs(e.clientY - startY) > 10) clearTimeout(timer)` |
| v-longpress: IME 输入状态 | 中文输入法 compositionstart 期间不应触发长按 | 检查 `e.isComposing` 或 `keyCode === 229` | `if (e.isComposing) return` |
| v-sticky: overflow:hidden 父元素 | 父元素 `overflow: hidden` 阻止 sentinel 检测 | `resolveTarget()` 查找最近的非 static 祖先作为 `IntersectionObserver` 的 `root` | `while (parent) { if (getComputedStyle(parent).overflow !== 'visible') return parent }` |
| v-sticky: 参数类型转换 | `v-sticky="60"` (number) 和 `v-sticky="{ top: 60 }"` (object) | `normalizeOptions()` 参数归一化：`number → { top }`, `string → { top: parseInt }`, `boolean/undefined → {}` | `normalizeOptions(value) { if (typeof value === 'number') return { top: value }; ... }` |
| v-throttle: 快速点击 disabled 未恢复 | `disabled` 属性在 1000ms 后需恢复，但用户已切换页面 | `beforeUnmount` 中恢复 `el.disabled = false` + `clearTimeout` | `beforeUnmount(el) { el.disabled = false; clearTimeout(el._throttleTimer) }` |

---


## 八、测试规格

### 8.1 单元测试

| # | 测试用例 | 输入 | 预期输出 |
|----|---------|------|----------|
| 1 | `v-auth` 无权限时移除元素 | `v-auth="'nonexistent'"` | `el` 被 `remove()` |
| 2 | `v-auth` 有权限时保留元素 | `v-auth="'existing_permission'"` | `el` 未被移除 |
| 3 | `v-auth` 数组权限全部满足 | `v-auth="['p1', 'p2']"`，当前角色有 `['p1','p2','p3']` | `el` 未被移除 |
| 4 | `v-auth` 数组权限部分满足 | `v-auth="['p1', 'p2']"`，当前角色有 `['p1']` | `el` 被移除 |
| 5 | `v-copy` 点击复制 | `v-copy="'test'"` → click | `navigator.clipboard.writeText` 被调用 |
| 6 | `v-debounce` 快速点击 | 连续 5 次 click，间隔 < 500ms | `binding.value` 仅调用 1 次 |
| 7 | `v-throttle` 快速点击 | 连续 5 次 click，间隔 < 1000ms | `binding.value` 仅调用 1 次 |
| 8 | `v-longpress` 长按 1000ms | mousedown → 等待 1000ms | `binding.value` 被调用 |
| 9 | `v-longpress` 提前松开 | mousedown → 500ms → mouseup | `binding.value` 未被调用 |
| 10 | `v-sticky` 参数归一化 | `v-sticky="60"` | 解析为 `{ top: 60 }` |

### 8.2 集成测试

| # | 测试用例 | 操作 | 预期结果 |
|----|---------|------|----------|
| 1 | 权限变更后指令响应 | 切换路由，权限列表变化 | 新页面的 v-auth 指令正确执行 |
| 2 | v-draggable 边界约束 | 拖拽元素到父容器边缘 | 元素不超出父容器边界 |
| 3 | v-sticky 滚动检测 | 滚动页面使元素到达 top 位置 | 元素添加 `is-stuck` 类 |
| 4 | 指令内存清理 | 组件卸载 | 所有 timer/observer/listener 被清理 |

### 8.3 BDD 场景

#### Requirement: v-auth 按钮级权限控制

**Scenario: 有权限时正常渲染元素**
- **GIVEN** 当前用户角色为 `admin`，权限列表包含 `user:manage`
- **WHEN** 组件渲染 `<el-button v-auth="'user:manage'">删除用户</el-button>`
- **THEN** 指令在 `mounted` 时检查 `authStore.buttonList.includes('user:manage')`
- **AND** 权限校验通过，元素正常渲染

**Scenario: 无权限时移除 DOM 元素**
- **GIVEN** 当前用户角色为 `viewer`，权限列表不含 `user:manage`
- **WHEN** 组件渲染 `<el-button v-auth="'user:manage'">删除用户</el-button>`
- **THEN** 指令检测到权限缺失，调用 `el.remove()` 从 DOM 中移除元素
- **AND** 记录 WARNING 日志：`[Directive] v-auth: removed element, permission="user:manage" not found`
- **AND** 后端仍有独立的权限校验（前端移除仅做 UI 控制，不替代后端安全）

**Scenario: 权限数组匹配（满足任一即可）**
- **GIVEN** 当前用户权限列表包含 `project:view` 但不包含 `project:edit`
- **WHEN** 组件渲染 `<el-button v-auth="['project:view', 'project:edit']">查看项目</el-button>`
- **THEN** 指令以数组模式匹配，`project:view` 命中
- **AND** 元素正常渲染

#### Requirement: v-sticky 粘性定位与状态感知

**Scenario: 元素到达粘性位置时添加状态类**
- **GIVEN** 元素设置了 `v-sticky="{ top: 60 }"`
- **WHEN** 用户向下滚动页面，元素的 `IntersectionObserver` 检测到元素触发 top 边界
- **THEN** 指令添加 CSS 类 `is-stuck` 到元素
- **AND** 元素应用粘性样式（阴影、z-index 提升）

**Scenario: 元素离开粘性位置时移除状态类**
- **GIVEN** 元素当前处于粘性状态（`is-stuck` 类已添加）
- **WHEN** 用户向上滚动，`IntersectionObserver` 检测到元素离开 top 边界
- **THEN** 指令移除 `is-stuck` 类
- **AND** 元素恢复原始样式

---

