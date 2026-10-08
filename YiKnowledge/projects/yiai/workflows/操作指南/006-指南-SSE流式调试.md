---
title: SSE 流式调试指南
tags: [yiai, sse, streaming, debug, agent, chat, event-stream]
category: projects/yiai/workflows
created: 2026-09-15
updated: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, aier]
benefit: "YiAi SSE 流式响应的调试方法、事件协议解析、常见故障排查"
---

# SSE 流式调试指南

> **读完你将能够**：YiAi SSE 流式响应的调试方法、事件协议解析、常见故障排查

> 如何调试 YiAi 的 SSE（Server-Sent Events）流式响应：Agent 聊天、RAG 对话、事件协议、断连排查。

## 一、SSE 协议速览

YiAi 的 SSE 遵循标准协议：

```
data: {"type":"event_name","payload":{...}}\n\n
```

**关键响应头**：

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no     # 禁用 Nginx 缓冲
```

## 二、Agent 事件流调试

### 事件序列示例

正常 Agent 对话的事件序列：

```
turn_start → tool_call → [confirmation_required] → tool_execution_start
→ tool_execution_end → turn_end → ... → agent_end
```

### 命令行监控

```bash
# 监听原始 SSE 流
curl -N -X POST http://localhost:10086/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "列出所有项目"}],
    "session_id": "debug-001",
    "model": "qwen2.5"
  }'
```

### 使用 Python 调试

```python
import httpx
import json

async def debug_sse_stream():
    """逐事件打印 Agent SSE 流"""
    async with httpx.AsyncClient(timeout=120) as client:
        async with client.stream(
            "POST",
            "http://localhost:10086/agent/chat",
            json={
                "messages": [{"role": "user", "content": "列出所有项目"}],
                "session_id": "debug-001"
            }
        ) as response:
            event_count = 0
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    event_count += 1
                    data = json.loads(line[6:])
                    event_type = data.get("type", "unknown")
                    print(f"[{event_count}] {event_type}: {json.dumps(data, ensure_ascii=False)[:200]}")
                elif line.startswith(": "):
                    print(f"  [heartbeat]")
```

## 三、常见事件类型

| 事件 | 说明 | 调试关注点 |
|------|------|-----------|
| `turn_start` | 新一轮开始 | `turn` 序号递增 |
| `tool_call` | LLM 决定调用工具 | `tool` 名称、`args` 参数是否正确 |
| `confirmation_required` | 写操作待确认 | `confirmation_id` 用于后续 confirm |
| `tool_execution_start` | 工具开始执行 | 确认后才出现 |
| `tool_execution_end` | 工具执行完毕 | `result` 或 `error` 字段 |
| `turn_end` | 本轮结束 | `summary` 内容 |
| `model_switch` | 模型自动切换 | `from` → `to` |
| `agent_end` | Agent 终止 | `stop_reason`: completed/max_turns/stopped/error |
| `error` | 错误事件 | `code`, `message` |

## 四、Agent 控制端点调试

### 确认工具调用

```bash
curl -X POST http://localhost:10086/agent/confirm \
  -H "Content-Type: application/json" \
  -d '{"session_id": "debug-001", "confirmation_id": "t0:tool_1", "approve": true}'
```

### 实时引导 Agent

```bash
curl -X POST http://localhost:10086/agent/steer \
  -H "Content-Type: application/json" \
  -d '{"session_id": "debug-001", "message": "改用标题 Final Version"}'
```

### 停止 Agent

```bash
curl -X POST http://localhost:10086/agent/stop \
  -H "Content-Type: application/json" \
  -d '{"session_id": "debug-001"}'
```

## 五、常见故障排查

### 故障 1：SSE 连接立即断开

**症状**：curl 或浏览器立即返回，无流式数据

**排查**：

```bash
# 1. 检查 Agent 端点是否可访问
curl -X POST http://localhost:10086/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "hi"}], "session_id": "test"}'

# 2. 检查 Ollama 是否运行
curl http://localhost:11434/api/tags

# 3. 查看后端日志中的错误
# 常见原因：Ollama 模型未加载、MongoDB 连接断开
```

### 故障 2：流中断无错误信息

**症状**：流在中途断开，无 `agent_end` 或 `error` 事件

**排查**：

```bash
# 1. 检查是否有代理/网关超时
# Nginx 需配置：proxy_read_timeout 600s;

# 2. 检查客户端是否主动断开
# 浏览器 DevTools → Network → 查看 EventStream 标签

# 3. 检查 asyncio.CancelledError 是否被正确处理
# Agent 循环中应捕获并发送 error 事件后正常关闭
```

### 故障 3：工具确认超时

**症状**：`confirmation_required` 事件后 Agent 无响应

**原因**：120s 超时自动拒绝

**修复**：
```bash
# 在超时前发送确认
curl -X POST http://localhost:10086/agent/confirm \
  -d '{"session_id": "...", "confirmation_id": "...", "approve": true}'
```

### 故障 4：心跳丢失导致代理超时

**症状**：长时间无事件的 Agent 会话被代理断开

**排查**：
```bash
# 检查是否有心跳（SSE 注释行，以 : 开头）
curl -N ... | grep "^:"
# 应每 15s 出现 ": heartbeat"

# 如无心跳，检查 Agent 循环中心跳任务是否正确启动
```

## 六、AI 聊天 SSE 调试

### 监控普通聊天流

```bash
# RPC 信封方式调用聊天
curl -N -X POST http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "services.ai.chat_service",
    "method_name": "chat",
    "parameters": {
      "model": "qwen2.5",
      "messages": [{"role": "user", "content": "介绍一下 RPC 协议"}],
      "stream": true
    }
  }'
```

**正常流**：
```
data: {"data": {"message": "RPC"}}
data: {"data": {"message": " 协议是..."}}
data: {"done": true}
```

**异常流**：
```
data: {"error": "model not found"}
```
→ 检查 `ollama list`，确认模型已 pull

## 七、Chrome DevTools 调试

1. 打开 `chrome://net-export/` 开始录包
2. 触发 SSE 请求
3. 停止录包，在 `netlog-viewer` 中查看
4. 筛选 `text/event-stream` 类型，查看事件序列

或使用 DevTools Network 面板：
1. 右键请求 → "Replay XHR" 可重放
2. 查看 EventStream 子标签获取格式化事件

## 八、快速诊断脚本

```bash
#!/bin/bash
# sse-debug.sh — SSE 流快速诊断
echo "=== SSE 诊断 ==="
echo "1. Ollama 状态:"
curl -s http://localhost:11434/api/tags | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('models',[])), 'models')" 2>/dev/null || echo "Ollama 不可达"

echo "2. Agent 连通性:"
timeout 5 curl -s -N -X POST http://localhost:10086/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}],"session_id":"diag"}' 2>&1 | head -5

echo "3. 聊天流连通性:"
timeout 5 curl -s -N -X POST http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{"module_name":"services.ai.chat_service","method_name":"chat","parameters":{"model":"qwen2.5","messages":[{"role":"user","content":"hi"}],"stream":true}}' 2>&1 | head -5
```