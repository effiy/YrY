---
doc_type: module
prd_task_id: "YA-07-04"
title: "YA-07-04: AI 聊天服务 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202607"
estimate_backend: 4.0
source_prd: "04-需求-AI聊天服务.md"
source_okr: [yiai-002]
---

# YA-07-04: AI 聊天服务 — 开发方案

> 来源 PRD：[04-需求-AI聊天服务.md](../../prds/2026-07/04-需求-AI聊天服务.md)
> 需求编号：YA-07-04 · 优先级：P0 · 人天：4.0d

---

## 一、架构概览

```
┌──────────────────────────────────────────────────────┐
│ RPC 路由层 (server/routes/)                           │
│   POST /  body: {services.ai.chat_service.chat, ...} │
├──────────────────────────────────────────────────────┤
│ 服务层 (services/ai/chat_service.py)                 │
│   └── 从 domain/ai/chat 和 services/ai/llm_provider │
│       重导出公共 API                                  │
├────────────────┬─────────────────────────────────────┤
│ 领域层          │ Multi-Provider 路由层               │
│ domain/ai/     │ services/ai/llm_provider.py         │
│  chat.py       │  LLMProviderRouter                  │
│  OllamaService │  ├── OllamaProvider (本地)          │
│  chat()        │  └── DeepSeekProvider (云端)        │
│  图片管线       │                                     │
├────────────────┴─────────────────────────────────────┤
│ 数据层 (data/sessions.py)                            │
│   └── MongoDB sessions 集合 CRUD                     │
├──────────────────────────────────────────────────────┤
│ 共享层 (shared/sse_utils.py)                         │
│   format_sse() / stream_async() / stream_sync()      │
└──────────────────────────────────────────────────────┘
```

---

## 二、文件清单

| 文件 | 类型 | 行数 | 职责 |
|------|------|------|------|
| `src/domain/ai/chat.py` | 核心 | ~250 | OllamaService、chat() 生成器、图片管线、模型列表 |
| `src/services/ai/llm_provider.py` | Provider | ~300 | LLMProviderRouter、OllamaProvider、DeepSeekProvider |
| `src/services/ai/chat_service.py` | 重导出 | ~10 | 公共 API 重导出（noqa: F401） |
| `src/services/ai/compaction.py` | 功能 | ~150 | 对话上下文压缩 |
| `src/shared/sse_utils.py` | 工具 | ~50 | format_sse()、stream_async()、stream_sync() |
| `src/data/sessions.py` | 数据 | ~80 | 会话 CRUD（MongoDB Motor 异步） |
| `src/domain/ai/tools/core.py` | Agent | ~200 | Agent 工具框架 |
| `src/domain/ai/tools/builtin.py` | Agent | ~200 | 内置工具（文件/知识/上下文） |
| `src/domain/ai/tools/mcp.py` | Agent | ~200 | MCP 协议工具发现 |

---

## 三、核心模块设计

### 3.1 OllamaService — `domain/ai/chat.py`

```python
class OllamaService:
    """Ollama 客户端封装 — 非流式 generate_response + 流式 chat"""

    def __init__(self, host: str | None = None, auth: str | None = None):
        self.ollama_url = host or settings.ollama_url
        self.ollama_auth = auth or settings.ollama_auth

    def _get_client(self) -> Client:
        """从配置创建 ollama.Client，支持认证 (username:password 格式)"""

    def generate_response(self, system_prompt, user_content, model_name,
                          images=None, messages=None, max_retries=2) -> dict:
        """非流式生成 — 传入完整 messages 或 system+user 构造"""

    def chat(self, model_name, messages, stream=True, images=None,
             keep_alive=None) -> Iterator[dict]:
        """流式生成 — 逐 chunk yield Ollama 原始响应"""
```

**图片管线**（`_resolve_images`）：

```python
# 输入: ["data:image/png;base64,...", "https://example.com/photo.jpg"]
# 流程:
#   1. 分类: data: URL → base64 decode; HTTP URL → 加入异步获取队列
#   2. 并发获取 HTTP URL（asyncio.Semaphore(4)），单张 10MB / 15s 超时
#   3. Content-Type 校验（仅 image/*）
#   4. 返回 bytes[] → 传给 Ollama API images 参数
```

### 3.2 LLMProviderRouter — `services/ai/llm_provider.py`

```python
class LLMProviderRouter:
    """多 Provider 路由器 — 根据 model 自动选择 Provider"""

    def __init__(self):
        self.providers = {
            ProviderType.OLLAMA: OllamaProvider(),
            ProviderType.DEEPSEEK: DeepSeekProvider(),
        }

    def get_provider(self, model: str) -> LLMProvider:
        """根据 model 名称返回对应 Provider"""

    async def chat(self, messages, model, stream=True, **kwargs) -> AsyncIterator[ChatResponse]:
        """路由到对应 Provider 的 chat 方法"""

    def list_models(self) -> list[str]:
        """聚合所有 Provider 的模型列表"""

class OllamaProvider(LLMProvider):
    """本地 Ollama Provider — 封装 domain/ai/chat.py 的调用"""

class DeepSeekProvider(LLMProvider):
    """云端 DeepSeek Provider — 通过 httpx 调用 DeepSeek API"""
```

### 3.3 SSE 格式化 — `shared/sse_utils.py`

```python
def format_sse(data: Any) -> bytes:
    """单帧 SSE 格式化 — 字符串 → {"data":{"message":"..."}}，dict → 直传"""
    payload = {"data": {"message": data}} if isinstance(data, str) else data
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n".encode()

async def stream_async(gen: AsyncIterator[Any]):
    """异步生成器 → SSE 流 — 正常结束追加 done 帧，异常追加 error 帧"""
    try:
        async for item in gen: yield format_sse(item)
    except Exception as e:
        yield format_sse({"done": True, "error": str(e)})
    else:
        yield format_sse({"done": True})

def stream_sync(gen: Iterator[Any]):
    """同步生成器 → SSE 流 — 同 stream_async 的同步版本"""
```

---

## 四、MongoDB Sessions 模型

```javascript
// sessions 集合文档结构
{
  "_id": ObjectId,
  "key": "uuid-v4-hex",               // 会话唯一标识（128 位 UUID）
  "url": "",                          // 来源 URL
  "title": "Q3 Roadmap Review",       // 会话标题
  "pageTitle": "",                    // 来源页面标题
  "pageDescription": "",              // 来源页面描述
  "pageContent": "",                  // 上下文文本内容
  "messages": [                       // 消息列表
    {
      "type": "user" | "pet",         // 角色
      "message": "消息内容",           // 文本
      "timestamp": 1726470000000,     // Unix ms
      "imageDataUrls": [],            // 可选图片
      "error": false,                 // 错误标记
      "aborted": false                // 中断标记
    }
  ],
  "tags": ["from:/aiChat", "ctx:path"], // 标签
  "isFavorite": false,                   // 收藏
  "createdAt": ISODate,                  // 创建时间
  "updatedAt": ISODate                   // 更新时间
}

// 索引
db.sessions.createIndex({ "key": 1 }, { unique: true })
db.sessions.createIndex({ "updatedAt": -1 })
db.sessions.createIndex({ "tags": 1 })
```

---

## 五、实施步骤

| 步骤 | 内容 | 输出物 | 验证 | 人天 |
|------|------|--------|------|------|
| 1 | OllamaService 客户端封装 | `domain/ai/chat.py` | `generate_response()` 返回有效回复 | 0.5 |
| 2 | 流式 chat 生成器 + 图片管线 | `domain/ai/chat.py` | `chat()` 逐 chunk yield；图片 base64/HTTP 正常 | 1.0 |
| 3 | Multi-Provider 路由 | `services/ai/llm_provider.py` | Ollama + DeepSeek 按 model 路由 | 0.5 |
| 4 | SSE 工具层 | `shared/sse_utils.py` | `format_sse` + `stream_async` 格式正确 | 0.25 |
| 5 | 会话管理 CRUD | `data/sessions.py` | MongoDB 读写正常，索引创建 | 0.5 |
| 6 | chat_service 重导出 + RPC 集成 | `services/ai/chat_service.py` | RPC 信封调用成功 | 0.25 |
| 7 | 集成测试 + 回归 | `tests/` | 流式响应端到端 + 现有 76 测试通过 | 1.0 |

**总计：4.0d**

---

## 六、边缘场景

| 场景 | 触发条件 | 处理 | 位置 |
|------|----------|------|------|
| Ollama 不可达 | 连接拒绝/超时 | 返回 `ErrorCode.AI_UNAVAILABLE`，tenacity 重试 2 次 | `domain/ai/chat.py` |
| 图片 URL 超时 | HTTP 获取 > 15s | 跳过该图片，不阻断聊天 | `_fetch_image_bytes` |
| 图片超 10MB | `len(buf) > 10MB` | 跳过 | 同上 |
| 非图片 Content-Type | `!content-type.startswith("image/")` | 跳过 | 同上 |
| base64 解码失败 | `b64decode(validate=True)` 抛异常 | DEBUG 日志 + 跳过 | `_resolve_images` |
| 空消息 | `user_content.strip() == ""` | 不调用 Ollama，返回空响应 | `chat_service.py` |
| SSE 异常 | 生成器抛出 | `stream_async` catch → error 帧 + 关闭 | `shared/sse_utils.py` |
| 客户端断开 | `request.is_disconnected()` | 停止生成，释放资源 | `chat_service` 路由层 |
| Nginx 缓冲 SSE | `proxy_buffering on` | SSE 响应头 `X-Accel-Buffering: no` | `chat_service` 路由层 |

---

## 七、已知缺陷

| # | 缺陷 | 影响 | 后续 |
|---|------|------|------|
| 1 | 无请求级超时 | Ollama 推理可能长时间无响应 | YA-09-115 超时传播 |
| 2 | 消息历史无截断 | 超长对话超出模型上下文窗口 | YA-09-13 上下文压缩 |
| 3 | `generate_response` 为同步方法 | 阻塞事件循环 | 已用 thread/进程池隔离 |

---

## 八、关联模块

| 模块 | 关系 | 文件 |
|------|------|------|
| RPC 信封协议 | 依赖 | `YA-07-03` |
| Multi-Provider LLM | 依赖 | `YA-08-02` — `LLMProviderRouter` |
| 上下文压缩 | 下游优化 | `YA-09-13` — `services/ai/compaction.py` |
| Agent 工具系统 | 下游 | `YA-08-13` — `domain/ai/tools/` |
| SSE 工具层 | 共享 | `shared/sse_utils.py` |

---

## 九、DoD

- [ ] 7 个文件按 §2 清单落地
- [ ] `chat()` 流式生成器正常工作
- [ ] 图片管线 base64 + HTTP URL 双路径
- [ ] Multi-Provider 按 model 路由
- [ ] SSE 格式 `data: {json}\n\n` + `done: true` 结束
- [ ] 会话 CRUD MongoDB 读写正确
- [ ] `pytest tests/ -v` 76+ 测试通过
- [ ] `ruff` 无新增问题