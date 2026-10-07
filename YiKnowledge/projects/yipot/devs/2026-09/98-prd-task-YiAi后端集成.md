---

doc_type: module
prd_task_id: "YP-09-53"
title: "YiAi 后端集成 — 开发方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer, leader]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_backend: 3
estimate_frontend: 1.5
source_prd: "53-prd-YiAi后端集成.md"

type: task
---

# YiAi 后端集成 — 开发方案

> 来源 PRD：[53-prd-YiAi后端集成.md](../../prds/2026-09/53-prd-YiAi后端集成.md)
> 需求编号：YP-09-53 · 优先级：P0 · 总人天：~4.5d

---

## 一、架构总览

将 YiPot 翻译/OCR/TTS/生词本的第三方 API 调用从 React 前端迁移到 YiAi Python 后端，通过 RPC 信封统一调用。

```
YiPot React             YiAi FastAPI (:10086)
────────────            ─────────────────────
src/api/client.ts  ───→ POST / RPC信封
  rpc(module, method,   ↓
  params)               services/translation/
                        ├── translate_service  → providers/{openai,google,...}
                        ├── memory_service     → MongoDB translation_memory
                        ├── context_service    → YiKnowledge RAG
                        └── recognize/tts/collection services
```

## 二、YiAi 后端实现

### 2.1 Provider 抽象基类

```python
# services/translation/providers/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class TranslationResult:
    text: str
    from_lang: str
    to_lang: str
    provider: str
    cached: bool = False
    error: str | None = None

class BaseTranslateProvider(ABC):
    name: str
    label: str

    @abstractmethod
    async def _translate(self, text, from_lang, to_lang, **config) -> str: ...

    async def translate(self, text, from_lang, to_lang, **config) -> TranslationResult:
        try:
            result = await asyncio.wait_for(
                self._translate(text, from_lang, to_lang, **config),
                timeout=config.get("timeout", 10)
            )
            return TranslationResult(text=result, from_lang=from_lang,
                                     to_lang=to_lang, provider=self.name)
        except Exception as e:
            return TranslationResult(text="", from_lang=from_lang,
                                     to_lang=to_lang, provider=self.name, error=str(e))
```

### 2.2 翻译服务编排

```python
# services/translation/translate_service.py
async def translate(
    text: str, from_lang: str = "auto", to_lang: str = "zh",
    providers: list[str] | None = None, provider_config: dict | None = None,
    use_memory: bool = True
) -> list[dict]:
    """多引擎并行翻译 + 记忆缓存"""
    results = []

    # 1. 查询翻译记忆
    if use_memory:
        for p in (providers or []):
            cached = await memory_service.lookup(text, from_lang, to_lang)
            if cached:
                results.append({**cached, "cached": True})
                providers.remove(p) if p in providers else None

    # 2. 并行调用剩余 Provider
    if providers:
        tasks = [get_provider(p).translate(text, from_lang, to_lang, **(provider_config or {}).get(p, {}))
                 for p in providers]
        new_results = await asyncio.gather(*tasks, return_exceptions=True)
        for r in new_results:
            results.append({"provider": r.provider, "text": r.text, "cached": False, "error": r.error})
            # 存入记忆
            if not r.error:
                await memory_service.store(text, from_lang, to_lang, r.text, r.provider)

    return results
```

### 2.3 共享 HTTP 连接池

```python
# shared/runtime.py
import httpx

_shared_client: httpx.AsyncClient | None = None

def get_shared_client() -> httpx.AsyncClient:
    global _shared_client
    if _shared_client is None or _shared_client.is_closed:
        _shared_client = httpx.AsyncClient(
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
            timeout=httpx.Timeout(10.0)
        )
    return _shared_client

async def close_shared_client():
    global _shared_client
    if _shared_client:
        await _shared_client.aclose()
        _shared_client = None
```

## 三、YiPot 前端实现

### 3.1 API 四层架构

```
src/api/
├── client.ts         — Layer 1: fetch 封装 + RPC 信封
├── endpoints.ts      — Layer 2: 路径常量
├── types.ts          — Layer 3: TypeScript 类型
└── services/
    └── translation.ts — Layer 4: 翻译领域服务
```

```typescript
// client.ts
interface YiAiResponse<T> { code: number; message: string; data: T; }

async function rpc<T>(module: string, method: string, params: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${baseUrl}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ module_name: module, method_name: method, parameters: params }),
    signal: AbortSignal.timeout(15000)
  });
  const json: YiAiResponse<T> = await res.json();
  if (json.code !== 0) throw new ApiError(json.code, json.message);
  return json.data;
}
```

### 3.2 降级策略实现

```typescript
// src/services/yiaiAdapter.ts
async function translateWithFallback(service: string, text: string, from: string, to: string, config: any) {
  if (!shouldUseYiAi(service)) {
    return builtinServices[service].translate(text, from, to, config);
  }
  try {
    return await api.rpc("services.translation.translate_service", "translate", {
      text, from_lang: from, to_lang: to,
      providers: [service], provider_config: { [service]: config }
    });
  } catch (e) {
    console.warn(`YiAi ${service} failed, fallback to direct call:`, e);
    return builtinServices[service].translate(text, from, to, config);
  }
}
```

## 四、设计决策

| 决策点 | 方案 | 理由 | 权衡 |
|--------|------|------|------|
| Provider 抽象 | ABC 基类 + `_translate` 抽象方法 | 统一错误处理、超时控制、结果标准化 | 增加一层调用开销 (< 1ms) |
| 并行调度 | `asyncio.gather` | asyncio 原生并发，零额外依赖 | 单 Provider 异常不阻断其他，需 `return_exceptions=True` |
| 共享连接池 | 模块级单例 `httpx.AsyncClient` | 连接复用减少 TCP 握手，全局生命周期管理 | 需在 shutdown 时显式关闭 |
| Provider 懒加载 | 首次调用时 `_init_providers()` | 减少冷启动时间，避免导入失败阻塞 | 首次翻译有额外 ~50ms Provider 初始化开销 |
| 降级策略 | 前端 catch → 直接 API 调用 | YiAi 不可达时用户无感知 | 部分翻译结果可能来自不同路径 |
| 记忆缓存键 | `SHA256(text+lang)[:16]` | 碰撞概率极低，固定长度索引 | 无法支持模糊匹配（由前缀搜索补偿） |

## 五、性能优化

| 优化点 | 手段 | 预期收益 |
|--------|------|---------|
| 连接池复用 | 50 max_connections + Keep-Alive | 后续请求减少 ~100ms TCP 握手 |
| 翻译记忆 | MongoDB 索引 `{text_hash, from_lang, to_lang}` | 缓存命中 < 50ms（vs API 调用 ~500ms） |
| Provider 懒加载 | 按需实例化 19 个 Provider | 冷启动减少 ~200ms |
| 并行翻译 | asyncio.gather 替代顺序调用 | N 引擎总时延 = max(各引擎) |
| 流式翻译 | OpenAI/Ollama 支持 SSE | 首 token 延迟 < 500ms |
| 请求取消 | AbortSignal.timeout(15s) | 前端快速切换语言时不积累请求 |

## 六、13 个 Provider 实现清单

| # | Provider | 文件 | 认证方式 | 特殊实现 |
|---|----------|------|---------|---------|
| 1 | OpenAI | `openai.py` | API Key | SSE 流式、自定义 model/prompt |
| 2 | Google | `google.py` | 免费 | 免费接口参数组装 |
| 3 | DeepL | `deepl.py` | API Key | formality 参数 |
| 4 | Baidu | `baidu.py` | AppID+Secret | MD5 签名 |
| 5 | Tencent | `tencent.py` | SecretId+Key | TC3-HMAC-SHA256 |
| 6 | Volcengine | `volcengine.py` | AK+SK | 火山 V4 签名 |
| 7 | Ollama | `ollama.py` | 本地 | SSE 流式 |
| 8 | Microsoft | `microsoft.py` | API Key | Azure region |
| 9 | Youdao | `youdao.py` | AppKey+Secret | MD5 签名、salt |
| 10 | Aliyun | `aliyun.py` | AK+SK | 阿里云通用签名 V1 |
| 11 | Caiyun | `caiyun.py` | Token | X-Authorization Header |
| 12 | Niutrans | `niutrans.py` | API Key | 垂直领域参数 |
| 13 | Yandex | `yandex.py` | Api-Key | Authorization Header |

## 七、交叉引用

| 关联文档 | 关系 | 路径 |
|---------|------|------|
| PRD 53 | 上游 | [53-prd-YiAi后端集成](../../prds/2026-09/53-prd-YiAi后端集成.md) |
| 测试方案 | 下游 | [95-prd-test-YiAi后端集成](../../tests/2026-09/95-prd-test-YiAi后端集成.md) |
| 源码 | YiAi | `YiAi/services/translation/` (14 files) |
| 源码 | YiPot API | `YiPot/src/api/` (8 files) |
| CLAUDE.md | 规范 | `YiPot/CLAUDE.md` / `YiAi/CLAUDE.md` |