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
related_tests: ["YP-09-53"]
related_modules: ["YP-09-53-1", "YP-09-53-2", "YP-09-53-3", "YP-09-53-4", "YP-09-53-5", "YP-09-53-6", "YP-09-53-7", "YP-09-53-8"]
implementation_progress: "7/7 子模块完成，34 文件新增/修改，406 单元测试通过"

type: task
---

# YiAi 后端集成 — 开发方案

> 来源 PRD：[53-prd-YiAi后端集成.md](../../prds/2026-09/53-prd-YiAi后端集成.md)
> 需求编号：YP-09-53 · 优先级：P0 · 人天：4.5d · 状态：全部完成（7/7 子模块）

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> **子模块索引**：
> | 编号 | 模块 | 文档 |
> |------|------|------|
> | YP-09-53-1 | 翻译 Provider 适配器 | [81-prd-task-翻译Provider适配器.md](./81-prd-task-翻译Provider适配器.md) |
> | YP-09-53-2 | OCR Provider 适配器 | [82-prd-task-OCRProvider适配器.md](./82-prd-task-OCRProvider适配器.md) |
> | YP-09-53-3 | TTS + 生词本 Provider | [83-prd-task-TTS生词本Provider适配器.md](./83-prd-task-TTS生词本Provider适配器.md) |
> | YP-09-53-4 | 翻译记忆 + RAG 上下文 | [84-prd-task-翻译记忆与RAG上下文.md](./84-prd-task-翻译记忆与RAG上下文.md) |
> | YP-09-53-5 | YiPot API 四层架构 | [85-prd-task-YiPotAPI四层架构.md](./85-prd-task-YiPotAPI四层架构.md) |
> | YP-09-53-6 | 前端集成 + 降级 | [86-prd-task-前端集成YiAi路由降级.md](./86-prd-task-前端集成YiAi路由降级.md) |
> | YP-09-53-7 | 知识库文档 + 基础设施 | [87-prd-task-知识库文档与基础设施.md](./87-prd-task-知识库文档与基础设施.md) |
> | YP-09-53-8 | Provider 健康监控 + 趋势 | [88-prd-task-Provider健康监控.md](./88-prd-task-Provider健康监控.md) |

---

## 源码索引

### YiAi 后端 — services/translation/ (19 文件)

| 文件 | 说明 | 行数 |
|------|------|------|
| `services/translation/__init__.py` | 模块导出 + RPC 方法清单 | +40 |
| `services/translation/translate_service.py` | 翻译服务编排（并行调度 + 记忆缓存 + 分析） | +170 |
| `services/translation/recognize_service.py` | OCR 识别服务编排 | +50 |
| `services/translation/tts_service.py` | TTS 语音合成服务 | +40 |
| `services/translation/collection_service.py` | 生词本服务 | +40 |
| `services/translation/memory_service.py` | 翻译记忆（MongoDB 缓存 + 前缀搜索 + 统计） | +80 |
| `services/translation/context_service.py` | RAG 上下文增强翻译 | +75 |
| `services/translation/providers/__init__.py` | Provider 注册表 + 懒加载 | +75 |
| `services/translation/providers/base.py` | 4 个抽象基类 + TranslationResult 数据类 | +65 |
| `services/translation/providers/openai.py` | OpenAI / 兼容 API Provider + SSE 流式 | +120 |
| `services/translation/providers/ollama.py` | Ollama 本地 LLM Provider + SSE 流式 | +75 |
| `services/translation/providers/google.py` | Google 翻译（含词典模式） | +65 |
| `services/translation/providers/deepl.py` | DeepL（free/api/deeplx 三模式） | +95 |
| `services/translation/providers/baidu.py` | 百度翻译（MD5 签名） | +50 |
| `services/translation/providers/tencent.py` | 腾讯云 TMT（TC3-HMAC-SHA256 签名） | +75 |
| `services/translation/providers/volcengine.py` | 火山翻译 | +45 |
| `services/translation/providers/microsoft.py` | 微软 Bing 翻译 | +45 |
| `services/translation/providers/youdao.py` | 有道翻译（SHA256 v3 签名） | +60 |
| `services/translation/providers/aliyun.py` | 阿里云翻译 | +45 |
| `services/translation/providers/caiyun.py` | 彩云小译 | +40 |
| `services/translation/providers/niutrans.py` | 小牛翻译 | +35 |
| `services/translation/providers/yandex.py` | Yandex 翻译 | +40 |
| `services/translation/providers/baidu_ocr.py` | 百度 OCR（含 token 获取） | +50 |
| `services/translation/providers/tencent_ocr.py` | 腾讯云 OCR（TC3 签名） | +75 |
| `services/translation/providers/volcengine_ocr.py` | 火山 OCR | +40 |
| `services/translation/providers/iflytek_ocr.py` | 讯飞 OCR | +65 |
| `services/translation/providers/lingva_tts.py` | Lingva TTS | +30 |
| `services/translation/providers/anki.py` | Anki（AnkiConnect 本地 API） | +50 |
| `services/translation/providers/eudic.py` | 欧路词典 | +35 |

### YiAi 基础设施 (2 文件)

| 文件 | 说明 | 行数 |
|------|------|------|
| `shared/runtime.py` | 新增 `get_shared_client()` + `close_shared_client()` | +30 |
| `server/lifespan.py` | Shutdown 时清理共享 HTTP 客户端 | +5 |

### YiPot 前端 — src/api/ (8 文件)

| 文件 | 说明 | 行数 |
|------|------|------|
| `src/api/client.ts` | fetch 封装 + RPC 信封 + SSE 流式 | +205 |
| `src/api/endpoints.ts` | 端点常量（匹配 YiAi 路由） | +55 |
| `src/api/types.ts` | 翻译/OCR/TTS/RAG 类型定义 | +100 |
| `src/api/index.ts` | 桶导出 | +20 |
| `src/api/init.ts` | API 客户端初始化 + 全局存储 | +35 |
| `src/api/services/translation.ts` | 翻译服务封装 | +95 |
| `src/api/services/knowledge.ts` | 知识库/RAG 服务封装 | +55 |
| `src/api/services/index.ts` | 服务聚合 + createApiServices | +30 |

### YiPot 集成修改 (3 文件)

| 文件 | 说明 | 变化 |
|------|------|------|
| `src/main.jsx` | 启动时初始化 YiAi API 客户端 | +3 |
| `src/window/Translate/components/TargetArea/index.jsx` | AI 引擎路由到 YiAi + 降级 | +25 / -30 |
| `src/services/yiaiAdapter.ts` | YiAi RPC 翻译/OCR/TTS/生词本适配器（新建） | +175 |
| `src/hooks/useApi.ts` | React useApi hook（新建） | +25 |

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、模块实现详情](#sec-3)
- [四、实施进度追踪](#sec-4)
- [五、已知缺口](#sec-5)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 分层结构

```
┌──────────────────────────────────────────────┐
│  YiPot TargetArea (React)                     │
│  shouldUseYiAi() → translateViaYiAi()         │
│  fallback → builtinServices[name].translate() │
├──────────────────────────────────────────────┤
│  YiPot API Layer (src/api/)                   │
│  client.ts → rpc(module, method, params)      │
│       │ RPC 信封 POST /                        │
├───────┴──────────────────────────────────────┤
│  YiAi Execution Module (:10086 /)             │
│  POST {module_name, method_name, parameters}  │
├──────────────────────────────────────────────┤
│  YiAi Translation Module (services/)          │
│  translate_service → translate()              │
│       ├── memory_service.lookup()  ← 检查缓存  │
│       ├── asyncio.gather(providers) ← 并行翻译 │
│       ├── memory_service.store()   ← 存储结果  │
│       └── _log_record()            ← 记录分析  │
├──────────────────────────────────────────────┤
│  Provider Adapters (providers/)               │
│  openai.py → httpx → api.openai.com           │
│  google.py → httpx → translate.google.com     │
│  ... (19 adapters total)                      │
└──────────────────────────────────────────────┘
```

### 1.2 数据流时序

```
TargetArea.translate()
  │
  ├─ shouldUseYiAi('openai')?
  │   YES → translateViaYiAi(text, from, to, config)
  │          │
  │          ├─ getApi().rpc('services.translation.translate_service', 'translate', {...})
  │          │   │ POST / {module_name, method_name, parameters}
  │          │   ▼
  │          │   YiAi translate_service.translate()
  │          │   │
  │          │   ├─ memory_service.lookup(text, from, to)
  │          │   │   └─ MongoDB find_one({text_hash: sha256[:16]})
  │          │   │       ├─ HIT  → return [{cached: true, text: "..."}]
  │          │   │       └─ MISS → continue
  │          │   │
  │          │   ├─ asyncio.gather([openai.translate(), google.translate()])
  │          │   │   ├─ OpenAIProvider._translate()
  │          │   │   │   └─ get_shared_client().post(api.openai.com, body)
  │          │   │   └─ GoogleProvider._translate()
  │          │   │       └─ get_shared_client().get(translate.google.com, params)
  │          │   │
  │          │   ├─ memory_service.store(text, from, to, result, provider)
  │          │   │   └─ MongoDB upsert({text_hash}, {$set: {...}})
  │          │   │
  │          │   └─ _log_record(source, from, to, results)
  │          │       └─ MongoDB insert_one(translation_records)
  │          │
  │          └─ return [{provider, text, from_lang, to_lang}]
  │
  │   SUCCESS → handleTranslateSuccess(v)
  │   FAIL    → fallback: builtinServices['openai'].translate(text, from, to)
  │
  └─ NO (baidu/google) → builtinServices[name].translate() (direct API)
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### 2.1 共享连接池：`get_shared_client()`

**问题**：每个 Provider 独立创建 `httpx.AsyncClient` 导致 TCP 连接无法复用，每次请求都有 ~50-100ms 的握手开销。

**方案**：在 `shared/runtime.py` 中新增全局单例：

```python
_shared_http_client: httpx.AsyncClient | None = None

def get_shared_client() -> httpx.AsyncClient:
    global _shared_http_client
    if _shared_http_client is None or _shared_http_client.is_closed:
        _shared_http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
            http2=False,
        )
    return _shared_http_client
```

**与现有模式的对比**：
- `services/ai/provider_ollama.py` — 已有 `_shared_client` 模式（仅用于 Ollama）
- `services/ai/model_runtime/ollama.py` — 已有 `_ollama_client` 模式
- `domain/rag/llm_stream.py` — 已有 `_http_client` 模式

`get_shared_client()` 统一了这三种模式，并被所有 29 个 Provider 复用。

### 2.2 Provider 懒加载注册表

**问题**：19 个 Provider 在模块导入时全部实例化会增加启动时间。

**方案**：Provider 实例在首次 RPC 调用时通过 `_init_*_providers()` 懒加载：

```python
TRANSLATE_PROVIDERS: dict[str, BaseTranslateProvider] = {}

def _init_translate_providers():
    if TRANSLATE_PROVIDERS:
        return  # already initialized
    from services.translation.providers.openai import OpenAIProvider
    # ... import all providers
    for p in [OpenAIProvider(), GoogleProvider(), ...]:
        TRANSLATE_PROVIDERS[p.name] = p
```

### 2.3 Provider 抽象基类

```python
@dataclass
class TranslationResult:
    provider: str
    text: str
    from_lang: str = ""
    to_lang: str = ""

class BaseTranslateProvider(ABC):
    name: str = "base"
    label: str = "Base Provider"

    @abstractmethod
    async def _translate(self, text, from_lang, to_lang, **config) -> str:
        """Provider-specific logic. Must be implemented."""

    async def translate(self, text, from_lang, to_lang, **config) -> TranslationResult:
        """Public method with error wrapping."""
        result_text = await self._translate(text, from_lang, to_lang, **config)
        return TranslationResult(provider=self.name, text=result_text.strip(), ...)
```

**设计理由**：
- `_translate` 是抽象方法 — 子类只需实现 API 调用逻辑
- `translate` 是模板方法 — 统一错误包装、结果标准化
- `TranslationResult` 是数据类 — 所有 Provider 返回统一格式
- `name` + `label` 是类属性 — 注册表通过 `name` 索引

### 2.4 Protect 降级策略

**决策**：`yiaiAdapter.ts` 中的 `translateViaYiAi()` 失败时自动回退到 `builtinServices[name].translate()`。

```
translateViaYiAi(openai, text, from, to, config)
  .then(onSuccess)
  .catch((yiAiErr) => {
    log(`YiAi fallback: ${yiAiErr}`);
    builtinServices['openai'].translate(text, from, to, config)
      .then(onSuccess).catch(onError);
  });
```

**降级触发条件**：
- YiAi 不可达（网络错误）
- YiAi 返回错误（HTTP 非 2xx）
- RPC 响应 code ≠ 0

---

<a id="sec-3"></a>
## 三、模块实现详情

### 3.1 translate_service.py — 翻译服务编排

**核心函数**：

```python
async def translate(
    text: str,
    from_lang: str = "auto",
    to_lang: str = "zh",
    providers: list[str] | None = None,
    provider_config: dict | None = None,
    use_memory: bool = True,
) -> list[dict]:
```

**执行流程**：

1. `_init_translate_providers()` — 懒加载 Provider 注册表
2. 如果 `use_memory=True`，调用 `memory_service.lookup()` 检查缓存
3. 构建 `asyncio.gather` 任务列表（每个选中的 Provider 一个任务）
4. 并行执行所有翻译任务
5. 收集结果（成功 + 错误，`return_exceptions=True`）
6. 成功结果调用 `memory_service.store()` 写入缓存
7. 调用 `_log_record()` 写入 MongoDB `translation_records`
8. 返回结果列表

**错误处理**：每个 Provider 失败不影响其他 Provider 的结果。失败的 Provider 返回 `{provider, text: "", error: "..."}`。

**缓存策略**：
- 缓存命中时，如果 `providers` 只包含该 Provider，直接返回缓存结果
- 如果 `providers` 包含多个 Provider，仍调用 API 但标记缓存命中的那个

### 3.2 memory_service.py — 翻译记忆

**数据模型**：

```json
{
  "text_hash": "a1b2c3d4e5f6g7h8",  // SHA256(text + from_lang + to_lang)[:16]
  "source": "Hello world",
  "target": "你好世界",
  "from_lang": "en",
  "to_lang": "zh",
  "provider": "openai",
  "created_at": "2026-09-23T10:00:00Z",
  "updated_at": "2026-09-23T10:00:00Z"
}
```

**API**：

| 函数 | 用途 | 查询条件 |
|------|------|---------|
| `lookup(text, from, to)` | 查找缓存 | `text_hash` 精确匹配 |
| `store(text, from, to, result, provider)` | 存储结果 | `text_hash` upsert |
| `search_by_prefix(prefix, from, to)` | 前缀搜索 | `source` regex `^prefix` |
| `stats()` | 统计信息 | 聚合查询 |

### 3.3 context_service.py — RAG 上下文增强

**核心流程**：

```python
async def translate_with_context(text, from_lang, to_lang, provider, domain=None, context=None):
    # 1. 查询 RAG（如果指定 domain）
    rag_context = await _fetch_rag_context(text, domain) if domain else ""

    # 2. 构建增强 prompt
    system_parts = ["You are a professional translation engine..."]
    if rag_context:
        system_parts.append(f"Domain-specific terminology:\n{rag_context}")

    # 3. 调用 Provider
    enhanced_config = {"prompt_list": [
        {"role": "system", "content": "\n".join(system_parts)},
        {"role": "user", "content": f"Translate into {to_lang}:\n{text}"}
    ]}
    return await provider.translate(text, from_lang, to_lang, **enhanced_config)
```

### 3.4 yiAiAdapter.ts — 前端路由适配器

**核心函数**：

```typescript
// AI 引擎判断
function shouldUseYiAi(serviceName: string): boolean {
  const AI_PROVIDERS = ['openai', 'ollama', 'chatglm', 'geminipro'];
  return AI_PROVIDERS.includes(serviceName);
}

// YiAi RPC 翻译
async function translateViaYiAi(serviceName, text, from, to, options): Promise<string> {
  const api = getApi();
  const res = await api.rpc('services.translation.translate_service', 'translate', {
    text, from_lang: mapLang(from), to_lang: mapLang(to),
    providers: [serviceName], provider_config: { [serviceName]: options.config },
    use_memory: true,
  });
  return res.data?.[0]?.text;
}
```

**语言代码映射**：

```typescript
function mapLang(code: string): string {
  const MAP = { zh_cn: 'zh', zh_tw: 'zh-TW', en: 'en', ja: 'ja', /* ... */ };
  return MAP[code] || code;
}
```

### 3.5 TargetArea 修改要点

**修改位置**：`src/window/Translate/components/TargetArea/index.jsx` 第 254-276 行

**关键变更**：
1. 新增 `handleTranslateSuccess` 辅助函数 — 提取重复的翻译成功处理逻辑
2. 新增 `useYiAi` 判断 + `doTranslate` 延迟执行
3. AI 引擎路径：`translateViaYiAi()` → 成功调用 `onSuccess` → 失败回退 `doTranslate()`
4. 传统引擎路径：保持原有的 `builtinServices[name].translate()` 直接调用
5. 插件引擎路径：保持不变（`invoke_plugin` 本地执行）

---

<a id="sec-4"></a>
## 四、实施进度追踪

| 子模块 | 编号 | 内容 | 状态 | 文件数 |
|--------|------|------|------|--------|
| YiAi 翻译 Provider | YP-09-53-1 | 13 个翻译引擎适配器 + base | ✅ | 14 |
| YiAi OCR Provider | YP-09-53-2 | 4 个 OCR 引擎适配器 | ✅ | 4 |
| YiAi TTS + 生词本 | YP-09-53-3 | TTS + 2 生词本适配器 | ✅ | 3 |
| YiAi 记忆 + 上下文 | YP-09-53-4 | memory_service + context_service | ✅ | 2 |
| YiPot API 层 | YP-09-53-5 | client + endpoints + types + services | ✅ | 8 |
| YiPot 前端集成 | YP-09-53-6 | main.jsx + TargetArea + yiaiAdapter | ✅ | 4 |
| 知识库文档 | YP-09-53-7 | CLAUDE.md + PRD + dev + test + architecture | ✅ | 5 |

---

<a id="sec-5"></a>
## 五、已知缺口

1. **Provider 单元测试** — 当前 Provider 需要 mock httpx 响应才能测试，尚未编写独立的 Provider 单元测试
2. **翻译记录 TTL 索引** — `translation_records` 集合未设置 TTL 索引，历史数据会无限增长
3. **YiPot 构建 CI** — YiPot 项目无 CI pipeline，`pnpm build` 仅在本地验证
4. **翻译质量评分** — 未实现用户对翻译结果的评分反馈机制
5. **Provider 配置热更新** — Provider 配置变更需重启 YiAi，不支持运行时热加载