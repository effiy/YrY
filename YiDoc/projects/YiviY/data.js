/**
 * YiviY · Video Translation & Dubbing Workbench
 * --------------------------------------------------------------------------
 * Project: Streamlit + Python · 12-step pipeline (download → ASR → NLP
 *          sentence split → LLM translate → TTS → synthesis) · multiple
 *          ASR / Translate / TTS backends (WhisperX · Replicate · OpenAI ·
 *          CTranslate2). Entry: st.py · core modules: core/_N_xxx.py.
 *
 * Consumed by:
 *   - index.html (Vue 3 template references · v-cloak hides it until
 *     the Vue app + all CDN components resolve)
 *   - index.js  (reads window.HELP_CONFIG and creates the Vue app)
 */
window.HELP_CONFIG = {
  titleIcon:     "🎬",
  title:         "YiviY · Video Translation & Dubbing Workbench",
  tagline:       "Streamlit + Python · 12-step pipeline (download → ASR → NLP split → LLM translate → TTS → synthesis) · WhisperX · Replicate · OpenAI · CTranslate2 backends",
  backTopLabel:  "返回顶部",
  footerNote:    "由 yry-init 流水线生成 (detect → explore → generate → arch → verify) · 项目根: /Users/ruiyi/Downloads/YrY/YiviY/",

  breadcrumb: [
    { label: "YiDoc", href: "../../index.html" },
    { label: "Projects", href: "../../dashboard/index.html" },
    { label: "YiviY" }
  ],

  stats: [
    { value: "12",  label: "Pipeline Steps",  modifier: "accent", sub: "core/_N_xxx.py per step" },
    { value: "73",   label: "Source Files",    modifier: "cyan",   sub: "Python · config · i18n" },
    { value: "4+",   label: "ASR / TTS Backends", modifier: "accent", sub: "WhisperX · Replicate · OpenAI · CTranslate2" },
    { value: "v1.0", label: "Latest Version",  modifier: "info",   sub: "Streamlit Web UI" }
  ],

  panelHub: {
    label: { text: '📊', panel: 'reports', title: 'YiviY 文档导航' },
    targetBlank: false,
    buttons: [
        {icon: '🏛', name: 'Architecture', desc: '5 个架构场景', color: 'var(--yry-accent)', panel: 'arch'},
        {icon: '🧪', name: 'Self-Check',   desc: '6 个自检场景', color: 'var(--yry-pass)',   panel: 'test'},
        {icon: '📁', name: 'Files',         desc: '73 文件 · 592 KB', color: 'var(--yry-info)', panel: 'files'}
    ],
    flow: '架构分析 → 自检 → 文件体检',
    urls: {
      arch:  '../../templates/arch/index.html?project=YiviY',
      test:  '../../templates/test/index.html?project=YiviY',
      files: '../../templates/files/index.html?project=YiviY',
      apis:  '../../templates/apis/index.html?project=YiviY',
      daily: '../../templates/daily/cto-report.html?project=YiviY',
    },
  },

  reportsList: {
    daily: [],
    weekly: [],
    monthly: [],
  },

  sections: [
    {
      id:    "section-dependencies",
      badge: "1",
      title: "Third-Party Dependencies / Frameworks",
      meta:  "Python runtime · Streamlit UI · multiple AI backends",
      groups: [
        {
          id:    "deps-runtime",
          kind:  "items",
          icon:  "📦",
          title: "Runtime Dependencies (Python)",
          items: [
            {
              icon:        "S",
              iconTone:    "is-module",
              title:       "Streamlit",
              description: "Interactive Web UI framework · zero frontend code · st.py entry · reactive widgets",
              meta:        "<span class=\"accent\">UI</span> · st.py"
            },
            {
              icon:        "W",
              iconTone:    "is-module",
              title:       "WhisperX",
              description: "ASR with word-level timestamps · speaker diarization via PyAnnote · CTranslate2 accelerated",
              meta:        "<span class=\"accent\">ASR</span> · core/asr_backend/"
            },
            {
              icon:        "P",
              iconTone:    "is-module",
              title:       "PyAnnote Audio",
              description: "Speaker diarization · multi-speaker segmentation · embedding-based clustering",
              meta:        "<span class=\"accent\">Diarize</span> · step 5"
            },
            {
              icon:        "O",
              iconTone:    "is-module",
              title:       "OpenAI (GPT + TTS)",
              description: "LLM translation (GPT-4o) · TTS audio synthesis · used as alt backend to Replicate",
              meta:        "<span class=\"accent\">LLM/TTS</span> · env-configured"
            },
            {
              icon:        "R",
              iconTone:    "is-module",
              title:       "Replicate",
              description: "Cloud model inference API · hosts Whisper / Llama / TTS models · used for ASR / Translate / TTS alt path",
              meta:        "<span class=\"accent\">Cloud</span> · api.replicate.com"
            },
            {
              icon:        "C",
              iconTone:    "is-module",
              title:       "CTranslate2",
              description: "Fast inference engine for Transformer models · GPU-accelerated Whisper / WhisperX fallback",
              meta:        "<span class=\"accent\">Engine</span> · local GPU"
            },
            {
              icon:        "Y",
              iconTone:    "is-module",
              title:       "yt-dlp",
              description: "Video downloader · YouTube / Bilibili / 1000+ sites · step 1 input",
              meta:        "<span class=\"accent\">Fetch</span> · core/_1_ytdlp.py"
            },
            {
              icon:        "F",
              iconTone:    "is-module",
              title:       "ffmpeg",
              description: "Audio extraction · audio merge · video muxing · step 2 / 10 / 11 / 12",
              meta:        "<span class=\"accent\">AV</span> · subprocess"
            },
            {
              icon:        "S",
              iconTone:    "is-module",
              title:       "spaCy",
              description: "NLP sentence splitting · language-aware semantic segmentation · step 3.1",
              meta:        "<span class=\"accent\">NLP</span> · core/_3_1_split_nlp.py"
            },
            {
              icon:        "M",
              iconTone:    "is-module",
              title:       "MoviePy",
              description: "Video editing · subtitle overlay · final render composition · step 11 / 12",
              meta:        "<span class=\"accent\">Render</span> · core/_12_dub_to_vid.py"
            },
            {
              icon:        "P",
              iconTone:    "is-module",
              title:       "pydub",
              description: "Audio chunk manipulation · TTS alignment · step 9 / 10",
              meta:        "<span class=\"accent\">Audio</span> · core/_9_refer_audio.py"
            }
          ]
        },
        {
          id:    "deps-dev",
          kind:  "items",
          icon:  "🛠",
          title: "Build & Infrastructure",
          items: [
            {
              icon:        "P",
              iconTone:    "is-module",
              title:       "Python 3.10+",
              description: "Runtime · venv · requirements.txt · install.py for one-shot setup",
              meta:        "<span class=\"accent\">Runtime</span> · install.py"
            },
            {
              icon:        "D",
              iconTone:    "is-module",
              title:       "Docker",
              description: "GPU-accelerated containerized deploy · OneKeyBatch.bat for batch run",
              meta:        "<span class=\"accent\">Infra</span> · Dockerfile"
            },
            {
              icon:        "C",
              iconTone:    "is-module",
              title:       "Colab Notebook",
              description: "VideoLingo_colab.ipynb · cloud-runnable variant · GPU-backed",
              meta:        "<span class=\"accent\">Cloud</span> · Google Colab"
            }
          ]
        }
      ]
    },

    {
      id:    "section-stories",
      badge: "2",
      title: "Story Documents & Scenes",
      meta:  "2 stories · 11 scenes · 5 architecture + 6 self-check",
      groups: [
        {
          kind:  "stories",
          icon:  "📚",
          title: "Story Catalog (arch + test)",
          items: [
            {
              icon:        "🏛",
              title:       "System Architecture & Knowledge Codification",
              badge:       "5 scenes",
              description: "End-to-end video translation pipeline trace · <strong>5 architecture scenes</strong> · module location, data flow through 12 steps, newcomer onboarding, dependency impact (WhisperX / openai / replicate upgrades), trust boundary (API keys + user uploads)",
              sceneLinks: [
                { label: "1. Module Location",          href: "../../projects/YiviY/arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",         href: "../../projects/YiviY/arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",      href: "../../projects/YiviY/arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",         href: "../../projects/YiviY/arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",         href: "../../projects/YiviY/arch/scene-5-trust-boundary-security-surface/index.md" }
              ],
              links: [
                { label: "Architecture Dashboard →", href: "../../templates/arch/index.html?project=YiviY" }
              ],
              meta: "5 scenes · risk: medium · covers 12-step pipeline + 4 backends"
            },
            {
              icon:        "🧪",
              title:       "Self-Check Strategy & Engineering Gate",
              badge:       "6 scenes",
              description: "<strong>6 self-check scenes</strong> · post-init full self-check, pre-commit incremental check, doc-code consistency, security-surface regression, cross-story integration, third-party framework service health",
              sceneLinks: [
                { label: "1. Post-Init Full Self-Check",        href: "../../projects/YiviY/test/scene-1-post-init-full-self-check/index.md" },
                { label: "2. Pre-Commit Incremental Check",   href: "../../projects/YiviY/test/scene-2-pre-commit-incremental-self-check/index.md" },
                { label: "3. Doc-Code Consistency",            href: "../../projects/YiviY/test/scene-3-doc-code-consistency/index.md" },
                { label: "4. Security Surface Regression",      href: "../../projects/YiviY/test/scene-4-security-surface-regression/index.md" },
                { label: "5. Cross-Story Integration",         href: "../../projects/YiviY/test/scene-5-cross-story-integration-regression/index.md" },
                { label: "6. Third-Party Framework Service",   href: "../../projects/YiviY/test/scene-6-third-party-framework-service/index.md" }
              ],
              links: [
                { label: "Test Dashboard →", href: "../../templates/test/index.html?project=YiviY" }
              ],
              meta: "6 scenes · gate: verify-step · 7-point readiness check"
            }
          ]
        }
      ]
    },

    {
      id:    "section-source",
      badge: "3",
      title: "Main Source Code",
      meta:  "st.py entry · core/ 12-step pipeline · 73 source files",
      groups: [
        {
          id:    "src-entry",
          kind:  "items",
          icon:  "🚀",
          title: "UI & Entry Layer",
          items: [
            { icon: "🚀", iconTone: "is-module", title: "st.py",                       description: "Streamlit Web UI entry · sidebar step selector · single-step debug + full pipeline run", meta: "<span class=\"accent\">Entry</span> · st.py" },
            { icon: "🧩", iconTone: "is-module", title: "core/st_utils/",              description: "Streamlit page components · sidebar_setting · download_video_section", meta: "<span class=\"accent\">UI</span> · core/st_utils/" },
            { icon: "⚙️", iconTone: "is-module", title: "install.py",                  description: "One-shot environment setup · pip + ffmpeg + spacy model", meta: "<span class=\"accent\">Setup</span> · install.py" },
            { icon: "🔐", iconTone: "is-module", title: "setup_env.py",                 description: "Environment variable loader · API keys (OpenAI / Replicate / Azure)", meta: "<span class=\"accent\">Env</span> · setup_env.py" }
          ]
        },
        {
          id:    "src-pipeline",
          kind:  "items",
          icon:  "🛠",
          title: "12-Step Pipeline (core/_N_xxx.py)",
          items: [
            { icon: "1",  iconTone: "is-module", title: "_1_ytdlp.py",          description: "Video download · YouTube / Bilibili via yt-dlp",         meta: "<span class=\"accent\">Step 1</span> · URL → video.mp4" },
            { icon: "2",  iconTone: "is-module", title: "_2_asr.py",            description: "ASR · WhisperX / CTranslate2 word-level timestamps",  meta: "<span class=\"accent\">Step 2</span> · video → words.json" },
            { icon: "3",  iconTone: "is-module", title: "_3_1_split_nlp.py",    description: "NLP sentence split · spaCy language-aware",            meta: "<span class=\"accent\">Step 3.1</span> · words → segments" },
            { icon: "3",  iconTone: "is-module", title: "_3_2_split_meaning.py", description: "Semantic-aware re-split · LLM-assisted",                meta: "<span class=\"accent\">Step 3.2</span> · segments refined" },
            { icon: "4",  iconTone: "is-module", title: "_4_1_summarize.py",     description: "Content summary · NLP key points",                     meta: "<span class=\"accent\">Step 4.1</span> · summary.txt" },
            { icon: "4",  iconTone: "is-module", title: "_4_2_translate.py",    description: "LLM translation · OpenAI GPT / Replicate · glossary-aware", meta: "<span class=\"accent\">Step 4.2</span> · translated.json" },
            { icon: "5",  iconTone: "is-module", title: "_5_split_sub.py",      description: "Subtitle line split · length-aware",                   meta: "<span class=\"accent\">Step 5</span> · subtitle_lines.json" },
            { icon: "6",  iconTone: "is-module", title: "_6_gen_sub.py",        description: "Subtitle generation · SRT / VTT",                      meta: "<span class=\"accent\">Step 6</span> · subtitle.srt" },
            { icon: "7",  iconTone: "is-module", title: "_7_sub_into_vid.py",   description: "Burn subtitles into video · ffmpeg",                   meta: "<span class=\"accent\">Step 7</span> · video_subbed.mp4" },
            { icon: "8",  iconTone: "is-module", title: "_8_1_audio_task.py",   description: "Audio task preparation · chunk mapping",               meta: "<span class=\"accent\">Step 8.1</span> · audio_tasks.json" },
            { icon: "8",  iconTone: "is-module", title: "_8_2_dub_chunks.py",   description: "Per-chunk TTS dubbing · OpenAI / Replicate",            meta: "<span class=\"accent\">Step 8.2</span> · dub_chunks/" },
            { icon: "9",  iconTone: "is-module", title: "_9_refer_audio.py",    description: "Reference audio generation · voice cloning target",     meta: "<span class=\"accent\">Step 9</span> · reference.wav" },
            { icon: "10", iconTone: "is-module", title: "_10_gen_audio.py",     description: "TTS audio synthesis · CTranslate2 / Replicate",         meta: "<span class=\"accent\">Step 10</span> · tts_audio.wav" },
            { icon: "11", iconTone: "is-module", title: "_11_merge_audio.py",   description: "Audio merge · original + TTS · ffmpeg",                meta: "<span class=\"accent\">Step 11</span> · merged_audio.wav" },
            { icon: "12", iconTone: "is-module", title: "_12_dub_to_vid.py",    description: "Final dubbing to video · MoviePy render",               meta: "<span class=\"accent\">Step 12</span> · final_output.mp4" }
          ]
        },
        {
          id:    "src-backends",
          kind:  "items",
          icon:  "🔌",
          title: "Backend Adapters (core/asr_backend · core/tts_backend)",
          items: [
            { icon: "🎤", iconTone: "is-module", title: "asr_backend/whisperX.py",       description: "WhisperX local ASR · GPU via CTranslate2",                   meta: "<span class=\"accent\">ASR</span> · core/asr_backend/" },
            { icon: "🎤", iconTone: "is-module", title: "asr_backend/audio_preprocess.py", description: "Audio preprocessing · resample · denoise · VAD",            meta: "<span class=\"accent\">Pre</span> · core/asr_backend/" },
            { icon: "🔊", iconTone: "is-module", title: "tts_backend/sf_fishtts.py",       description: "Fish TTS via Replicate · cloud voice cloning",              meta: "<span class=\"accent\">TTS</span> · core/tts_backend/" },
            { icon: "🔊", iconTone: "is-module", title: "tts_backend/gpt_sovits_tts.py",  description: "GPT-SoVITS local TTS · custom voice model",                 meta: "<span class=\"accent\">TTS</span> · core/tts_backend/" },
            { icon: "📝", iconTone: "is-module", title: "core/prompts.py",                description: "LLM prompt templates · translate / summarize / split",      meta: "<span class=\"accent\">Prompts</span> · core/prompts.py" }
          ]
        }
      ]
    }
  ],

  footerLinks: [
    { label: "YiviY Project", href: "../../YiviY/index.html", targetBlank: true },
    { label: "CLAUDE.md",     href: "CLAUDE.md",        targetBlank: true },
    { label: "README.md",    href: "README.md",        targetBlank: true },
    { label: "Story Report →", href: "story/index.html" }
  ]
};
