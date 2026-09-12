"""Tests for services/ai/model_runtime.py — runtime factory and helpers."""
import pytest
from unittest.mock import patch, MagicMock
from services.ai.model_runtime import (
    ModelRuntime,
    OllamaRuntime,
    OpenAIRuntime,
    RAGRuntime,
    get_runtime,
    _b64,
)


class TestB64:
    def test_basic_encoding(self):
        result = _b64(b"hello")
        assert result == "aGVsbG8="

    def test_empty_bytes(self):
        result = _b64(b"")
        assert result == ""

    def test_binary_data(self):
        result = _b64(b"\x00\x01\x02\xff")
        assert result == "AAEC/w=="


class TestGetRuntime:
    def test_default_ollama(self):
        runtime = get_runtime()
        assert isinstance(runtime, OllamaRuntime)

    def test_ollama_mode(self):
        runtime = get_runtime("ollama")
        assert isinstance(runtime, OllamaRuntime)

    def test_openai_mode(self):
        with patch("services.ai.model_runtime.settings") as mock_settings:
            mock_settings.deepseek_api_key = "sk-test"
            mock_settings.deepseek_base_url = "https://api.deepseek.com/v1"
            mock_settings.deepseek_default_model = "deepseek-chat"
            mock_settings.deepseek_chat_timeout = 300
            runtime = get_runtime("openai")
            assert isinstance(runtime, OpenAIRuntime)

    def test_deepseek_mode(self):
        with patch("services.ai.model_runtime.settings") as mock_settings:
            mock_settings.deepseek_api_key = "sk-test"
            mock_settings.deepseek_base_url = "https://api.deepseek.com/v1"
            mock_settings.deepseek_default_model = "deepseek-chat"
            mock_settings.deepseek_chat_timeout = 300
            runtime = get_runtime("deepseek")
            assert isinstance(runtime, OpenAIRuntime)

    def test_rag_mode(self):
        runtime = get_runtime("rag")
        assert isinstance(runtime, RAGRuntime)

    def test_unknown_mode_falls_back_to_ollama(self):
        runtime = get_runtime("unknown_provider")
        assert isinstance(runtime, OllamaRuntime)


class TestOllamaRuntime:
    def test_model_name(self):
        with patch("services.ai.model_runtime.settings") as mock_settings:
            mock_settings.ollama_url = "http://localhost:11434"
            mock_settings.ollama_auth = ""
            mock_settings.ollama_chat_timeout = 300
            runtime = OllamaRuntime()
            assert runtime.model_name() == "qwen3.5:4b"

    def test_custom_host(self):
        runtime = OllamaRuntime(host="http://custom:11434")
        assert runtime._host == "http://custom:11434"

    def test_custom_auth(self):
        runtime = OllamaRuntime(auth="user:pass")
        assert runtime._auth == "user:pass"


class TestOpenAIRuntime:
    def test_model_name(self):
        with patch("services.ai.model_runtime.settings") as mock_settings:
            mock_settings.deepseek_api_key = "sk-test"
            mock_settings.deepseek_base_url = "https://api.deepseek.com/v1"
            mock_settings.deepseek_default_model = "deepseek-chat"
            mock_settings.deepseek_chat_timeout = 300
            runtime = OpenAIRuntime()
            assert runtime.model_name() == "deepseek-chat"

    def test_custom_model(self):
        with patch("services.ai.model_runtime.settings") as mock_settings:
            mock_settings.deepseek_api_key = "sk-test"
            mock_settings.deepseek_base_url = "https://api.deepseek.com/v1"
            mock_settings.deepseek_default_model = "deepseek-chat"
            mock_settings.deepseek_chat_timeout = 300
            runtime = OpenAIRuntime(model="gpt-4o")
            assert runtime.model_name() == "gpt-4o"

    def test_custom_api_key(self):
        with patch("services.ai.model_runtime.settings") as mock_settings:
            mock_settings.deepseek_api_key = ""
            mock_settings.deepseek_base_url = "https://api.deepseek.com/v1"
            mock_settings.deepseek_default_model = "deepseek-chat"
            mock_settings.deepseek_chat_timeout = 300
            runtime = OpenAIRuntime(api_key="custom-key")
            assert runtime._api_key == "custom-key"


class TestRAGRuntime:
    def test_model_name(self):
        with patch("services.ai.model_runtime.settings") as mock_settings:
            mock_settings.rag_llm_model = "qwen3.5"
            runtime = RAGRuntime()
            assert runtime.model_name() == "qwen3.5"

    def test_has_fallback_to_ollama(self):
        runtime = RAGRuntime()
        assert isinstance(runtime._fallback, OllamaRuntime)


class TestModelRuntimeABC:
    def test_cannot_instantiate_abc(self):
        with pytest.raises(TypeError):
            ModelRuntime()  # type: ignore[abstract]

    def test_default_model_name(self):
        # Create a concrete subclass to test the default implementation
        class TestRuntime(ModelRuntime):
            async def stream_chat(self, messages, model=None, system=None, images=None):
                yield {"data": {"message": "test"}}

            async def complete(self, messages, model=None, system=None, images=None, max_retries=2):
                return {"success": True, "message": "test", "model": "test"}

        runtime = TestRuntime()
        assert runtime.model_name() == "qwen3.5:4b"