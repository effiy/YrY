"""RAG-powered context translation service.

Enhances translation quality by leveraging YiKnowledge's domain-specific
terminology. Uses the RAG engine to find relevant context before translating.
"""

import logging

from services.translation.providers import TRANSLATE_PROVIDERS, _init_translate_providers

logger = logging.getLogger(__name__)


async def translate_with_context(
    text: str,
    from_lang: str = "auto",
    to_lang: str = "zh",
    provider: str = "openai",
    provider_config: dict | None = None,
    domain: str | None = None,
    context: str | None = None,
) -> str:
    """Translate with domain-specific context.

    If domain is provided, queries RAG for relevant terminology and injects
    it into the translation prompt for more accurate technical translations.
    """
    _init_translate_providers()
    p = TRANSLATE_PROVIDERS.get(provider)
    if p is None:
        from shared.error_codes import ErrorCode
        from shared.exceptions import BusinessException
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Unknown provider: {provider}")

    config = provider_config or {}
    enhanced_config = dict(config)

    # If domain specified, fetch relevant context from RAG
    rag_context = ""
    if domain:
        try:
            rag_context = await _fetch_rag_context(text, domain)
        except Exception as e:
            logger.warning(f"RAG context lookup failed: {e!s}")

    # Build enhanced prompt
    if rag_context or context:
        system_prompt_parts = [
            "You are a professional translation engine. Translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.",
        ]
        if rag_context:
            system_prompt_parts.append(f"\nDomain-specific terminology and context:\n{rag_context}")
        if context:
            system_prompt_parts.append(f"\nAdditional context:\n{context}")

        enhanced_config["prompt_list"] = [
            {"role": "system", "content": "\n".join(system_prompt_parts)},
            {"role": "user", "content": f"Translate into {to_lang}:\n\"\"\"\n{text}\n\"\"\""},
        ]

    result = await p.translate(text, from_lang, to_lang, **enhanced_config)
    return result.text


async def _fetch_rag_context(text: str, domain: str, max_sources: int = 3) -> str:
    """Fetch RAG context for a given text and domain."""
    from domain.rag.engine import rag_query

    query = f"Terminology and definitions related to: {text}"
    scope = f"projects/{domain}" if domain != "all" else None

    results = rag_query(query, scope=scope, top_k=max_sources)
    if not results:
        return ""

    context_parts = []
    for r in results[:max_sources]:
        snippet = r.get("text", "")[:300] if isinstance(r, dict) else str(r)[:300]
        path = r.get("file_path", "") if isinstance(r, dict) else ""
        if snippet:
            context_parts.append(f"- {snippet}" + (f" (from {path})" if path else ""))

    return "\n".join(context_parts) if context_parts else ""


async def translate_with_context_detailed(
    text: str,
    from_lang: str = "auto",
    to_lang: str = "zh",
    provider: str = "openai",
    provider_config: dict | None = None,
    domain: str | None = None,
    context: str | None = None,
) -> dict:
    """Translate with domain-specific context, returning both text and RAG sources.

    Returns dict with:
      - text: translated text
      - sources: list of {file_path, score, snippet} from RAG
    """
    _init_translate_providers()
    p = TRANSLATE_PROVIDERS.get(provider)
    if p is None:
        from shared.error_codes import ErrorCode
        from shared.exceptions import BusinessException
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Unknown provider: {provider}")

    config = provider_config or {}
    enhanced_config = dict(config)

    rag_context = ""
    rag_sources = []
    if domain:
        try:
            rag_sources_data = await _fetch_rag_sources(text, domain)
            rag_context = "\n".join(
                f"- {r['snippet']}" + (f" (from {r['file_path']})" if r.get('file_path') else "")
                for r in rag_sources_data
            )
            rag_sources = [
                {"file_path": r.get("file_path", ""), "score": r.get("score", 0), "snippet": r.get("snippet", "")[:200]}
                for r in rag_sources_data
            ]
        except Exception as e:
            logger.warning(f"RAG context lookup failed: {e!s}")

    if rag_context or context:
        system_prompt_parts = [
            "You are a professional translation engine. Translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.",
        ]
        if rag_context:
            system_prompt_parts.append(f"\nDomain-specific terminology and context:\n{rag_context}")
        if context:
            system_prompt_parts.append(f"\nAdditional context:\n{context}")
        enhanced_config["prompt_list"] = [
            {"role": "system", "content": "\n".join(system_prompt_parts)},
            {"role": "user", "content": f"Translate into {to_lang}:\n\"\"\"\n{text}\n\"\"\""},
        ]

    result = await p.translate(text, from_lang, to_lang, **enhanced_config)
    return {"text": result.text, "sources": rag_sources}


async def _fetch_rag_sources(text: str, domain: str, max_sources: int = 3) -> list[dict]:
    """Fetch RAG context sources for a given text and domain."""
    from domain.rag.engine import rag_query

    query = f"Terminology and definitions related to: {text}"
    scope = f"projects/{domain}" if domain != "all" else None

    results = rag_query(query, scope=scope, top_k=max_sources)
    if not results:
        return []
    return [
        {"file_path": r.get("file_path", ""), "score": r.get("score", 0), "snippet": r.get("text", "")[:300]}
        for r in (results if isinstance(results, list) else [results])
    ]
