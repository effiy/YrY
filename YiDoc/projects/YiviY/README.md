# YiviY · Video Translation & Dubbing Workbench

> Streamlit + Python · 12-step pipeline (download → ASR → NLP split → LLM
> translate → TTS → synthesis) · WhisperX · Replicate · OpenAI · CTranslate2
> backends. Source root: `/Users/ruiyi/Downloads/YrY/YiviY/`.

## System view

YiviY is a Streamlit-based video translation and dubbing workbench that
automates the full journey from a video URL to a dubbed output MP4. The
core is a **12-step pipeline** (`core/_N_xxx.py`), where each step is an
independent Python module that reads JSON intermediate state from
`output/`, performs one transformation (download → audio extraction → ASR
→ NLP sentence split → LLM translation → subtitle generation → TTS →
audio merge → final render), and writes JSON state back for the next
step. The Streamlit UI (`st.py`) exposes a sidebar step selector so users
can run the whole pipeline end-to-end or debug a single step in
isolation. Multiple backends are supported at each AI stage — WhisperX
/ CTranslate2 for ASR, OpenAI GPT / Replicate for translation, OpenAI /
Replicate / GPT-SoVITS / edge-tts for TTS — selected via `config.yaml`.

## Command flow

| Command | Purpose |
|---------|---------|
| `python -m streamlit run st.py` | Run the Streamlit Web UI locally |
| `python install.py` | One-shot environment setup (pip + ffmpeg + spaCy model + whisperx + demucs) |
| `python setup_env.py` | Load API keys (OpenAI / Replicate / Azure / DeepSeek) into env |
| `OneKeyBatch.bat` | Windows batch runner for headless full-pipeline execution |
| `Dockerfile` / `docker build` | GPU-accelerated containerized deployment |
| `VideoLingo_colab.ipynb` | Cloud-runnable Colab variant (GPU-backed) |
| No `pytest` | No automated test runner; verify via `test/` scenes |

## Quick start

1. Clone the source tree at `/Users/ruiyi/Downloads/YrY/YiviY/` and `cd`
   into it.
2. Run `python install.py` to install Python deps, `ffmpeg`, the spaCy
   language model, `whisperx`, and `demucs` (the last two are installed
   separately to avoid torchaudio version conflicts).
3. Fill API credentials — either edit `config.yaml` (the `api.key` /
   `api.base_url` / `api.model` fields) or export the same keys as
   environment variables and run `python setup_env.py`.
4. Launch the UI: `python -m streamlit run st.py`. Open the printed
   localhost URL in a browser.
5. Paste a video URL (YouTube / Bilibili / local path) into the sidebar,
   pick ASR / Translate / TTS backends, and run step 1, then step 2,
   ... or click "Run All" for the full pipeline.
6. To inspect the documentation catalog entry for this project, open
   `/Users/ruiyi/Downloads/YrY/YiDoc/projects/YiviY/index.html` in a browser.

**Goal-Driven Execution** — success criteria: (a) the Streamlit UI boots
without import errors, (b) step 1 (`_1_ytdlp.py`) downloads a test video
into `output/`, (c) step 12 (`_12_dub_to_vid.py`) produces a dubbed MP4
whose audio track matches the translated transcript.

## Project structure

```
YiviY/
├── st.py                       # Streamlit Web UI entry · sidebar step selector
├── config.yaml                 # Pipeline config · API keys · model names · language
├── setup_env.py                # API key loader · env-var bridge
├── install.py                  # One-shot environment setup
├── setup.py                    # Package metadata
├── Dockerfile                  # GPU container deployment
├── VideoLingo_colab.ipynb      # Colab variant
├── custom_terms.xlsx           # Glossary / domain terms (multilingual)
├── requirements.txt            # Python runtime deps
├── batch/                      # Headless batch runners (OneKeyBatch.bat etc.)
├── translations/               # i18n resources (en.json, zh-CN.json)
└── core/                       # Pipeline core
    ├── __init__.py
    ├── prompts.py              # LLM prompt templates (translate / summarize / split)
    ├── translate_lines.py      # Line-level translation orchestrator
    ├── _1_ytdlp.py             # Step 1  · video download (yt-dlp)
    ├── _2_asr.py               # Step 2  · ASR (WhisperX / CTranslate2)
    ├── _3_1_split_nlp.py       # Step 3.1· NLP sentence split (spaCy)
    ├── _3_2_split_meaning.py   # Step 3.2· semantic re-split (LLM)
    ├── _4_1_summarize.py       # Step 4.1· content summary
    ├── _4_2_translate.py       # Step 4.2· LLM translation
    ├── _5_split_sub.py         # Step 5  · subtitle line split
    ├── _6_gen_sub.py           # Step 6  · SRT / VTT generation
    ├── _7_sub_into_vid.py      # Step 7  · burn subtitles into video (ffmpeg)
    ├── _8_1_audio_task.py      # Step 8.1· audio task preparation
    ├── _8_2_dub_chunks.py      # Step 8.2· per-chunk TTS dubbing
    ├── _9_refer_audio.py       # Step 9  · reference audio (voice cloning target)
    ├── _10_gen_audio.py        # Step 10 · TTS audio synthesis
    ├── _11_merge_audio.py      # Step 11 · audio merge (ffmpeg)
    ├── _12_dub_to_vid.py       # Step 12 · final dubbing to video (MoviePy)
    ├── asr_backend/            # ASR adapters (whisperX.py, audio_preprocess.py)
    ├── tts_backend/            # TTS adapters (sf_fishtts.py, gpt_sovits_tts.py)
    ├── st_utils/               # Streamlit UI components (sidebar, sections)
    ├── spacy_utils/            # spaCy language helpers
    └── utils/                  # shared helpers
```

## Domain Language

YiviY's domain is **automated video translation and dubbing** — turning
a source-language video into a target-language dubbed video through a
deterministic 12-step pipeline with pluggable AI backends.

- **Step** — a single stage of the 12-step pipeline, implemented as
  `core/_N_xxx.py` where `N` is the execution order. Each step reads
  JSON intermediate state from `output/`, performs one transformation,
  and writes JSON state back. Steps are independently re-runnable.
- **Backend adapter** — a pluggable implementation of an AI capability
  (ASR, Translate, TTS) living under `core/asr_backend/` or
  `core/tts_backend/`. Step modules dispatch to adapters via
  `config.yaml`; they never import SDKs directly.
- **Intermediate state** — the JSON artifacts under `output/` that flow
  between steps (e.g. `words.json` from ASR, `translated.json` from
  translation, `audio_tasks.json` from step 8.1). Intermediate state is
  the pipeline's persistence layer and the retry boundary.
- **Pipeline** — the ordered sequence of 12 steps from video download to
  final dubbed MP4. "Run the pipeline" means executing steps 1→12 in
  order; "run step N" means re-running only that step from its input
  intermediate state.
- **Diarization** — the process of segmenting audio by speaker
  (via `pyannote-audio`), so that multi-speaker videos are dubbed with
  distinct TTS voices per speaker.

### Relationships

- **Pipeline** ⊇ **Step**: the pipeline is the ordered container; each
  step is one stage within it.
- **Step** → **Backend adapter**: a step that needs an AI capability
  (ASR, Translate, TTS) delegates to the adapter selected in
  `config.yaml`. The step owns the orchestration; the adapter owns the
  model call.
- **Step** ↔ **Intermediate state**: each step reads the previous step's
  JSON output and writes its own JSON output. Intermediate state is the
  only cross-step coupling — steps never import each other directly.
- **Backend adapter** ⊥ **Step**: adapters are agnostic of which step
  calls them; the same TTS adapter serves both step 8.2 (per-chunk
  dubbing) and step 10 (full audio synthesis).

### Example dialogue

> User: "Translate this YouTube video to Chinese and dub it."
> System: runs step 1 (`_1_ytdlp.py`) → downloads `video.mp4` to
> `output/`; step 2 (`_2_asr.py`) → produces `words.json`; step 3.1 +
> 3.2 → sentence-aligned segments; step 4.2 → `translated.json` in
> Chinese; step 6 → `subtitle.srt`; step 8.2 + 10 → TTS audio in
> Chinese; step 11 → merged audio; step 12 → `final_output.mp4`.
> User: "The translation missed a technical term."
> System: re-runs step 4.2 after the user edits `custom_terms.xlsx`
> (glossary); downstream steps 6 / 8.2 / 10 / 11 / 12 re-run from the
> refreshed `translated.json` without re-doing ASR.
> User: "Use a different voice for speaker 2."
> System: re-runs step 9 (`_9_refer_audio.py`) with a new reference
> clip, then steps 10 / 11 / 12.

### Disambiguation markers

- "step" in this codebase **never** means a wizard step in the Streamlit
  UI; it always means one of the 12 pipeline stages in `core/_N_xxx.py`.
- "backend" **does not** mean a web backend server — YiviY has no
  inbound HTTP server. It means a pluggable AI model adapter under
  `core/asr_backend/` or `core/tts_backend/`.
- "intermediate state" **never** means Streamlit session state; it means
  the JSON files under `output/` that flow between pipeline steps.
- "pipeline" **does not** refer to a CI/CD pipeline; it is the 12-step
  video translation pipeline defined in `core/`.
