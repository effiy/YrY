"""TTS 后端子包公共 API。

``tts_main`` 是对外分发入口,``estimate_duration`` 供外部阶段调用;
各具体 TTS 引擎 (edge / azure / fish / openai / gpt_sovits /
sf_cosyvoice2 / sf_fishtts / _302_f5tts / custom_tts) 仅供
``tts_main`` 内部 dispatch,不对外暴露。

使用 try/except 包裹以兼容 install.py 阶段尚未装齐依赖的情况。
"""
try:
    from .tts_main import tts_main
    from .estimate_duration import init_estimator, estimate_duration
except ImportError:
    pass

__all__ = [
    "tts_main",
    "init_estimator",
    "estimate_duration",
]
