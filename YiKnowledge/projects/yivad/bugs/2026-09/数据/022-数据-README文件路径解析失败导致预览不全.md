---
title: "项目详情页: README.md 预览不全—文件路径解析失败"
tags:
- readme
- readProjectFile
- project-detail
- file-path
category: projects/yivad/bugs/data
created: "2026-09-10"
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: views/project/components/DetailOverview.vue, hooks/useMarkdown.ts
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-10)
frequency: always
benefit: "缺陷记录：数据-README文件路径解析失败导致预览不全"
lifecycle: active
---

## Description

`http://localhost:8848/#/project/yivad` 项目详情 Overview Tab 的 README.md 预览内容不全。页面只展示了项目的简短 description，而非 `YiKnowledge/projects/yivad/README.md` 的完整 Markdown 渲染内容。

## Steps to Reproduce

1. 启动 YiAi 后端 + YiVad 前端
2. 访问 `http://localhost:8848/#/project/yivad`
3. 查看 Overview Tab 下的 README.md 卡片
4. 观察到内容非常简短（仅为项目描述），远少于 `YiKnowledge/projects/yivad/README.md` 的完整内容

## Root Cause

三个问题叠加导致预览不全：

### 1. 文件路径解析失败 (DetailOverview.vue:146)

`loadDescFile` 调用 `readProjectFile(project.value.key, "README.md")`，project.key 为 `"yivad"`（小写）。后端 `_resolve_project_path("yivad", "README.md")` 解析为 `<YrY_root>/yivad/README.md`，但实际项目目录为 `YiVad`（大小写混合），路径不存在。后端返回 404，前端 catch 回退到 `project.value?.description || ""`。

**修复**：使用 `YiKnowledge/projects/${project.value.key}/README.md` 作为 `target_file`。后端 `_resolve_project_path` 检测到 `YiKnowledge/` 前缀后，自动解析到 `knowledge_base_dir`（`../YiKnowledge`），正确找到 `YiKnowledge/projects/yivad/README.md`。

### 2. YAML Frontmatter 作为可见文本渲染

`readProjectFile` 返回的原始文件内容包含 YAML frontmatter（`---` 包裹的元数据）。`marked` 将 `---` 解析为 `<hr>`，frontmatter 字段渲染为可见段落，浪费预览空间。

**修复**：渲染前通过 `stripFrontmatter()` 移除 frontmatter。

### 3. renderWithHtml 中 DOMPurify 调用顺序错误 (useMarkdown.ts:327)

`renderWithHtml` 在 `marked.parse()` 之前对原始 Markdown 调用 `DOMPurify.sanitize()`。DOMPurify 设计用于消毒 HTML 而非 Markdown 源码，对原始 Markdown 调用可能导致内容损坏。

**修复**：调整为 `marked.parse()` → `sanitizeHtml()` → `wrapMermaidBlocks()`。

## Fix

### DetailOverview.vue

```diff
 async function loadDescFile() {
   if (!project.value) return;
   try {
-    const content = await readProjectFile(project.value.key, "README.md");
+    const content = await readProjectFile(project.value.key, `YiKnowledge/projects/${project.value.key}/README.md`);
-    descContent.value = content || "";
+    descContent.value = stripFrontmatter(content || "");
   } catch {
     descContent.value = project.value?.description || "";
   }
   descExpanded.value = false;
 }

+function stripFrontmatter(md: string): string {
+  const trimmed = md.trimStart();
+  if (trimmed.startsWith("---")) {
+    const end = trimmed.indexOf("\n---", 3);
+    if (end !== -1) return trimmed.slice(end + 4).trimStart();
+  }
+  return md;
+}
```

### useMarkdown.ts — renderWithHtml

```diff
 function renderWithHtml(md: string): string {
   if (!md) return "";
   try {
-    const sanitized = sanitizeHtml(md);
-    const safe = sanitized.replace(/]\s*\((javascript:|vbscript:)[^)]*\)/gi, "](#)");
+    const safe = md.replace(/]\s*\((javascript:|vbscript:)[^)]*\)/gi, "](#)");
     let html = marked.parse(safe) as string;
+    html = sanitizeHtml(html);
     html = wrapMermaidBlocks(html);
     return html;
   } catch { ... }
 }
```

### Clamp 高度提升

```diff
 &.is-clamped {
-  max-height: 400px;
+  max-height: 600px;
   overflow: hidden;
 }
```

## Impact

- **影响模块**：`DetailOverview.vue`（README 预览）、`useMarkdown.ts`（所有 Markdown 渲染）
- **是否影响 API 契约**：否（仍使用 `readProjectFile`，仅 `target_file` 参数值变化）
- **是否影响其他前端项目**：否

## Verification

- [x] `vue-tsc --noEmit` 通过，无新增类型错误
- [x] README.md 完整内容在 Overview Tab 中正确渲染
- [x] Frontmatter 元数据不在预览中显示
- [x] KnowledgePreviewDialog 中 Markdown 渲染不受影响
- [x] 展开/收起按钮在内容超出 clamp 高度时正常显示

## Prevention

| 层面 | 措施 |
|------|------|
| 代码 | `readProjectFile` 调用应在 `target_file` 中使用 `YiKnowledge/projects/<key>/` 前缀以明确目标目录 |
| 测试 | 为 project detail 页添加集成测试，验证 README.md 内容加载成功且长度 > 100 字符 |
| 流程 | 涉及文件路径解析的修改需同时验证小写/camelCase 项目 key 的场景 |

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | `readProjectFile` 调用统一使用 `YiKnowledge/projects/<key>/` 前缀，封装为 `readProjectReadme(key)` helper |
| 测试 | 为 `stripFrontmatter()` 添加单元测试：有/无 frontmatter、frontmatter 含 `---` 内部字符等边界情况 |
| 流程 | 涉及文件路径解析的修改需同时验证小写/camelCase/PascalCase 项目 key 的场景 |

## 经验教训

- **路径解析隐式规则是脆弱点**：`_resolve_project_path` 对 `YiKnowledge/` 前缀有特殊处理逻辑（跳转到 `knowledge_base_dir`），但调用方不知道这个规则。应通过 `readProjectReadme(key)` 封装隐藏路径细节
- **DOMPurify 的输入假设**：`DOMPurify.sanitize()` 设计用于消毒 HTML，对 Markdown 源码调用会损坏内容（如将 `---` frontmatter 分隔符误判为可疑标签）。必须先 `marked.parse()` 转为 HTML 后再消毒

