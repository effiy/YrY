"""Tests for shared/sse_utils.py."""
import json
import pytest
from shared.sse_utils import format_sse, stream_async, stream_sync


class TestFormatSse:
    def test_string_input_wraps_in_message(self):
        result = format_sse("hello world")
        decoded = result.decode("utf-8")
        assert decoded.startswith("data: ")
        payload = json.loads(decoded[6:].strip())
        assert payload["data"]["message"] == "hello world"

    def test_dict_input_passthrough(self):
        result = format_sse({"custom": "value"})
        decoded = result.decode("utf-8")
        assert decoded.startswith("data: ")
        payload = json.loads(decoded[6:].strip())
        assert payload["custom"] == "value"

    def test_bytes_input_decoded(self):
        result = format_sse(b"bytes message")
        decoded = result.decode("utf-8")
        payload = json.loads(decoded[6:].strip())
        assert payload["data"]["message"] == "bytes message"

    def test_bytearray_input_decoded(self):
        result = format_sse(bytearray(b"bytearray message"))
        decoded = result.decode("utf-8")
        payload = json.loads(decoded[6:].strip())
        assert payload["data"]["message"] == "bytearray message"

    def test_ends_with_double_newline(self):
        result = format_sse("test")
        assert result.endswith(b"\n\n")

    def test_unicode_preserved(self):
        result = format_sse("你好世界")
        decoded = result.decode("utf-8")
        payload = json.loads(decoded[6:].strip())
        assert payload["data"]["message"] == "你好世界"

    def test_empty_string(self):
        result = format_sse("")
        decoded = result.decode("utf-8")
        payload = json.loads(decoded[6:].strip())
        assert payload["data"]["message"] == ""

    def test_invalid_bytes_fallback(self):
        # bytes that cannot be decoded as UTF-8
        invalid = bytes([0xff, 0xfe, 0x00])
        result = format_sse(invalid)
        decoded = result.decode("utf-8")
        payload = json.loads(decoded[6:].strip())
        assert "message" in payload["data"]


class TestStreamAsync:
    @pytest.mark.asyncio
    async def test_yields_items_and_done(self):
        async def gen():
            yield "item1"
            yield "item2"

        frames = []
        async for frame in stream_async(gen()):
            frames.append(frame)

        assert len(frames) == 3  # 2 items + 1 done
        assert frames[-1].decode("utf-8").startswith("data: ")

    @pytest.mark.asyncio
    async def test_empty_generator_yields_only_done(self):
        async def gen():
            return
            yield  # pragma: no cover

        frames = []
        async for frame in stream_async(gen()):
            frames.append(frame)

        assert len(frames) == 1
        decoded = frames[0].decode("utf-8")
        payload = json.loads(decoded[6:].strip())
        assert payload["done"] is True

    @pytest.mark.asyncio
    async def test_done_frame_even_on_exception(self):
        async def gen():
            yield "ok"
            raise RuntimeError("boom")

        frames = []
        async for frame in stream_async(gen()):
            frames.append(frame)

        # Exception is caught internally, error frame appended instead of propagating
        assert len(frames) >= 1
        last = json.loads(frames[-1].decode("utf-8")[6:].strip())
        assert last["done"] is True
        assert last.get("error") == "boom"


class TestStreamSync:
    def test_yields_items_and_done(self):
        def gen():
            yield "item1"
            yield "item2"

        frames = list(stream_sync(gen()))
        assert len(frames) == 3
        assert frames[-1].decode("utf-8").startswith("data: ")

    def test_empty_generator_yields_only_done(self):
        def gen():
            return
            yield  # pragma: no cover

        frames = list(stream_sync(gen()))
        assert len(frames) == 1
        decoded = frames[0].decode("utf-8")
        payload = json.loads(decoded[6:].strip())
        assert payload["done"] is True

    def test_done_frame_even_on_exception(self):
        def gen():
            yield "ok"
            raise RuntimeError("boom")

        frames = []
        for frame in stream_sync(gen()):
            frames.append(frame)

        # Exception is caught internally, error frame appended instead of propagating
        assert len(frames) >= 1
        last = json.loads(frames[-1].decode("utf-8")[6:].strip())
        assert last["done"] is True
        assert last.get("error") == "boom"

    def test_mixed_types(self):
        def gen():
            yield "text"
            yield {"structured": True}

        frames = list(stream_sync(gen()))
        assert len(frames) == 3  # 2 items + 1 done
        decoded0 = json.loads(frames[0].decode("utf-8")[6:].strip())
        assert decoded0["data"]["message"] == "text"
        decoded1 = json.loads(frames[1].decode("utf-8")[6:].strip())
        assert decoded1["structured"] is True