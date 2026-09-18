---
doc_type: test
title: "YA-07-04: AI 聊天服务 — 测试规格"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202607"
prd_task_id: "YA-07-04"
source_prds: ["04-需求-AI聊天服务"]
source_modules: []
---

# YA-07-04: AI 聊天服务 — 测试规格

> 来源 PRD：[04-需求-AI聊天服务.md](../../prds/2026-07/04-需求-AI聊天服务.md)
> 开发方案：[04-prd-task-AI聊天服务.md](../../devs/2026-07/04-prd-task-AI聊天服务.md)

---

## 一、测试环境

| 组件 | 配置 | 说明 |
|------|------|------|
| 测试框架 | pytest 8 + pytest-asyncio | `python -m pytest tests/ -v` |
| HTTP 客户端 | httpx.AsyncClient | ASGI transport 直连（不通过网络） |
| MongoDB | mongomock 或真实实例 | 集成测试用真实 MongoDB |
| Ollama | Mock / 真实实例 | 单元测试 Mock，在线 E2E 用真实 |

---

## 二、功能测试

### F-01：SSE 流式聊天

#### F-01-S01：正常流式返回
- **GIVEN** RPC 请求 `{ services.ai.chat_service.chat, messages: [...], model: "qwen3.5:4b", stream: true }`
- **WHEN** POST / → StreamingResponse
- **THEN** Content-Type = `text/event-stream`
- **AND** 每个 SSE 帧格式 `data: {"data":{"message":"..."}}\n\n`
- **AND** 最后一帧 `data: {"done":true}\n\n`

#### F-01-S02：无 session_key 时创建新会话
- **GIVEN** RPC 请求无 `session_key` 参数
- **WHEN** POST /
- **THEN** SSE 响应中包含 `session_key`
- **AND** MongoDB `sessions` 集合中新增文档

#### F-01-S03：有 session_key 时恢复会话
- **GIVEN** MongoDB 已有 session_key="existing-abc" 的会话（含 3 轮历史）
- **WHEN** POST / 携带 `session_key: "existing-abc"`
- **THEN** 上下文包含历史消息
- **AND** 新消息追加到会话

#### F-01-S04：Ollama 不可达时返回错误帧
- **GIVEN** Ollama 服务不可达（模拟连接拒绝）
- **WHEN** POST /
- **THEN** SSE 流包含 error 帧 `{"done":true,"error":"..."}`
- **AND** `ErrorCode.AI_UNAVAILABLE`

#### F-01-S05：空消息不调用 LLM
- **GIVEN** messages 中 `user_content` 为空
- **WHEN** POST /
- **THEN** 不调用 Ollama API
- **AND** 返回空响应

### F-02：Multi-Provider 路由

#### F-02-S01：Ollama 模型路由到 OllamaProvider
- **GIVEN** `model: "qwen3.5:4b"`
- **WHEN** `LLMProviderRouter.get_provider("qwen3.5:4b")`
- **THEN** 返回 `OllamaProvider` 实例

#### F-02-S02：DeepSeek 模型路由到 DeepSeekProvider
- **GIVEN** `model: "deepseek-chat"`
- **WHEN** 同上
- **THEN** 返回 `DeepSeekProvider` 实例

#### F-02-S03：list_models 聚合所有 Provider
- **GIVEN** Ollama 返回 3 个模型，DeepSeek 返回 1 个模型
- **WHEN** `LLMProviderRouter.list_models()`
- **THEN** 返回 4 个模型

### F-03：图片多模态

#### F-03-S01：base64 图片解码成功
- **GIVEN** `images: ["data:image/png;base64,..."]`
- **WHEN** `_resolve_images(images)`
- **THEN** 返回 `list[bytes]`，长度 = 1
- **AND** 图片 bytes 传递给 Ollama `images` 参数

#### F-03-S02：HTTP URL 图片获取成功
- **GIVEN** `images: ["https://example.com/photo.jpg"]` + HTTP 200 + `Content-Type: image/jpeg`
- **WHEN** `_resolve_images(images)`
- **THEN** 异步获取成功 → 返回 bytes

#### F-03-S03：HTTP URL 非图片类型跳过
- **GIVEN** `images: ["https://example.com/doc.pdf"]` + `Content-Type: application/pdf`
- **WHEN** `_resolve_images(images)`
- **THEN** 跳过该 URL，不阻断聊天

#### F-03-S04：HTTP URL 超时跳过
- **GIVEN** HTTP 获取 > 15s
- **WHEN** `_resolve_images(images)`
- **THEN** 超时跳过，其他图片正常返回

#### F-03-S05：图片超过 10MB 跳过
- **GIVEN** HTTP 响应体 > 10MB
- **WHEN** `_fetch_image_bytes(url)`
- **THEN** 返回 None

### F-04：SSE 工具层

#### F-04-S01：format_sse 字符串格式化
- **GIVEN** `"hello"`
- **WHEN** `format_sse("hello")`
- **THEN** 返回 `b'data: {"data":{"message":"hello"}}\n\n'`

#### F-04-S02：format_sse dict 直传
- **GIVEN** `{"done": true, "session_key": "abc"}`
- **WHEN** `format_sse({"done": true, "session_key": "abc"})`
- **THEN** 返回 `b'data: {"done":true,"session_key":"abc"}\n\n'`

#### F-04-S03：stream_async 异常捕获
- **GIVEN** 异步生成器抛出 `RuntimeError("test")`
- **WHEN** `stream_async(failing_generator)`
- **THEN** 最后帧为 `{"done":true,"error":"test"}`

---

## 三、边缘场景测试

| # | 场景 | 预期 |
|---|------|------|
| E-01 | 并发 5 个请求 | Provider 级别限流生效 |
| E-02 | 超长消息历史（500+ 轮） | 滑动窗口截断，不 OOM |
| E-03 | 模型切换 mid-session | Provider 路由正确切换 |
| E-04 | MongoDB 写入失败 | 不影响 SSE 流，仅记录 ERROR 日志 |
| E-05 | uvicorn 优雅关闭 | Provider 连接池正确释放 |

---

## 四、需求追溯

| 需求 ID | 测试用例 |
|---------|----------|
| FR-01 SSE 流式 | F-01-S01 ~ S05 |
| FR-02 Multi-Provider | F-02-S01 ~ S03 |
| FR-03 会话管理 | F-01-S02, S03 |
| FR-04 图片多模态 | F-03-S01 ~ S05 |
| FR-05 SSE 工具 | F-04-S01 ~ S03 |

---

## 五、运行命令

```bash
# 全量测试
python -m pytest tests/ -v

# 仅 AI Chat 相关
python -m pytest tests/ -v -k "chat"

# 覆盖率
python -m pytest tests/ -v --cov=src --cov-report=term-missing

# 集成测试
python -m pytest tests/ -v -m integration
```