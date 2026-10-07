---

doc_type: module
prd_task_id: "YP-09-53-6"
title: "YiPot 前端集成（YiAi 路由 + 降级） — 开发方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "53-prd-YiAi后端集成.md"
parent_module: "YP-09-53"
related_tests: ["YP-09-53"]

type: task
---

# YiPot 前端集成（YiAi 路由 + 降级） — 开发方案

> 来源 PRD：[53-prd-YiAi后端集成.md](../../prds/2026-09/53-prd-YiAi后端集成.md) · 父模块：[80-prd-task-YiAi后端集成.md](./80-prd-task-YiAi后端集成.md)

---

## 源码索引

| 文件 | 说明 | 变化 |
|------|------|------|
| `YiPot/src/main.jsx` | 启动时初始化 YiAi API 客户端 | +3 |
| `YiPot/src/services/yiaiAdapter.ts` | YiAi RPC 路由适配器（新建） | +175 |
| `YiPot/src/window/Translate/components/TargetArea/index.jsx` | AI 引擎路由到 YiAi + 降级 | +25 / -30 |
| `YiPot/src/hooks/useApi.ts` | React useApi Hook（新建） | +25 |

---

## 一、应用启动集成

### main.jsx 修改

```javascript
// 原有启动流程
initStore().then(async () => {
    await initEnv();
    // ... React 挂载
});

// 新增：YiAi API 客户端初始化
initStore().then(async () => {
    await initEnv();
    initApi({ baseUrl: import.meta.env.VITE_YIAI_URL || 'http://localhost:10086' });
    // ... React 挂载
});
```

**关键设计**：
- `initApi()` 在 store 和环境初始化之后、React 挂载之前调用
- `VITE_YIAI_URL` 环境变量（默认 `http://localhost:10086`）支持构建时配置
- API 客户端存储在 `window.__yipot_api`，供所有服务模块访问（避免 React Context 的嵌套限制）

---

## 二、yiaiAdapter — 路由适配器

### 2.1 架构位置

```
TargetArea.translate()
  │
  ├─ shouldUseYiAi(serviceName)?
  │   ├─ YES → translateViaYiAi(serviceName, text, from, to, options)
  │   │         └─ getApi().rpc('services.translation.translate_service', 'translate', {...})
  │   │              ├─ SUCCESS → handleTranslateSuccess(v)
  │   │              └─ FAIL    → 降级: builtinServices[name].translate(...)
  │   │
  │   └─ NO  → builtinServices[name].translate(text, from, to, options)
  │             └─ 直接调用第三方 API（保持原有路径）
```

### 2.2 AI 引擎判断

```typescript
export function shouldUseYiAi(serviceName: string): boolean {
  const AI_PROVIDERS = ['openai', 'ollama', 'chatglm', 'geminipro'];
  return AI_PROVIDERS.includes(serviceName);
}
```

**选择标准**：
- AI/LLM 引擎 → YiAi RPC（享受记忆缓存 + RAG 上下文 + 流式支持）
- 传统引擎 → 直接调用（延迟更低，无需中转）

### 2.3 翻译适配器

```typescript
export async function translateViaYiAi(
  serviceName: string, text: string, from: string, to: string,
  options: { config: Record<string, unknown>; detect?: string; setResult?: (v: string) => void }
): Promise<string> {
  const api = getApi();
  if (!api) throw new Error('YiAi not configured');

  // 1. 语言代码映射
  const fromLang = mapLang(from);
  const toLang = mapLang(to);

  // 2. 构建 Provider 配置
  const providerConfig = { [serviceName]: { ...options.config } };

  // 3. RPC 调用
  const res = await api.rpc<Array<{ provider, text, cached?, error? }>>(
    'services.translation.translate_service', 'translate',
    { text, from_lang: fromLang, to_lang: toLang,
      providers: [serviceName], provider_config: providerConfig, use_memory: true }
  );

  // 4. 解包结果
  const first = res.data?.[0];
  if (!first || first.error) throw new Error(first?.error || 'No result');
  if (options.setResult) options.setResult(first.text);
  return first.text;
}
```

### 2.4 语言代码映射

```typescript
function mapLang(code: string): string {
  const MAP: Record<string, string> = {
    'auto': 'auto', 'zh_cn': 'zh', 'zh_tw': 'zh-TW', 'en': 'en',
    'ja': 'ja', 'ko': 'ko', 'fr': 'fr', 'es': 'es', 'ru': 'ru',
    'de': 'de', 'it': 'it', 'pt': 'pt', 'vi': 'vi', 'th': 'th',
    'ar': 'ar', 'tr': 'tr', 'pl': 'pl', 'nl': 'nl', 'sv': 'sv',
    'uk': 'uk', 'he': 'he', 'id': 'id', 'ms': 'ms', 'hi': 'hi',
  };
  return MAP[code] || code;  // 未知代码透传
}
```

**关键点**：
- YiPot 内部使用 `zh_cn` / `zh_tw` 格式（JavaScript 约定）
- YiAi Provider 使用 `zh` / `zh-TW` 格式（国际标准）
- `mapLang()` 在路由层做转换，Provider 无需关心语言代码格式

### 2.5 OCR / TTS / 生词本适配器

```typescript
// OCR — 当前未路由到 YiAi（保留给未来）
export async function recognizeViaYiAi(serviceName, imageBase64, language, options) { ... }

// TTS — 通过 YiAi RPC 调用
export async function ttsViaYiAi(text, language, options) { ... }

// 生词本 — 通过 YiAi RPC 调用
export async function collectViaYiAi(provider, source, target, options) { ... }
```

---

## 三、TargetArea 修改

### 3.1 关键变更

**新增 `handleTranslateSuccess` 辅助函数**（提取重复的成功处理逻辑）：

```javascript
const handleTranslateSuccess = (v, sourceText, detectLanguage, newTargetLanguage,
                                  translateServiceName, id, index, setHideOnce) => {
    if (translateID[index] !== id) return;
    setResult(typeof v === 'string' ? v.trim() : v);
    setIsLoading(false);
    if (v !== '') setHideOnce(false);
    if (!historyDisable) {
        addToHistory(sourceText.trim(), detectLanguage, newTargetLanguage,
                     translateServiceName, typeof v === 'string' ? v.trim() : v);
    }
    if (index === 0 && !clipboardMonitor) {
        // autoCopy 策略处理
    }
};
```

**修改翻译调度逻辑**（从直接调用到 YiAi 优先）：

```javascript
const useYiAi = shouldUseYiAi(translateServiceName);
const doTranslate = (svcName) => builtinServices[svcName].translate(...);
const onSuccess = (v) => handleTranslateSuccess(v, ...);
const onError = (e) => { setError(e.toString()); setIsLoading(false); };

if (useYiAi) {
    translateViaYiAi(translateServiceName, text, from, to, { config, ... })
        .then(onSuccess)
        .catch((_yiAiErr) => {
            log(`YiAi fallback: ${_yiAiErr}`);
            doTranslate(translateServiceName).then(onSuccess).catch(onError);
        });
} else {
    doTranslate(translateServiceName).then(onSuccess).catch(onError);
}
```

### 3.2 影响范围

| 变更类型 | 影响 | 风险 |
|---------|------|------|
| `handleTranslateSuccess` 提取 | 减少 ~30 行重复代码 | 低 — 纯函数提取 |
| AI 引擎路由 | 仅影响 4 个引擎（openai/ollama/chatglm/geminipro） | 中 — 降级保证安全性 |
| 传统引擎路径 | 无变化 | 无 |
| 插件引擎路径 | 无变化 | 无 |
| 翻译回译功能 | 同样走 YiAi 优先路径 | 低 |

---

## 四、降级策略

```
翻译请求
  │
  ├─ shouldUseYiAi() = true
  │   │
  │   ├─ getApi() 返回 null
  │   │   └─ throw → catch → doTranslate() [降级：YiAi 未配置]
  │   │
  │   ├─ api.rpc() 网络错误
  │   │   └─ reject → catch → doTranslate() [降级：YiAi 不可达]
  │   │
  │   ├─ api.rpc() code ≠ 0
  │   │   └─ res.ok = false → throw → catch → doTranslate() [降级：业务错误]
  │   │
  │   └─ api.rpc() 成功 → onSuccess(v)
  │
  └─ shouldUseYiAi() = false
      └─ doTranslate() [保持原有直接调用]
```

**关键保证**：任何 YiAi 路径的失败都会自动降级到原有的直接 API 调用，用户始终能看到翻译结果。

---

## 五、实施进度

| 任务 | 文件 | 状态 |
|------|------|------|
| INT-01 | `main.jsx` — 启动时 `initApi()` | ✅ |
| INT-02 | `yiaiAdapter.ts` — translateViaYiAi + shouldUseYiAi + mapLang | ✅ |
| INT-03 | `yiaiAdapter.ts` — recognizeViaYiAi + ttsViaYiAi + collectViaYiAi | ✅ |
| INT-04 | `TargetArea/index.jsx` — handleTranslateSuccess 提取 | ✅ |
| INT-05 | `TargetArea/index.jsx` — AI 引擎路由 + 降级逻辑 | ✅ |
| INT-06 | `useApi.ts` — React Hook | ✅ |