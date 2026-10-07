"""RAG query + chat engines — public API re-exports.

All functions are imported from their canonical homes in retrieval.py,
chat_stream.py, and decompose.py. External callers should continue to
import from domain.rag.engine.
"""

from domain.rag.chat_stream import rag_chat_stream, rag_file_chat_stream  # noqa: F401
from domain.rag.decompose import rag_decompose  # noqa: F401
from domain.rag.response_synthesizer import close_http_client  # noqa: F401
from domain.rag.retrieval import rag_file_query, rag_query  # noqa: F401
