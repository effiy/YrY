---
doc_type: module
prd_task_id: "YA-09-128"
title: "YA-09-128: 音频转录 — Whisper 集成 + 会议记录 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "168-需求-音频转录与处理.md"
source_okr: [yiai-002]
---

# YA-09-128: 音频转录 — Whisper 集成 + 会议记录 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[168-需求-音频转录与处理.md](../../prds/2026-09/168-需求-音频转录与处理.md)
> 需求编号：YA-09-128 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

Ollama 不原生支持音频。通过 `faster-whisper` 本地转录，转录结果可送入 LLM 进行摘要/翻译/提取待办。

```python
from faster_whisper import WhisperModel

model = WhisperModel("medium", device="cpu")

async def transcribe(audio_path: str) -> dict:
    segments, info = model.transcribe(audio_path, language="zh")
    text = " ".join(s.text for s in segments)
    return {"text": text, "language": info.language, "duration_s": info.duration}
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | faster-whisper 集成 + 上传 API | 中文音频转录正确 | 0.25 |
| 2 | 转录后 LLM 摘要 + 测试 | 会议 → 待办清单 | 0.25 |

**合计：0.5d**。