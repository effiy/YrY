"""Abstract base classes for translation providers.

Each provider type has a uniform interface. Third-party API adapters
inherit from these base classes and implement the async call methods.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class TranslationResult:
    """Unified translation result from any provider."""
    provider: str
    text: str
    from_lang: str = ""
    to_lang: str = ""


class BaseTranslateProvider(ABC):
    """Abstract translation provider.

    Subclasses implement `_translate` with provider-specific API logic.
    The public `translate` method adds error wrapping and result normalization.
    """

    name: str = "base"
    label: str = "Base Provider"

    @abstractmethod
    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        """Provider-specific translation logic. Must be implemented."""

    async def translate(self, text: str, from_lang: str, to_lang: str, **config) -> TranslationResult:
        """Public translation method with error wrapping."""
        result_text = await self._translate(text, from_lang, to_lang, **config)
        return TranslationResult(
            provider=self.name,
            text=result_text.strip(),
            from_lang=from_lang,
            to_lang=to_lang,
        )


class BaseRecognizeProvider(ABC):
    """Abstract OCR/recognition provider."""

    name: str = "base"
    label: str = "Base OCR"

    @abstractmethod
    async def _recognize(self, image_base64: str, language: str, **config) -> str:
        """Provider-specific OCR logic."""

    async def recognize(self, image_base64: str, language: str, **config) -> str:
        """Public recognition method with error wrapping."""
        return (await self._recognize(image_base64, language, **config)).strip()


class BaseTTSProvider(ABC):
    """Abstract TTS provider."""

    name: str = "base"
    label: str = "Base TTS"

    @abstractmethod
    async def _tts(self, text: str, language: str, **config) -> dict:
        """Provider-specific TTS logic. Returns dict with audio data."""

    async def tts(self, text: str, language: str, **config) -> dict:
        """Public TTS method."""
        return await self._tts(text, language, **config)


class BaseCollectionProvider(ABC):
    """Abstract vocabulary collection provider."""

    name: str = "base"
    label: str = "Base Collection"

    @abstractmethod
    async def _collect(self, source: str, target: str, **config) -> None:
        """Provider-specific collection logic."""

    async def collect(self, source: str, target: str, **config) -> None:
        """Public collection method."""
        await self._collect(source, target, **config)
