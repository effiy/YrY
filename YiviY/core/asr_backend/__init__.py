"""ASR 后端子包公共 API。

外部调用方只能 ``from core.asr_backend import ...``;不要直接从
``audio_preprocess`` / ``demucs_vl`` / ``whisperX_*`` / ``elevenlabs_asr``
等内部文件导入。

使用 try/except 包裹以兼容 install.py 阶段尚未装齐依赖的情况
(沿用 core/__init__.py 与 core/utils/__init__.py 的模式)。
"""
try:
    from .audio_preprocess import (
        normalize_audio_volume,
        convert_video_to_audio,
        get_audio_duration,
        split_audio,
        process_transcription,
        save_results,
        save_language,
    )
    from .demucs_vl import demucs_audio
    from .whisperX_local import transcribe_audio
    from .whisperX_302 import transcribe_audio_302
    from .elevenlabs_asr import transcribe_audio_elevenlabs
except ImportError:
    pass

__all__ = [
    "normalize_audio_volume",
    "convert_video_to_audio",
    "get_audio_duration",
    "split_audio",
    "process_transcription",
    "save_results",
    "save_language",
    "demucs_audio",
    "transcribe_audio",
    "transcribe_audio_302",
    "transcribe_audio_elevenlabs",
]
