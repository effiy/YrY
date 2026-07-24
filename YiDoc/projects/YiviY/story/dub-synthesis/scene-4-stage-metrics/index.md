# Scene · 查询每个分块的 TTS 耗时与 token 消耗

> Story: [dub-synthesis](../index.md) · US-P4

## 用户故事

作为运维，能查询每个分块的 TTS 耗时与 token 消耗。

## 验收

- 每个 chunk 发布 `TTSInvoked(chunk_id, latency_ms, tokens)`。
- 写入 `output/metrics.jsonl`；UI 侧边栏可查询。
- 失败 chunk 标记错误码，便于排查。

## 使用场景 · 模块化

- 指标收集在 `tts_backend/` 内；阶段模块只发起调用，不记录指标。
- 阶段与 metrics 解耦 → 可替换 metrics backend 而不动阶段。
