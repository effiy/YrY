---
doc_type: prd
title: "YiPot YiAi 后端集成 — 翻译服务统一化与架构升级"
tags:
- 需求文档
- YiAi集成
- 后端统一
- 翻译服务
- OCR服务
- RPC协议
- 翻译记忆
- 架构升级
category: 项目/桌面应用/需求
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
status: 已完成
implementation_progress: 全部完成（8 子模块，36 文件新增/修改）
implementation_updated: '2026-09-23'
priority: P0
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: '202609'
prd_task_id: YP-09-53
estimate_backend: 3
estimate_frontend: 1.5
review_status: 已评审
issue_type: 架构升级
roles:
- engineer
- leader
related_modules:
- YP-09-53-1
- YP-09-53-2
- YP-09-53-3
- YP-09-53-4
- YP-09-53-5
- YP-09-53-6
- YP-09-53-7
- YP-09-53-8
related_tests:
- YP-09-53
---

# YiPot YiAi 后端集成 — 翻译服务统一化与架构升级

> 需求编号：YP-09-53 · 优先级：P0 · 总人天：~4.5d · 涉及模块：YiAi 翻译模块(14 文件)、YiPot API 层(8 文件)、桌面集成(3 文件)、基础设施(3 文件)、知识库(2 文件)

> **文档职责**：本文档定义**要做什么、为什么做、做到什么程度算完成**（WHAT / WHY），不含实现方案与测试用例。
> 实现方案见 [开发方案](../../devs/2026-09/80-prd-task-YiAi后端集成.md)，验证方案见 [测试方案](../../tests/2026-09/95-prd-test-YiAi后端集成.md)。

---

## 目录

- [0. 文档概述](#sec-0)
- [1. 背景与动机](#sec-1)
- [2. 现状分析](#sec-2)
- [3. 需求范围](#sec-3)
- [4. 功能需求（FR-1 ~ FR-7）](#sec-4)
- [5. 领域模型](#sec-5)
- [6. 非功能需求](#sec-6)
- [7. 设计决策](#sec-7)
- [8. 验收标准](#sec-8)
- [9. 风险与缓解](#sec-9)
- [10. 后续演进](#sec-10)
- [11. 关联需求](#sec-11)

---

## <a id="sec-0"></a>0. 文档概述

### 核心目标

将 YiPot 翻译/OCR/TTS/生词本四类服务的**后端调用逻辑**从 React 前端迁移到 YiAi Python 后端，通过标准 RPC 信封统一调用，同时保留 YiPot 作为桌面应用的独特优势（截图、系统 OCR、全局热键、剪切板监听）。

### 核心价值

| 维度 | 改造前 | 改造后 |
|------|--------|--------|
| 后端架构 | 前端直接调用第三方 API | YiAi 后端统一编排 |
| 数据存储 | SQLite 本地历史 | MongoDB 翻译记录 + 记忆缓存 |
| 跨项目共享 | 无 | YiVad/YiPet 可复用翻译能力 |
| 翻译效率 | 每次请求都调用 API | 翻译记忆缓存命中直接返回 |
| 领域翻译 | 无上下文 | RAG 增强领域术语翻译 |
| 可观测性 | 无 | 翻译统计 + YiVad Dashboard 分析 |

### 适用范围

- **YiAi**：新增 `services/translation/` 模块（翻译/OCR/TTS/生词本/记忆/上下文）
- **YiPot**：新增 `src/api/` 四层 API 架构，修改翻译/TTS/生词本调用路径
- **基础设施**：`shared/runtime.py` 共享 HTTP 连接池，`server/lifespan.py` 生命周期管理

---

## <a id="sec-1"></a>1. 背景与动机

### 1.1 问题陈述

YiPot 3.0.7 作为跨平台桌面翻译软件，目前存在以下架构问题：

1. **无统一后端** — 翻译/OCR/TTS 服务调用直接在前端 JavaScript 中发起 HTTP 请求到第三方 API（OpenAI、Google、DeepL 等），API Key 散落在前端代码和本地配置中
2. **数据孤岛** — 翻译历史存储在 SQLite 本地数据库中，无法与 YiVad/YiPet 共享，也无法进行跨项目分析
3. **代码重复风险** — 如果未来 YiVad 管理后台或 YiPet 浏览器扩展也需要翻译功能，将在各端重复实现所有服务调用逻辑
4. **架构不一致** — 与 YiVad/YiPet 的 RPC 信封模式脱节，违背了 YrY 单体仓库「共享后端」的架构方向
5. **缺乏缓存层** — 每次翻译都调用第三方 API，相同文本重复翻译浪费配额和费用
6. **缺乏领域上下文** — 技术文档翻译时无法利用 YiKnowledge 中的领域术语库

### 1.2 预期收益

- **架构统一**：YiPot 加入 YiVad/YiPet 的 RPC 协议体系，成为第 3 个完整接入 YiAi 的前端项目
- **翻译记忆**：MongoDB `translation_memory` 集合缓存翻译结果，相同文本命中率预估 15-30%
- **领域翻译**：基于 YiKnowledge RAG 的上下文增强，技术文档翻译准确率提升
- **可观测性**：翻译统计数据可在 YiVad Dashboard 查看和分析
- **代码复用**：YiAi 的翻译服务可被 YiVad/YiPet 直接调用

---

## <a id="sec-2"></a>2. 现状分析

### 2.1 当前架构

```
YiPot React 前端（浏览器环境）
├── src/services/translate/openai/index.jsx  → 直接 fetch OpenAI API
├── src/services/translate/google/index.jsx  → 直接 fetch Google API
├── src/services/translate/baidu/index.jsx   → 直接 fetch Baidu API
├── ...（20+ 翻译引擎，每个都直接调用第三方 API）
├── src/services/recognize/baidu/index.jsx   → 直接 fetch Baidu OCR API
├── src/services/tts/lingva/index.jsx        → 直接 fetch Lingva API
└── src/services/collection/anki/index.jsx   → 直接调用本地 AnkiConnect

YiPot Rust 后端（Tauri）
├── 截图捕获、系统 OCR、全局热键、剪切板监听
├── 系统托盘、窗口管理
└── 本地 HTTP 服务（:60828，外部调用入口）
```

### 2.2 目标架构

```
YiPot React 前端
├── src/api/  ← 新增四层 API 架构
│   ├── client.ts（fetch + RPC + SSE）
│   ├── endpoints.ts / types.ts
│   └── services/translation.ts
├── src/services/yiaiAdapter.ts ← 新增 YiAi 路由适配器
└── src/window/Translate/components/TargetArea/index.jsx ← 修改：AI 引擎走 YiAi

        │ RPC 信封 POST /  {module_name, method_name, parameters}
        ▼
YiAi FastAPI :10086
├── services/translation/  ← 新增
│   ├── translate_service.py     ← 多引擎并行翻译 + 记忆缓存
│   ├── recognize_service.py     ← OCR 编排
│   ├── tts_service.py           ← TTS 编排
│   ├── collection_service.py    ← 生词本编排
│   ├── memory_service.py        ← 翻译记忆（MongoDB）
│   ├── context_service.py       ← RAG 上下文增强
│   └── providers/               ← 19 个适配器
│       ├── openai.py, google.py, deepl.py, baidu.py, tencent.py,
│       │   volcengine.py, ollama.py, microsoft.py, youdao.py,
│       │   aliyun.py, caiyun.py, niutrans.py, yandex.py
│       ├── baidu_ocr.py, tencent_ocr.py, volcengine_ocr.py, iflytek_ocr.py
│       ├── lingva_tts.py
│       └── anki.py, eudic.py
└── MongoDB
    ├── translation_records（翻译历史）
    └── translation_memory（翻译记忆缓存）

YiPot Rust 后端（保持不变）
└── 桌面特有功能不受影响
```

---

## <a id="sec-3"></a>3. 需求范围

### 3.1 需求清单

| 编号 | 需求项 | 优先级 | 类型 | 状态 |
|------|--------|--------|------|------|
| FR-1 | YiAi 翻译服务模块（13 引擎适配器） | P0 | 新增 | ✅ |
| FR-2 | YiAi OCR 识别服务模块（4 引擎适配器） | P0 | 新增 | ✅ |
| FR-3 | YiAi TTS + 生词本服务模块（3 适配器） | P1 | 新增 | ✅ |
| FR-4 | 翻译记忆缓存（MongoDB translation_memory） | P0 | 新增 | ✅ |
| FR-5 | RAG 上下文增强翻译 | P1 | 新增 | ✅ |
| FR-6 | YiPot 前端 API 四层架构（参照 YiPet） | P0 | 新增 | ✅ |
| FR-7 | YiPot AI 翻译引擎路由到 YiAi（含降级） | P0 | 修改 | ✅ |
| FR-8 | 翻译统计分析接口（供 YiVad Dashboard） | P2 | 新增 | ✅ |
| FR-9 | 共享 HTTP 连接池（get_shared_client） | P0 | 新增 | ✅ |
| FR-10 | 知识库文档补充（CLAUDE.md + 架构文档） | P1 | 新增 | ✅ |

### 3.2 不在范围内

- 系统 OCR（Windows OCR / macOS Vision / Tesseract）— 保持 Rust 本地调用
- 截图捕获 — 保持 Rust `screenshots` crate
- 全局热键注册 — 保持 Rust `global_shortcut`
- 剪切板监听 — 保持 Rust `arboard`
- 插件系统（.potext 插件加载）— 保持 Rust 本地
- 备份系统（WebDAV/本地/阿里云）— 保持 Rust 本地
- 语言检测（lingua）— 保持 Rust 本地

---

## <a id="sec-4"></a>4. 功能需求

### <a id="sec-4-1"></a>FR-1: YiAi 翻译服务模块

**描述**：在 YiAi `services/translation/` 下创建翻译服务模块，将 YiPot 现有的 20+ 翻译引擎调用逻辑迁移到 Python 后端。

**核心接口**：

```python
# RPC: services.translation.translate_service.translate
async def translate(
    text: str,
    from_lang: str = "auto",
    to_lang: str = "zh",
    providers: list[str] | None = None,
    provider_config: dict | None = None,
    use_memory: bool = True,
) -> list[dict]
```

**Provider 接口规范**：

```python
class BaseTranslateProvider(ABC):
    name: str          # 唯一标识
    label: str         # 显示名称

    @abstractmethod
    async def _translate(self, text, from_lang, to_lang, **config) -> str: ...

    async def translate(self, text, from_lang, to_lang, **config) -> TranslationResult: ...
```

**验收标准**：

- [ ] 13 个翻译引擎适配器全部实现 `BaseTranslateProvider` 接口
- [ ] 支持并行多引擎翻译（`asyncio.gather`）
- [ ] 支持 SSE 流式翻译（OpenAI/Ollama）
- [ ] 引擎配置通过 `provider_config` 字典传递，不硬编码
- [ ] 单个引擎失败不影响其他引擎结果返回
- [ ] 通过 RPC 执行模块可调用：`POST / {module_name: "services.translation.translate_service", method_name: "translate"}`

### <a id="sec-4-2"></a>FR-2: YiAi OCR 识别服务模块

**描述**：OCR 识别服务编排，支持 Baidu/Tencent/Volcengine/Iflytek 四个引擎。

**RPC 方法**：`services.translation.recognize_service.recognize`

**验收标准**：

- [ ] 4 个 OCR 引擎适配器全部实现 `BaseRecognizeProvider` 接口
- [ ] 支持并行多引擎识别
- [ ] 单个引擎失败不影响其他引擎结果

### <a id="sec-4-3"></a>FR-3: TTS + 生词本服务

**描述**：TTS 语音合成（Lingva）和生词本导出（Anki、Eudic）服务。

**RPC 方法**：
- `services.translation.tts_service.tts`
- `services.translation.collection_service.collect`

**验收标准**：

- [ ] Lingva TTS 返回 base64 音频数据
- [ ] Anki 通过 AnkiConnect 本地 API 创建卡片
- [ ] Eudic 通过 API 保存词汇

### <a id="sec-4-4"></a>FR-4: 翻译记忆缓存

**描述**：MongoDB `translation_memory` 集合存储翻译对，相同文本+语言组合直接返回缓存。

**核心逻辑**：

```python
# 查找缓存（SHA256 hash）
async def lookup(text, from_lang, to_lang) -> dict | None

# 存储翻译结果
async def store(text, from_lang, to_lang, result, provider) -> None

# 前缀搜索（输入联想）
async def search_by_prefix(prefix, from_lang, to_lang, limit=10) -> list[dict]
```

**缓存策略**：
- 缓存键：`SHA256(text + from_lang + to_lang)[:16]`
- 更新策略：最新翻译覆盖旧结果（upsert）
- 生命周期：永久保留，手动清理

**验收标准**：

- [ ] 相同文本+语言第二次翻译命中缓存（`cached: true` 标记）
- [ ] 缓存命中不调用第三方 API
- [ ] 前缀搜索支持输入联想功能
- [ ] 缓存统计可查询

### <a id="sec-4-5"></a>FR-5: RAG 上下文增强翻译

**描述**：翻译时查询 YiKnowledge RAG 获取领域术语上下文，提升技术文档翻译准确率。

**RPC 方法**：内嵌在 `translate` 流程中，通过 `domain` 参数激活。

**验收标准**：

- [ ] 传入 `domain` 参数时自动查询 RAG
- [ ] RAG 上下文注入到 LLM 翻译 prompt 的 system message 中
- [ ] RAG 查询失败不影响翻译（降级为普通翻译）
- [ ] 支持 `context` 参数手动注入额外上下文

### <a id="sec-4-6"></a>FR-6: YiPot 前端 API 四层架构

**描述**：参照 YiPet `src/api/` 的四层架构，为 YiPot 创建统一的 API 调用层。

**层次结构**：

```
Layer 1: client.ts    — fetch 封装 + RPC 信封 + SSE 流式
Layer 2: endpoints.ts — 路径常量，匹配 YiAi 路由
Layer 3: types.ts     — 请求/响应 TypeScript 接口
Layer 4: services/    — 领域服务（translation.ts, knowledge.ts）
```

**验收标准**：

- [ ] `createApiClient(config)` 返回统一的 `ApiClient` 实例
- [ ] `client.rpc(moduleName, methodName, parameters)` 发送标准 RPC 信封
- [ ] `client.stream(path, body)` 返回 `AsyncGenerator<StreamChunk>`
- [ ] 自动解包 YiAi `{code, message, data}` 信封
- [ ] 支持 AbortSignal 取消请求
- [ ] `initApi()` 在 `main.jsx` 中初始化，存储在 `window.__yipot_api`

### <a id="sec-4-7"></a>FR-7: AI 翻译引擎路由到 YiAi

**描述**：修改 YiPot 翻译窗口的 TargetArea 组件，AI/LLM 类翻译引擎（OpenAI/Ollama/ChatGLM/Gemini）优先通过 YiAi RPC 调用。

**路由策略**：

```
if (shouldUseYiAi(serviceName)) {
    translateViaYiAi(serviceName, text, from, to, config)
        .then(onSuccess)
        .catch(() => {
            // 降级：直接调用第三方 API
            builtinServices[serviceName].translate(text, from, to, config)
                .then(onSuccess).catch(onError);
        });
} else {
    // 传统翻译引擎保持直接调用
    builtinServices[serviceName].translate(text, from, to, config);
}
```

**验收标准**：

- [ ] OpenAI/Ollama/ChatGLM/Gemini 翻译优先走 YiAi RPC
- [ ] YiAi 不可达时自动降级到直接 API 调用（用户无感知）
- [ ] Google/Baidu/DeepL 等传统引擎保持原有调用路径
- [ ] 翻译结果展示、复制、语音朗读功能不变
- [ ] 翻译历史记录正常写入

---

## <a id="sec-5"></a>5. 领域模型

### 5.1 Provider 注册表

```python
TRANSLATE_PROVIDERS: dict[str, BaseTranslateProvider] = {}
RECOGNIZE_PROVIDERS: dict[str, BaseRecognizeProvider] = {}
TTS_PROVIDERS: dict[str, BaseTTSProvider] = {}
COLLECTION_PROVIDERS: dict[str, BaseCollectionProvider] = {}
```

每个注册表在首次访问时通过 `_init_*_providers()` 懒加载。

### 5.2 MongoDB 集合

| 集合 | 用途 | 关键字段 |
|------|------|---------|
| `translation_records` | 翻译历史 | `source`, `from_lang`, `to_lang`, `results`, `source_length`, `created_at` |
| `translation_memory` | 翻译记忆缓存 | `text_hash`, `source`, `target`, `from_lang`, `to_lang`, `provider`, `updated_at` |

### 5.3 RPC 方法契约

| module_name | method_name | 参数 | 返回 |
|-------------|-------------|------|------|
| `services.translation.translate_service` | `translate` | `text, from_lang, to_lang, providers?, provider_config?, use_memory?` | `[{provider, text, from_lang, to_lang, cached?, error?}]` |
| `services.translation.translate_service` | `translate_stream` | `text, from_lang, to_lang, provider, config?` | SSE 流 |
| `services.translation.recognize_service` | `recognize` | `image_base64, language, providers?, provider_config?` | `[{provider, text, error?}]` |
| `services.translation.tts_service` | `tts` | `text, language, provider, config?` | `{provider, audio, format?, error?}` |
| `services.translation.collection_service` | `collect` | `source, target, provider, config?` | `{success, provider, error?}` |

---

## <a id="sec-6"></a>6. 非功能需求

### 6.1 性能

| 指标 | 目标 | 说明 |
|------|------|------|
| 翻译记忆查询 | < 50ms | MongoDB 单文档查询 |
| 并行翻译 | 与原方案持平 | asyncio.gather 并发 |
| YiAi overhead | < 100ms | RPC 分发 + 网络延迟 |
| 共享连接池 | 50 max_connections | 复用 TCP 连接 |

### 6.2 可靠性

- **降级策略**：YiAi 不可达时，AI 引擎自动回退到前端直接调用
- **隔离性**：单个 Provider 失败不影响其他 Provider 的结果
- **优雅关闭**：`close_shared_client()` 在 `server/lifespan.py` shutdown 时调用

### 6.3 安全性

- **API Key 集中管理**：Provider 配置通过 YiAi 后端传递，不暴露在前端代码中
- **输入校验**：文本长度、语言代码在 `translate_service` 层校验
- **审计日志**：通过 YiAi 现有审计框架记录翻译请求

### 6.4 兼容性

- **YiPot 向后兼容**：现有服务配置 UI 不变，仅调用路径变化
- **插件系统不受影响**：.potext 插件继续通过 Rust 后端加载和执行
- **Rust 后端不变**：截图/系统 OCR/热键/剪切板/托盘/窗口管理全部保持

---

## <a id="sec-7"></a>7. 设计决策

### ADR-1: 共享 httpx.AsyncClient 连接池

**决策**：在 `shared/runtime.py` 中新增 `get_shared_client()` 函数，返回全局单例 `httpx.AsyncClient`，所有 Provider 复用同一连接池。

**理由**：
- 避免每次翻译请求创建新 HTTP 连接（TCP 握手开销 ~50-100ms）
- 连接池复用减少第三方 API 的 TIME_WAIT 连接数
- 统一管理生命周期（app shutdown 时 `close_shared_client()`）

### ADR-2: 懒加载 Provider 注册表

**决策**：Provider 实例在首次 RPC 调用时懒加载，不在模块导入时实例化。

**理由**：
- 减少冷启动时间（19 个 Provider 不必在 app 启动时全部初始化）
- 避免导入失败的 Provider 阻塞整个模块加载

### ADR-3: 双层降级（YiAi → 前端直接调用）

**决策**：AI/LLM 引擎先通过 YiAi RPC，失败时回退到原有前端直接调用。

**理由**：
- YiAi 首次部署时可能不稳定，需要降级保障
- 桌面应用离线场景（无网络到 YiAi）仍需工作
- 用户无感知切换

### ADR-4: 翻译记忆永久缓存

**决策**：翻译记忆不设 TTL，通过 upsert 更新，手动清理。

**理由**：
- 翻译是确定性操作（相同输入 → 相同输出），无需过期
- 第三方 API 翻译结果不会变化（Google/Baidu 的翻译模型更新频率低）
- LLM 翻译可通过 `use_memory=false` 跳过缓存

---

## <a id="sec-8"></a>8. 验收标准

### 8.1 后端验收

- [ ] 13 个翻译 Provider 全部可被 RPC 调用并返回正确结果
- [ ] 并行多引擎翻译：`providers: ["google", "baidu"]` 同时返回两个结果
- [ ] 翻译记忆：同一文本第二次翻译返回 `cached: true`
- [ ] SSE 流式翻译：OpenAI/Ollama Provider 返回流式结果
- [ ] OCR 识别：4 个 Provider 均可识别图片文字
- [ ] TTS 返回 base64 音频数据
- [ ] 生词本 Anki 成功创建卡片

### 8.2 前端验收

- [ ] `initApi({ baseUrl })` 初始化 API 客户端
- [ ] `hasApi()` 返回 true 表示 YiAi 已配置
- [ ] AI 翻译引擎走 YiAi RPC 路径（开发者工具 Network 可见请求到 localhost:10086）
- [ ] YiAi 不可达时自动降级（用户看到翻译结果无感知）
- [ ] Google/Baidu 等传统引擎保持原有直接调用（Network 可见请求到第三方 API）
- [ ] `pnpm build` 构建成功

### 8.3 基础设施验收

- [ ] `get_shared_client()` 返回全局单例 httpx.AsyncClient
- [ ] App shutdown 时 `close_shared_client()` 正确关闭连接
- [ ] `shared/runtime.py` 测试通过（不影响现有模块）

---

## <a id="sec-9"></a>9. 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| YiAi 不可达导致翻译失败 | 中 | 高 | 前端自动降级到直接 API 调用 |
| Provider 第三方 API 变更 | 低 | 中 | 每个 Provider 独立封装，变更影响隔离 |
| 翻译记忆缓存无限增长 | 中 | 低 | MongoDB TTL 索引可选，手动清理接口 |
| 共享连接池耗尽 | 低 | 中 | 50 最大连接 + 20 keepalive，超出排队 |

---

## <a id="sec-10"></a>10. 后续演进

1. **翻译记录同步到 YiVad** — 用户在 YiPot 中的翻译记录可在 YiVad Dashboard 查看和分析
2. **YiPet 翻译接入** — YiPet 浏览器扩展可通过同一 RPC 接口调用翻译服务
3. **翻译质量评分** — 用户对翻译结果评分，反馈优化 Provider 选择
4. **离线翻译缓存预热** — 常用术语库预加载到翻译记忆
5. **自定义 Provider** — 通过 YiAi 端注册自定义翻译引擎（无需插件系统）

---

## <a id="sec-11"></a>11. 关联需求

| 需求 | 关系 |
|------|------|
| [01-prd-划词翻译核心.md](./01-prd-划词翻译核心.md) | 划词翻译的后端服务化升级 |
| [04-prd-插件与服务系统.md](./04-prd-插件与服务系统.md) | 内置服务向 YiAi 后端的迁移 |
| [05-prd-翻译服务接口全景.md](./05-prd-翻译服务接口全景.md) | 13 个翻译引擎的 Provider 适配器实现 |
| [06-prd-OCR服务接口全景.md](./06-prd-OCR服务接口全景.md) | 4 个 OCR 引擎的 Provider 适配器实现 |
| [12-prd-百度翻译服务.md](./12-prd-百度翻译服务.md) | Baidu Provider 参考原 JS 实现 |
| [13-prd-AI翻译服务.md](./13-prd-AI翻译服务.md) | OpenAI + Ollama Provider 含 SSE 流式 |
| [44-prd-ADR-Tauri选择.md](./44-prd-ADR-Tauri选择.md) | 桌面框架选择（Rust 后端保留决策） |
| [YiVad 89-prd-系统页面样式与交互优化](../../yivad/prds/2026-09/89-prd-系统页面样式与交互优化.md) | 参考 YiVad PRD 文档格式 |