"""Node post-processors for the RAG engine.

Self-contained post-processing utilities — no HTTP, no LLM calls, no
dependencies on other sub-modules.

Public surface (used by engine.py):
    - ``_text_signature(text, n)``           — compact signature for near-duplicate detection
    - ``_NumberSourcesPostprocessor``        — prepend [Source N] to chunk content
"""
from __future__ import annotations


def _text_signature(text: str, n: int = 3) -> str:
    """Compact signature for near-duplicate detection.

    Normalizes text (lowercase, strip punctuation/collapse whitespace)
    then extracts word bigrams for Jaccard-similarity comparison. Two
    chunks with >70% word-bigram overlap are treated as duplicates.

    Much more robust than char trigrams: "hello world" and "hello, world"
    produce the same signature because punctuation is stripped before
    bigram extraction.
    """
    import re
    cleaned = re.sub(r"[^\w\s]", "", text.lower())
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    words = cleaned.split()
    if len(words) < 2:
        return cleaned
    bigrams = [f"{words[i]}|{words[i + 1]}" for i in range(len(words) - 1)]
    return " ".join(sorted(set(bigrams)))


class _NumberSourcesPostprocessor:
    """Prepend ``[Source N]`` (1-indexed) to each retrieved chunk's content.

    Lets the chat LLM emit ``[N]`` markers in its answer that map to the
    ranked source list. The list is sent to the frontend in the same order,
    so ``[N]`` in prose corresponds to the Nth chip in ``RagSources``.

    Clones each node into a fresh ``TextNode`` (preserving id_/metadata/
    relationships) so the docstore entry stays unmutated and future
    ``delete_ref_doc`` calls still find the original chunk.
    """

    def postprocess_nodes(self, nodes: list, query_str: str = None, query_bundle=None) -> list:
        from llama_index.core.schema import NodeWithScore, TextNode
        out: list = []
        for i, nws in enumerate(nodes, start=1):
            node = nws.node
            original = node.get_content() or ""
            new_node = TextNode(
                id_=node.node_id,
                text=f"[Source {i}]\n{original}",
                metadata=dict(getattr(node, "metadata", {}) or {}),
                start_char_idx=getattr(node, "start_char_idx", None),
                end_char_idx=getattr(node, "end_char_idx", None),
                relationships=getattr(node, "relationships", {}) or {},
            )
            out.append(NodeWithScore(node=new_node, score=getattr(nws, "score", None)))
        return out
