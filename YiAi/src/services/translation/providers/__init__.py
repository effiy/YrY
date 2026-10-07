"""Provider registry — maps provider names to adapter instances.

Each category (translate/recognize/tts/collection) has a lazy-loading
provider map. Providers are instantiated on first access.
"""

from services.translation.providers.base import (
    BaseTranslateProvider,
    BaseRecognizeProvider,
    BaseTTSProvider,
    BaseCollectionProvider,
)


# ── Translate providers ───────────────────────────────────────────────

TRANSLATE_PROVIDERS: dict[str, BaseTranslateProvider] = {}


def _init_translate_providers():
    """Lazy-load translate provider instances."""
    if TRANSLATE_PROVIDERS:
        return
    from services.translation.providers.openai import OpenAIProvider
    from services.translation.providers.google import GoogleProvider
    from services.translation.providers.deepl import DeepLProvider
    from services.translation.providers.baidu import BaiduProvider
    from services.translation.providers.tencent import TencentProvider
    from services.translation.providers.volcengine import VolcengineProvider
    from services.translation.providers.ollama import OllamaProvider
    from services.translation.providers.microsoft import MicrosoftProvider
    from services.translation.providers.youdao import YoudaoProvider
    from services.translation.providers.aliyun import AlibabaProvider
    from services.translation.providers.caiyun import CaiyunProvider
    from services.translation.providers.niutrans import NiutransProvider
    from services.translation.providers.yandex import YandexProvider

    _providers: list[BaseTranslateProvider] = [
        OpenAIProvider(), GoogleProvider(), DeepLProvider(), BaiduProvider(),
        TencentProvider(), VolcengineProvider(), OllamaProvider(), MicrosoftProvider(),
        YoudaoProvider(), AlibabaProvider(), CaiyunProvider(), NiutransProvider(),
        YandexProvider(),
    ]
    for p in _providers:
        TRANSLATE_PROVIDERS[p.name] = p


# ── Recognize providers ───────────────────────────────────────────────

RECOGNIZE_PROVIDERS: dict[str, BaseRecognizeProvider] = {}


def _init_recognize_providers():
    if RECOGNIZE_PROVIDERS:
        return
    from services.translation.providers.baidu_ocr import BaiduOCRProvider
    from services.translation.providers.tencent_ocr import TencentOCRProvider
    from services.translation.providers.volcengine_ocr import VolcengineOCRProvider
    from services.translation.providers.iflytek_ocr import IflytekOCRProvider

    for p in [BaiduOCRProvider(), TencentOCRProvider(), VolcengineOCRProvider(), IflytekOCRProvider()]:
        RECOGNIZE_PROVIDERS[p.name] = p


# ── TTS providers ─────────────────────────────────────────────────────

TTS_PROVIDERS: dict[str, BaseTTSProvider] = {}


def _init_tts_providers():
    if TTS_PROVIDERS:
        return
    from services.translation.providers.lingva_tts import LingvaTTSProvider
    TTS_PROVIDERS["lingva"] = LingvaTTSProvider()


# ── Collection providers ──────────────────────────────────────────────

COLLECTION_PROVIDERS: dict[str, BaseCollectionProvider] = {}


def _init_collection_providers():
    if COLLECTION_PROVIDERS:
        return
    from services.translation.providers.anki import AnkiProvider
    from services.translation.providers.eudic import EudicProvider
    for p in [AnkiProvider(), EudicProvider()]:
        COLLECTION_PROVIDERS[p.name] = p
