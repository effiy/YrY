# Scene · 配音分块与参考音频对齐自然

> Story: [dub-synthesis](../index.md) · US-P2

## 用户故事

作为用户，配音分块与参考音频对齐自然。

## 验收

- `_8_2_dub_chunks.py` 按句切分配音任务；每 chunk ≤ T 秒。
- `_9_refer_audio.py` 对齐 chunk 到原时间轴；gap 用静音填充。
- 对齐偏差超过容差时自动 stretch（time-stretch）。

## 使用场景 · 模块化

- `_8_2` 与 `_9` 通过中间 JSON 传递 chunk 元数据；不直接函数调用。
- 对齐算法隔离在 `_9`；chunk 切分在 `_8_2` → 职责单一。
