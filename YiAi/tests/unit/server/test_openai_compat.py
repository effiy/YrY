"""Tests for server/routes/openai_compat.py — OpenAI-compatible API."""
import pytest


class TestParseOpenAIMessages:
    def test_simple_messages(self):
        from server.routes.openai_compat import _parse_openai_messages
        body = {"messages": [{"role": "user", "content": "hello"}]}
        result = _parse_openai_messages(body)
        assert result == [{"role": "user", "content": "hello"}]

    def test_multimodal_content(self):
        from server.routes.openai_compat import _parse_openai_messages
        body = {"messages": [{"role": "user", "content": [
            {"type": "text", "text": "describe this image"},
            {"type": "image_url", "image_url": {"url": "http://example.com/img.png"}},
        ]}]}
        result = _parse_openai_messages(body)
        assert result[0]["content"] == "describe this image"

    def test_empty_messages(self):
        from server.routes.openai_compat import _parse_openai_messages
        result = _parse_openai_messages({"messages": []})
        assert result == []

    def test_missing_messages_key(self):
        from server.routes.openai_compat import _parse_openai_messages
        result = _parse_openai_messages({})
        assert result == []


class TestOpenAIToolConversion:
    def test_convert_function_tool(self):
        from server.routes.openai_compat import _openai_tool_to_ollama
        tools = [{"type": "function", "function": {"name": "search", "description": "web search", "parameters": {}}}]
        result = _openai_tool_to_ollama(tools)
        assert result[0]["type"] == "function"
        assert result[0]["function"]["name"] == "search"

    def test_none_tools(self):
        from server.routes.openai_compat import _openai_tool_to_ollama
        assert _openai_tool_to_ollama(None) is None
        assert _openai_tool_to_ollama([]) is None

    def test_non_function_tool_skipped(self):
        from server.routes.openai_compat import _openai_tool_to_ollama
        tools = [{"type": "code_interpreter"}]
        result = _openai_tool_to_ollama(tools)
        assert result is None


class TestBuildSSEChunk:
    def test_delta_chunk(self):
        from server.routes.openai_compat import _build_sse_chunk
        chunk = _build_sse_chunk(delta={"content": "Hello"}, model="test", chunk_id="id1", created=123)
        assert b"data: " in chunk
        assert b"Hello" in chunk
        assert b"chat.completion.chunk" in chunk

    def test_finish_chunk(self):
        from server.routes.openai_compat import _build_sse_chunk
        chunk = _build_sse_chunk(finish_reason="stop", model="test", chunk_id="id1", created=123)
        assert b'"finish_reason":"stop"' in chunk

    def test_usage_chunk(self):
        from server.routes.openai_compat import _build_sse_chunk
        chunk = _build_sse_chunk(
            delta={}, finish_reason="stop",
            usage={"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
            model="test", chunk_id="id1", created=123,
        )
        assert b'"total_tokens":30' in chunk