"""RAG chat streaming: conversation-level and file-level streaming endpoints."""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

from domain.rag.context_builder import _is_simple_question
from domain.rag.query_builder import _enhance_query_for_retrieval, _get_date_context, _is_standalone_question
from domain.rag.response_synthesizer import (
    _build_context_messages,
    _condense_question_llm,
    _safe_put,
    _stream_ollama_chat,
    _stream_queue,
)
from domain.rag.retrieval import (
    _RETRIEVAL_CACHE_MAX,
    _RETRIEVAL_CACHE_TTL,
    _boost_recent_for_time_sensitive,
    _dedup_identical_chunks,
    _dedup_sources_by_file,
    _filter_by_keyword_overlap,
    _hyde_expand,
    _normalize_query,
    _normalize_scores,
    _retrieval_cache,
)
from domain.rag.retrievers import (
    _build_postprocessors,
    _build_retriever,
    _source_dict,
)
from domain.rag.settings import ensure_settings_configured
from shared.config import settings

logger = logging.getLogger(__name__)


async def rag_chat_stream(
    messages: list[dict[str, Any]],
    model: str | None = None,
    scope: str | None = None,
    top_k: int | None = None,
    hybrid: bool | None = None,
    rerank: bool | None = None,
    citations: bool | None = None,
    num_queries: int | None = None,
    chat_mode: str | None = None,
    category: str | None = None,
    tags: list[str] | None = None,
    hyde_enabled: bool = False,
    file_paths: list[str] | None = None,
    context_notes: str = "",
    web_search: bool = False,
    fast: bool = False,
):
    t_init = time.perf_counter()
    mode = (chat_mode or "condense_plus_context").strip().lower()
    try:
        ensure_settings_configured()
        llm_model = model or settings.rag_llm_model
        k = top_k or settings.rag_top_k
        h = settings.rag_hybrid_retrieval_enabled if hybrid is None else hybrid
        r = settings.rag_rerank_enabled if rerank is None else rerank
        c = settings.rag_inline_citations_enabled if citations is None else citations
        nq = num_queries if num_queries is not None and num_queries > 0 else settings.rag_num_queries
        index = None
        if mode != "simple" and not fast:
            from domain.rag.indexer import ensure_kb_index, is_index_building
            index = ensure_kb_index()
            if index is None:
                if is_index_building():
                    yield {"status": "building", "message": "RAG index is being built. This may take a few minutes. Please retry shortly."}
                else:
                    yield {"error": "RAG index not built yet. Please trigger a build via /rag-build or enable auto_rebuild in config.yaml."}
                return
    except Exception as e:
        yield {"error": f"RAG init failed: {e}"}
        return
    t_init_done = time.perf_counter()

    history = messages[:-1]
    last_msg = messages[-1] if messages else {}
    question = last_msg.get("content", "")

    if not question.strip():
        yield {"error": "Empty question"}
        return

    timing: dict[str, float] = {}

    # Multi-turn question resolution
    if history:
        if mode == "condense":
            # Skip LLM condensation for standalone questions — saves ~0.5-1s
            if _is_standalone_question(question):
                logger.info(f"Standalone question, skipping condensation: '{question[:60]}...'")
            else:
                t_cond = time.perf_counter()
                try:
                    condensed = await _condense_question_llm(
                        question, history,
                        model=llm_model, base_url=settings.ollama_url,
                    )
                    if condensed and condensed.strip():
                        logger.info(f"Condensed question: '{question[:50]}...' → '{condensed[:80]}...'")
                        question = condensed.strip()
                except Exception as e:
                    logger.warning(f"Condense failed, using original question: {e}")
                timing["condense_ms"] = round((time.perf_counter() - t_cond) * 1000)
        elif mode in ("condense_plus_context", "condense_question") and len(question) < 30:
            for m in reversed(history):
                if m.get("role") == "user":
                    question = f"{m.get('content', '')} {question}"
                    break

    if mode == "context" and history:
        all_user = [m.get("content", "") for m in messages if m.get("role") == "user"]
        question = " ".join(all_user)

    answer_buf: list[str] = []
    sources: list[dict[str, Any]] = []
    web_sources: list[dict[str, Any]] = []
    source_nodes: list = []
    timing["init_ms"] = round((t_init_done - t_init) * 1000)

    try:
        # Fast path: skip retrieval, go directly to LLM with compact prompt
        if fast or (mode == "fast"):
            yield {"data": {"phase": "thinking"}}
            llm_messages = [{"role": "system", "content": (
                "You are a knowledgeable assistant. Current date: {date}. "
                "Answer concisely and accurately. Respond in the question's language."
            ).format(date=_get_date_context()["current_date"])}]
            llm_messages += [dict(m) for m in messages]
            t_llm = time.perf_counter()
            async for chunk in _stream_ollama_chat(
                model=llm_model, messages=llm_messages,
                base_url=settings.ollama_url, timeout=float(settings.rag_chat_timeout),
            ):
                if isinstance(chunk, dict):
                    msg_data = chunk.get("data", {})
                    token = msg_data.get("message", "")
                    if token:
                        answer_buf.append(token)
                        yield {"data": {"message": token}}
                else:
                    answer_buf.append(str(chunk))
                    yield {"data": {"message": str(chunk)}}
            timing["llm_ms"] = round((time.perf_counter() - t_llm) * 1000)
            timing["total_ms"] = round((time.perf_counter() - t_init) * 1000)
            timing["tokens"] = len("".join(answer_buf))
            yield {"data": {"timing": timing, "mode": "fast"}}
            if not answer_buf:
                yield {"data": {"message": "_(模型未生成回复，请重试)_"}}
            return

        # Query enhancement
        retrieval_query = _enhance_query_for_retrieval(question)
        if retrieval_query != question:
            logger.info("RAG chat query enhanced for time: '%s' → '%s'", question[:80], retrieval_query[:120])
        if hyde_enabled and mode != "simple":
            retrieval_query = await _hyde_expand(retrieval_query, is_chat=True)

        # Retrieve — optionally run web search in parallel
        if mode != "simple":
            yield {"data": {"phase": "retrieving"}}
            t_ret = time.perf_counter()

            web_task = None
            web_sources = []
            if web_search:
                from domain.search.router import classify_query
                qcat, _conf = classify_query(question)
                if qcat in ("web", "hybrid"):
                    from domain.search import search_async
                    web_task = asyncio.create_task(search_async(retrieval_query, max_results=4))

            retriever = None
            nodes = None

            # Check retrieval cache (same cache as rag_query for cross-endpoint reuse)
            cache_key = (
                f"{_normalize_query(retrieval_query)}|{scope or ''}|{k}|{h}|{nq}"
                f"|{category or ''}|{','.join(sorted(tags or []))}"
            )
            now = time.time()
            cache_hit = False
            if cache_key in _retrieval_cache:
                ts, cached_nodes = _retrieval_cache[cache_key]
                if now - ts < _RETRIEVAL_CACHE_TTL:
                    logger.info(f"RAG chat retrieval cache hit: {retrieval_query[:60]} ({len(cached_nodes)} nodes)")
                    nodes = cached_nodes
                    cache_hit = True

            if nodes is None:
                retriever = _build_retriever(index, k, scope, h, nq, category, tags, file_paths)
                try:
                    nodes = await asyncio.to_thread(retriever.retrieve, retrieval_query)
                except Exception as _exc:
                    msg = str(_exc)
                    if "Nested MetadataFilters" in msg:
                        logger.warning(
                            "Nested MetadataFilters error during retrieval — "
                            "retrying without scope/category/tag filters"
                        )
                        try:
                            retriever = _build_retriever(index, k, None, h, nq, None, None, None)
                            nodes = await asyncio.to_thread(retriever.retrieve, retrieval_query)
                        except Exception as _retry_exc:
                            logger.warning(
                                f"Retry without filters also failed ({_retry_exc}) — "
                                "falling back to bare retriever"
                            )
                            retriever = index.as_retriever(similarity_top_k=k)
                            nodes = await asyncio.to_thread(retriever.retrieve, retrieval_query)
                    else:
                        raise
                # Normalize and dedup before caching (consistent with rag_query)
                nodes = _normalize_scores(nodes)
                nodes = _dedup_identical_chunks(nodes)
                nodes = _filter_by_keyword_overlap(nodes, question)
                # Cache the result
                if len(_retrieval_cache) >= _RETRIEVAL_CACHE_MAX:
                    oldest = next(iter(_retrieval_cache))
                    del _retrieval_cache[oldest]
                _retrieval_cache[cache_key] = (now, nodes)

            # Collect web search results if we started one
            if web_task:
                try:
                    web_sources = await asyncio.wait_for(web_task, timeout=8.0)
                except asyncio.TimeoutError:
                    logger.warning("Web search timed out during RAG chat")
                except Exception as e:
                    logger.warning(f"Web search failed during RAG chat: {e}")

            # Boost recent documents for time-sensitive queries (post-cache)
            nodes = _boost_recent_for_time_sensitive(nodes, question)

            postprocessors = _build_postprocessors(r, k, sentence_window=settings.rag_sentence_window_enabled)
            for pp in postprocessors:
                nodes = await asyncio.to_thread(pp.postprocess_nodes, nodes, query_str=question)
            if not cache_hit:
                nodes = _normalize_scores(nodes)
                nodes = _dedup_identical_chunks(nodes)
            timing["retrieve_ms"] = round((time.perf_counter() - t_ret) * 1000)
            timing["web_ms"] = round((time.perf_counter() - t_ret) * 1000) if web_sources else 0
            source_nodes = nodes
            sources = [_source_dict(n) for n in source_nodes]
            sources = _dedup_sources_by_file(sources)

            # Low-confidence guard: refuse to answer when retrieval quality is poor.
            # Prevents hallucination by not feeding weak sources to the LLM.
            top_score = sources[0].get("score", 0) if sources else 0
            if top_score < 0.3:
                logger.info(
                    f"RAG low-confidence guard: top_score={top_score:.3f} — "
                    f"returning 'not enough information'"
                )
                yield {"data": {"phase": "retrieving"}}
                yield {"data": {
                    "sources": sources,
                    "timing": {
                        "retrieve_ms": timing.get("retrieve_ms", 0),
                        "total_ms": round((time.perf_counter() - t_init) * 1000),
                        "sources": len(sources),
                    },
                    "low_confidence": True,
                }}
                yield {"data": {
                    "message": (
                        "**Insufficient information in knowledge base.**\n\n"
                        "The retrieved sources have low relevance to your question "
                        f"(top match: {top_score:.0%}). "
                        "The sources below are the closest matches available — "
                        "you may want to rephrase your question or add relevant documents "
                        "to the knowledge base."
                    )
                }}
                return

        # Build messages
        if mode == "simple":
            llm_messages = [dict(m) for m in messages]
        else:
            # Simple questions get fewer chunks + compact prompt (faster)
            is_simple = _is_simple_question(question)
            eff_chunks = max(3, settings.rag_context_chunks // 2) if is_simple else settings.rag_context_chunks
            llm_messages = _build_context_messages(
                question, source_nodes,
                history if mode in ("condense_plus_context", "context") else None,
                c,
                context_chunks=eff_chunks,
                snippet_chars=settings.rag_snippet_chars,
                history_msgs=settings.rag_history_msgs,
                history_chars=settings.rag_history_chars,
                context_notes=context_notes,
                web_results=web_sources if web_sources else None,
            )
        prompt_chars = sum(len(m.get("content", "")) for m in llm_messages)
        timing["prompt_chars"] = prompt_chars
        if prompt_chars > 8000:
            logger.warning(f"RAG prompt is large ({prompt_chars} chars) — may exceed model context window")

        # Stream from Ollama
        yield {"data": {"phase": "thinking"}}
        t_llm = time.perf_counter()
        logger.info(
            f"RAG chat calling Ollama: model={llm_model} "
            f"url={settings.ollama_url} prompt_chars={prompt_chars} "
            f"web={len(web_sources)}"
        )
        async for chunk in _stream_ollama_chat(
            model=llm_model, messages=llm_messages,
            base_url=settings.ollama_url, timeout=float(settings.rag_chat_timeout),
        ):
            if isinstance(chunk, dict):
                msg_data = chunk.get("data", {})
                token = msg_data.get("message", "")
                if token:
                    answer_buf.append(token)
                    yield {"data": {"message": token}}
                if "usage" in msg_data:
                    yield {"data": {"usage": msg_data["usage"]}}
            else:
                answer_buf.append(str(chunk))
                yield {"data": {"message": str(chunk)}}
        timing["llm_ms"] = round((time.perf_counter() - t_llm) * 1000)

        if not answer_buf:
            yield {"data": {"message": "_(模型未生成回复，请重试)_"}}

        # Emit sources + timing
        timing["total_ms"] = round((time.perf_counter() - t_init) * 1000)
        timing["sources"] = len(sources)
        timing["web_sources"] = len(web_sources)
        timing["tokens"] = len("".join(answer_buf))
        if mode != "simple":
            yield {"data": {"sources": sources, "web_sources": web_sources, "timing": timing}}
        else:
            yield {"data": {"timing": timing}}

        logger.info(
            f"RAG chat done: mode={mode} top_k={k} hybrid={h} rerank={r} hyde={hyde_enabled} "
            f"web={len(web_sources)} sources={len(sources)} tokens={len(''.join(answer_buf))} "
            f"retrieve={timing.get('retrieve_ms',0)}ms llm={timing.get('llm_ms',0)}ms "
            f"total={timing.get('total_ms',0)}ms prompt_chars={timing.get('prompt_chars',0)}"
        )
        try:
            from domain.rag.chat_history import record_chat_turn
            record_chat_turn(
                question=last_msg.get("content", ""),
                answer="".join(answer_buf), sources=sources,
                scope=scope or "", chat_mode=mode, latency_ms=timing["total_ms"],
                hybrid=h, rerank=r, citations=c, num_queries=nq,
                category=category or "", tags=tags,
            )
        except Exception:
            logger.warning("Failed to record chat turn", exc_info=True)

    except Exception as e:
        logger.exception(f"RAG chat failed: {e}")
        yield {"error": f"RAG chat failed: {e}"}


async def rag_file_chat_stream(question: str, abs_path: str):
    """Stream chat grounded in a single file's index — no scope filtering needed."""
    from llama_index.core.chat_engine import CondensePlusContextChatEngine

    from domain.rag.indexer import build_file_index

    try:
        ensure_settings_configured()
        index = build_file_index(abs_path)
        retriever = index.as_retriever(similarity_top_k=settings.rag_top_k)
    except Exception as e:
        yield {"error": f"RAG file chat init failed: {e}"}
        return

    try:
        chat_engine = CondensePlusContextChatEngine.from_defaults(
            retriever=retriever,
            system_prompt="Answer the user's question from the content of the provided file only.",
        )
    except Exception as e:
        yield {"error": f"RAG file chat init failed: {e}"}
        return

    loop = asyncio.get_running_loop()
    queue: asyncio.Queue = asyncio.Queue()

    def _worker():
        try:
            _safe_put(queue, {"data": {"phase": "retrieving"}}, loop)
            response = chat_engine.stream_chat(question)
            for token in response.response_gen:
                if token:
                    _safe_put(queue, {"data": {"message": token}}, loop)
            try:
                sources = [_source_dict(n) for n in (response.source_nodes or [])]
            except Exception:
                sources = []
            _safe_put(queue, {"data": {"sources": sources}}, loop)
        except Exception as e:
            _safe_put(queue, {"error": f"RAG file chat failed: {e}"}, loop)
        finally:
            _safe_put(queue, None, loop)

    worker_task = asyncio.create_task(asyncio.to_thread(_worker))
    timeout = float(settings.rag_chat_timeout)
    async for item in _stream_queue(queue, worker_task, timeout):
        yield item
