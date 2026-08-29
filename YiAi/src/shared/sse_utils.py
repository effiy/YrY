"""Shared SSE (Server-Sent Events) formatting helpers.

Used by route modules that stream responses via text/event-stream.
"""
import json
from typing import Any, AsyncIterator


def format_sse(data: Any) -> bytes:
    """Format a data item as an SSE ``data:`` frame."""
    if isinstance(data, (bytes, bytearray)):
        try:
            data = data.decode("utf-8")
        except Exception:
            data = str(data)
    if isinstance(data, str):
        payload: Any = {"data": {"message": data}}
    else:
        payload = data
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n".encode("utf-8")


async def stream_async(gen: AsyncIterator[Any]):
    """Yield SSE frames from an async generator, appending a ``done`` frame."""
    try:
        async for item in gen:
            yield format_sse(item)
    finally:
        yield format_sse({"done": True})