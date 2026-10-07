---

doc_type: module
prd_id: "PO-09-62"
title: "PO-09-62-dev: SSE 流式翻译 — 开发方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: task
---

# PO-09-62-dev: SSE 流式翻译 — 开发方案

## 改动清单

### 1. YiPot `src/api/services/translation.ts` — 新增流式方法

```typescript
async *translateStream(params: {
  text: string; from_lang?: string; to_lang?: string;
  provider?: string; config?: Record<string, unknown>;
  signal?: AbortSignal;
}): AsyncGenerator<{ chunk?: string; done: boolean; error?: string }> {
  const body = {
    module_name: `services.translation.translate_service`,
    method_name: 'translate_stream',
    parameters: {
      text: params.text,
      from_lang: params.from_lang ?? 'auto',
      to_lang: params.to_lang ?? 'zh',
      provider: params.provider ?? 'openai',
      config: params.config ?? null,
    },
  };
  for await (const event of client.stream('/', body, params.signal)) {
    if (event.done) { yield { done: true }; return; }
    if (event.error) { yield { done: true, error: event.error }; return; }
    const data = event.data as any;
    const message = data?.data?.message ?? data?.message ?? data;
    if (typeof message === 'string') yield { chunk: message, done: false };
  }
  yield { done: true };
}
```

### 2. YiPot `src/services/yiaiAdapter.ts` — 新增流式适配器

```typescript
export function supportsStreaming(serviceName: string): boolean {
  return shouldUseYiAi(serviceName);  // openai, ollama, chatglm, geminipro
}

export async function translateStreamViaYiAi(
  serviceName: string, text: string, from: string, to: string,
  options: { config: Record<string, unknown>; setResult: (v: string) => void; signal?: AbortSignal },
): Promise<string> {
  const api = getApi();
  let fullText = '';
  for await (const event of api.translation.translateStream({
    text, from_lang: mapLang(from), to_lang: mapLang(to),
    provider: serviceName,
    config: { [serviceName]: { ...options.config } },
    signal: options.signal,
  })) {
    if (event.error) throw new Error(event.error);
    if (event.done) break;
    if (event.chunk) { fullText += event.chunk; options.setResult(fullText); }
  }
  return fullText;
}
```

### 3. YiPot `TargetArea/index.jsx` — 翻译分流

在 `useYiAi` 分支中增加流式检测：

```jsx
if (useYiAi) {
    const useStreaming = supportsStreaming(translateServiceName);
    if (useStreaming) {
        translateStreamViaYiAi(...).then(onSuccess).catch(fallback);
    } else {
        translateViaYiAi(...).then(onSuccess).catch(fallback);
    }
}
```

### 4. 数据流

```
TargetArea (LLM engine)
  → translateStreamViaYiAi('openai', text, from, to, {setResult, config})
    → api.translation.translateStream({...})
      → client.stream('/', {module_name, method_name: 'translate_stream', parameters})
        → fetch POST / (Accept: text/event-stream)
          → YiAi translate_stream(text, from, to, 'openai')
            → OpenAIProvider.translate_stream()
              → httpx.stream() → SSE chunks
                → data: {"data": {"message": "Hello"}}\n\n
                → data: {"data": {"message": " world"}}\n\n
                  → setResult("Hello world") → UI 实时更新
```

### 5. 降级策略

| 场景 | 行为 |
|------|------|
| SSE 流式失败 | catch → 降级到直接 API 调用 `doTranslate(serviceName)` |
| YiAi 不可达 | translateViaYiAi 失败 → fallback 到直接 API |
| 引擎切换 | translateID 检查丢弃旧请求结果 |

## 验证步骤

1. 选择 openai 引擎，输入文本触发翻译
2. 确认翻译结果逐字显示（非一次性出现）
3. 选择 google 引擎，确认仍为同步显示
4. 翻译过程中切换引擎，确认旧请求被丢弃