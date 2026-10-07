---

doc_type: module
prd_task_id: "YP-08-02"
title: "YP-08-02: 知识库与 RAG 集成 — 知识树浏览 + RAG 检索 + scope 限定 + 子问题分解 + 来源预览 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202608"
estimate_frontend: 3.0
source_prd: "02-功能实现-知识库与RAG集成.md"
source_okr: [yipet-002]

type: task
---

# YP-08-02: 知识库与 RAG 集成 — 开发方案

> 来源 PRD：[02-功能实现-知识库与RAG集成.md](../../prds/2026-08/02-功能实现-知识库与RAG集成.md)
> 需求编号：YP-08-02 · 优先级：P0 · 人天：3.0d

---

## 一、方案概述

在聊天窗口中集成 YiKnowledge 知识树浏览和 RAG 检索，实现知识驱动的 AI 对话。核心流程：用户浏览知识树选择范围 → RAG 检索相关文档 → SSE 流式回答含内联引用。

### 1.1 架构定位

```
┌─────────────────────────────────────────────────┐
│ ChatWindow (MAIN World)                          │
│                                                   │
│  ┌─────────────┐  ┌──────────────────────────┐  │
│  │ KnowledgeTree│  │ ContextScopeBar          │  │
│  │ (侧边栏)     │  │ — RAG scope 芯片         │  │
│  │             │  │ — 文件数 / chunk 数预览   │  │
│  │ 7 角色目录   │  │ — Clear scope 按钮       │  │
│  │  ↳ 递归展开  │  └──────────────────────────┘  │
│  │  ↳ 文件选择  │                                │
│  └──────┬──────┘  ┌──────────────────────────┐  │
│         │         │ @MentionDropdown          │  │
│         │         │ — 输入 @ 触发             │  │
│         │         │ — 实时文件名匹配           │  │
│         │         │ — 键盘导航 (↑↓ Enter)     │  │
│         └────┬────┘                           │  │
│              │  ┌──────────────────────────┐  │
│              └──→ RagService.search()      │  │
│                 └──────────┬───────────────┘  │
│                            │                   │
│                 ┌──────────▼───────────────┐  │
│                 │ SSE Stream + 内联引用     │  │
│                 │ — "According to [1]..."   │  │
│                 │ — RAG 来源面板（折叠）    │  │
│                 └──────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 二、核心模块设计

### 2.1 KnowledgeService (`src/api/services/knowledgeService.ts`)

```typescript
class KnowledgeService {
  constructor(private apiClient: ApiClient) {}

  // 获取知识树（可选角色过滤）
  async getTree(role?: string): Promise<KnowledgeTreeNode> {
    const res = await this.apiClient.call(
      "services.ai.knowledge_service", "get_tree",
      { role }
    );
    return res.data as KnowledgeTreeNode;
  }

  // 获取单个知识文件（含 frontmatter + 内容）
  async getFile(filePath: string): Promise<KnowledgeFile | null> {
    const res = await this.apiClient.call(
      "services.ai.knowledge_service", "get_file",
      { target_file: filePath }
    );
    return res.code === 0 ? (res.data as KnowledgeFile) : null;
  }

  // 搜索知识文件（用于 @mention 自动补全）
  async searchFiles(query: string, limit = 10): Promise<KnowledgeFile[]> {
    const res = await this.apiClient.call(
      "services.ai.knowledge_service", "search_files",
      { query, limit }
    );
    return (res.data?.files || []) as KnowledgeFile[];
  }
}

interface KnowledgeTreeNode {
  name: string;
  type: "dir" | "file";
  path: string;
  children?: KnowledgeTreeNode[];
}

interface KnowledgeFile {
  path: string;
  title: string;
  tags: string[];
  category: string;
  frontmatter: Record<string, any>;
  content?: string;
}
```

### 2.2 RagService (`src/api/services/ragService.ts`)

```typescript
type RagScope =
  | { type: "file"; paths: string[] }
  | { type: "dir"; paths: string[] };

class RagService {
  constructor(private apiClient: ApiClient) {}

  // RAG 检索 — 支持 scope 限定
  async search(query: string, scope?: RagScope): Promise<RagSearchResult> {
    const res = await this.apiClient.call(
      "services.ai.rag_service", "search",
      { query, scope }
    );
    return res.data as RagSearchResult;
  }

  // 预检 — 无 LLM 调用，仅返回匹配文件列表和 chunk 预估
  async previewSources(scope: RagScope): Promise<SourcePreview> {
    const res = await this.apiClient.call(
      "services.ai.rag_service", "preview_sources",
      { scope }
    );
    return res.data as SourcePreview;
  }

  // 子问题分解 — 复杂问题拆分为 3-5 个子问题，并行检索后综合
  async decompose(question: string): Promise<DecomposeResult> {
    const res = await this.apiClient.call(
      "services.ai.rag_service", "decompose",
      { question }
    );
    return res.data as DecomposeResult;
  }

  // 重建索引
  async rebuildIndex(): Promise<void> {
    await this.apiClient.call(
      "services.ai.rag_service", "rebuild_index", {}
    );
  }
}

interface RagSearchResult {
  results: RagHit[];
}

interface RagHit {
  file: string;
  score: number;
  snippet: string;
  chunk_index: number;
}

interface SourcePreview {
  files: string[];
  estimated_chunks: number;
}

interface DecomposeResult {
  sub_questions: string[];
  synthesized_answer: string;
}
```

### 2.3 知识树组件 (`KnowledgeTree.vue`)

```
Props:
  role?: string            // 可选角色过滤

Emits:
  @select-file(path)       // 文件选中 → 追加到 RAG scope
  @select-dir(path)        // 目录选中 → 目录级 scope
  @preview(path)           // 预览文件 frontmatter（不添加到 scope）

State:
  - tree: 递归目录结构
  - expanded: Set<string>   // 已展开节点路径
  - loading: boolean
  - error: string | null

Interactions:
  - 点击目录 → toggle expand → lazy-load 子节点
  - 点击文件 → 展示 frontmatter 摘要 popover
  - 文件行右侧 @ 按钮 → 添加到 scope
  - 目录行右侧 @ 按钮 → 目录级 scope
```

### 2.4 ContextScopeBar (`ContextScopeBar.vue`)

```
Props:
  ragScope: RagScope       // 当前 RAG 范围
  sourcePreview: SourcePreview | null

Emits:
  @remove-scope(path)      // 移除单个 scope 项
  @clear-scope()           // 清除所有 scope

Display:
  [{chip} engineer/architecture/ (12 files, ~45 chunks)] [×]
  [{chip} sre/releases/ (3 files, ~8 chunks)]          [×]
  [Clear all scopes]
```

### 2.5 @Mention 下拉 (`useMention.ts` composable)

```typescript
export function useMention() {
  const mentionQuery = ref("");
  const isMentioning = ref(false);
  const mentionResults = ref<KnowledgeFile[]>([]);
  const selectedMentionIdx = ref(0);

  // 监听 ChatInput 的 @ 输入
  watch(mentionQuery, async (q) => {
    if (q.length >= 2) {
      mentionResults.value = await knowledgeService.searchFiles(q);
    } else {
      mentionResults.value = [];
    }
  });

  function onKeydown(e: KeyboardEvent) {
    if (!isMentioning.value) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedMentionIdx.value = Math.min(
        selectedMentionIdx.value + 1, mentionResults.value.length - 1
      );
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedMentionIdx.value = Math.max(selectedMentionIdx.value - 1, 0);
    }
    if (e.key === "Enter" && mentionResults.value.length > 0) {
      e.preventDefault();
      selectMention(mentionResults.value[selectedMentionIdx.value]);
    }
    if (e.key === "Escape") {
      isMentioning.value = false;
    }
  }

  function selectMention(file: KnowledgeFile) {
    // 1. 将 @engineer/architecture 文本替换为文件路径 chip
    // 2. 将文件路径添加到 RAG scope
    // 3. 关闭下拉
  }

  return { mentionQuery, isMentioning, mentionResults, selectedMentionIdx, onKeydown, selectMention };
}
```

### 2.6 RAG 状态监控 (`RagStatus.vue`)

```typescript
// RAG 索引状态徽章
const ragStatus = ref<"built" | "building" | "not_built">("not_built");

// 轮询检查索引状态
onMounted(async () => {
  const status = await ragService.getStatus();
  ragStatus.value = status.index_status;
});

// 状态对应 UI：
// built    → {绿} RAG Ready · 12,345 chunks
// building → {黄} Indexing... 67%
// not_built→ {灰} No Index · [Rebuild] 按钮
```

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 验证 | 人天 |
|------|------|---------|------|------|
| 1 | KnowledgeService + getTree API | `knowledgeService.ts` | `getTree()` 返回 7 角色目录树 | 0.5 |
| 2 | KnowledgeTree 组件（递归展开 + lazy-load） | `KnowledgeTree.vue` | 树渲染 + 展开/折叠 + 文件预览 | 0.75 |
| 3 | RagService + search API | `ragService.ts` | `search("query", scope)` 返回含 score 的结果 | 0.5 |
| 4 | ContextScopeBar + scope 管理 | `ContextScopeBar.vue`, chat store | scope chips + 文件数/chunk 数预览 | 0.5 |
| 5 | @Mention 下拉 | `useMention.ts`, `ChatInput.vue` | 输入 @ → 下拉 → 键盘选择 → scope 限定 | 0.5 |
| 6 | Decompose + 子问题并行检索 | `ragService.ts` | 复杂问题 → 3-5 子问题 → 综合回答 | 0.5 |
| 7 | RAG 状态监控 + 重建索引 | `RagStatus.vue` | 状态轮询 + 重建按钮 | 0.25 |
| 8 | 集成 + 回归测试 | `tests/` | 全量通过 | 0.5 |

**总计：4.0d**（估时从 3.0 调整为 4.0，增加了 @mention 和状态监控）

---

## 四、边缘场景

| 场景 | 触发 | 处理 |
|------|------|------|
| 知识库为空 | 零知识文件 | KnowledgeTree 显示 "No knowledge files yet" + 引导链接 |
| scope 文件被删除 | 用户 scope 了已被删除的文件 | RagService 返回 warning "2 of 5 files not found" |
| RAG 检索超时 | YiAi 检索 > 10s | 显示 "Search is taking longer..." + 取消按钮 |
| RAG 检索零结果 | scope 无匹配内容 | 显示 "No relevant knowledge found. Try broader scope." |
| 索引构建中 | rebuildIndex 调用中 | RagStatus 显示进度条，禁用 scope 选择 |
| @mention 无匹配 | 输入的文件名不存在 | 下拉显示 "No files matching 'xxx'" |
| 页面切换时 scope 保留 | SPA 导航 | scope 存储在 chat store → 页面切换不丢失 |
| Decompose 子问题过多 | 极复杂问题 → 10+ 子问题 | 限制最大 5 个子问题，其余合并 |

---

## 五、完成定义

- [ ] KnowledgeService: getTree + getFile 可用
- [ ] RagService: search + previewSources + decompose + rebuildIndex 可用
- [ ] KnowledgeTree: 7 角色目录递归展开，文件 frontmatter 预览
- [ ] ContextScopeBar: scope chips + 文件数/chunk 数预览 + clear
- [ ] @mention: 输入 @ → 下拉 → 键盘选择 → scope 限定
- [ ] RAG 检索结果含内联引用（分数 + 文件名）
- [ ] RAG 状态徽章正确显示三种状态
- [ ] `tsc --noEmit` 零错误
- [ ] `npm test` 全量通过