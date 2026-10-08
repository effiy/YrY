---
title: YiPot YiAi 后端集成架构
tags: [architecture, yiai-integration, rpc, translation, yipot]
category: projects/yipot/workflows
created: 2026-09-23
updated: 2026-09-23
source: internal
type: architecture
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader]
benefit: 理解 YiPot 与 YiAi 的集成架构——完整架构图、RPC 方法契约、Provider 支持矩阵、降级策略
related:
  - ../prds/2026-09/53-prd-YiAi后端集成.md
  - ../devs/2026-09/80-prd-task-YiAi后端集成.md
  - ../../../leader/decisions/yipot-01-决策-翻译服务迁移YiAi.md
  - ../../../leader/decisions/yipot-02-决策-双层降级策略.md
---

# YiPot YiAi 后端集成架构

## 架构总览

```
YiPot 桌面应用
├── Rust 后端（桌面功能 — 保持不变）
│   ├── 截图捕获（screenshots crate）
│   ├── 系统 OCR（平台原生：Windows.Media.OCR / Apple Vision / Tesseract）
│   ├── 全局热键（global_shortcut）
│   ├── 剪切板监听（arboard）
│   ├── 系统托盘（SystemTray）
│   ├── 窗口管理（多窗口）
│   ├── 插件系统（.potext 本地加载和执行）
│   └── 本地 HTTP 服务（:60828，外部调用）
├── React 前端（UI + 服务路由）
│   ├── 翻译窗口（TargetArea — AI 引擎走 YiAi RPC + 降级）
│   ├── 识别窗口（SourceArea — 在线 OCR 走 YiAi RPC + 降级）
│   ├── 设置窗口（Config — YiAi URL 配置 + 连接状态）
│   └── API 层（src/api/ — 四层架构：client → endpoints → types → services）
│       │
│       │ RPC 信封 POST /  {module_name, method_name, parameters}
│       │ 降级：YiAi 不可达 → 回退前端直接 API 调用
│       ▼
YiAi FastAPI :10086
├── Execution Module（POST / → RPC 分发 → importlib + getattr）
├── Translation Module（services/translation/ — 29 文件）
│   ├── translate_service.py     — 多引擎并行 + 记忆缓存 + 日志
│   ├── recognize_service.py     — OCR 编排
│   ├── tts_service.py           — TTS 服务
│   ├── collection_service.py    — 生词本服务
│   ├── memory_service.py        — 翻译记忆（MongoDB translation_memory）
│   ├── context_service.py       — RAG 上下文增强
│   └── providers/               — 19 个适配器（13 翻译 + 4 OCR + 1 TTS + 1 生词本）
├── Shared Infrastructure
│   ├── shared/runtime.py        — get_shared_client() 全局连接池
│   └── server/lifespan.py       — shutdown 清理
└── MongoDB
    ├── translation_records       — 翻译历史
    ├── translation_memory        — 翻译记忆缓存
    └── translation_feedback      — 用户质量反馈
```

## RPC 方法契约

所有翻译/OCR/TTS/生词本调用通过标准 RPC 信封：

```
POST /  Content-Type: application/json

{
  "module_name": "services.translation.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific> }
}

响应: { "code": 0, "message": "ok", "data": <any> }
```

### 翻译（translate_service）

| 方法 | 参数 | 返回 | 流式 |
|------|------|------|------|
| `translate` | `text, from_lang, to_lang, providers?, provider_config?, use_memory?` | `[{provider, text, from_lang, to_lang, cached?, error?}]` | — |
| `translate_stream` | `text, from_lang, to_lang, provider, config?` | SSE 文本流 | ✅ |
| `translation_memory_search` | `prefix, from_lang, to_lang, limit?` | `[{source, target, provider}]` | — |
| `translation_memory_stats` | — | `{total, languages, providers}` | — |
| `translation_analytics` | `days?` | `{total_translations, by_target_language}` | — |
| `translation_feedback` | `source, target, rating, provider?, from_lang?, to_lang?` | `{success, error?}` | — |

### OCR（recognize_service）

| 方法 | 参数 | 返回 |
|------|------|------|
| `recognize` | `image_base64, language, providers?, provider_config?` | `[{provider, text, error?}]` |

### TTS（tts_service）

| 方法 | 参数 | 返回 |
|------|------|------|
| `tts` | `text, language, provider?, config?` | `{provider, audio, format?, error?}` |

### 生词本（collection_service）

| 方法 | 参数 | 返回 |
|------|------|------|
| `collect` | `source, target, provider?, config?` | `{success, provider, error?}` |

## Provider 支持矩阵

### 翻译引擎

| Provider | 类型 | 认证方式 | SSE 流式 |
|----------|------|---------|---------|
| OpenAI | LLM | API Key (Bearer) | ✅ |
| Ollama | LLM (离线) | 无 | ✅ |
| Google | 规则 | 无 (可选 custom_url) | — |
| DeepL | 混合 | Auth Key / Free (JSON-RPC) | — |
| Baidu | 规则 | MD5(appid+text+salt+secret) | — |
| Tencent | 规则 | TC3-HMAC-SHA256 | — |
| Volcengine | 规则 | X-Access-Key-Id + X-Secret-Key | — |
| Microsoft | 规则 | Ocp-Apim-Subscription-Key | — |
| Youdao | 规则 | SHA256 v3 | — |
| Alibaba | 规则 | X-Access-Key-Id + X-Access-Key-Secret | — |
| Caiyun | 规则 | X-Authorization: token | — |
| Niutrans | 规则 | API Key (POST body) | — |
| Yandex | 规则 | Api-Key (Authorization header) | — |

### OCR 引擎

| Provider | 认证方式 | 特殊处理 |
|----------|---------|---------|
| Baidu OCR | OAuth 2.0 Token | 两步调用：token → OCR |
| Tencent OCR | TC3-HMAC-SHA256 | Action: GeneralBasicOCR |
| Volcengine OCR | X-Access-Key-Id Header | 简单头部认证 |
| Iflytek OCR | app_id + JSON Body | payload.result 二次 JSON 解析 |

### TTS + 生词本

| Provider | 类型 | 部署方式 |
|----------|------|---------|
| Lingva | TTS | 在线 GET API |
| Anki | 生词本 | 本地 AnkiConnect (:8765) |
| Eudic | 生词本 | 在线 POST API |

## 降级策略

```
AI 翻译请求
  │
  ├─ YiAi RPC 可用？
  │   YES → translateViaYiAi() → 享受缓存 + RAG + 分析
  │   NO  → 降级
  │
  └─ 降级路径
      ├─ getApi() = null → builtinServices[name].translate() [直接 API]
      ├─ api.rpc() 网络错误 → builtinServices[name].translate() [直接 API]
      └─ api.rpc() code ≠ 0 → builtinServices[name].translate() [直接 API]

传统翻译（Google/Baidu/DeepL） → builtinServices[name].translate() [始终直接]
系统 OCR → Rust 本地 [始终离线]
插件服务 → Rust invoke_plugin [始终本地]
```

## 翻译记忆缓存

```
翻译请求
  │
  ├─ use_memory = true？
  │   YES → memory_service.lookup(text, from, to)
  │          ├─ HIT → 返回 {cached: true}
  │          └─ MISS → 调用 Provider → store(text, from, to, result)
  │
  └─ NO → 跳过缓存（LLM 非确定性输出）

缓存键: SHA256(text + from_lang + to_lang)[:16]
更新策略: Upsert（最新覆盖）
生命周期: 永久保留（翻译是确定性操作）
```

## 基础设施

### 共享 HTTP 连接池

```python
# shared/runtime.py
_shared_http_client: httpx.AsyncClient | None = None

def get_shared_client() -> httpx.AsyncClient:
    # 全局单例，50 最大连接，20 keepalive
    # 29 个 Provider 复用同一连接池
    # App shutdown 时 close_shared_client() 清理
```

### 生命周期

```
App 启动:
  configure_runtime() → db.initialize() → cache.initialize()
  → init_knowledge_watcher() → setup_backup_scheduler()
  → _warmup_cache() [预导入 5 热模块]

App 关闭:
  graceful_drain() → shutdown_knowledge_watcher() → shutdown_rss()
  → shutdown_backup() → db.close()
  → close_http_client() [RAG] → close_http_client() [LLM]
  → _close_ollama_client() → close_shared_client() [新增]
```