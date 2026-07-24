# Scene · 选择 TTS 后端与参考音色

> Story: [dub-synthesis](../index.md) · US-P1

## 用户故事

作为用户，我能选择 TTS 后端与参考音色。

## 验收

- `config.yaml` 配 `tts_backend`：OpenAI / Edge-TTS / 本地 GPT-SoVITS。
- 参考音频样本可选上传；用于音色克隆。
- 缺失参考音频走默认音色，不阻塞流程。

## 使用场景 · 模块化

- `_10_gen_audio.py` 只调 `core/tts_backend/` 抽象；backend 切换零改动阶段。
- backend 实现差异隔离在 `tts_backend/<name>/`；阶段模块不感知 SDK。
