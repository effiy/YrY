---

doc_type: module
prd_id: "PO-09-63"
title: "PO-09-63-dev: 缓存指示器 — 开发方案"
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

# PO-09-63-dev: 缓存指示器 — 开发方案

## 改动清单

### 1. `yiaiAdapter.ts` — 返回类型改为 `{text, cached}`

```typescript
export async function translateViaYiAi(...): Promise<{ text: string; cached: boolean }> {
  // ...
  const isCached = !!first.cached;
  if (setResult) setResult(resultText);
  return { text: resultText, cached: isCached };
}
```

### 2. `TargetArea/index.jsx` — 缓存状态 + UI 徽章

**新增状态**：
```jsx
const [isCached, setIsCached] = useState(false);
```

**翻译开始重置**：
```jsx
const translate = async () => {
    setIsCached(false);
    // ...
```

**handleTranslateSuccess 支持 cached 参数**：
```jsx
const handleTranslateSuccess = (v, ..., cached = false) => {
    const text = typeof v === 'string' ? v.trim() : (v?.text ?? '');
    setResult(text);
    setIsCached(cached);
    // ...
```

**调用方适配**：
```jsx
// 非流式 YiAi 路径
translateViaYiAi(...).then((res) =>
    handleTranslateSuccess(res.text, ..., res.cached)
)

// 流式路径（永不缓存）
translateStreamViaYiAi(...).then((v) =>
    handleTranslateSuccess(v, ..., false)
)

// 直接 API 路径
doTranslate(...).then(onSuccess)  // onSuccess 默认 cached=false
```

**UI 徽章**（头部 PulseLoader 旁）：
```jsx
{isCached && !isLoading && (
    <span className="... text-purple-600 bg-purple-100 ...">⚡ Cached</span>
)}
```

### 3. 数据流

```
TargetArea.translate()
  → translateViaYiAi('openai', text, from, to, config)
    → YiAi translate RPC → memory_service.lookup()
      → MongoDB translation_memory.find({hash})
        → 命中 → {text, cached: true}
        → 未命中 → OpenAI API → memory_service.store() → {text, cached: false}
  → handleTranslateSuccess(text, ..., cached)
    → setIsCached(true/false)
      → 渲染 "⚡ Cached" 徽章
```