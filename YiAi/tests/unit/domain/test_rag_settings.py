"""Tests for domain/rag/settings.py — llama_index global config."""
import pytest
from unittest.mock import patch, MagicMock
from domain.rag.settings import ensure_settings_configured


class TestEnsureSettingsConfigured:
    def test_first_call_configures_settings(self):
        """First call should configure llama_index Settings."""
        import domain.rag.settings as rag_settings
        rag_settings._configured = False

        with patch("domain.rag.settings.settings") as mock_settings:
            mock_settings.rag_embed_model = "nomic-embed-text"
            mock_settings.rag_llm_model = "qwen3.5"
            mock_settings.ollama_url = "http://localhost:11434"
            mock_settings.rag_llm_request_timeout = 120
            mock_settings.rag_chunk_size = 1024
            mock_settings.rag_chunk_overlap = 200

            with patch("llama_index.embeddings.ollama.OllamaEmbedding") as mock_embed:
                with patch("llama_index.llms.ollama.Ollama") as mock_llm:
                    with patch("llama_index.core.Settings") as mock_llama_settings:
                        ensure_settings_configured()
                        assert mock_embed.called
                        assert mock_llm.called
                        assert mock_llama_settings.chunk_size == 1024
                        assert mock_llama_settings.chunk_overlap == 200

        rag_settings._configured = False

    def test_configured_flag_prevents_reconfig(self):
        """Once configured, subsequent calls are no-ops."""
        import domain.rag.settings as rag_settings
        rag_settings._configured = True

        with patch("domain.rag.settings.settings") as mock_settings:
            with patch("llama_index.embeddings.ollama.OllamaEmbedding") as mock_embed:
                with patch("llama_index.llms.ollama.Ollama") as mock_llm:
                    ensure_settings_configured()
                    assert not mock_embed.called
                    assert not mock_llm.called

        rag_settings._configured = False

    def test_deepseek_embed_provider(self):
        """DeepSeek embed provider should use OpenAIEmbedding."""
        import domain.rag.settings as rag_settings
        rag_settings._configured = False

        with patch("domain.rag.settings.settings") as mock_settings:
            mock_settings.rag_embed_model = "deepseek-embed"
            mock_settings.rag_llm_model = "qwen3.5"
            mock_settings.ollama_url = "http://localhost:11434"
            mock_settings.deepseek_api_key = "sk-test"
            mock_settings.deepseek_base_url = "https://api.deepseek.com"
            mock_settings.rag_llm_request_timeout = 120
            mock_settings.rag_chunk_size = 1024
            mock_settings.rag_chunk_overlap = 200
            mock_settings.llm_embed_provider = "deepseek"
            mock_settings.ai_provider = "ollama"
            mock_settings.llm_chat_provider = ""

            with patch("llama_index.embeddings.openai.OpenAIEmbedding") as mock_embed:
                with patch("llama_index.llms.ollama.Ollama") as mock_llm:
                    with patch("llama_index.core.Settings") as mock_llama_settings:
                        ensure_settings_configured()
                        assert mock_embed.called
                        assert mock_llm.called

        rag_settings._configured = False

    def test_deepseek_chat_provider(self):
        """DeepSeek chat provider should use OpenAI LLM."""
        import domain.rag.settings as rag_settings
        rag_settings._configured = False

        with patch("domain.rag.settings.settings") as mock_settings:
            mock_settings.rag_embed_model = "nomic-embed-text"
            mock_settings.rag_llm_model = "qwen3.5"
            mock_settings.ollama_url = "http://localhost:11434"
            mock_settings.deepseek_api_key = "sk-test"
            mock_settings.deepseek_base_url = "https://api.deepseek.com"
            mock_settings.deepseek_default_model = "deepseek-chat"
            mock_settings.rag_llm_request_timeout = 120
            mock_settings.rag_chunk_size = 1024
            mock_settings.rag_chunk_overlap = 200
            mock_settings.llm_embed_provider = ""
            mock_settings.ai_provider = "deepseek"
            mock_settings.llm_chat_provider = ""

            with patch("llama_index.embeddings.ollama.OllamaEmbedding") as mock_embed:
                with patch("llama_index.llms.openai.OpenAI") as mock_llm:
                    with patch("llama_index.core.Settings") as mock_llama_settings:
                        ensure_settings_configured()
                        assert mock_embed.called
                        assert mock_llm.called

        rag_settings._configured = False