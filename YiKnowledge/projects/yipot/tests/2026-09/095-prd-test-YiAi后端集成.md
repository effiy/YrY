---

doc_type: test
title: "YiAi 后端集成 — 测试方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prds: ["53-prd-YiAi后端集成"]
source_modules: ["80-prd-task-YiAi后端集成"]
related_test_modules: ["100-prd-test-翻译Provider适配器", "101-prd-test-OCRProvider适配器", "102-prd-test-TTS生词本Provider", "103-prd-test-翻译记忆与RAG上下文", "104-prd-test-YiPotAPI四层架构", "105-prd-test-前端集成YiAi路由降级", "106-prd-test-知识库文档与基础设施"]

type: test
---

# YiAi 后端集成 — 测试方案

> **文档职责**：本文档定义 YiPot YiAi 后端集成功能的验证方案。
> 来源 PRD：[53-prd-YiAi后端集成](../../prds/2026-09/53-prd-YiAi后端集成.md)
> 来源开发方案：[80-prd-task-YiAi后端集成](../../devs/2026-09/80-prd-task-YiAi后端集成.md)

> **子模块测试索引**：
> | 编号 | 测试域 | 文档 |
> |------|--------|------|
> | TC-TP | 翻译 Provider | [100-prd-test-翻译Provider适配器.md](./100-prd-test-翻译Provider适配器.md) |
> | TC-OC | OCR Provider | [101-prd-test-OCRProvider适配器.md](./101-prd-test-OCRProvider适配器.md) |
> | TC-TT/CL | TTS + 生词本 | [102-prd-test-TTS生词本Provider.md](./102-prd-test-TTS生词本Provider.md) |
> | TC-ME/RA | 翻译记忆 + RAG | [103-prd-test-翻译记忆与RAG上下文.md](./103-prd-test-翻译记忆与RAG上下文.md) |
> | TC-AP | API 四层架构 | [104-prd-test-YiPotAPI四层架构.md](./104-prd-test-YiPotAPI四层架构.md) |
> | TC-FE | 前端集成 + 降级 | [105-prd-test-前端集成YiAi路由降级.md](./105-prd-test-前端集成YiAi路由降级.md) |
> | TC-DO/IN | 文档 + 基础设施 | [106-prd-test-知识库文档与基础设施.md](./106-prd-test-知识库文档与基础设施.md) |

---

## 测试范围总览

| 测试域 | 测试类型 | 用例数 | 状态 |
|--------|---------|--------|------|
| YiAi Provider 翻译 | 功能测试 | 6 | ✅ |
| YiAi Provider OCR/TTS/生词本 | 功能测试 | 4 | ✅ |
| 翻译记忆缓存 | 功能测试 | 4 | ✅ |
| RAG 上下文增强 | 功能测试 | 3 | ✅ |
| YiPot API 层 | 功能测试 | 4 | ✅ |
| YiPot 前端降级 | 端到端测试 | 4 | ✅ |
| 基础设施 | 回归测试 | 406 | ✅ |

---

## 一、YiAi Provider 翻译测试

### TC-YA-TR-001: OpenAI Provider 基本翻译

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 通过 RPC 调用 `services.translation.translate_service.translate` | — |
| 2 | 参数 `{text: "Hello", from_lang: "en", to_lang: "zh", providers: ["openai"]}` | — |
| 3 | 检查响应 `data[0].text` | 返回中文翻译 |
| 4 | 检查响应 `data[0].provider` | `"openai"` |
| 5 | 检查响应 `data[0].cached` | `undefined`（首次调用不缓存） |

### TC-YA-TR-002: 多引擎并行翻译

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC 调用 `providers: ["openai", "google"]` | — |
| 2 | 检查响应 `data` 数组长度 | `2` |
| 3 | 检查 `data[0].provider` | `"openai"` |
| 4 | 检查 `data[1].provider` | `"google"` |
| 5 | 两个结果都有 `text` 字段 | 非空字符串 |

### TC-YA-TR-003: 翻译记忆缓存命中

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 第一次调用翻译 `text: "Hello"` | 正常返回 |
| 2 | 第二次调用相同 `text + from_lang + to_lang` | — |
| 3 | 检查 `data[0].cached` | `true` |
| 4 | 检查 `data[0].text` | 与第一次结果相同 |
| 5 | 检查 YiAi 日志 | 无第三方 API 调用（缓存命中） |

### TC-YA-TR-004: Provider 失败隔离

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC 调用 `providers: ["openai", "invalid_provider"]` | — |
| 2 | 检查 `data` 数组长度 | `2` |
| 3 | `data[0]` 是 openai 的结果 | `text` 非空 |
| 4 | `data[1]` 是 invalid 的结果 | `error` 字段非空 |

### TC-YA-TR-005: SSE 流式翻译

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC 调用 `translate_stream` method | — |
| 2 | 参数 `{provider: "openai", ...}` | — |
| 3 | 响应类型 | `text/event-stream` |
| 4 | 检查流式数据格式 | `data: {"data": "..."}\n\n` |
| 5 | 流结束信号 | `data: {"done": true}` |

### TC-YA-TR-006: Baidu 签名翻译

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC 调用 `providers: ["baidu"]` | — |
| 2 | `provider_config.baidu` 含 `appid, secret` | — |
| 3 | 检查签名生成 | MD5(appid+text+salt+secret) 正确 |
| 4 | 检查响应 | `trans_result` 解析正确 |

---

## 二、YiAi Provider OCR/TTS/生词本测试

### TC-YA-OC-001: Baidu OCR 识别

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC 调用 `services.translation.recognize_service.recognize` | — |
| 2 | 参数 `{image_base64: "...", language: "zh", providers: ["baidu_ocr"]}` | — |
| 3 | 检查响应 `data[0].text` | 返回识别的文字 |
| 4 | 检查 `data[0].provider` | `"baidu_ocr"` |

### TC-YA-OC-002: 并行 OCR 多引擎

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC 调用 `providers: ["baidu_ocr", "tencent_ocr"]` | — |
| 2 | 检查 `data` 长度 | `2` |
| 3 | 两个结果都有 `text` | 非空字符串 |

### TC-YA-TT-001: Lingva TTS

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC 调用 `services.translation.tts_service.tts` | — |
| 2 | 参数 `{text: "Hello", language: "en", provider: "lingva"}` | — |
| 3 | 检查响应 `data.audio` | base64 编码的音频数据 |
| 4 | 检查 `data.format` | `"mp3"` |

### TC-YA-CL-001: Anki 生词本

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC 调用 `services.translation.collection_service.collect` | — |
| 2 | 参数 `{source: "hello", target: "你好", provider: "anki"}` | — |
| 3 | 检查响应 `data.success` | `true` |
| 4 | 检查 Anki 本地 | "Pot" 牌组中有新卡片 |

---

## 三、翻译记忆缓存测试

### TC-ME-001: 缓存写入与读取

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 翻译 `text: "test cache"` | — |
| 2 | 检查 MongoDB `translation_memory` | 存在 `text_hash` 匹配的文档 |
| 3 | 再次翻译相同文本 | 返回 `cached: true` |
| 4 | 检查 API 调用日志 | 第二次不调用第三方 API |

### TC-ME-002: 不同语言独立缓存

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 翻译 `text: "hello", to_lang: "zh"` | 缓存键 `hash("hello"+"en"+"zh")` |
| 2 | 翻译 `text: "hello", to_lang: "ja"` | 缓存键 `hash("hello"+"en"+"ja")` |
| 3 | 两个缓存独立 | 不同 `text_hash` |

### TC-ME-003: 前缀搜索

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 翻译并缓存 `"software engineering"` | — |
| 2 | 调用 `search_by_prefix("soft", "en", "zh")` | 返回包含该条目的列表 |
| 3 | 搜索不存在的 `"zzz"` | 返回空数组 `[]` |

### TC-ME-004: 缓存统计

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 翻译 3 条不同文本（2 条 en→zh, 1 条 en→ja） | — |
| 2 | 调用 `memory_service.stats()` | `total: 3` |
| 3 | 检查 `languages` | 包含 2 个源语言组 |
| 4 | 检查 `providers` | 按 provider 统计数量 |

---

## 四、RAG 上下文增强测试

### TC-RA-001: Domain 上下文注入

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 调用 `translate_with_context(text="deploy", domain="yiai")` | — |
| 2 | 检查发送给 Provider 的 system prompt | 包含 YiKnowledge 中的 YiAi 领域术语 |
| 3 | 翻译结果 | "部署"（而非通用词典翻译） |

### TC-RA-002: RAG 失败降级

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 调用 `translate_with_context(domain="nonexistent")` | — |
| 2 | RAG 查询返回空 | 无 crash |
| 3 | 翻译正常返回 | 降级为普通翻译 |

### TC-RA-003: 手动上下文注入

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 调用 `translate_with_context(context="This is about React")` | — |
| 2 | 检查 system prompt | 包含手动注入的上下文 |
| 3 | 翻译结果 | 领域相关的准确翻译 |

---

## 五、YiPot 前端 API 层测试

### TC-FE-001: API 客户端初始化

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 启动 YiPot 应用 | — |
| 2 | 检查 `window.__yipot_api` | 非 null |
| 3 | 调用 `getApi()` | 返回 ApiClient 实例 |
| 4 | 调用 `hasApi()` | 返回 `true` |

### TC-FE-002: RPC 调用

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `client.rpc("services.translation.translate_service", "translate", {...})` | — |
| 2 | 检查 Network 面板 | POST 到 `localhost:10086/` |
| 3 | 请求体 | `{module_name, method_name, parameters}` |
| 4 | 响应解包 | `ApiResponse.ok === true`, `data` 有值 |

### TC-FE-003: 语言代码映射

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `mapLang("zh_cn")` | `"zh"` |
| 2 | `mapLang("en")` | `"en"` |
| 3 | `mapLang("ja")` | `"ja"` |
| 4 | `mapLang("unknown")` | `"unknown"`（透传） |

### TC-FE-004: shouldUseYiAi 判断

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `shouldUseYiAi("openai")` | `true` |
| 2 | `shouldUseYiAi("ollama")` | `true` |
| 3 | `shouldUseYiAi("chatglm")` | `true` |
| 4 | `shouldUseYiAi("geminipro")` | `true` |
| 5 | `shouldUseYiAi("google")` | `false` |
| 6 | `shouldUseYiAi("baidu")` | `false` |

---

## 六、YiPot 前端降级测试

### TC-FB-001: YiAi 可用 — AI 引擎走 RPC

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 确保 YiAi 运行在 :10086 | — |
| 2 | 在 YiPot 选中文本触发 OpenAI 翻译 | — |
| 3 | 检查 Network 面板 | 请求到 `localhost:10086/` |
| 4 | 翻译结果显示 | 正常显示中文翻译 |

### TC-FB-002: YiAi 不可用 — 降级到直接 API

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 停止 YiAi 服务 | — |
| 2 | 在 YiPot 选中文本触发 OpenAI 翻译 | — |
| 3 | 检查控制台日志 | 出现 "YiAi fallback" 消息 |
| 4 | 检查 Network 面板 | 请求到 `api.openai.com`（降级） |
| 5 | 翻译结果显示 | 正常显示中文翻译（用户无感知） |

### TC-FB-003: 传统引擎不受影响

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 在 YiPot 选中文本触发 Google 翻译 | — |
| 2 | 检查 Network 面板 | 请求到 `translate.google.com`（直接调用） |
| 3 | YiPot 构建 | `pnpm build` 成功 |

### TC-FB-004: 插件翻译不受影响

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 安装翻译插件（如 Tatoeba） | — |
| 2 | 启用插件翻译 | — |
| 3 | 检查翻译结果 | 正常显示（插件走 Rust `invoke_plugin` 路径） |

---

## 七、基础设施回归测试

### TC-IF-001: 共享客户端生命周期

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `get_shared_client()` | 返回 httpx.AsyncClient 实例 |
| 2 | 再次调用 `get_shared_client()` | 返回同一个实例（单例） |
| 3 | 停止 YiAi 服务（触发 shutdown） | `close_shared_client()` 被调用 |
| 4 | 检查连接池 | 所有连接已关闭 |

### TC-IF-002: 现有模块不受影响

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 运行 YiAi 单元测试 | `python -m pytest tests/unit/ -q` |
| 2 | 检查通过数量 | 406 passed |
| 3 | 检查失败 | 仅 `test_logging.py` 的 10 个预存在失败 |

---

## 测试环境要求

| 依赖 | 说明 |
|------|------|
| YiAi 运行中 | `cd YiAi && python main.py`（端口 10086） |
| MongoDB 运行中 | `mongod` 或 Atlas 连接 |
| YiPot 构建通过 | `cd YiPot && pnpm build` |
| 网络连接 | 第三方 API 需要外网访问（Google/Baidu/OpenAI 等） |
| API 凭证 | Provider 测试需要有效的 API Key/Secret |