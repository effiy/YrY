---

doc_type: module
prd_id: "PO-09-60"
title: "PO-09-60-dev: 翻译结果 RAG 上下文展示 — 开发方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: task
---

# PO-09-60-dev: 翻译结果 RAG 上下文展示 — 开发方案

## 改动清单

### 1. YiAi `services/translation/context_service.py` — 新增详细版 RAG 翻译

新增 `translate_with_context_detailed()` 函数，返回 `{text, sources}` 字典：

```python
async def translate_with_context_detailed(...) -> dict:
    """Returns {text: translated_text, sources: [{file_path, score, snippet}]}"""
    # ... RAG query for domain context
    # ... translate with enhanced prompt
    return {"text": result.text, "sources": rag_sources}
```

新增 `_fetch_rag_sources()` 辅助函数，返回结构化来源列表。

### 2. YiAi `services/translation/translate_service.py` — 注册 RPC

```python
async def translate_with_context_detailed(
    text, from_lang="auto", to_lang="zh", provider="openai",
    provider_config=None, domain=None,
) -> dict:
    """RPC wrapper for context_service.translate_with_context_detailed"""
    from services.translation.context_service import translate_with_context_detailed as _impl
    return await _impl(text=text, ...)
```

### 3. YiPot `api/services/translation.ts` — 新增 RPC 方法

```typescript
async translateWithContext(params: {
    text: string; from_lang?: string; to_lang?: string;
    provider?: string; domain?: string;
}) {
    const res = await client.rpc(
        `${MODULE}.translate_service`, 'translate_with_context_detailed', {
            text: params.text, from_lang: params.from_lang ?? 'auto',
            to_lang: params.to_lang ?? 'zh', provider: params.provider ?? 'openai',
            domain: params.domain ?? null,
        },
    );
    if (!res.ok) throw new Error(res.error || 'Context translation failed');
    return res.data;  // {text: string, sources: Array<{file_path, score, snippet}>}
}
```

### 4. YiPot `TargetArea/index.jsx` — RAG 来源展示

**新增状态**：
```jsx
const [ragSources, setRagSources] = useState(null);
```

**UI 展示**（翻译结果下方）：
```jsx
{ragSources?.length > 0 && !isLoading && (
    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-default-100">
        <span className="text-[10px] text-default-400 font-medium">RAG:</span>
        {ragSources.slice(0, 3).map((s, i) => (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-600 cursor-default"
                title={`${s.file_path} · score: ${(s.score * 100).toFixed(0)}%`}>
                {s.file_path?.split('/').slice(-2).join('/') || 'context'}
            </span>
        ))}
    </div>
)}
```

### 5. 数据流

```
TargetArea (AI engine translation)
  → (future) translateWithContext({text, domain: 'yivad'})
    → YiAi translate_with_context_detailed(domain='yivad')
      → _fetch_rag_sources(text, 'yivad')
        → RAG engine query("Terminology: {text}", scope="projects/yivad")
          → llama_index hybrid search
            ← [{file_path, score, snippet}, ...]
      → provider.translate(text, enhanced prompt with RAG context)
        ← {text: "...", sources: [{file_path: "projects/yivad/...", score: 0.85, snippet: "..."}]}
  → setRagSources(sources)
    → 渲染 RAG: yivad/prds/file.md · engineer/patterns/file.md
```

## 验证步骤

1. 启动 YiAi + YiKnowledge RAG 索引
2. 在 YiPot 中使用 AI 引擎翻译技术文本
3. 确认翻译结果下方显示 RAG 来源芯片（如有领域术语匹配）