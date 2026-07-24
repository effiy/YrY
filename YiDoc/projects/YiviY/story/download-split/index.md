# Story · 下载与切分（download-split）

> 模块：[YiviY Story](../index.md) · `core/_1` ~ `core/_3`

## 场景

- [US-D1 · 提供视频 URL，系统下载并切分为可处理单元](scene-1-video-download/index.md)
- [US-D2 · ASR 识别多语种并产出带时间戳的转录文本](scene-2-asr-transcribe/index.md)
- [US-D3 · NLP / 语义切分粒度可调](scene-3-nlp-segment/index.md)

## 使用场景 · 模块化

- ASR 后端抽象在 `core/asr_backend/`，可插拔替换（OpenAI / Whisper / 本地）。
- `_3_1` 与 `_3_2` 共享 `core/spacy_utils/` 切分基础，避免重复。
