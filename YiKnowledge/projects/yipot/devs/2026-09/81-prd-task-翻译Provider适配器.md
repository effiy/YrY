---

doc_type: module
prd_task_id: "YP-09-53-1"
title: "YiAi 翻译 Provider 适配器 — 开发方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_backend: 1.5
source_prd: "53-prd-YiAi后端集成.md"
parent_module: "YP-09-53"
related_tests: ["YP-09-53"]

type: task
---

# YiAi 翻译 Provider 适配器 — 开发方案

> 来源 PRD：[53-prd-YiAi后端集成.md](../../prds/2026-09/53-prd-YiAi后端集成.md) · 父模块：[80-prd-task-YiAi后端集成.md](./80-prd-task-YiAi后端集成.md)
> 需求编号：YP-09-53-1 · 优先级：P0 · 人天：1.5d

> **文档职责**：13 个翻译引擎 Provider 适配器的实现细节——从 JS 前端代码迁移到 Python 后端的完整记录。

---

## 源码索引

| 文件 | 说明 | 行数 |
|------|------|------|
| `YiAi/src/services/translation/providers/base.py` | 抽象基类 `BaseTranslateProvider` + `TranslationResult` 数据类 | 65 |
| `YiAi/src/services/translation/providers/__init__.py` | Provider 注册表 + 懒加载 `_init_translate_providers()` | 75 |
| `YiAi/src/services/translation/providers/openai.py` | OpenAI / 兼容 API（含 SSE 流式 `translate_stream`） | 120 |
| `YiAi/src/services/translation/providers/ollama.py` | Ollama 本地 LLM（含 SSE 流式） | 75 |
| `YiAi/src/services/translation/providers/google.py` | Google 翻译（文本模式 + 词典模式 `_format_dict`） | 65 |
| `YiAi/src/services/translation/providers/deepl.py` | DeepL（free/api/deeplx 三模式 + 反爬虫时间戳） | 95 |
| `YiAi/src/services/translation/providers/baidu.py` | 百度翻译（MD5 签名 `appid+text+salt+secret`） | 50 |
| `YiAi/src/services/translation/providers/tencent.py` | 腾讯云 TMT（TC3-HMAC-SHA256 完整签名流程） | 75 |
| `YiAi/src/services/translation/providers/volcengine.py` | 火山翻译（`X-Access-Key-Id` + `X-Secret-Key` 头部） | 45 |
| `YiAi/src/services/translation/providers/microsoft.py` | 微软 Bing 翻译（`Ocp-Apim-Subscription-Key`） | 45 |
| `YiAi/src/services/translation/providers/youdao.py` | 有道翻译（SHA256 v3 签名 `_truncate` 截断） | 60 |
| `YiAi/src/services/translation/providers/aliyun.py` | 阿里云翻译（`X-Access-Key-Id` + `X-Access-Key-Secret`） | 45 |
| `YiAi/src/services/translation/providers/caiyun.py` | 彩云小译（`X-Authorization: token <token>`） | 40 |
| `YiAi/src/services/translation/providers/niutrans.py` | 小牛翻译（简单 API Key POST） | 35 |
| `YiAi/src/services/translation/providers/yandex.py` | Yandex 翻译（`Authorization: Api-Key`） | 40 |

---

## 一、架构设计

### 1.1 Provider 抽象基类

```python
@dataclass
class TranslationResult:
    provider: str       # Provider 名称（如 "openai"）
    text: str           # 翻译结果文本
    from_lang: str = "" # 源语言代码
    to_lang: str = ""   # 目标语言代码

class BaseTranslateProvider(ABC):
    name: str = "base"          # 注册表索引键
    label: str = "Base Provider" # 人类可读标签

    @abstractmethod
    async def _translate(self, text, from_lang, to_lang, **config) -> str:
        """子类实现：调用第三方 API 的原始逻辑。"""

    async def translate(self, text, from_lang, to_lang, **config) -> TranslationResult:
        """模板方法：统一错误包装 + 结果标准化。"""
        result_text = await self._translate(text, from_lang, to_lang, **config)
        return TranslationResult(provider=self.name, text=result_text.strip(), ...)
```

**设计理由**：
- `_translate` 是唯一需要子类实现的方法 — 最小化适配成本
- `translate` 是模板方法 — 统一的错误包装、结果标准化、strip 处理
- `TranslationResult` 是不可变数据类 — 所有 Provider 返回统一格式
- `name` 是类属性 — 注册表通过 `p.name` 索引，无需字符串映射

### 1.2 懒加载注册表

```python
TRANSLATE_PROVIDERS: dict[str, BaseTranslateProvider] = {}

def _init_translate_providers():
    if TRANSLATE_PROVIDERS:  # 已初始化
        return
    from services.translation.providers.openai import OpenAIProvider
    # ... 13 个 import
    for p in [OpenAIProvider(), GoogleProvider(), ...]:
        TRANSLATE_PROVIDERS[p.name] = p
```

**设计理由**：19 个 Provider 不在模块导入时实例化，而是在首次 RPC 调用时懒加载。减少冷启动时间，避免导入失败的 Provider 阻塞整个模块。

---

## 二、关键 Provider 实现

### 2.1 OpenAI — LLM 类翻译 + SSE 流式

```python
class OpenAIProvider(BaseTranslateProvider):
    name = "openai"

    async def _translate(self, text, from_lang, to_lang, **config) -> str:
        request_path = config.get("request_path", "https://api.openai.com")
        model = config.get("model", "gpt-3.5-turbo")
        api_key = config.get("api_key", "")

        # 兼容 OpenAI 和类 OpenAI API（ChatGLM/Gemini 等）
        service = config.get("service", "openai")
        url = request_path.rstrip("/")
        if service == "openai" and not url.endswith("/chat/completions"):
            url = f"{url}/v1/chat/completions"

        headers = {"Content-Type": "application/json"}
        if service == "openai":
            headers["Authorization"] = f"Bearer {api_key}"
        else:
            headers["api-key"] = api_key

        # 支持自定义 prompt
        prompt_list = config.get("prompt_list") or [
            {"role": "system", "content": "You are a professional translation engine..."},
            {"role": "user", "content": f"Translate into {to_lang}:\n\"\"\"\n{text}\n\"\"\""},
        ]

        body = {"model": model, "messages": prompt_list, "stream": False}
        # 合并额外参数（temperature, top_p 等）
        extra_args = json.loads(config.get("request_arguments", "{}"))
        body.update(extra_args)

        client = get_shared_client()  # 共享连接池
        resp = await client.post(url, json=body, headers=headers, timeout=60.0)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip().strip('"')
```

**流式翻译**：`translate_stream()` 方法使用 `client.stream("POST", ...)` + `resp.aiter_lines()` 逐行解析 SSE `data:` 帧，yield 增量文本。

### 2.2 Google — 文本翻译 + 词典模式

```python
class GoogleProvider(BaseTranslateProvider):
    name = "google"

    async def _translate(self, text, from_lang, to_lang, **config) -> str:
        custom_url = config.get("custom_url", "https://translate.google.com")
        params = {"client": "gtx", "sl": from_lang, "tl": to_lang, "q": text, ...}
        resp = await get_shared_client().get(f"{custom_url}/translate_a/single", params=params)
        result = resp.json()

        if result[1]:  # 词典模式：result[1] 存在 = 有词典释义
            return self._format_dict(result)  # 返回 {pronunciations, explanations, ...}
        return "".join(r[0] for r in result[0] if r[0]).strip()  # 文本翻译模式
```

**Google 响应结构**（`translate_a/single`）：
- `result[0]` — 翻译句子数组（`[[translated_text, original, ...], ...]`）
- `result[1]` — 词典条目（词性、释义）
- `result[13]` — 例句

### 2.3 DeepL — 三模式支持

| 模式 | 触发条件 | 端点 | 签名 |
|------|---------|------|------|
| Free | `type: "free"` | `www2.deepl.com/jsonrpc` | JSON-RPC + 反爬虫时间戳 |
| API | `type: "api"` | `api.deepl.com/v2/translate` | `DeepL-Auth-Key` 头部 |
| DeepLX | `type: "deeplx"` | 自定义 URL | 简单 POST |

**Free 模式反爬虫时间戳**：
```python
def _get_timestamp(i_count):
    ts = int(time.time() * 1000)
    if i_count != 0:
        i_count += 1
        return ts - (ts % i_count) + i_count
    return ts
```
`i_count` = 文本中字母 `i` 的出现次数 + 1。

**API Key 后缀路由**：
- `:fx` → `api-free.deepl.com`（免费套餐）
- `:dp` → `api.deepl-pro.com`（专业套餐）
- 其他 → `api.deepl.com`（标准套餐）

### 2.4 腾讯云 TMT — TC3-HMAC-SHA256 签名

```python
# 步骤 1: 拼接规范请求串
canonical_request = "POST\n/\n\ncontent-type:application/json\nhost:tmt.tencentcloudapi.com\n\ncontent-type;host\n" + sha256(payload)

# 步骤 2: 拼接待签名字符串
string_to_sign = f"TC3-HMAC-SHA256\n{timestamp}\n{date}/tmt/tc3_request\n{sha256(canonical_request)}"

# 步骤 3: 计算签名
kDate = hmac_sha256("TC3" + secret_key, date)
kService = hmac_sha256(kDate, "tmt")
kSigning = hmac_sha256(kService, "tc3_request")
signature = hex(hmac_sha256(kSigning, string_to_sign))
```

这是 13 个 Provider 中最复杂的签名流程，直接从 YiPot JS 前端 `crypto-js/hmac-sha256` 迁移到 Python `hmac` + `hashlib`。

---

## 三、从 JS 到 Python 的迁移对照

| JS (YiPot 前端) | Python (YiAi 后端) |
|-----------------|-------------------|
| `@tauri-apps/api/http fetch()` | `httpx.AsyncClient.post()` |
| `md5(str)` | `hashlib.md5(str.encode()).hexdigest()` |
| `crypto-js/hmac-sha256` | `hmac.new(key, msg, hashlib.sha256)` |
| `nanoid()` | `uuid.uuid4()` |
| `JSON.stringify(body)` | `json.dumps(body)` |
| Tauri Body.json/Text | httpx `json=` / `content=` |
| 浏览器 `window.fetch` SSE | `httpx.stream()` + `aiter_lines()` |

---

## 四、关键技术决策

**KD-1: 共享连接池** — 所有 Provider 使用 `get_shared_client()` 返回的全局 `httpx.AsyncClient`，避免每次请求创建新 TCP 连接（~50-100ms 节省）。

**KD-2: Provider 配置字典传递** — API Key/Secret/Model 等配置通过 `**config` 字典传递，不硬编码在任何 Provider 中。

**KD-3: SSE 流式仅在 LLM Provider 实现** — `translate_stream()` 方法是可选的（`getattr(p, "translate_stream", None)`），非 LLM Provider 不实现。

---

## 五、实施进度

| 编号 | Provider | 源 JS 文件 | 状态 |
|------|----------|-----------|------|
| P-01 | OpenAI | `services/translate/openai/index.jsx` | ✅ |
| P-02 | Ollama | `services/translate/ollama/index.jsx` | ✅ |
| P-03 | Google | `services/translate/google/index.jsx` | ✅ |
| P-04 | DeepL | `services/translate/deepl/index.jsx` | ✅ |
| P-05 | Baidu | `services/translate/baidu/index.jsx` | ✅ |
| P-06 | Tencent | `services/translate/tencent/index.jsx` | ✅ |
| P-07 | Volcengine | `services/translate/volcengine/index.jsx` | ✅ |
| P-08 | Microsoft | `services/translate/bing/index.jsx` | ✅ |
| P-09 | Youdao | `services/translate/youdao/index.jsx` | ✅ |
| P-10 | Alibaba | `services/translate/alibaba/index.jsx` | ✅ |
| P-11 | Caiyun | `services/translate/caiyun/index.jsx` | ✅ |
| P-12 | Niutrans | `services/translate/niutrans/index.jsx` | ✅ |
| P-13 | Yandex | `services/translate/yandex/index.jsx` | ✅ |