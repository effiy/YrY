---
doc_type: test
title: "M17: 内容创作与编辑工具 — 测试用例"
status: 待开始
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-M17"
source_prds: ["01-功能实现-内容创作与编辑工具"]
source_modules: ["01-prd-task-内容创作与编辑工具"]
source_okr: [yiknowledge-001]
---

# M17: 内容创作与编辑工具 — 测试用例

> 来源 PRD：[01-功能实现-内容创作与编辑工具.md](../../prds/2026-09/01-功能实现-内容创作与编辑工具.md)
> 开发方案：[01-prd-task-内容创作与编辑工具.md](../../devs/2026-09/01-prd-task-内容创作与编辑工具.md)
> 需求编号：YK-09-M17 · 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 目录

- [一、测试范围与目标](#sec-1)
- [二、测试策略](#sec-2)
- [三、测试环境与前置条件](#sec-3)
- [四、准入与准出标准](#sec-4)
- [五、单元测试](#sec-5)
- [六、集成测试](#sec-6)
- [七、端到端场景](#sec-7)
- [八、性能验收测试](#sec-8)
- [九、缺陷分级与处理流程](#sec-9)
- [十、自动化现状与缺口](#sec-10)

---

<a id="sec-1"></a>
## 一、测试范围与目标

### 1.1 在范围内

| 范围 | 内容 |
|------|------|
| 编辑器核心 | CodeMirror 6 初始化、Markdown 语法高亮、快捷键绑定、分屏布局、Frontmatter 面板、快捷工具栏、图片拖拽/粘贴 |
| AI 写作助手 | 大纲生成（RAG 增强）、改写/润色/扩展、质量预检（章节完整性 + 链接有效性 + 代码语法） |
| 翻译管道 | LLM 翻译、翻译记忆库匹配、术语表强制替换、质量评分（BLEU + COMET） |
| 导出管道 | unified/remark → PDF/EPUB/HTML/DOCX/LaTeX，大文档异步导出（≥50KB） |
| 导入管道 | 格式检测（Markdown 变体/HTML/DOCX）、Frontmatter 提取、内容转换 |
| 模板引擎 | 5 种基础模板套用、LLM 动态扩展 |
| 协作 | 编辑锁获取/释放/心跳/过期、Git 冲突标记解析 |
| 版本管理 | 快照保存/列表/差异对比/恢复 |
| 非功能需求 | 性能阈值、体积预算（CodeMirror 6 gzip < 150KB） |

### 1.2 不在范围内

| 排除项 | 原因 |
|--------|------|
| CRDT 实时协同编辑 | PRD 决策 5 列为远期规划（1-2 年） |
| 代码示例可运行性验证（Docker 沙箱） | 技术复杂度高，列为技术债 |
| 定时发布调度 | 依赖后台任务队列，独立需求 |
| 现有 textarea 编辑器的回归 | 编辑器作为独立页面入口，旧页面保持不变 |

### 1.3 测试目标

| 目标 | 判定 |
|------|------|
| 功能完整性 | 14 个功能模块全部有覆盖 |
| 核心路径自动化 | 编辑器核心 + AI 助手 + 导出管道有自动化测试 |
| 性能达标 | CodeMirror 6 gzip < 150KB，大纲生成 < 5s（RAG 模式） |

---

<a id="sec-2"></a>
## 二、测试策略

| 层级 | 框架 | 覆盖范围 | 占比 |
|------|------|---------|------|
| 单元测试 | Vitest | CodeMirror 扩展函数、Frontmatter 解析/序列化/校验、模板引擎、翻译记忆库匹配逻辑 | 40% |
| 组件测试 | Vitest + jsdom | 编辑器组件、分屏布局、Frontmatter 面板、快捷工具栏 | 25% |
| 集成测试 | Vitest + MSW（Mock Service Worker）| AI 写作助手 RPC 契约、翻译管道 RPC、导出管道 RPC、版本管理 RPC | 20% |
| 端到端测试 | Playwright（手动验证） | 完整编辑流程（新建 → AI 大纲 → 写作 → 质量检查 → 保存 → 导出）、翻译流程、导入流程 | 10% |
| 性能测试 | Lighthouse + 手动采集 | 编辑器首屏加载、大纲生成延迟、大文档（2000 行）编辑延迟 | 5% |

---

<a id="sec-3"></a>
## 三、测试环境与前置条件

### 3.1 环境要求

| 组件 | 要求 |
|------|------|
| YiAi 后端 | 必须运行（端口 10086），含 Ollama LLM 服务 |
| 编辑器页面 | 通过 YiVad 开发服务器或独立静态服务器访问 |
| MongoDB | 运行中，`edit_history` + `translation_memory` + `templates` 集合已创建 |
| 测试数据 | 至少 5 个不同领域的 Markdown 文件（架构设计/故障复盘/操作手册/需求文档/技术规范）用于 RAG 检索测试 |

### 3.2 前置条件

```bash
# 1. 启动后端
cd YiAi && python main.py

# 2. 启动前端
cd YiVad && pnpm dev

# 3. 准备测试数据（导入种子文件到 YiKnowledge）
cd YiKnowledge && python scripts/seed_test_data.py

# 4. 等待 KnowledgeWatcher 扫描完成（约 60s）
curl http://localhost:10086/knowledge/stats

# 5. 运行测试
pnpm test -- --grep "editor"
```

---

<a id="sec-4"></a>
## 四、准入与准出标准

### 4.1 准入门槛

| 条件 | 判定方法 |
|------|---------|
| 后端全部 RPC 接口可调用（不含 AI 依赖的接口降级为 mock） | `curl POST /` 返回 200 |
| 编辑器页面可正常加载（CodeMirror 6 初始化无报错） | DevTools Console 无红色错误 |
| 测试数据已就绪（≥ 5 个 Markdown 文件，含完整 Frontmatter） | 文件系统检查 |
| 类型检查通过 | `vue-tsc --noEmit`（若在 YiVad 中实现） |

### 4.2 准出标准

| 条件 | 阈值 |
|------|------|
| 全部 P0/P1 测试用例通过 | 100% |
| P2 测试用例通过 | ≥ 95% |
| CodeMirror 6 包体积（gzip） | < 150KB |
| 编辑器首屏加载（含 CodeMirror 6） | < 2s |
| AI 大纲生成（RAG 增强模式） | < 5s |
| 大文档（2000 行）编辑输入延迟 | < 50ms |
| 导出 PDF 中文正确渲染 | 无 tofus |
| 导入格式检测准确率 | > 95%（20 个测试文件） |

---

<a id="sec-5"></a>
## 五、单元测试

### 5.1 Frontmatter 解析器

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-FM-01 | 解析标准 Frontmatter | 合法的 YAML frontmatter 块 | 返回正确的键值对 |
| UT-FM-02 | 解析空 Frontmatter | `---\n---` | 返回空对象 |
| UT-FM-03 | 解析缺失必填字段 | 仅含 `title`，缺 `tags` | 校验失败，返回缺失字段列表 |
| UT-FM-04 | 解析 YAML 语法错误 | 缩进不一致的 YAML | 返回解析错误提示行号 |
| UT-FM-05 | 序列化 Frontmatter 回 YAML | 完整的 FrontmatterData 对象 | 生成合法的 YAML frontmatter 块 |
| UT-FM-06 | 双向同步一致性 | parse → modify → serialize → parse | 两次 parse 结果相等 |
| UT-FM-07 | 非法 status 值 | `status: invalid_value` | 校验失败，提示合法值列表 |
| UT-FM-08 | 日期格式校验 | `created: "not-a-date"` | 校验失败，提示 YYYY-MM-DD 格式 |

### 5.2 翻译记忆库匹配

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-TM-01 | 精确匹配 | 源句段与 TM 中某条完全一致 | 返回该条，score=1.0 |
| UT-TM-02 | 模糊匹配（阈值 0.8） | 源句段与 TM 中某条相似度 0.85 | 返回该条，score=0.85 |
| UT-TM-03 | 低于阈值不匹配 | 源句段与 TM 中某条相似度 0.6 | 不返回该条 |
| UT-TM-04 | 空 TM 降级 | TM 集合为空 | 返回空结果，不报错 |
| UT-TM-05 | 术语表强制替换 | 源文本含术语表中词汇 | 目标文本中对应词汇被替换为术语表标准翻译 |
| UT-TM-06 | 多语言 TM 隔离 | 查询 `source_lang=zh, target_lang=en` | 不返回 `source_lang=en` 的条目 |

### 5.3 模板引擎

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-TP-01 | 套用基础模板 | `template_id="architecture"` + 空目标文件 | 生成含标准章节的 Markdown 内容 |
| UT-TP-02 | 模板占位符替换 | 模板含 `{{title}}`、`{{date}}` | 所有占位符被正确替换 |
| UT-TP-03 | LLM 动态扩展 | `template_id="architecture"` + RAG 上下文 | 模板章节被 LLM 基于 RAG 结果扩展 |
| UT-TP-04 | 模板不存在 | `template_id="nonexistent"` | 返回 1002 错误（资源不存在） |

### 5.4 格式检测

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-FD-01 | 检测 Markdown | 含 `# Title` 和 `**bold**` 的文本 | 返回 `format: "markdown"` |
| UT-FD-02 | 检测 HTML | 含 `<html>`、`<body>` 标签的文本 | 返回 `format: "html"` |
| UT-FD-03 | 检测 Frontmatter Markdown | 开头为 `---\n...\n---\n` 的文本 | 返回 `format: "markdown"`，提取 Frontmatter |
| UT-FD-04 | 检测 DOCX（二进制魔数） | 开头为 `PK\x03\x04` 的字节流 | 返回 `format: "docx"` |
| UT-FD-05 | 未知格式降级 | 无特征匹配的纯文本 | 返回 `format: "plaintext"` |

---

<a id="sec-6"></a>
## 六、集成测试

### 6.1 RPC 契约测试

| 编号 | RPC 方法 | 场景 | 预期 |
|------|---------|------|------|
| IT-RPC-01 | `writing_service.generate` (outline) | 标准大纲生成请求 | 返回 JSON 大纲，含层级结构 |
| IT-RPC-02 | `writing_service.generate` (rewrite) | 改写选中段落 | 返回改写结果 + diff 差异 |
| IT-RPC-03 | `writing_service.generate` (polish) | 润色选中段落 | 返回润色结果 |
| IT-RPC-04 | `translate_service.translate` | 中文 → 英文，使用 TM | 返回翻译结果，含 TM 匹配数 |
| IT-RPC-05 | `translate_service.translate` | TM 和术语表均为空 | 降级为纯 LLM 翻译，不报错 |
| IT-RPC-06 | `export_service.create_export_task` (PDF) | 小文档（<50KB）导出 | 返回 `task_id`，轮询获取下载 URL |
| IT-RPC-07 | `export_service.create_export_task` (PDF) | 大文档（≥50KB）导出 | 返回 `task_id`，异步任务处理 |
| IT-RPC-08 | `import_service.detect_format` | HTML 内容 | 返回 `format: "html"` |
| IT-RPC-09 | `import_service.import_content` | Markdown + Frontmatter | 创建文件 + 正确提取 Frontmatter |
| IT-RPC-10 | `template_service.apply_template` | 套用标准架构模板 | 返回填充后的 Markdown 内容 |
| IT-RPC-11 | `version_service.save_snapshot` → `list_snapshots` → `get_diff` → `restore_version` | 完整版本管理流程 | 各步骤返回正确数据 |
| IT-RPC-12 | `lock_service.acquire_lock` → `check_lock` → `release_lock` | 完整编辑锁流程 | 锁状态正确流转 |

### 6.2 编辑器 + 后端集成

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-ED-01 | 编辑器加载 → `/read-file` 获取内容 | 内容正确显示，Frontmatter 面板解析正确 |
| IT-ED-02 | Ctrl+S 保存 → `/write-file` 写入 | 文件系统内容更新，无数据丢失 |
| IT-ED-03 | 图片拖拽 → 自动保存到 `images/` | 图片文件写入磁盘，引用路径自动生成 |
| IT-ED-04 | 30s 自动保存 → 触发版本快照 | `edit_history` 集合新增一条记录 |

---

<a id="sec-7"></a>
## 七、端到端场景

### 7.1 完整创作流程

**场景**：用户写一篇"微服务架构设计"文档

| 步骤 | 操作 | 验证点 |
|------|------|--------|
| 1 | 打开编辑器 → 选择文档类型"架构设计" | 编辑器加载，显示空白 Markdown 文件 |
| 2 | 点击"AI 大纲"→ 输入主题"微服务架构设计" | SSE 流式返回大纲，层级结构完整 |
| 3 | 在大纲编辑器中拖拽调整章节顺序 | 拖拽后层级正确，无数据丢失 |
| 4 | 点击"应用大纲"→ 大纲插入编辑器 | 编辑器内容为完整的 Markdown 大纲 |
| 5 | 在编辑器中写作，使用快捷工具栏（加粗/链接/图片） | Markdown 语法正确生成 |
| 6 | 选中一段文字 → AI 改写 → 查看差异对比 | 差异高亮正确，接受/拒绝按钮可用 |
| 7 | 拖拽一张图片到编辑器 | 图片保存到 `images/`，引用路径 `images/img-{ts}.png` |
| 8 | 查看 Frontmatter 面板 → 补充 tags | 面板与 YAML 源码双向同步 |
| 9 | Ctrl+S 保存 | 保存成功，编辑历史新增一条记录 |
| 10 | 点击"质量检查" | 三项检查（章节/链接/代码）结果展示 |
| 11 | 点击"导出 PDF" | PDF 下载，中文正常，分页正确 |

### 7.2 翻译流程

| 步骤 | 操作 | 验证点 |
|------|------|--------|
| 1 | 打开已有中文文档 | 编辑器加载完整内容 |
| 2 | 点击"翻译"→ 选择目标语言"English" | 翻译对话框打开 |
| 3 | 确认选项（使用 TM、术语表、阈值 3.5） | 选项已选中 |
| 4 | 点击"开始翻译" | 进度条显示，SSE 流式返回 |
| 5 | 翻译完成 → 查看质量评分 | BLEU + COMET 评分显示 |
| 6 | 人工审阅翻译结果 | 术语一致性检查通过 |
| 7 | 保存翻译版本 | 翻译内容写入新文件或覆盖 |

### 7.3 导入流程

| 步骤 | 操作 | 验证点 |
|------|------|--------|
| 1 | 拖拽一个 HTML 文件到导入向导 | 格式自动检测为 HTML |
| 2 | 预览提取的 Frontmatter（title、tags） | 提取字段展示，可手动编辑 |
| 3 | 预览转换后的 Markdown 内容 | 表格/列表/链接转换正确 |
| 4 | 选择目标目录 → 确认导入 | 文件创建成功，Frontmatter 完整 |
| 5 | 打开导入的文件 | 编辑器正常渲染，格式正确 |

---

<a id="sec-8"></a>
## 八、性能验收测试

### 8.1 编辑器性能

| 编号 | 场景 | 目标 | 采集方式 |
|------|------|------|---------|
| PT-ED-01 | CodeMirror 6 包体积（gzip） | < 150KB | `ls -lh dist/js/editor.*.js.gz` |
| PT-ED-02 | 编辑器首屏加载（含 CodeMirror + Markdown） | < 2s | Lighthouse Performance |
| PT-ED-03 | 2000 行 Markdown 文件加载 | < 1s | `performance.now()` |
| PT-ED-04 | 2000 行文件中编辑输入延迟 | < 50ms | 按键事件到 DOM 更新时间差 |
| PT-ED-05 | 分屏预览实时渲染（1000 行） | < 200ms 延迟 | `performance.now()` |
| PT-ED-06 | 图片拖拽插入（500KB PNG） | < 500ms | 拖拽释放到图片引用路径生成 |

### 8.2 AI 服务性能

| 编号 | 场景 | 目标 | 采集方式 |
|------|------|------|---------|
| PT-AI-01 | AI 大纲生成（RAG 增强模式） | < 5s（含 RAG 检索 + LLM 生成） | SSE 首字节时间 |
| PT-AI-02 | AI 改写（选中 200 字段落） | < 3s | SSE 完成时间 |
| PT-AI-03 | AI 润色（选中 200 字段落） | < 3s | SSE 完成时间 |
| PT-AI-04 | 质量预检（2000 行文档） | < 2s | 三项检查完成时间 |

### 8.3 管线性能

| 编号 | 场景 | 目标 | 采集方式 |
|------|------|------|---------|
| PT-PL-01 | 翻译 3000 字文章（LLM + TM） | < 10s | RPC 响应时间 |
| PT-PL-02 | 导出 PDF（50KB Markdown，Puppeteer） | < 5s | 任务完成时间 |
| PT-PL-03 | 导出 PDF（200KB Markdown，异步） | < 30s | 任务完成时间 |
| PT-PL-04 | 版本差异对比（2000 行文件） | < 500ms | diff 算法执行时间 |
| PT-PL-05 | 版本快照保存 | < 100ms | MongoDB 写入时间 |

---

<a id="sec-9"></a>
## 九、缺陷分级与处理流程

### 9.1 严重级别

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | 核心功能完全不可用 | 编辑器无法加载、保存丢失全部内容、导出 PDF 白屏 |
| S1 — 严重 | 核心功能部分可用但有重大缺陷 | AI 大纲生成始终超时、翻译结果乱码、保存耗时 > 10s |
| S2 — 一般 | 非核心功能异常或边界情况 | 图片粘贴在 Firefox 中失败、Frontmatter 面板特殊字符处理错误 |
| S3 — 轻微 | 体验问题或边缘情况 | 字数统计未包含中文标点、分屏比例拖拽非平滑动画 |
| S4 — 建议 | 优化建议 | 快捷键自定义、模板市场评分功能 |

### 9.2 处理流程

```
发现缺陷 → 登记（YiKnowledge/projects/yiknowledge/bugs/）→ 分级 → 
  → S0/S1：立即修复，阻塞发布
  → S2：迭代内修复
  → S3/S4：下一迭代或 backlog
```

---

<a id="sec-10"></a>
## 十、自动化现状与缺口

### 10.1 自动化覆盖

| 模块 | 自动化状态 | 文件数 | 说明 |
|------|----------|--------|------|
| Frontmatter 解析/校验 | 待实施 | ~8 | 纯函数，易于单元测试 |
| 翻译记忆库匹配 | 待实施 | ~6 | 纯函数，易于单元测试 |
| 模板引擎 | 待实施 | ~4 | 纯函数 + RPC mock |
| 格式检测 | 待实施 | ~5 | 纯函数 |
| 编辑器组件 | 待实施 | ~5 | jsdom 环境 |
| AI 助手 RPC 契约 | 待实施 | ~5 | MSW mock |
| 导出/导入 RPC 契约 | 待实施 | ~5 | MSW mock |
| 版本管理 RPC 契约 | 待实施 | ~4 | MSW mock |
| E2E 完整流程 | 手动验证 | 3 个场景 | Playwright 待配置 |
| 性能测试 | 手动验证 | 11 个场景 | Lighthouse CI 待配置 |

### 10.2 阻塞项

| # | 阻塞项 | 影响 | 解除条件 |
|---|--------|------|---------|
| 1 | YiAi `writing_service` 未实现 | IT-RPC-01～03 无法执行 | 阶段二后端开发完成 |
| 2 | YiAi `translate_service` 未实现 | IT-RPC-04～05 无法执行 | 阶段四后端开发完成 |
| 3 | YiAi `export_service` 未实现 | IT-RPC-06～07 无法执行 | 阶段三后端开发完成 |
| 4 | YiAi `version_service` 未实现 | 自动保存 → 快照流程无法验证 | 阶段一后端开发完成 |

> 以上阻塞项与[开发方案 §13 已知缺口与技术债](../../devs/2026-09/01-prd-task-内容创作与编辑工具.md#sec-13)对齐。

---