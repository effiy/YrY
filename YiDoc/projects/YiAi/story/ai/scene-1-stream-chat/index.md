# Scene · 流式 AI 回复期间可取消

> Story: [ai](../index.md) · US-AI-1

## 用户故事

作为调用方，我发送一条用户消息，得到流式 AI 回复，期间可取消。

## 验收

- SSE 流式分块输出；每个 chunk 携带 `delta` 与 `seq`。
- 客户端断连 1s 内服务端检测并释放 provider reader。
- 取消后再次发送不影响后续调用，无 socket 泄漏。

## 使用场景 · 模块化

- `domain/ai.stream()` 是唯一公共入口；provider SDK 适配在 `services/ai/<provider>/`。
- observer 通过共享 `Event` 契约订阅 stream 事件，`domain/ai` 不直调 observer。
