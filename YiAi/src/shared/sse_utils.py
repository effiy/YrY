"""Shared SSE (Server-Sent Events) formatting helpers.

Used by route modules that stream responses via text/event-stream.
"""
import json
from typing import Any, AsyncIterator, Iterator


def format_sse(data: Any) -> bytes:
    """Format a data item as an SSE ``data:`` frame."""
    if isinstance(data, (bytes, bytearray)):
        try:
            data = data.decode("utf-8")
        except UnicodeDecodeError:
            data = data.decode("utf-8", errors="replace")
    if isinstance(data, str):
        payload: Any = {"data": {"message": data}}
    else:
        payload = data
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n".encode()


async def stream_async(gen: AsyncIterator[Any]):
    """Yield SSE frames from an async generator, appending a ``done`` frame.

    If the generator raises, an error frame is sent so the client can
    distinguish abnormal termination from a normal end-of-stream.
    """
    try:
        async for item in gen:
            yield format_sse(item)
    except Exception as e:
        yield format_sse({"done": True, "error": str(e)})
    else:
        yield format_sse({"done": True})


def stream_sync(gen: Iterator[Any]):
    """Yield SSE frames from a sync generator, appending a ``done`` frame.

    If the generator raises, an error frame is sent so the client can
    distinguish abnormal termination from a normal end-of-stream.
    """
    try:
        for item in gen:
            yield format_sse(item)
    except Exception as e:
        yield format_sse({"done": True, "error": str(e)})
    else:
        yield format_sse({"done": True})
