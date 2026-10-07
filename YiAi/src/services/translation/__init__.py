"""Translation service module — multi-engine translation, OCR, TTS, and vocabulary collection.

All translation/recognition/TTS calls from client applications are routed through this module
via the YiAi RPC envelope, replacing the previous direct-to-third-party-API
pattern in the frontend.

RPC methods:
  services.translation.translate_service.translate       — parallel multi-engine translation
  services.translation.translate_service.translate_stream — SSE streaming translation (LLM)
  services.translation.translate_service.translate_with_context — RAG-enhanced translation
  services.translation.translate_service.translation_memory_search — memory search
  services.translation.translate_service.translation_memory_stats — memory statistics
  services.translation.translate_service.translation_analytics — usage analytics
  services.translation.translate_service.translation_feedback — quality feedback
  services.translation.translate_service.provider_health — provider health monitoring
  services.translation.translate_service.hourly_trend — hourly translation trend
  services.translation.translate_service.provider_breakdown — provider usage breakdown
  services.translation.recognize_service.recognize              — OCR text recognition
  services.translation.tts_service.tts                   — text-to-speech
  services.translation.collection_service.collect        — vocabulary collection
"""

from services.translation.providers import (
    TRANSLATE_PROVIDERS,
    RECOGNIZE_PROVIDERS,
    TTS_PROVIDERS,
    COLLECTION_PROVIDERS,
)
from services.translation.translate_service import (
    translate,
    translate_stream,
    translation_memory_search,
    translation_memory_stats,
    translation_analytics,
    translation_feedback,
    provider_health,
    hourly_trend,
    provider_breakdown,
)
from services.translation.recognize_service import recognize
from services.translation.tts_service import tts
from services.translation.collection_service import collect

__all__ = [
    "translate",
    "translate_stream",
    "translation_memory_search",
    "translation_memory_stats",
    "translation_analytics",
    "translation_feedback",
    "provider_health",
    "hourly_trend",
    "provider_breakdown",
    "recognize",
    "tts",
    "collect",
    "TRANSLATE_PROVIDERS",
    "RECOGNIZE_PROVIDERS",
    "TTS_PROVIDERS",
    "COLLECTION_PROVIDERS",
]
