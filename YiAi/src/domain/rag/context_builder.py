"""Context message builder — assembles the RAG chat prompt from retrieved nodes."""

from __future__ import annotations

from datetime import datetime, timezone
import logging
import re
from typing import Any

from domain.rag.post_processors import _text_signature
from domain.rag.prompts import (
    RAG_SYSTEM_PROMPT,
    RAG_SYSTEM_PROMPT_COMPACT,
    RAG_SYSTEM_PROMPT_DATE_AWARE,
    RAG_SYSTEM_PROMPT_PLANNING,
)
from domain.rag.query_builder import _get_date_context, _is_planning_request, _is_time_sensitive

logger = logging.getLogger(__name__)


def _relative_time(date_str: str) -> str:
    """Convert an ISO date string to a relative label like '3 days ago'."""
    if not date_str:
        return ""
    try:
        d = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        if d.tzinfo is None:
            d = d.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        delta = now - d
        days = delta.days
        if days < 0:
            return "(future)"
        if days == 0:
            return "(today)"
        if days == 1:
            return "(yesterday)"
        if days < 7:
            return f"({days}d ago)"
        if days < 30:
            return f"({days // 7}w ago)"
        if days < 365:
            return f"({days // 30}mo ago — stale)"
        return "(stale)"
    except (ValueError, TypeError):
        return ""


def _recency_bonus(node_with_score: Any) -> float:
    """Small score bonus for recent documents — acts as a tiebreaker.

    Returns 0.0 to 0.05 based on document age. A chunk from today gets the
    full bonus, a 30-day-old document gets ~0.005, older gets 0. This is
    small enough that a clearly more relevant older document still wins,
    but among equally relevant chunks, the newer one surfaces first.
    """
    node = getattr(node_with_score, "node", None) or node_with_score
    metadata = dict(getattr(node, "metadata", {}) or {})
    date_str = metadata.get("created") or metadata.get("date") or ""
    if not date_str:
        return 0.0
    try:
        d = datetime.fromisoformat(str(date_str).replace("Z", "+00:00"))
        if d.tzinfo is None:
            d = d.replace(tzinfo=timezone.utc)
        age_days = (datetime.now(timezone.utc) - d).days
        if age_days < 0:
            return 0.0
        if age_days == 0:
            return 0.05
        if age_days <= 7:
            return 0.03
        if age_days <= 30:
            return 0.01
        return 0.0
    except (ValueError, TypeError):
        return 0.0


def _authority_level(file_path: str, category: str) -> str:
    """Classify a source's authority based on its file path and category.

    Returns a label the LLM can use to weigh sources:
      [Authoritative] — specs, formal definitions, architecture decisions
      [Empirical]    — lessons learned, gotchas, real-world experience
      [Process]      — workflows, how-to guides, standard procedures
      [Report]       — time-bound analysis, dashboards, metrics
      [Reference]    — general documentation, templates
    """
    fp = (file_path or "").lower()
    cat = (category or "").lower()

    # Spec-like categories — highest authority
    if any(p in fp for p in ("/specs/", "/spec/", "/architecture/", "/governance/")):
        return "[Authoritative]"
    if cat in ("spec", "specification", "architecture", "governance", "standard"):
        return "[Authoritative]"

    # Lesson/experience categories — high practical authority
    if any(p in fp for p in ("/lessons/", "/lesson/", "/gotchas/", "/failures/")):
        return "[Empirical]"
    if cat in ("lesson", "gotcha", "failure", "bug", "incident", "postmortem"):
        return "[Empirical]"

    # Process/workflow — defines how things are done
    if any(p in fp for p in ("/workflows/", "/workflow/", "/process/", "/procedure/")):
        return "[Process]"
    if cat in ("workflow", "process", "procedure", "guide", "how-to"):
        return "[Process]"

    # Reports and analytics — time-bound
    if any(p in fp for p in ("/reports/", "/report/", "/dashboard/", "/analytics/", "/metrics/")):
        return "[Report]"
    if cat in ("report", "dashboard", "analytics", "metrics", "kpi"):
        return "[Report]"

    return "[Reference]"


def _build_context_messages(
    question: str,
    nodes: list,
    history: list[dict[str, Any]] | None,
    citations: bool,
    context_chunks: int = 5,
    snippet_chars: int = 1200,
    history_msgs: int = 6,
    history_chars: int = 500,
    context_notes: str = "",
    web_results: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    # Sort by relevance score (descending) before selection.
    # Add a small recency bonus so newer docs rank higher among equals.
    scored: list[tuple[float, Any]] = []
    for nws in nodes:
        s = getattr(nws, "score", None)
        base = float(s) if s is not None else 0.0
        scored.append((base + _recency_bonus(nws), nws))
    scored.sort(key=lambda x: x[0], reverse=True)

    # Score threshold: drop chunks below 25% of top score.
    # Tighter than the old 10% — low-relevance chunks add noise,
    # confuse the LLM, and waste context window budget.
    if scored and scored[0][0] > 0:
        min_score = scored[0][0] * 0.25
        candidates = [nws for s, nws in scored if s >= min_score]
    else:
        candidates = [nws for _, nws in scored]

    # Two-pass selection with per-file cap:
    # Pass 1 — pick highest-score chunk from each unique file (up to 2 per file)
    # Pass 2 — fill remaining slots with next-best chunks (any file, still capped at 2)
    max_per_file = max(2, context_chunks // 3)
    selected = _pick_chunks(candidates, context_chunks, prefer_unique=True, max_per_file=max_per_file)
    if len(selected) < context_chunks:
        already = {id(n) for n in selected}
        remaining = [n for n in candidates if id(n) not in already]
        remaining.sort(
            key=lambda n: getattr(n, "score", 0) or 0, reverse=True,
        )
        selected += _pick_chunks(
            remaining, context_chunks - len(selected), prefer_unique=False, max_per_file=max_per_file,
        )

    # Cross-chunk content overlap filter: remove chunks whose text is >80%
    # contained within another (higher-scoring) selected chunk. Catches the
    # case where two chunks from different files are near-copies.
    selected = _filter_overlapping_chunks(selected)

    # Build context from selected RAG chunks, grouped by file.
    # Grouping keeps related content together so the LLM sees coherent
    # document sections rather than scattered fragments sorted by score.
    source_idx = 0
    file_groups: dict[str, list[dict[str, Any]]] = {}
    file_order: list[str] = []
    for nws in selected:
        node = getattr(nws, "node", None) or nws
        text = getattr(node, "get_content", lambda: "")() or getattr(node, "text", "") or ""
        metadata = dict(getattr(node, "metadata", {}) or {})
        file_path = metadata.get("file_path", "")
        title = metadata.get("title", "")
        doc_date = metadata.get("created") or metadata.get("date") or ""
        category = metadata.get("category", "")
        score = getattr(nws, "score", None)
        score_pct = f"{score:.0%}" if score is not None and 0 < score <= 1 else ""
        score_str = f" relevance:{score_pct}" if score_pct else ""
        rel_str = _relative_time(str(doc_date)) if doc_date else ""
        date_str = f" {doc_date} {rel_str}" if doc_date else ""
        cat_str = f" [{category}]" if category else ""
        stale_flag = " ⚠STALE" if "stale" in rel_str.lower() else ""
        authority = _authority_level(file_path, category)
        source_idx += 1
        label = (
            f"[Source {source_idx}] {authority}{stale_flag}{cat_str}{date_str}"
            + (f" — {title}" if title else "")
            + (f" ({file_path})" if file_path else "")
            + score_str
        )
        snippet = text[:snippet_chars] if len(text) > snippet_chars else text
        entry = {"label": label, "snippet": snippet, "file_path": file_path}
        if file_path not in file_groups:
            file_groups[file_path] = []
            file_order.append(file_path)
        file_groups[file_path].append(entry)

    context_parts: list[str] = []
    for fp in file_order:
        entries = file_groups[fp]
        if len(entries) == 1:
            context_parts.append(f"{entries[0]['label']}\n{entries[0]['snippet']}")
        else:
            # Multiple chunks from same file — group under a file header
            header = f"## {fp}" + (f" ({len(entries)} relevant sections)" if len(entries) > 1 else "")
            chunk_texts = [f"{e['label']}\n{e['snippet']}" for e in entries]
            context_parts.append(header + "\n\n" + "\n---\n".join(chunk_texts))

    # Append web search results if available
    web_context = ""
    has_web = web_results and len(web_results) > 0
    # Cross-source dedup: remove web results that duplicate KB content.
    # When the KB already covers a topic, showing the same web article
    # as a separate source is redundant and wastes context window budget.
    if has_web and selected:
        deduped = _dedup_web_against_kb(web_results, selected)
        web_results[:] = deduped
        has_web = bool(web_results)
    if has_web:
        web_parts: list[str] = []
        for wr in web_results:
            source_idx += 1
            title = wr.get("title", "")
            url = wr.get("url", "")
            snippet = wr.get("snippet", "")[:snippet_chars]
            date = wr.get("date", "")
            quality = wr.get("quality", 0)
            date_str = f" [{date}]" if date else ""
            quality_str = f" (quality: {quality})" if quality else ""
            web_parts.append(f"[Source {source_idx}]{date_str} {title}\n{url}{quality_str}\n{snippet}")
        web_context = "\n\n---\n\n## Web Search Results\n\n" + "\n\n".join(web_parts)

    context = "\n\n---\n\n".join(context_parts) + web_context

    # Prompt size guard: if the combined context is dangerously large
    # (>90% of typical context window), truncate the lowest-scoring
    # chunks until we're under budget. Each truncated chunk keeps its
    # label + first 300 chars so the LLM can still assess relevance.
    MAX_CONTEXT_CHARS = 18000
    if len(context) > MAX_CONTEXT_CHARS:
        logger.warning(
            f"RAG context oversized ({len(context)} chars), "
            f"truncating to fit {MAX_CONTEXT_CHARS} char budget"
        )
        # Truncate from the back (lowest-scoring chunks are last in pass 2)
        truncated_parts: list[str] = []
        budget = MAX_CONTEXT_CHARS - len(web_context)
        for part in context_parts:
            if budget <= 0:
                break
            if len(part) <= budget:
                truncated_parts.append(part)
                budget -= len(part)
            else:
                # Keep label + first 300 chars of snippet
                lines = part.split("\n", 1)
                label = lines[0] if lines else ""
                truncated = f"{label}\n{lines[1][:300]}…" if len(lines) > 1 else label[:budget]
                truncated_parts.append(truncated)
                budget -= len(truncated)
        context = "\n\n---\n\n".join(truncated_parts) + web_context

    messages: list[dict[str, Any]] = []

    # System prompt selection
    date_ctx = _get_date_context()
    if _is_planning_request(question):
        sys_prompt = RAG_SYSTEM_PROMPT_PLANNING.format(**date_ctx)
    elif _is_time_sensitive(question):
        sys_prompt = RAG_SYSTEM_PROMPT_DATE_AWARE.format(**date_ctx)
    elif _is_simple_question(question) and not has_web:
        sys_prompt = RAG_SYSTEM_PROMPT_COMPACT.format(**date_ctx)
    else:
        sys_prompt = RAG_SYSTEM_PROMPT.format(**date_ctx)
    if context_notes:
        sys_prompt = (
            f"## User Context Files\n"
            f"The user has explicitly added these files to their session context. "
            f"Prioritize information from these files in your analysis:\n\n"
            f"{context_notes}\n\n"
            f"---\n\n"
            f"{sys_prompt}"
        )
    messages.append({"role": "system", "content": sys_prompt})

    # Chat history
    if history:
        for m in history[-history_msgs:]:
            role = m.get("role", "user")
            if role in ("user", "assistant"):
                content = m.get("content", "")
                msg_text = content[:history_chars] if len(content) > history_chars else content
                messages.append({"role": role, "content": msg_text})

    # Final user message
    sources_note = ""
    source_count = source_idx  # total sources including web
    if has_web:
        kb_count = source_idx - len(web_results)
        sources_note = (
            f"Sources [1]-[{kb_count}] are from the internal knowledge base. "
            f"Sources [{kb_count + 1}]-[{source_count}] are from web search. "
            "Prefer KB sources when available; use web sources to fill gaps or provide current information.\n\n"
        )
    cite_instruction = "Tag every factual claim with [N] markers." if citations else ""
    # Accuracy-focused synthesis — specific, verifiable, professional
    synthesis_instructions = (
        "Write a professional, evidence-based answer using the source excerpts above.\n\n"
        "## Accuracy Rules (follow strictly)\n"
        "1. **Quote before claim.** For each key finding, first quote the relevant excerpt "
        "in 「excerpt text」 format with its [N] marker. Then state your conclusion. "
        "This proves the source supports your claim.\n"
        "2. **Paraphrase = risk.** Changing wording from sources introduces errors. "
        "Use the source's original language for technical terms, numbers, and dates.\n"
        "3. **Cross-check when possible.** If [1] and [3] both discuss the same topic, "
        "note whether they agree. Agreement increases confidence; disagreement means "
        "you must report both positions and state which is more authoritative or recent.\n"
        "4. **Flag missing evidence.** At the end, list any sub-questions the sources "
        "don't answer. 'No source addresses [X]' is better than guessing.\n"
        "5. **Confidence levels are mandatory.** After each claim, indicate:\n"
        "   - **[Confirmed]** — multiple consistent sources with specific data\n"
        "   - **[Supported]** — single source explicitly states this\n"
        "   - **[Inferred]** — logically follows from sources but not stated directly\n"
        "   - **[Supplementary]** — from general knowledge, no source support\n"
        "6. **Distinguish fact from analysis.** Source-quoted facts come first. "
        "Your synthesis and implications come after, clearly separated.\n"
        "7. **Weigh source authority.** [Authoritative] sources override [Reference] ones. "
        "When they conflict, prefer the higher-authority source and explain why.\n"
        "# Professional Formatting\n"
        "Structure your answer as follows:\n\n"
        "**Executive Summary** — 2-3 sentence bottom-line answer. Busy readers stop here.\n\n"
        "**Key Findings** — Bulleted list. Each point: 「quote」 → claim [N] [Confidence]. "
        "Order by importance, not source order.\n\n"
        "**Evidence Table** (when 3+ sources)\n"
        "| Source | Excerpt | Relevance | Confidence |\n"
        "|--------|---------|-----------|------------|\n"
        "| [N] file | 「key quote」 | High | [Confirmed] |\n\n"
        "**Limitations** — What the sources don't cover. "
        "What additional information would improve the answer.\n\n"
        "**Sources Referenced** — Compact list: [N] title (date, authority)"
        f"{cite_instruction}\n"
    )
    messages.append({
        "role": "user",
        "content": (
            f"{sources_note}"
            f"{synthesis_instructions}\n"
            f"{context}\n\n"
            f"Question: {question}\n\n"
            f"Answer:"
        ),
    })
    return messages


def _pick_chunks(candidates: list, max_count: int, prefer_unique: bool, max_per_file: int = 2) -> list:
    """Select up to ``max_count`` chunks from candidates.

    Candidates are assumed pre-sorted by relevance (descending). When
    ``prefer_unique`` is True, selects the top chunks from each file first;
    when False, selects the top-scoring chunks regardless of file.

    Deduplicates by text signature (word-bigram Jaccard) and enforces a
    per-file cap of ``max_per_file`` chunks to prevent a single document
    from dominating the context window.
    """
    out: list = []
    seen_files: dict[str, int] = {}
    seen_sigs: set[str] = set()
    floor = _min_score_for_candidates(candidates, max_count)

    for nws in candidates:
        if len(out) >= max_count:
            break
        score = getattr(nws, "score", None)
        if score is not None and score < floor:
            continue
        node = getattr(nws, "node", None) or nws
        text = getattr(node, "get_content", lambda: "")() or getattr(node, "text", "") or ""
        # Use 1200 chars for dedup signature — more context than the old 500,
        # catches near-duplicates that differ only in preamble
        sig = _text_signature(text[:1200])
        if sig in seen_sigs:
            continue
        metadata = dict(getattr(node, "metadata", {}) or {})
        fp = metadata.get("file_path", "")
        # Per-file cap: prevent one document from dominating
        file_count = seen_files.get(fp, 0)
        if file_count >= max_per_file:
            continue
        # File preference: in pass 1, skip chunks from files we've already picked
        if prefer_unique and fp and file_count > 0:
            continue
        seen_sigs.add(sig)
        seen_files[fp] = file_count + 1
        out.append(nws)
    return out


def _min_score_for_candidates(candidates: list, max_count: int = 5) -> float:
    """Adaptive score floor for chunk selection.

    When the top score is high (>0.8), uses a 50% floor — the top chunks
    clearly match, low-scoring ones add noise. When there are many more
    candidates than slots (>3×), uses a 40% floor to filter aggressively.
    Otherwise defaults to 25%.
    """
    scores = [getattr(n, "score", 0) for n in candidates if getattr(n, "score", None) is not None]
    if not scores:
        return 0.0
    top = max(scores)
    if top > 0.8:
        return top * 0.5  # high confidence — be strict
    if len(candidates) > max_count * 3:
        return top * 0.4  # many candidates — filter more
    return top * 0.25


def _filter_overlapping_chunks(selected: list) -> list:
    """Remove chunks whose normalized text content is >80% contained within
    a higher-scoring chunk. Uses word-level Jaccard similarity on the first
    800 chars to catch near-duplicate content across different files.

    This catches the case where two files contain copy-pasted sections —
    the lower-scoring copy is removed so the LLM sees diverse evidence.
    """
    if len(selected) <= 1:
        return selected

    def _get_text(nws) -> str:
        node = getattr(nws, "node", None) or nws
        return getattr(node, "get_content", lambda: "")() or getattr(node, "text", "") or ""

    def _jaccard(words_a: set, words_b: set) -> float:
        if not words_a or not words_b:
            return 0.0
        return len(words_a & words_b) / len(words_a | words_b)

    kept: list = []
    kept_word_sets: list[set] = []

    for nws in selected:
        text = _get_text(nws)[:800]
        cleaned = re.sub(r"[^\w\s]", "", text.lower())
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        words = set(cleaned.split())
        if len(words) < 4:
            kept.append(nws)
            kept_word_sets.append(words)
            continue

        overlap = False
        for prev_words in kept_word_sets:
            if len(prev_words) < 4:
                continue
            if _jaccard(words, prev_words) > 0.8:
                overlap = True
                break
        if not overlap:
            kept.append(nws)
            kept_word_sets.append(words)

    return kept


def _dedup_web_against_kb(
    web_results: list[dict[str, Any]],
    kb_chunks: list,
) -> list[dict[str, Any]]:
    """Remove web results whose content overlaps with KB chunks.

    For each web result, computes word-level Jaccard similarity between
    its title+snippet and each KB chunk's text. If any KB chunk has >50%
    overlap, the web result is considered redundant and removed.

    This prevents the LLM from seeing the same information twice — once
    from the KB and again from a web search that found the same content.
    """
    if not web_results or not kb_chunks:
        return web_results

    def _get_node_text(nws) -> str:
        node = getattr(nws, "node", None) or nws
        return getattr(node, "get_content", lambda: "")() or getattr(node, "text", "") or ""

    # Pre-compute KB word sets for O(N * M) comparison
    kb_word_sets: list[set[str]] = []
    for nws in kb_chunks:
        text = _get_node_text(nws)[:800]
        cleaned = re.sub(r"[^\w\s]", "", text.lower())
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        kb_word_sets.append(set(cleaned.split()))

    kept: list[dict[str, Any]] = []
    for wr in web_results:
        wr_title = wr.get("title", "")
        wr_snippet = wr.get("snippet", "")
        wr_text = f"{wr_title} {wr_snippet}"[:800]
        cleaned = re.sub(r"[^\w\s]", "", wr_text.lower())
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        wr_words = set(cleaned.split())
        if len(wr_words) < 4:
            kept.append(wr)
            continue

        overlap = False
        for kb_words in kb_word_sets:
            if len(kb_words) < 4:
                continue
            intersection = len(wr_words & kb_words)
            union = len(wr_words | kb_words)
            if union > 0 and intersection / union > 0.5:
                overlap = True
                break
        if not overlap:
            kept.append(wr)

    removed = len(web_results) - len(kept)
    if removed:
        logger.info(f"Cross-source dedup: removed {removed} web result(s) overlapping with KB chunks")
    return kept


def _is_simple_question(question: str) -> bool:
    """Detect simple factual questions that benefit from compact prompts.

    Simple questions are short (< 80 chars) and ask for a definition,
    single fact, translation, calculation, or yes/no — they don't need
    the full analytical format. Extended with more Chinese patterns.
    """
    q = (question or "").strip()
    if len(q) > 80:
        return False
    simple_patterns = [
        "what is", "who is", "define", "definition of",
        "when was", "where is", "how many", "how much",
        "translate", "convert", "calculate",
        "是什么", "什么是", "谁", "定义", "哪里", "怎么读",
        "什么时候", "多少", "翻译", "解释", "介绍一下",
        "如何", "怎么样", "为什么",
    ]
    q_lower = q.lower()
    return any(p in q_lower for p in simple_patterns)
