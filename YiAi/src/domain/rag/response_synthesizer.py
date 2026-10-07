"""Response synthesis and LLM interaction — public API re-exports.

All functions are imported from their canonical homes in prompts.py,
llm_stream.py, and context_builder.py. External callers should continue
to import from domain.rag.response_synthesizer.
"""

from domain.rag.context_builder import _build_context_messages  # noqa: F401
from domain.rag.llm_stream import (  # noqa: F401
    _check_ollama,
    _condense_question_llm,
    _get_http_client,
    _safe_put,
    _stream_ollama_chat,
    _stream_queue,
    close_http_client,
)
from domain.rag.prompts import (  # noqa: F401
    RAG_SYSTEM_PROMPT,
    RAG_SYSTEM_PROMPT_COMPACT,
    RAG_SYSTEM_PROMPT_DATE_AWARE,
    RAG_SYSTEM_PROMPT_PLANNING,
)
