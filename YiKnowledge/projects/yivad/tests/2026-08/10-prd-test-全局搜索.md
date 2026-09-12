---
doc_type: test
title: "全局搜索 — 7 集合跨域全文检索 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
prd_task_id: "YV-08-10"
source_prds: ["10-prd-全局搜索"]
source_modules: []
---
# 全局搜索 — 7 集合跨域全文检索 — 测试规格

> 来源 PRD：[10-prd-全局搜索.md](../../prds/2026-08/10-prd-全局搜索.md)
> 提取日期：2026-09-11

---

### 4.7 边缘场景处理

| # | 场景 | 描述 | 处理策略 | 实现细节 |
|---|------|------|---------|---------|
| 1 | 并行搜索单路失败 | 5 路并行搜索中 `bugs` 返回 400，其他 4 路成功 | `Promise.allSettled` 替代 `Promise.all`，失败的集合在分组中显示 `⚠ 搜索失败` 标记 | `results.forEach(r => r.status === 'rejected' ? showError(col) : showResults(r))` |
| 2 | 中文输入法 composition | IME composition 期间 `input` 事件触发搜索 | `compositionstart` 时 `isComposing = true`，`compositionend` 时手动触发搜索 | `@input="if (isComposing) return"` |
| 3 | 正则特殊字符搜索 | 搜索 `C++` 或 `[BUG]`，`new RegExp(query)` 抛出 SyntaxError | 在 `new RegExp` 前转义特殊字符 | `query.replace(/[.*+?^${}()\|[\]\\]/g, '\\$&')` |
| 4 | localStorage 容量超限 | 搜索历史积累 2000+ 条，`setItem` 抛出 QuotaExceededError | 设置 `MAX_HISTORY = 50`，超过后 `slice(-50)` | `try { localStorage.setItem(...) } catch { /* 清理旧数据 */ }` |
| 5 | Ctrl+K 快捷键冲突 | macOS Firefox 中 `Ctrl+K` 打开"清除最近历史记录"对话框 | macOS 使用 `Cmd+K`：`const isMac = navigator.platform.includes('Mac')` | `(e.ctrlKey \|\| e.metaKey) && e.key === 'k'` |
| 6 | 跨集合 key 重复 | `bugs` 和 `issues` 都使用数字自增 key，`v-for` 的 `:key` 冲突 | 使用复合 key：`:key="\`${item.collection}-${item.key}\`"` | 确保跨集合唯一 |
| 7 | 搜索结果高亮 HTML 实体破坏 | 搜索 `<script>` 时 `&lt;` 实体被高亮标记破坏 | 先 `escapeHtml(text)` 转义所有实体，再插入 `<mark>` 标签 | `escapeHtml(text).replace(regex, '<mark>$1</mark>')` |
| 8 | 组件卸载后定时器触发 | `blurTimer` 和 `debounceTimer` 未在 `onUnmounted` 清除 | 在 `onUnmounted` 中清除所有定时器 | `clearTimeout(searchTimer); clearTimeout(debounceTimer); clearTimeout(blurTimer)` |
| 9 | 搜索结果中敏感数据泄露 | 搜索 "password" 或 "token" 返回包含敏感字段的文档 | 后端 `data_service` 在搜索时排除敏感字段（`password`、`token`、`secret`） | 后端 filter 中排除敏感字段索引 |
| 10 | Module 全量加载数据量大 | Module > 200 时 `getModuleList({ pageSize: 50 })` 不完整 | 改为 API 搜索：`getModuleList({ search: q, pageSize: 30 })` | 统一使用服务端搜索 |


## 六、测试规格

### 6.1 搜索功能

**TC-SEARCH-01: 基本搜索**
- GIVEN 数据库中有 Issue 和 Bug
- WHEN 输入 "login"
- THEN 结果显示匹配的 Issue 和 Bug，分组显示，标题中 "login" 高亮

**TC-SEARCH-02: 竞态控制**
- GIVEN 网络延迟 500ms
- WHEN 快速输入 "a" → "ab" → "abc"
- THEN 仅显示 "abc" 的搜索结果，"a" 和 "ab" 的结果被丢弃

**TC-SEARCH-03: 类型筛选**
- GIVEN 搜索结果显示 Issue(5) + Bug(3)
- WHEN 点击 "Issues" 筛选按钮
- THEN 仅显示 Issue 结果，分布条消失，显示 "Filtered by Issues" + Clear 按钮

**TC-SEARCH-04: 项目筛选**
- GIVEN 搜索结果包含多个项目
- WHEN 选择项目下拉中的 "Project A"
- THEN 仅显示 Project A 的结果

**TC-SEARCH-05: 排序切换**
- GIVEN 搜索结果
- WHEN 点击 "Recent" 排序
- THEN 结果按时间倒序排列

**TC-SEARCH-06: 可折叠分组**
- GIVEN 搜索结果显示 3 个分组
- WHEN 点击 "Issues" 分组头
- THEN Issues 结果折叠，Chevron 图标旋转，再次点击展开

**TC-SEARCH-07: 无结果**
- GIVEN 输入不匹配任何内容的搜索词
- WHEN 搜索完成
- THEN 显示 "No results for 'xxx'" + 搜索耗时 + 快速创建链接

**TC-SEARCH-08: 搜索建议**
- GIVEN 有历史搜索记录 ["login", "dashboard"]
- WHEN 聚焦搜索框（输入为空）
- THEN 显示最近 5 条搜索记录
- WHEN 输入 "log"
- THEN 过滤显示 "login"

### 6.2 键盘导航

**TC-SEARCH-09: 键盘导航**
- GIVEN 搜索结果显示 10 条
- WHEN 按 `↓` 3 次
- THEN 第 3 条高亮，自动滚动到可见区域
- WHEN 按 `Enter`
- THEN 导航到第 3 条链接

**TC-SEARCH-10: Ctrl+K 聚焦**
- GIVEN 用户在任意页面
- WHEN 按下 `Ctrl+K`（或 `Cmd+K`）
- THEN 搜索输入框聚焦（与命令面板共享快捷键，搜索页面优先）

### 6.3 安全

**TC-SEARCH-11: XSS 防护**
- GIVEN 搜索页面
- WHEN 输入 `<script>alert(1)</script>`
- THEN 搜索正常执行，`<script>` 被转义为 `&lt;script&gt;`，不执行脚本

### 6.4 持久化

**TC-SEARCH-12: URL 同步**
- GIVEN 搜索 "login"
- WHEN URL 变为 `?q=login`
- THEN 刷新页面后搜索框保留 "login"，自动执行搜索

**TC-SEARCH-13: 搜索历史**
- GIVEN 搜索 "login" 后关闭页面
- WHEN 重新打开搜索页面
- THEN "login" 出现在最近搜索中

---


## 边缘场景处理

| # | 场景 | 触发条件 | 处理策略 | 优先级 |
|---|------|---------|---------|--------|
| 1 | 5 路并行搜索中 bugs 集合返回 400 错误 | bugs 集合的 `filter` 参数中 `search` 字段映射错误 | 使用 `Promise.allSettled`，成功的 4 路正常展示，失败的集合在分组中显示 `⚠ 搜索失败` 标记 | P0 |
| 2 | 搜索词包含正则特殊字符导致 `highlight` 崩溃 | 用户输入 `C++`、`[BUG]`、`(WIP)` 等 | 在 `new RegExp` 前对搜索词进行转义：`query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` | P0 |
| 3 | 搜索词在 IME composition 期间触发搜索 | 用户输入中文拼音时每个字母都触发搜索 | 监听 `compositionstart`/`compositionend`，composition 期间跳过搜索 | P1 |
| 4 | 搜索结果中不同集合的 `key` 重复 | bugs 和 issues 都有 `key: "1"` 的条目 | 使用复合 key：`:key="\`${item.collection}-${item.key}\`"` | P1 |
| 5 | `localStorage` 搜索历史超限 | 2000+ 条搜索历史 + 其他 Pinia 持久化数据接近 5MB | 限制搜索历史最多 50 条，去重，存储前检查 `JSON.stringify` 大小 | P1 |
| 6 | `Ctrl+K` 在 macOS Firefox 中与浏览器快捷键冲突 | Firefox 使用 `Ctrl+K` 作为"清除历史记录" | 同时注册 `Ctrl+K` 和 `Cmd+K`，macOS 优先使用 `Cmd+K` | P1 |
| 7 | Module 搜索使用全量加载 + 本地过滤 | Module 数量 > 200 时前端过滤耗时 > 50ms | 当 Module 数量 > 200 时改用 API 搜索（`search` 参数），前端不再全量加载 | P2 |
| 8 | 搜索建议下拉在 `mousedown` 后 `blur` 事件关闭 | 移动端触摸事件导致 `blur` 先于 `click` 触发 | 使用 `@mousedown.prevent` 阻止默认，`@touchstart.prevent` 适配移动端 | P2 |
| 9 | 搜索结果中 `v-html` 高亮时 HTML 实体被破坏 | `title` 中包含 `&lt;script&gt;`，搜索 `<` 时实体被破坏 | 先 `escapeHtml(text)` 再 `replace(regex, '<mark>$1</mark>')` | P1 |
| 10 | 类型分布条中占比 0% 的类型不可见 | 某类型无搜索结果 | 设置最小宽度 2%（即使无结果也显示颜色条），确保用户知道该类型参与了搜索 | P2 |
| 11 | 用户快速切换排序时 `_idx` 重新计算 | 连续点击 Relevance → Recent → Relevance | 使用 `computed` 而非手动 `watch`，Vue 自动批处理，避免多次重算 | P2 |
| 12 | 搜索页面在 `keep-alive` 中缓存 | 用户离开搜索页后返回，搜索词和结果仍保留 | 组件 `onActivated` 中检查搜索结果是否过期（> 5min），过期则清空 | P3 |

---


## 扩展测试规格

### 6.5 搜索历史

**TC-SEARCH-14: 搜索历史去重**
- GIVEN 搜索历史中有 ["login", "dashboard", "login"]
- WHEN 搜索 "login"
- THEN 历史中旧的 "login" 被移除，新的 "login" 排在最前，历史变为 ["login", "dashboard"]

**TC-SEARCH-15: 搜索历史本地存储上限**
- GIVEN 搜索历史已有 50 条记录
- WHEN 执行第 51 次搜索
- THEN 历史保持 50 条，最早的一条被移除

### 6.6 边界情况

**TC-SEARCH-16: 搜索词包含正则特殊字符**
- GIVEN 搜索页面
- WHEN 输入 "C++" 并搜索
- THEN 正常搜索执行，不高亮崩溃，正则特殊字符被正确转义

**TC-SEARCH-17: 中文输入法 composition**
- GIVEN 用户使用中文输入法
- WHEN 输入拼音 "denglu"（composition 进行中）
- THEN 搜索不触发
- WHEN 确认输入 "登录"（compositionend）
- THEN 搜索正常触发

---

