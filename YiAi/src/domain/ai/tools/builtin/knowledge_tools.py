"""Knowledge base (RAG) tool for the agent — rag_search, kb_search."""

from typing import Any

from domain.ai.tools.core import ToolDefinition, ToolRegistry


def register_knowledge_tools(registry: ToolRegistry) -> None:
    """Register knowledge base (RAG) tools."""

    # ── rag_search ──────────────────────────────────────────────────────
    async def _rag_search(args: dict[str, Any]) -> dict[str, Any]:
        from domain.rag.engine import rag_query
        query = str(args.get("query", "")).strip()
        top_k = min(int(args.get("top_k", 5)), 20)
        scope = args.get("scope")
        if not query:
            return {"content": "", "error": "No query provided"}
        try:
            results = await rag_query(query, top_k=top_k, scope=scope)
            if not results:
                return {"content": f"No relevant documents found for: {query}"}
            lines = [f"Knowledge base results for '{query}':"]
            for i, r in enumerate(results, 1):
                fp = r.get('file_path', 'unknown')
                score = r.get('score', 0)
                text = r.get('text', '')[:500]
                lines.append(f"{i}. [{fp}] (relevance: {score:.0%})")
                lines.append(f"   {text}")
            return {"content": "\n".join(lines), "details": results}
        except Exception as e:
            return {"content": "", "error": f"RAG search failed: {e}"}

    registry.register(ToolDefinition(
        name="rag_search",
        description="Search the internal knowledge base (YiKnowledge) for relevant documents.",
        parameters={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The search query"},
                "top_k": {"type": "integer", "description": "Number of results (1-20, default 5)"},
                "scope": {"type": "string", "description": "Optional file path prefix to scope the search"},
            },
            "required": ["query"],
        },
        execute=_rag_search,
    ))

    # ── kb_search (unified KB + web) ────────────────────────────────────
    async def _kb_search(args: dict[str, Any]) -> dict[str, Any]:
        from domain.search.router import unified_search
        query = str(args.get("query", "")).strip()
        if not query:
            return {"content": "", "error": "No query provided"}
        try:
            results = await unified_search(
                query,
                top_k=min(int(args.get("top_k", 5)), 20),
                scope=args.get("scope"),
                web_results=min(int(args.get("web_results", 4)), 8),
            )
        except Exception as e:
            return {"content": "", "error": f"Unified search failed: {e}"}

        lines = [f"Search results for '{query}' (category: {results['category']}):"]

        if results["rag"]:
            lines.append("\n## Internal Knowledge Base")
            for i, r in enumerate(results["rag"], 1):
                fp = r.get("file_path", "unknown")
                text = r.get("text", "")[:400]
                lines.append(f"{i}. [{fp}] {text}")

        if results["web"]:
            lines.append("\n## Web Search")
            for i, r in enumerate(results["web"], 1):
                lines.append(f"{i}. {r.get('title', '')} — {r.get('url', '')}")
                if r.get("snippet"):
                    lines.append(f"   {r['snippet'][:300]}")

        timing = results.get("timing", {})
        lines.append(f"\n---\nSearch completed in {timing.get('total_ms', 0)}ms")
        return {"content": "\n".join(lines), "details": results}

    registry.register(ToolDefinition(
        name="kb_search",
        description=(
            "Unified search across internal knowledge base AND web. "
            "Automatically decides which sources to query for best results. "
            "Use this for questions that may need both internal docs and external info."
        ),
        parameters={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The search query"},
                "top_k": {"type": "integer", "description": "Max KB results (1-20, default 5)"},
                "scope": {"type": "string", "description": "Optional KB scope filter"},
                "web_results": {"type": "integer", "description": "Max web results (1-8, default 4)"},
            },
            "required": ["query"],
        },
        execute=_kb_search,
    ))
