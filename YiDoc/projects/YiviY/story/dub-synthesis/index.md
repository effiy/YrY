# Story · 配音与合成（dub-synthesis）

> 模块：[YiviY Story](../index.md) · `core/_8` ~ `core/_12`

## 场景

- [US-P1 · 选择 TTS 后端与参考音色](scene-1-tts-backend/index.md)
- [US-P2 · 配音分块与参考音频对齐自然](scene-2-chunk-alignment/index.md)
- [US-P3 · 最终视频与原视频的时长差 ≤ 容差](scene-3-duration-tolerance/index.md)
- [US-P4 · 查询每个分块的 TTS 耗时与 token 消耗](scene-4-stage-metrics/index.md)

## 使用场景 · 模块化

- TTS 后端抽象在 `core/tts_backend/`，可插拔替换（OpenAI / Edge-TTS / 本地）。
- `_8_1` → `_8_2` → `_9` → `_10` → `_11` → `_12` 形成线性流水线；每步产出中间文件，失败可重跑该步而非全管线。
