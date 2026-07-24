# Scene 2 · Data Flow Tracing

> **问题**: 一条视频在 YiviY 12 步流水线中如何流转？每一步的输入输出契约是什么？

---

## §0 · Effect Sketch

```mermaid
graph LR
    URL[URL] --> S1[1. yt-dlp]
    S1 -->|video.mp4| S2[2. ASR]
    S2 -->|words.json| S3[3.1 NLP Split]
    S3 -->|segments.json| S4[3.2 Meaning Split]
    S4 --> S5[4.1 Summarize]
    S5 --> S6[4.2 Translate]
    S6 -->|translated.json| S7[5. Sub Split]
    S7 --> S8[6. Gen Subtitle]
    S8 -->|subtitle.srt| S9[7. Sub into Vid]
    S9 -->|video_subbed.mp4| S10[8.1 Audio Task]
    S10 --> S11[8.2 Dub Chunks]
    S11 --> S12[9. Ref Audio]
    S12 --> S13[10. Gen Audio]
    S13 --> S14[11. Merge Audio]
    S14 -->|merged_audio.wav| S15[12. Dub to Vid]
    S15 --> FINAL[final_output.mp4]
```

**场景概述**: 本场景追踪一段视频从用户输入 URL 到产出带字幕配音的最终视频的完整数据流。每步通过 JSON 中间态衔接，所有产物落盘到 `output/`，任意步骤失败可重试而无需从头开始。

---

## §1 · Test Design

| AC# | 验收标准 | 验证方法 |
|-----|---------|---------|
| AC-2.1 | 能描述从 URL 到 final_output.mp4 的完整链路 | 检查 12 步流水线模块的输入输出契约 |
| AC-2.2 | 每步产物在 output/ 中可定位 | 检查 `output/` 目录下的 JSON / 媒体文件 |
| AC-2.3 | 失败重试不重跑前序步骤 | 单步调试 `python -c "from core._N import run"` |
| AC-2.4 | 后端切换不改变中间态契约 | 对比 WhisperX 与 Replicate 的 words.json 结构 |

---

## §2 · Output Inventory

### 2.1 端到端数据流

| 阶段 | 步骤 | 输入 | 输出 | 后端 |
|------|------|------|------|------|
| 下载 | 1. yt-dlp | URL | video.mp4 | yt-dlp subprocess |
| 识别 | 2. ASR | video.mp4 | words.json | WhisperX / CTranslate2 |
| 切分 | 3.1 NLP Split | words.json | segments.json | spaCy |
| 切分 | 3.2 Meaning Split | segments.json | segments.json (refined) | LLM 辅助 |
| 摘要 | 4.1 Summarize | segments.json | summary.txt | LLM |
| 翻译 | 4.2 Translate | segments + glossary | translated.json | OpenAI GPT / Replicate |
| 字幕 | 5. Sub Split | translated.json | subtitle_lines.json | length-aware splitter |
| 字幕 | 6. Gen Subtitle | subtitle_lines | subtitle.srt | formatter |
| 合成 | 7. Sub into Vid | video + subtitle.srt | video_subbed.mp4 | ffmpeg |
| 配音 | 8.1 Audio Task | translated.json | audio_tasks.json | planner |
| 配音 | 8.2 Dub Chunks | audio_tasks | dub_chunks/ | TTS |
| 参考音 | 9. Ref Audio | 原文音频 | reference.wav | voice clone target |
| 配音 | 10. Gen Audio | audio_tasks + reference | tts_audio.wav | TTS synth |
| 合成 | 11. Merge Audio | original + tts | merged_audio.wav | ffmpeg |
| 渲染 | 12. Dub to Vid | video_subbed + merged_audio | final_output.mp4 | MoviePy + ffmpeg |

### 2.2 中间态契约

- **words.json** — 词级时间戳，每项含 `word / start / end / speaker?`
- **segments.json** — 语义感知分段，每项含 `id / text / start / end / speaker`
- **translated.json** — 翻译结果，每项含 `id / source / target / glossary_terms`
- **audio_tasks.json** — TTS 任务映射，每项含 `chunk_id / text / duration / voice_ref`
- **subtitle.srt** — 标准 SRT，每段含 `index / start-end / text (bilingual)`

### 2.3 架构决策

- **JSON 中间态**: 所有步骤产物以 JSON 或文件落盘 `output/`，便于断点续跑与跨步骤调试
- **后端契约一致**: WhisperX 与 Replicate 产出的 words.json 结构对齐，下游步骤无需感知后端
- **术语表注入**: 翻译步骤加载 `custom_terms.xlsx`，确保领域术语一致翻译
- **双语字幕**: 步骤 6 同时输出原文 + 译文，便于用户对照

---

## §3 · Test Report

| AC# | 状态 | 详情 |
|-----|------|------|
| AC-2.1 | ✅ PASS | 12 步流水线每步均有明确的输入输出契约，链路清晰 |
| AC-2.2 | ✅ PASS | `output/` 目录下可定位 words.json / segments.json / translated.json / subtitle.srt / dub_chunks/ / final_output.mp4 |
| AC-2.3 | ✅ PASS | 单步调试命令 `python -c "from core._2_asr import run; run('video.mp4')"` 可直接运行任意步骤 |
| AC-2.4 | ✅ PASS | 后端适配器隔离了后端差异，下游步骤消费相同 JSON 结构 |

---

## §4 · Self-Improvement

| 诊断项 | 评估 | 行动 |
|--------|------|------|
| D0 完整性 | ✅ 全部步骤已追踪 | 无需行动 |
| D1 中间态版本 | ⚠️ JSON 中间态无 schema 版本号 | 建议在 JSON 顶层添加 `schema_version` 字段 |
| D2 重试粒度 | ✅ 步骤级重试可用 | 可考虑在 config.yaml 添加 `resume_from_step` |
| D3 可观测性 | ⚠️ 仅 Rich logger 输出 stdout | 建议添加每步耗时 + 产物路径的结构化日志 |

**当前状态**: 数据流清晰，断点续跑可用。D1 / D3 可作为改进项。
