# YiviY · 用户故事与模块化分析

> 轴线：**后端 → 模块化**（见 `.claude/skills/yry-init/rules/architecture-direction.md`）。
> 分析口径：以**架构设计**为大模块（阶段边界），每个模块下展开用户故事；以**功能模块化**为基础组织使用场景。
> 源码根：`YiviY/core/` + `YiviY/batch/` + `YiviY/translations/`。生成于 2026-07-24。

## 故事目录

| 阶段组（大模块） | 范围 | 故事 | 场景数 |
|------------------|------|------|--------|
| 下载与切分 | `_1` ~ `_3` | [下载 / ASR / NLP 切分](download-split/index.md) | 3 |
| 翻译与字幕 | `_4` ~ `_7` | [翻译 / 字幕生成 / 注入](translate-subtitle/index.md) | 4 |
| 配音与合成 | `_8` ~ `_12` | [TTS / 对齐 / 合成](dub-synthesis/index.md) | 4 |
| 批量与 UI | `launch.py` + `batch/` + `st_utils/` | [Streamlit UI / 批量 / 多语](batch-ui/index.md) | 3 |

管线 12 阶段：`_1_ytdlp → _2_asr → _3_1_split_nlp / _3_2_split_meaning → _4_* → _5_split_sub → _6_gen_sub → _7_sub_into_vid → _8_* → _9_refer_audio → _10_gen_audio → _11_merge_audio → _12_dub_to_vid`。

## 模块化方向（下一步边界固化）

| 机会 | 现状 | 建议边界 |
|------|------|----------|
| 阶段注册表 | 编号命名隐式表达顺序 | 显式 `PIPELINE_STAGES` 列表，`launch.py` 按表执行 |
| 后端抽象显式化 | `asr_backend/` `tts_backend/` 已存在但部分脚本仍直引 | 所有阶段仅通过 backend 抽象接口调用 |
| 中间文件契约 | 文件命名散落脚本内 | 定义 `IntermediateFiles` 常量集合 |
| 错误与重试 | 失败需重跑整个阶段 | stage-level 检查点与 resume 协议 |
| 多语资源 | `translations/` 静态 | 引入 key 注册表，缺失 key fail-fast |

## 非目标

- 不在本阶段拆分独立微服务（管线单进程更合算）。
- 不强制替换 yt-dlp / spacy 等核心依赖（够用）。

## 链接

- 架构场景：`../arch/index.html`
- 测试场景：`../test/index.html`
- 文件清单：`../files/index.html`
- API 清单：`../apis/index.html`
