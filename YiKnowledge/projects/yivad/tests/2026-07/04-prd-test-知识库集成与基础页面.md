---
doc_type: test
title: "YV-07-04: 知识库集成与基础页面 — 知识浏览 + RAG 聊天 + 数据/文件管理 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202607"
prd_task_id: "YV-07-04"
source_prds: ["04-prd-知识库集成与基础页面"]
source_modules: []
---
# YV-07-04: 知识库集成与基础页面 — 知识浏览 + RAG 聊天 + 数据/文件管理 — 测试规格

> 来源 PRD：[04-prd-知识库集成与基础页面.md](../../prds/2026-07/04-prd-知识库集成与基础页面.md)
> 提取日期：2026-09-11

---

### 4.3 边缘场景处理（Edge Cases）

| 场景 | 描述 | 处理策略 | 实现细节 |
|------|------|---------|---------|
| 知识树空目录 | YiKnowledge 中某角色目录下无任何 .md 文件 | `el-tree` 懒加载时，`resolve([])` 后设置 `node.isLeaf = true`，移除展开箭头 | `src/views/knowledge/KnowledgeTree.vue` 的 `loadNode` 中检查 `children.length === 0` |
| 知识文件 frontmatter 缺失 | 知识文件缺少 `title`/`tags`/`category` 等必需 frontmatter 字段 | `KnowledgeList` 中为该文件显示 `[缺少标题]` 占位符，`tags` 显示为空，`KnowledgePreview` 中显示 frontmatter 校验警告 | 使用可选链 `file.frontmatter?.title ?? '[缺少标题]'`，不阻断页面渲染 |
| 文件编码非 UTF-8 | 用户上传或编辑了一个 GBK 编码的文件 | `FileEditor` 在读取文件时检测编码（通过 `TextDecoder` 的 `fatal: true` 模式），非 UTF-8 文件提示用户"文件编码非 UTF-8，可能显示乱码" | `new TextDecoder('utf-8', { fatal: true }).decode(buffer)` + `catch` 降级为 `TextDecoder('gbk')` |
| 大文件编辑 (> 1MB) | 用户尝试编辑一个超过 1MB 的 markdown 文件 | CodeMirror 6 对 1MB+ 文件编辑性能下降（语法高亮解析耗时 > 500ms），前端检查文件大小，> 1MB 时降级为 `<textarea>` 编辑 | `FileEditor` 中 `if (content.length > 1024 * 1024) { useTextarea = true }` |
| RAG 检索无结果 | 用户问题与知识库内容不相关，BM25 + 向量检索均无匹配 | 显示"未找到相关知识，正在使用通用知识回答"，降级为普通 AI Chat（SSE 流式，不带引用） | `RagSearchResult` 组件中 `v-if="citations.length === 0"` 显示降级提示 |
| ProTable 筛选字段不存在 | 用户在 Bug 管理页面使用了 Issue 页面的筛选条件（如 `status=open`，但 Bug 集合无 `status` 字段） | 后端 `data_service.query_documents` 返回空列表，不报错。前端在 `useProTableFilter` 中为每个集合维护独立的 `filter` 状态 | 切换 `collection` 时调用 `resetFilters()` + `resetSort()`，`filters: Record<string, FilterState>` |
| 并发编辑同一文件 | 用户 A 和用户 B 同时编辑同一个知识文件 | 文件保存时检查 `mtime`（修改时间），如果后端返回的文件 `mtime` 与编辑开始时的 `mtime` 不一致，提示"文件已被他人修改，请刷新后重新编辑" | `FileEditor` 的 `save()` 中 `if (response.mtime !== originalMtime) { ElMessage.warning('文件已被他人修改') }` |
| ProTable 大数据量导出 | 用户在 10000 条数据中执行"导出全部" | ProTable 的 `features.export` 在数据量 > 1000 时弹出确认框"当前数据量较大，导出可能需要 30 秒，是否继续？"，分批导出（每批 500 条）为 CSV | `useProTableData` 中 `if (total > 1000) { await ElMessageBox.confirm(...) }`，`exportCSV` 使用 `Blob` + `URL.createObjectURL` |

---

## 五、测试规格

### Requirement: 知识库浏览

#### Scenario: 知识树加载
- **GIVEN** 用户访问知识库页面
- **WHEN** 页面加载
- **THEN** 左侧显示知识树（按 7 个角色目录组织：engineer/aier/producter/curator/analyst/leader/designer）
- **AND** 点击树节点懒加载对应目录的文件列表（首次展开时显示 loading 动画）
- **AND** 空目录节点标记为 leaf（无展开箭头）

#### Scenario: 知识树大数据量性能
- **GIVEN** 知识库有 500+ 个文件分布在 7 个角色目录下
- **WHEN** 用户展开多个目录节点
- **THEN** `el-tree` 虚拟滚动保持 60fps，无卡顿
- **AND** 知识树加载耗时 < 500ms

#### Scenario: 知识文件搜索
- **GIVEN** 知识文件列表已加载 200 条记录
- **WHEN** 用户在 ProTable 搜索框输入"RPC"
- **THEN** 文件列表实时过滤（200ms 防抖），仅显示标题/tags/分类包含"RPC"的文件
- **AND** 搜索结果高亮匹配关键词

#### Scenario: 知识文件预览
- **GIVEN** 知识文件列表中有一条 Markdown 文件
- **WHEN** 用户点击该文件
- **THEN** 弹出预览弹窗，Markdown 正确渲染（标题层级/代码块语法高亮/表格对齐/链接可点击）
- **AND** 代码块显示语言标签和复制按钮
- **AND** frontmatter 区域以结构化表单展示（title/tags/category/created/updated/status）

#### Scenario: 知识文件预览 XSS 防护
- **GIVEN** 知识文件内容包含 `<img src=x onerror="alert(document.cookie)"> `
- **WHEN** 用户预览该文件
- **THEN** `onerror` 属性被 DOMPurify 移除，图片标签保留但无事件处理器
- **AND** 不弹出 alert，不执行脚本

### Requirement: RAG 聊天

#### Scenario: 知识库范围选择
- **GIVEN** 用户访问 RAG 聊天页面
- **WHEN** 用户选择知识库范围为"仅 AI 工程师知识"（勾选 `aier/` 目录）
- **THEN** `RagKnowledgeSelector` 显示 7 个角色目录复选框，已选目录高亮
- **AND** 后续检索仅在该范围内进行（`filters: { paths: ['aier/'] }`）

#### Scenario: RAG 流式聊天 + 引用
- **GIVEN** 用户已选择知识库范围
- **WHEN** 用户输入"YiVad 的 RPC 协议格式是什么？"并发送
- **THEN** 先调用 `rag_service.query` 检索返回 5 条引用（含标题、相似度分数、文本摘录）
- **AND** 再通过 SSE 流式接收 AI 回复，逐 token 渲染
- **AND** 回复中的引用处以 `[1]` / `[2]` 标记，hover 显示引用详情卡片

#### Scenario: RAG 检索无结果降级
- **GIVEN** 用户问题"今天天气怎么样"与知识库完全无关
- **WHEN** 用户发送消息
- **THEN** `rag_service.query` 返回 0 条引用
- **AND** 显示提示"未找到相关知识，使用通用知识回答"
- **AND** 降级为普通 AI Chat（仅 SSE 流式，无引用标注）

#### Scenario: RAG 检索超时处理
- **GIVEN** YiAi 的混合检索（BM25 + 向量）因向量索引重建中导致响应超时
- **WHEN** 检索请求超过 5 秒未返回
- **THEN** 前端取消检索请求（`AbortController.abort()`）
- **AND** 显示"检索超时，正在使用通用知识回答，您可以稍后重试"
- **AND** 自动降级为普通 AI Chat

### Requirement: 数据管理

#### Scenario: ProTable CRUD 操作
- **GIVEN** 用户访问数据管理页面（Issue 管理）
- **WHEN** 用户点击"新增"按钮
- **THEN** 弹出新增表单（ProTableForm），表单字段根据 `columns` 配置中的 `editType` 动态生成（input/select/date/textarea）
- **AND** 填写后点击提交，`data_service.insert_document` API 调用成功
- **AND** 列表自动刷新，新记录显示在列表顶部
- **WHEN** 用户点击某行的编辑按钮
- **THEN** 弹出编辑表单，预填当前值
- **WHEN** 用户点击删除按钮
- **THEN** 弹出确认框 `ElMessageBox.confirm`，确认后调用 `data_service.delete_document`，列表刷新

#### Scenario: ProTable 筛选和排序
- **GIVEN** 数据列表已加载 200 条 Issue
- **WHEN** 用户选择筛选条件 `status=open`
- **THEN** 列表仅显示状态为 `open` 的 Issue，分页信息自动更新总条数
- **WHEN** 用户点击 `created` 列头两次（升序 → 降序 → 默认）
- **THEN** 列表按创建时间排序，排序图标 (`el-icon`) 正确指示排序方向

#### Scenario: ProTable 切换集合时筛选重置
- **GIVEN** 用户在 Issue 管理页面筛选了 `status=open`
- **WHEN** 用户切换到 Bug 管理页面
- **THEN** 筛选状态自动重置，Bug 列表显示全部数据
- **AND** 上一个集合的筛选条件不会影响新集合

### Requirement: 文件管理

#### Scenario: 文件树浏览
- **GIVEN** 用户访问文件管理页面
- **WHEN** 页面加载
- **THEN** 左侧显示文件树（按 YiKnowledge 目录组织，7 个角色子目录 + curator/ + projects/）
- **AND** 点击文件在右侧 CodeMirror 编辑器中打开
- **AND** 首次打开时自动检测文件类型并切换对应的语言模式（.md → Markdown, .json → JSON, .py → Python, .ts → TypeScript）

#### Scenario: 文件编辑保存
- **GIVEN** 用户已在编辑器中打开文件 `YiKnowledge/aier/prompts/chat-prompt.md`
- **WHEN** 用户修改内容（添加一行"## 新增内容"）并点击保存（`Ctrl+S` 快捷键）
- **THEN** 调用 `/write-file` API，文件保存成功
- **AND** `ElMessage.success('文件已保存')` 提示
- **AND** `Ctrl+S` 快捷键在 CodeMirror 编辑器聚焦时触发保存而非浏览器的"保存网页"

#### Scenario: 文件编辑并发冲突
- **GIVEN** 用户 A 打开文件编辑，5 分钟后用户 B 也编辑并保存了同一文件
- **WHEN** 用户 A 点击保存
- **THEN** 后端检查 `mtime` 发现文件已被修改
- **AND** 前端弹出警告"文件已被他人修改（用户 B 于 2 分钟前），请刷新后合并修改"
- **AND** 当前编辑内容不丢失（保留在编辑器中），用户可以复制内容后刷新页面重新编辑

---

