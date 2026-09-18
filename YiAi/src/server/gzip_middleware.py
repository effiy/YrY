"""Fast GZip middleware — pure ASGI with zlib level 1.

Starlette's ``GZipMiddleware`` uses Python's ``gzip`` module at level 9
(maximum compression) which is 3-4× slower than level 1 but only ~10% smaller
for typical JSON API responses. This middleware uses ``zlib.compressobj`` at
level 1 with gzip format (wbits=MAX_WBITS+16) — full gzip compatibility, much
faster.

Also buffers small responses in memory to avoid streaming overhead
for the common case of responses under 64KB.
"""

import struct
import zlib


class FastGZipMiddleware:
    """Pure ASGI, zlib level-1 gzip for responses > *minimum_size* bytes."""

    def __init__(self, app, minimum_size: int = 512, compression_level: int = 1):
        self.app = app
        self.minimum_size = minimum_size
        self.level = compression_level

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        # Check if client accepts gzip
        accept_encoding = ""
        for name, value in scope.get("headers", []):
            if name == b"accept-encoding":
                accept_encoding = value.decode().lower()
                break
        if "gzip" not in accept_encoding:
            return await self.app(scope, receive, send)

        responder = _GzipResponder(self.app, scope, receive, send, self.minimum_size, self.level)
        await responder.run()


class _GzipResponder:
    """Intercepts ``send``, buffers body, compresses if over threshold."""

    def __init__(self, app, scope, receive, send, minimum_size: int, level: int):
        self.app = app
        self.scope = scope
        self.receive = receive
        self.outer_send = send
        self.minimum_size = minimum_size
        self.level = level
        self._start_message: dict | None = None
        self._body_chunks: list[bytes] = []
        self._body_len = 0
        self._compressing = False
        self._send = self._capture_send

    async def run(self):
        await self.app(self.scope, self.receive, self._send)
        # Final flush — if we captured chunks and haven't sent yet
        if self._body_chunks and not self._compressing:
            await self._flush_raw()

    async def _capture_send(self, message):
        if message["type"] == "http.response.start":
            self._start_message = message
        elif message["type"] == "http.response.body":
            self._body_chunks.append(message.get("body", b""))
            self._body_len += len(message.get("body", b""))
            if not message.get("more_body", False):
                await self._maybe_compress_and_send()

    async def _maybe_compress_and_send(self):
        if self._body_len < self.minimum_size or not self._start_message:
            return await self._flush_raw()

        self._compressing = True
        full_body = b"".join(self._body_chunks)

        # zlib with wbits=MAX_WBITS+16 produces gzip format
        compressor = zlib.compressobj(level=self.level, wbits=zlib.MAX_WBITS + 16)
        compressed = compressor.compress(full_body) + compressor.flush()

        headers = [
            (k, v) for k, v in self._start_message.get("headers", [])
            if k.lower() != b"content-length"
        ]
        headers.append((b"content-encoding", b"gzip"))
        headers.append((b"content-length", str(len(compressed)).encode()))
        # Vary: Accept-Encoding so caches don't serve gzip to non-gzip clients
        vary = b"Accept-Encoding"
        if not any(h[0].lower() == b"vary" for h in headers):
            headers.append((b"vary", vary))
        else:
            for i, (k, v) in enumerate(headers):
                if k.lower() == b"vary":
                    if b"accept-encoding" not in v.lower():
                        headers[i] = (k, v + b", Accept-Encoding")
                    break

        await self.outer_send({
            "type": "http.response.start",
            "status": self._start_message["status"],
            "headers": headers,
        })
        await self.outer_send({
            "type": "http.response.body",
            "body": compressed,
            "more_body": False,
        })

    async def _flush_raw(self):
        """Send without compression (under threshold or early send)."""
        if self._compressing:
            return
        self._compressing = True
        if self._start_message:
            await self.outer_send(self._start_message)
        body = b"".join(self._body_chunks)
        await self.outer_send({
            "type": "http.response.body",
            "body": body,
            "more_body": False,
        })
