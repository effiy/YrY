---
doc_type: module
prd_task_id: "YK-09-M17"
title: "YK-09-M17: 内容创作与编辑工具 — 开发方案"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 3.5
estimate_backend: 2.9
source_prd: "01-功能实现-内容创作与编辑工具.md"
source_okr: [yiknowledge-001]
related_tests: ["01-prd-test-内容创作与编辑工具"]
---

# YK-09-M17: 内容创作与编辑工具 — 开发方案

> 来源 PRD：[01-功能实现-内容创作与编辑工具.md](../../prds/2026-09/01-功能实现-内容创作与编辑工具.md)
> 需求编号：YK-09-M17 · 优先级：P1 · 人天：6.4d（前端 3.5 + 后端 2.9）
> 测试方案：[01-prd-test-内容创作与编辑工具.md](../../tests/2026-09/01-prd-test-内容创作与编辑工具.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、模块与接口契约](#sec-3)
- [四、组件清单](#sec-4)
- [五、数据流与状态机](#sec-5)
- [六、RPC 契约](#sec-6)
- [七、性能预算与体积控制](#sec-7)
- [八、实施路线图](#sec-8)
- [九、代码审查检查清单](#sec-9)
- [十、技术风险与回归预测](#sec-10)
- [十一、开发环境与验证方式](#sec-11)
- [十二、实现完成记录](#sec-12)
- [十三、已知缺口与技术债](#sec-13)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 分层结构

**编辑器核心层**：CodeMirror 6 + 扩展体系（Markdown 语言包、分屏预览、折叠、搜索替换、字数统计、快捷键绑定）。

**AI 增强层**：大纲生成（RAG 增强 Prompt）、内容改写/润色/扩展（三模式切换）、质量预检（章节完整性 + 链接有效性 + 代码语法）。

**协作层**：编辑锁提示（文件级，基于活跃 session 检测）、Git 三路合并、冲突标记高亮。

**内容管线层**：翻译管道（LLM 机翻 + 翻译记忆库 + 术语表 + 质量评分）、导出管道（unified/remark → PDF/EPUB/HTML/DOCX/LaTeX）、导入管道（格式检测 → Frontmatter 提取 → 内容转换）。

**模板与版本层**：模板引擎（5 种基础模板 + LLM 动态扩展）、版本管理（编辑历史快照 + 差异对比 + 版本恢复）。

### 1.2 目录与文件清单

全部新增文件位于 YiKnowledge 项目内，前端为静态站点增强脚本，后端经 YiAi RPC 通道。

```
YiKnowledge/
├── static/
│   ├── js/
│   │   ├── editor/
│   │   │   ├── index.ts              # CodeMirror 6 初始化 + 扩展注册
│   │   │   ├── extensions.ts         # 自定义扩展（大纲/字数统计/Frontmatter 面板）
│   │   │   ├── splitView.ts          # 分屏布局（50:50 默认，可拖拽 25%-75%）
│   │   │   ├── frontmatterPanel.ts   # 图形化 Frontmatter 编辑面板
│   │   │   └── toolbar.ts            # 快捷工具栏（加粗/斜体/链接/图片/表格）
│   │   ├── ai/
│   │   │   ├── outlineGenerator.ts   # AI 大纲生成（RAG 增强）
│   │   │   ├── contentAssistant.ts   # AI 改写/润色/扩展
│   │   │   └── qualityCheck.ts       # 质量预检（章节/链接/代码语法）
│   │   ├── collab/
│   │   │   ├── editLock.ts           # 编辑锁检测与提示
│   │   │   └── conflictResolver.ts   # Git 冲突标记解析与高亮
│   │   ├── pipeline/
│   │   │   ├── translate.ts          # 翻译管道 UI
│   │   │   ├── export.ts             # 导出管道 UI
│   │   │   └── import.ts             # 导入向导 UI
│   │   ├── template/
│   │   │   ├── engine.ts             # 模板引擎（5 种基础模板 + LLM 扩展）
│   │   │   └── marketplace.ts        # 模板市场 UI
│   │   └── version/
│   │       ├── history.ts            # 编辑历史管理
│   │       └── diff.ts              # 版本差异对比渲染
│   └── css/
│       ├── editor.css                # 编辑器样式
│       └── print.css                 # 打印/导出样式
├── templates/                        # 5 种基础文档模板（Markdown）
│   ├── requirement.md
│   ├── architecture.md
│   ├── postmortem.md
│   ├── howto.md
│   └── spec.md
└── curator/templates/                # 现有模板目录（复用）
```

YiAi 后端新增/扩展：

```
YiAi/
├── services/
│   ├── ai/
│   │   ├── writing_service.py        # AI 写作服务（大纲/改写/质量检查）
│   │   └── translate_service.py      # 翻译管道服务
│   ├── content/
│   │   ├── export_service.py         # 多格式导出服务
│   │   ├── import_service.py         # 导入管道服务
│   │   ├── template_service.py       # 模板 CRUD + 市场
│   │   └── version_service.py        # 版本历史 + 差异对比
│   └── collab/
│       └── lock_service.py           # 编辑锁管理
├── domain/
│   ├── content/
│   │   ├── export_pipeline.py        # 导出管道核心（unified/remark）
│   │   ├── import_pipeline.py        # 导入管道核心（格式检测 + 转换）
│   │   └── translation_memory.py     # 翻译记忆库 + 术语表
│   └── template/
│       └── template_engine.py        # 模板引擎 + LLM 动态扩展
└── data/
    └── collections/
        ├── edit_history              # 编辑历史记录
        ├── translation_memory        # 翻译记忆库条目
        └── templates                 # 用户模板 + 市场模板
```

---

<a id="sec-2"></a>
## 二、关键技术决策

PRD 已定义 8 项设计决策，本节补充实现层面的关键技术决策。

### D-01：CodeMirror 6 最小扩展集

仅加载必要扩展以控制体积：`@codemirror/lang-markdown`、`@codemirror/view`、`@codemirror/state`、`@codemirror/commands`（基础快捷键）、`@codemirror/search`（搜索替换）、`@codemirror/fold`（代码折叠）。总 gzip 约 150KB。

预览扩展独立打包，动态 `import()` 加载，不进首屏。

### D-02：预览渲染使用 unified/remark 管道

```
Markdown 源码 → remark-parse (MDAST) → remark-gfm (表格/任务列表) → remark-math (数学) → remark-rehype (HAST) → rehype-highlight (代码高亮) → rehype-stringify (HTML)
```

复用 YiKnowledge 静态站点既有的 unified 管道，避免引入第二套 Markdown 渲染器。

### D-03：编辑历史快照策略

每 30 秒自动快照 + 手动保存时快照。每个文件保留最近 50 个版本，超出自动清理。快照存储为完整文件内容（非增量差异），MongoDB `edit_history` 集合持久化。

### D-04：翻译记忆库存储格式

TMX（Translation Memory eXchange）标准格式存储，确保与主流 CAT 工具互操作。术语表以 CSV 格式维护（`source,target,domain`），MongoDB 双集合存储（`translation_memory` + `glossary`）。

### D-05：导出管道分流策略

小文档（< 50KB Markdown）前端 unified 管道直接渲染导出。大文档（≥ 50KB）走 YiAi 后端异步导出任务。PDF 导出使用 Puppeteer（后端 headless Chrome）+ 打印 CSS，确保中文字体嵌入。

### D-06：模板引擎仅服务端

模板数据存 MongoDB `templates` 集合。前端仅展示模板列表和预览，模板套用和 LLM 动态扩展均在后端完成，避免在前端暴露 Prompt 模板。

### D-07：编辑锁为软锁（advisory lock）

文件被打开编辑时，后端记录 `{file_path, user, session_id, acquired_at}`。其他用户打开同一文件时看到黄色提示"xxx 正在编辑此文件"。锁在用户关闭页面或 5 分钟无操作后自动释放。不做硬锁阻止编辑——知识库场景的协作密度不需要硬锁。

---

<a id="sec-3"></a>
## 三、模块与接口契约

### 3.1 CodeMirror 6 编辑器初始化

```typescript
interface EditorConfig {
  element: HTMLElement;
  initialValue: string;
  onChange: (value: string) => void;
  onSave: () => void;
  readOnly?: boolean;
  placeholder?: string;
}

interface EditorInstance {
  setValue: (value: string) => void;
  getValue: () => string;
  focus: () => void;
  destroy: () => void;
  // 扩展点
  addExtension: (ext: Extension) => void;
  removeExtension: (ext: Extension) => void;
}

function createEditor(config: EditorConfig): EditorInstance;
```

### 3.2 AI 写作助手

```typescript
interface WritingAssistantOptions {
  mode: "outline" | "rewrite" | "expand" | "polish";
  text: string;
  context?: { filePath: string; docType: string; ragResults?: RAGChunk[] };
}

interface WritingResult {
  original: string;
  result: string;
  diff?: DiffSegment[];  // 改写模式提供差异对比
  suggestions?: string[];
}

// RPC: services.ai.writing_service.generate
function generateContent(opts: WritingAssistantOptions): Promise<WritingResult>;
```

### 3.3 翻译管道

```typescript
interface TranslateRequest {
  content: string;
  sourceLang: string;
  targetLang: string;
  useTM: boolean;         // 是否使用翻译记忆库
  useGlossary: boolean;   // 是否强制术语表
  qualityThreshold: number; // 质量评分阈值，低于此值打回（默认 3.5）
}

interface TranslateResult {
  translated: string;
  qualityScore: number;   // BLEU + COMET 综合评分
  tmMatches: number;      // 匹配到的翻译记忆库条目数
  glossaryApplied: string[]; // 应用的术语列表
}

// RPC: services.ai.translate_service.translate
function translateContent(req: TranslateRequest): Promise<TranslateResult>;
```

### 3.4 版本管理

```typescript
interface VersionSnapshot {
  id: string;
  filePath: string;
  content: string;
  size: number;
  author: string;
  timestamp: string;
  message?: string;
}

// RPC: services.content.version_service.*
function saveSnapshot(filePath: string, content: string, author: string, message?: string): Promise<VersionSnapshot>;
function listSnapshots(filePath: string, limit?: number): Promise<VersionSnapshot[]>;
function getDiff(snapshotIdA: string, snapshotIdB: string): Promise<DiffResult>;
function restoreVersion(snapshotId: string): Promise<void>;
```

### 3.5 其余模块摘要

| 模块 | 核心接口 |
|------|---------|
| 导出管道 | `exportContent(filePath, format, options)` → `Blob`，格式：`pdf/epub/html/docx/latex`（大文档异步 `createExportTask` → `getExportStatus`） |
| 导入管道 | `importContent(file, targetDir, options)` → `ImportResult{detectedFormat, extractedFrontmatter, convertedContent, warnings}`，支持 Markdown 变体/HTML/DOCX |
| 模板引擎 | `listTemplates(category?)` / `applyTemplate(templateId, targetPath)` / `createTemplate(...)` / `marketplace.search(query)` |
| 编辑锁 | `acquireLock(filePath, user)` → `LockResult{success, currentHolder?}` / `releaseLock(filePath, user)` / `checkLock(filePath)` → `LockStatus` |
| Frontmatter 面板 | `parseFM(raw: string)` → `FrontmatterData` / `serializeFM(data: FrontmatterData)` → `string` / `validateFM(data)` → `ValidationResult` |

---

<a id="sec-4"></a>
## 四、组件清单

| 组件/模块 | 职责 | 关键行为 |
|----------|------|---------|
| `editor/index.ts` | CodeMirror 6 初始化 | 注册语言包、快捷键（Ctrl+S 保存、Ctrl+B 加粗）、主题 |
| `editor/extensions.ts` | 自定义扩展 | 大纲面板联动（滚动同步）、字数统计实时更新、Frontmatter 面板数据绑定 |
| `editor/splitView.ts` | 分屏布局 | 默认 50:50 左右分屏，拖拽分隔条调整比例（25%-75%），窄屏自动切换上下分屏 |
| `editor/frontmatterPanel.ts` | Frontmatter 图形化面板 | 表单控件（下拉/日期/标签输入），与 CodeMirror YAML 区块双向同步，实时校验 |
| `editor/toolbar.ts` | 快捷工具栏 | 加粗/斜体/链接/图片/表格/代码块，选中文本自动包裹 Markdown 语法 |
| `ai/outlineGenerator.ts` | AI 大纲生成 | RAG 搜索同类文档 → 构建 Prompt → SSE 流式返回大纲 → 层级编辑器展示 |
| `ai/contentAssistant.ts` | AI 改写/润色/扩展 | 选中文本 → 选择模式 → 流式返回结果 → 差异对比（改写模式） |
| `ai/qualityCheck.ts` | 质量预检 | 章节完整性（对照模板）、链接有效性（HEAD 请求）、代码块语法（highlight.js 解析） |
| `collab/editLock.ts` | 编辑锁 | 页面加载时 acquire → 定时心跳续期（每 2 分钟）→ 关闭时 release；检测到他人持锁显示黄色提示条 |
| `collab/conflictResolver.ts` | 冲突标记解析 | 解析 Git 冲突标记 `<<<<<<<`/`=======`/`>>>>>>>`，双侧差异可视化高亮 |
| `pipeline/translate.ts` | 翻译管道 UI | 选择目标语言 → 配置选项（TM/术语表/质量阈值）→ 预览结果 → 质量评分展示 |
| `pipeline/export.ts` | 导出管道 UI | 格式选择 → 配置选项（含封面/目录/页码）→ 进度条 → 下载 / 异步任务通知 |
| `pipeline/import.ts` | 导入向导 UI | 拖拽/选择文件 → 格式自动检测 → Frontmatter 提取预览 → 确认导入 → 结果报告 |
| `template/engine.ts` | 模板引擎 UI | 5 种基础模板预览 → 一键套用 → LLM 动态扩展开关 |
| `template/marketplace.ts` | 模板市场 | 模板搜索/浏览/安装/评分，Markdown 模板预览 |
| `version/history.ts` | 编辑历史列表 | 时间轴展示最近 50 个版本，点击预览对应版本内容 |
| `version/diff.ts` | 差异对比 | 双栏 diff 视图（参考 GitHub diff），差异行高亮（绿色新增/红色删除/黄色修改） |

---

<a id="sec-5"></a>
## 五、数据流与状态机

### 5.1 编辑器数据流

用户输入 → CodeMirror 6 `onChange` → 前端内存（未保存标记） → Ctrl+S / 自动保存（30s） → `callService` → YiAi `content_service.write_file`（参数：`target_file`、`content`）→ 写入文件系统 + 触发 KnowledgeWatcher 扫描 → 同时触发版本快照（`version_service.saveSnapshot`）

### 5.2 AI 大纲生成流程

用户输入主题 + 文档类型 → `writing_service.generate({mode: "outline"})` → 后端 RAG 搜索同类文档提取章节结构 → 构建 Few-shot Prompt → Ollama 流式生成大纲 → SSE 流式返回前端 → 层级编辑器展示 → 用户拖拽调整层级/增删章节 → 点击"应用"→ 插入编辑器

### 5.3 翻译管道流程

用户选择目标语言 → `translate_service.translate(content, targetLang, {useTM, useGlossary, qualityThreshold})` → 后端分词 → 匹配翻译记忆库（TMX，模糊匹配阈值 0.8）→ 强制替换术语表词汇 → LLM 翻译（注入匹配到的 TM 句段作为 Few-shot 上下文）→ BLEU + COMET 质量评分 → 返回结果 + 评分 → 评分 < 阈值时前端红色标记建议人工审阅

### 5.4 导出管道状态机

`idle → configuring`（用户打开导出对话框）→ `exporting`（点击导出）→ `completed`（渲染完成触发下载）/ `failed`（渲染异常）。大文档（≥50KB）走异步：`idle → configuring → task_created → polling`（轮询 `get_export_status`）→ `completed`/`failed`。

### 5.5 编辑锁生命周期

页面打开 → `acquireLock(filePath, user)` → 成功：绿色"正在编辑"标记；失败（他人持锁）：黄色"xxx 正在编辑"提示 → 每 2 分钟心跳续期 → 页面关闭/导航离开 → `releaseLock(filePath, user)` → 5 分钟无心跳 → 服务端自动释放

---

<a id="sec-6"></a>
## 六、RPC 契约

### 6.1 新增模块

| module_name | method_name | 参数 | 说明 |
|-------------|------------|------|------|
| `services.ai.writing_service` | `generate` | `{mode, text, context?}` | AI 大纲/改写/扩展/润色 |
| `services.ai.translate_service` | `translate` | `{content, source_lang, target_lang, use_tm, use_glossary, quality_threshold}` | 翻译管道 |
| `services.content.export_service` | `create_export_task` | `{target_file, format, options?}` | 创建异步导出任务 |
| `services.content.export_service` | `get_export_status` | `{task_id}` | 查询导出进度 |
| `services.content.import_service` | `import_content` | `{content, format, target_dir, options?}` | 导入内容 |
| `services.content.import_service` | `detect_format` | `{content}` | 检测导入格式 |
| `services.content.template_service` | `list_templates` | `{category?, search?}` | 模板列表 |
| `services.content.template_service` | `apply_template` | `{template_id, target_file}` | 套用模板 |
| `services.content.version_service` | `save_snapshot` | `{target_file, content, message?}` | 保存版本快照 |
| `services.content.version_service` | `list_snapshots` | `{target_file, limit?}` | 版本历史列表 |
| `services.content.version_service` | `get_diff` | `{snapshot_id_a, snapshot_id_b}` | 版本差异对比 |
| `services.content.version_service` | `restore_version` | `{snapshot_id}` | 恢复版本 |
| `services.collab.lock_service` | `acquire_lock` | `{target_file}` | 获取编辑锁 |
| `services.collab.lock_service` | `release_lock` | `{target_file}` | 释放编辑锁 |
| `services.collab.lock_service` | `check_lock` | `{target_file}` | 查询锁状态 |

### 6.2 复用现有 RPC

| module_name | method_name | 用途 |
|-------------|------------|------|
| `services.ai.chat_service` | `chat` | AI 写作助手的底层 LLM 调用（SSE 流式） |
| `services.knowledge.knowledge_service` | `search` | RAG 检索同类文档（大纲生成、翻译、内容助手） |
| `services.data.data_service` | `query_documents` | 查询编辑历史、翻译记忆库、模板数据 |
| `POST /write-file` | — | 编辑器保存文件（`target_file` 参数） |
| `POST /read-file` | — | 编辑器加载文件 |

> **参数名契约**：collection 参数必须用 `cname`，查询条件必须用 `filter`，文件路径必须用 `target_file`。

---

<a id="sec-7"></a>
## 七、性能预算与体积控制

### 7.1 前端体积

| 模块 | 大小（gzip）| 加载方式 | 首屏影响 |
|------|-----------|---------|---------|
| CodeMirror 6 核心 + Markdown | ~150KB | 静态导入 | +150KB |
| 编辑器扩展（大纲/字数/FM面板）| ~20KB | 静态导入 | +20KB |
| 预览渲染（unified/remark 管道）| ~80KB | 静态导入 | +80KB |
| AI 助手 UI（大纲/改写/质量检查）| ~15KB | 动态 import | 0KB |
| 翻译管道 UI | ~10KB | 动态 import | 0KB |
| 导出管道 UI | ~10KB | 动态 import | 0KB |
| 导入向导 UI | ~10KB | 动态 import | 0KB |
| 版本历史/差异对比 UI | ~15KB | 动态 import | 0KB |
| **合计首屏增量** | | | **~250KB** |

编辑器是核心体验入口，250KB 首屏体积可接受——CodeMirror 6 的 150KB 是无法绕过的基线。

### 7.2 后端性能指标

| 操作 | 目标延迟 | 备注 |
|------|---------|------|
| AI 大纲生成 | < 5s（RAG 增强模式）| 含 RAG 检索 + LLM 生成 + SSE 流式首字节 |
| AI 改写/润色 | < 3s | 选中段落通常 200-500 字 |
| 翻译（LLM） | < 10s/篇（3000 字）| 含 TM 匹配 + LLM 翻译 |
| 导出 PDF（小文档） | < 5s | Puppeteer 渲染 |
| 导出 PDF（大文档） | < 30s | 异步任务，后台处理 |
| 版本快照保存 | < 100ms | MongoDB 写入 |
| 版本差异对比 | < 500ms（2000 行）| 服务端 diff 算法 |

### 7.3 MongoDB 新增集合

| 集合 | 预估大小 | 索引 |
|------|---------|------|
| `edit_history` | ~100MB（500 文件 × 50 版本 × 4KB）| `{file_path: 1, timestamp: -1}` |
| `translation_memory` | ~50MB（5000 条句段 × 10KB）| `{source_lang: 1, target_lang: 1, source_hash: 1}` |
| `templates` | ~1MB（100 模板 × 10KB）| `{category: 1, created: -1}` |

---

<a id="sec-8"></a>
## 八、实施路线图

四个阶段依次递进，核心编辑体验先行。

### 阶段一：编辑器核心（P1，约 2.0d 前端 + 0.5d 后端）

| 任务 | 产出 | 人天 |
|------|------|------|
| CodeMirror 6 集成 | 编辑器初始化 + 扩展注册 + 主题 + 快捷键 | 0.7 |
| 分屏布局 | 左右/上下/仅编辑/仅预览四种模式 | 0.3 |
| Frontmatter 图形化面板 | 表单控件 + YAML 双向同步 + 实时校验 | 0.4 |
| 快捷工具栏 | 加粗/斜体/链接/图片/表格/代码块 | 0.3 |
| 图片拖拽/粘贴插入 | 自动保存到 images/ + 生成引用路径 | 0.3 |
| 后端文件读写 | 复用 `/read-file` + `/write-file` | 0.2 |
| 版本快照 | `version_service.saveSnapshot` + MongoDB `edit_history` | 0.3 |

### 阶段二：AI 写作助手（P1，约 0.5d 前端 + 1.2d 后端）

| 任务 | 产出 | 人天 |
|------|------|------|
| AI 大纲生成 | `writing_service.generate({mode: "outline"})` + RAG 增强 | 0.5 |
| AI 改写/润色/扩展 | `writing_service.generate({mode: "rewrite/polish/expand"})` | 0.4 |
| 质量预检 | 章节完整性 + 链接有效性 + 代码语法 | 0.3 |
| 前端 AI 助手 UI | SSE 流式展示 + 差异对比 + 模式切换 | 0.5 |

### 阶段三：内容管线（P1，约 0.5d 前端 + 0.7d 后端）

| 任务 | 产出 | 人天 |
|------|------|------|
| 模板引擎 | 5 种基础模板 + LLM 动态扩展 + 模板市场 UI | 0.5 |
| 导出管道 | unified/remark → PDF/EPUB/HTML/DOCX/LaTeX + 异步大文档导出 | 0.4 |
| 导入向导 | 格式检测 → Frontmatter 提取 → 内容转换 → UI | 0.3 |

### 阶段四：协作与翻译（P2，约 0.5d 前端 + 0.5d 后端）

| 任务 | 产出 | 人天 |
|------|------|------|
| 翻译管道 | LLM 翻译 + 翻译记忆库 + 术语表 + 质量评分 | 0.5 |
| 编辑锁 | 软锁获取/释放/心跳/自动过期 | 0.2 |
| Git 冲突标记解析 | 冲突检测 + 双侧差异高亮 + 可视化 | 0.2 |
| 编辑历史 + 差异对比 | 时间轴列表 + 双栏 diff 视图 | 0.1 |

**总计：6.4d（前端 3.5d + 后端 2.9d）**

---

<a id="sec-9"></a>
## 九、代码审查检查清单

### 编辑器核心

- [ ] CodeMirror 6 扩展仅加载必要项，gzip < 150KB
- [ ] 分屏布局在 ≥1024px 和 <1024px 下行为正确
- [ ] Frontmatter 面板与 YAML 源码双向同步，编辑一方另一方实时更新
- [ ] 图片拖拽/粘贴生成路径格式 `images/img-{timestamp}.{ext}`
- [ ] Ctrl+S 手动保存 + 30s 自动保存 + 导航离开未保存提示

### AI 写作助手

- [ ] 大纲生成时 RAG 检索同类文档并注入 Prompt
- [ ] SSE 流式返回不阻塞 UI，首字节 < 1s
- [ ] 改写模式显示原文与改写结果的差异对比
- [ ] 质量预检三项（章节/链接/代码）均有明确通过/失败状态

### 翻译管道

- [ ] 翻译记忆库模糊匹配阈值 0.8 生效
- [ ] 术语表词汇在翻译结果中强制替换
- [ ] 质量评分 < 3.5 时前端红色标记
- [ ] 未匹配到 TM 时降级为纯 LLM 翻译

### 导出/导入

- [ ] 导出 PDF 中文字体正确嵌入，不含 tofus
- [ ] 大文档（≥50KB）走异步导出，显示进度
- [ ] 导入格式检测准确率 > 95%
- [ ] 导入后 Frontmatter 完整性校验

### 协作

- [ ] 编辑锁心跳续期正常（每 2 分钟）
- [ ] 5 分钟无心跳自动释放
- [ ] 他人持锁时显示黄色提示条（含用户名）
- [ ] 页面关闭时锁正确释放

### 版本管理

- [ ] 手动保存 + 自动保存均触发快照
- [ ] 每文件最多保留 50 个快照
- [ ] 差异对比在 2000 行文件上 < 500ms

---

<a id="sec-10"></a>
## 十、技术风险与回归预测

### 10.1 技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| CodeMirror 6 与现有页面脚本冲突 | 中 | 高 | 编辑器作为独立入口页面加载，不注入全局脚本 | 降级为 textarea |
| IME 中文输入法 debounce 问题 | 高 | 中 | `compositionstart`/`compositionend` 事件监听，组合输入期间暂停预览更新 | 调整 debounce 延迟到 500ms |
| 大文档（>2000 行）编辑器卡顿 | 中 | 中 | CodeMirror 6 视口虚拟化 + 语法高亮增量解析 | 降级为纯文本模式 |
| LLM 大纲生成质量不稳定 | 中 | 中 | Few-shot Prompt + RAG 结构提取 + 领域模板约束 | 降级为仅基础模板 |
| HTML/DOCX 导入格式检测误判 | 低 | 中 | 分层检测：文件头魔数 → MIME 类型 → 内容特征 | 手动选择格式 |
| Puppeteer 导出 PDF 内存消耗大 | 中 | 高 | 单 Worker 串行处理，并发上限 3，超过排队 | 降级为 HTML 导出 |
| 编辑锁心跳丢失导致误释放 | 低 | 中 | 服务端 5 分钟宽限期 + 释放前连续 3 次心跳丢失确认 | 手动强制释放 |
| 版本快照 MongoDB 写入延迟 | 低 | 低 | 快照写操作异步化，不阻塞保存主流程 | 写入队列暂存内存 |

### 10.2 回归问题预测

| # | 问题 | 触发场景 | 预防措施 |
|---|------|---------|---------|
| 1 | 编辑器加载后现有 textarea 功能丢失 | 旧页面未迁移到新编辑器入口 | 编辑器独立路由，旧页面保持不变 |
| 2 | unified 管道渲染结果与旧渲染器不一致 | 使用不同版本的 remark 插件 | 锁定插件版本，添加渲染对比测试 |
| 3 | AI 生成内容覆盖用户已有内容 | 用户选中的区域包含内容但意图是替换 | 确认对话框 + 差异预览后再写入 |
| 4 | 翻译记忆库条目覆盖错误 | 模糊匹配跨越了不同领域的句段 | TM 增加 domain 字段，匹配时限定 domain |
| 5 | 导出 PDF 中文乱码 | CSS font-family 未指定中文字体 | 嵌入思源黑体子集，Puppeteer 渲染前等待字体加载 |
| 6 | 模板套用后 Frontmatter 覆盖用户已有值 | 模板的 Frontmatter 默认值与用户文件不一致 | 套用前预览变更，仅填充空字段 |

---

<a id="sec-11"></a>
## 十一、开发环境与验证方式

### 11.1 本地开发

```bash
# YiKnowledge 是静态 Markdown 库，编辑器作为静态页面或 YiVad 内嵌路由开发
# 1. 后端（YiAi 必须运行）
cd YiAi && python main.py

# 2. 前端静态服务器
cd YiKnowledge && python -m http.server 8899

# 3. 编辑器入口（开发阶段在 YiVad 中测试更高效）
cd YiVad && pnpm dev
# 访问 http://localhost:8848/#/knowledge/editor

# 4. 类型检查
pnpm exec vue-tsc --noEmit   # 如果编辑器在 YiVad 中实现
```

### 11.2 关键验证项

| 验证项 | 方法 |
|--------|------|
| CodeMirror 6 包体积 | `ls -lh dist/js/editor.*.js \| awk '{print $5}'`，验证 gzip < 150KB |
| Markdown 渲染一致性 | 同一文件在旧渲染器与新 unified 管道中渲染，diff HTML 输出 |
| AI 大纲生成质量 | 10 个不同领域的文档主题，人工评估大纲结构完整性（1-5 分） |
| 翻译质量 | 选取 5 篇中文文章翻译为英文，人工 BLEU + COMET 评分 + 术语一致性检查 |
| 导出 PDF 正确性 | 导出后打开 PDF 逐页对比：字体渲染、分页位置、目录链接 |
| 大文件性能 | 2000 行 Markdown 文件中编辑，监控输入延迟 < 50ms |
| 编辑锁并发 | 两个浏览器 Tab 同时打开同一文件，验证锁提示与释放 |

---

<a id="sec-12"></a>
## 十二、实现完成记录

> **状态**：需求已编写，尚未开始实施。
> **预计开始**：2026-09-16

### 12.1 产出清单（待填充）

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| 编辑器核心 | — | — |
| AI 写作助手 | — | — |
| 翻译管道 | — | — |
| 导出/导入管道 | — | — |
| 模板引擎 | — | — |
| 协作 | — | — |
| 版本管理 | — | — |
| **合计** | **0** | |

---

<a id="sec-13"></a>
## 十三、已知缺口与技术债

### 13.1 功能缺口

| # | 缺口 | 影响 | 现状 | 建议 |
|---|------|------|------|------|
| 1 | CRDT 实时协同编辑 | PRD 决策 5 列为远期规划 | 未实现，近期用 Git Merge + 编辑锁替代 | 1-2 年后评估协作密度再决定 |
| 2 | 协同审阅工作流（评论/批注/建议修改） | 多人审阅场景缺失 | 未实现（包含在 PRD 35 项原子需求中，本期未单独列出 RPC 接口） | 阶段四补充 |
| 3 | 定时发布调度 | 内容发布需手动操作 | 未实现 | 依赖 YiAi 后台任务队列（apscheduler 可复用） |
| 4 | 代码示例可运行性验证 | PRD 决策中列为需求 | 未实现，需要 Docker 沙箱执行代码 | 技术复杂度高，列为技术债 |
| 5 | 翻译记忆库种子数据 | TM 初始为空，冷启动期匹配率低 | 无种子数据 | 手工导入 200 条常用术语 + 句段 |

### 13.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | CodeMirror 6 扩展按需加载 | P2 | 0.3 | 当前所有扩展（Markdown/搜索/折叠）打包在一起；搜索/折叠可懒加载 | 待实施 |
| 2 | 大文档编辑性能优化 | P2 | 0.5 | 2000+ 行文档的语法高亮需增量解析 | 待实施 |
| 3 | 翻译记忆库模糊匹配优化 | P2 | 0.3 | 当前全量扫描匹配，条目 > 10K 时需引入向量索引 | 待实施 |
| 4 | 编辑历史快照增量存储 | P3 | 0.5 | 当前全量快照，文件 50KB × 50 版本 = 2.5MB/文件；增量存储可降低 70%+ 空间 | 待实施 |
| 5 | 导出管道 Worker 线程 | P3 | 0.5 | Puppeteer 渲染在主线程可能超时，独立 Worker 进程提高可靠性 | 待实施 |
| 6 | 模板版本化 | P3 | 0.2 | 模板更新后已套用的文档不受影响，需模板版本号追踪 | 待实施 |

---