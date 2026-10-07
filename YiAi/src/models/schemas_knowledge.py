"""Data model definitions (Schemas)
- Contains Pydantic models for all API requests and responses
- Organized by functional module: Module, RSS, etc.
"""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ChatMode(str, Enum):
    """RAG chat engine mode."""

    CONDENSE = "condense"
    CONDENSE_PLUS_CONTEXT = "condense_plus_context"
    CONDENSE_QUESTION = "condense_question"
    CONTEXT = "context"
    SIMPLE = "simple"
    FAST = "fast"


# --- Knowledge Base Schemas ---
class KnowledgeScanRequest(BaseModel):
    """Scan the ~/YiKnowledge markdown tree for a sidebar view."""

    category: str | None = Field(
        default=None, description="Limit to one top-level role directory (product/leader/engineer/...). Empty = all."
    )


class KnowledgeReadRequest(BaseModel):
    """Read a single knowledge markdown file with parsed frontmatter."""

    target_file: str = Field(..., description="Relative path under the knowledge base dir")


class KnowledgeStoriesRequest(BaseModel):
    """List story.md entries under engineer/learn/projects/{project}/."""

    project: str | None = Field(default=None, description="Limit to one project (YiAi/YiPet/YiVad/...). Empty = all.")


class KnowledgeStoryReadRequest(BaseModel):
    """Read a specific story's story.md."""

    project: str = Field(..., description="Project name (e.g. YiVad)")
    story_name: str = Field(..., description="Story directory name (semantic, e.g. ai-chat-function)")


class KnowledgeBugsRequest(BaseModel):
    """List bug markdown entries under projects/{project}/bugs/{date}/{type}/.

    The returned list carries the full ``BugDocument`` fields (title, severity,
    status, contentPath, …) parsed from each file's YAML frontmatter — no
    MongoDB lookup is required.
    """

    project: str | None = Field(
        default=None,
        description="Limit to one project (case-insensitive match on the directory name under projects/). Empty = all projects.",
    )


class KnowledgeBugReadRequest(BaseModel):
    """Read a single bug markdown file by its relative contentPath.

    Returns both the ``BugDocument`` metadata (parsed frontmatter) plus the
    structured ``BugContent`` body (description / steps / expected / actual /
    cause / solution).
    """

    content_path: str = Field(
        ..., description="Relative YiKnowledge path, e.g. projects/yivad/bugs/2026-08-21/logic/issue-detail-comment.md"
    )


class KnowledgeFilesRequest(BaseModel):
    """Read metadata from the DB mirror (no disk scan)."""

    category: str | None = Field(
        default=None, description="Filter by top-level role directory (product/leader/engineer/.../static/__root__)."
    )
    page: int = Field(default=1, ge=1, description="1-based page number.")
    page_size: int = Field(default=0, ge=0, description="Page size. 0 = return all (no pagination).")


class KnowledgeWriteRequest(BaseModel):
    """Write a markdown file with YAML frontmatter to the knowledge base."""

    target_file: str = Field(..., description="Relative path under the knowledge base dir, e.g. reports/q3-sales.md")
    content: str = Field(..., description="Markdown body (will be written after auto-generated frontmatter)")
    metadata: dict | None = Field(
        default=None, description="Optional YAML frontmatter key-value pairs (title, tags, category, etc.)"
    )


class KnowledgeDeleteRequest(BaseModel):
    """Delete a knowledge markdown file from disk. No-op if the file does not exist."""

    target_file: str = Field(..., description="Relative path under the knowledge base dir")


class KnowledgeSearchRequest(BaseModel):
    """Search content within knowledge base markdown files."""

    query: str = Field(..., description="Search query string")
    category: str | None = Field(default=None, description="Optional category filter")
    max_results: int = Field(default=50, description="Max results to return")


class KnowledgeExportRequest(BaseModel):
    """Export a knowledge directory as a zip archive."""

    target_dir: str = Field(..., description="Relative directory path under the knowledge base dir, e.g. skills/vue")


class KnowledgeIssuesRequest(BaseModel):
    """List YiKnowledge project files as unified Issue records."""

    project: str | None = Field(default=None, description="Filter by project key (case-insensitive directory match)")
    issue_type: str | None = Field(default=None, description="Filter by issue_type: bug/task/requirement/feature/improvement")
    status: str | None = Field(default=None, description="Comma-separated status values")
    priority: str | None = Field(default=None, description="Comma-separated priority values")
    search: str | None = Field(default=None, description="Substring match on title")
    pageNum: int = Field(default=1, ge=1, description="1-based page number")
    pageSize: int = Field(default=50, ge=1, le=500, description="Items per page")


class KnowledgeIssuesStatsRequest(BaseModel):
    """Pre-aggregated stats for the issue list — same filters as KnowledgeIssuesRequest, no pagination."""

    project: str | None = Field(default=None, description="Filter by project key")
    issue_type: str | None = Field(default=None, description="Filter by issue_type")
    status: str | None = Field(default=None, description="Comma-separated status values")
    priority: str | None = Field(default=None, description="Comma-separated priority values")
    search: str | None = Field(default=None, description="Substring match on title")


class KnowledgeProjectsStatsRequest(BaseModel):
    """Count .md files per project under YiKnowledge/projects/."""

    project: str | None = Field(default=None, description="Limit to one project directory. Empty = all projects.")


class KnowledgeGoalsRequest(BaseModel):
    """Fetch live OKR goals with progress derived from knowledge_files."""

    year: str | None = Field(default=None, description="Filter by year, e.g. '2026'. Defaults to current year.")
    period: str | None = Field(default=None, description="Filter by period: Q1/Q2/Q3/Q4/annual.")


# --- RAG Schemas (llama_index) ---
class RagQueryRequest(BaseModel):
    """One-shot retrieval over the YiKnowledge VectorStoreIndex."""

    question: str = Field(..., description="Query string")
    top_k: int | None = Field(default=None, description="Override settings.rag_top_k")
    scope: str | None = Field(default=None, description="Substring filter on file_path (e.g. 'engineer/learn/projects/yivad/')")
    file_paths: list[str] | None = Field(
        default=None, description="Exact file paths to restrict retrieval to (OR-combined CONTAINS filters)"
    )
    hybrid: bool | None = Field(default=None, description="Override settings.rag_hybrid_retrieval_enabled (vector + BM25 fusion)")
    rerank: bool | None = Field(default=None, description="Override settings.rag_rerank_enabled (LLMRerank postprocessor)")
    citations: bool | None = Field(default=None, description="Override settings.rag_inline_citations_enabled ([Source N] prefix)")
    num_queries: int | None = Field(
        default=None,
        description="QueryFusionRetriever LLM query-variant count (1 = no expansion). Only honored when hybrid active + no metadata filter.",
    )
    category: str | None = Field(
        default=None, description="MetadataFilter on frontmatter 'category' (TEXT_MATCH). Disables hybrid when set."
    )
    tags: list[str] | None = Field(
        default=None, description="MetadataFilter on frontmatter 'tags' (CONTAINS each, AND-combined). Disables hybrid when set."
    )
    hyde: bool | None = Field(default=None, description="HyDE — generate hypothetical answer for retrieval query")


class RagChatRequest(BaseModel):
    """SSE-streaming RAG chat over the knowledge index."""

    messages: list[dict[str, Any]] = Field(
        ..., min_length=1, description="[{role:'user'|'assistant'|'system', content}] — last must be user"
    )
    model: str | None = Field(default=None, description="Model name override — falls back to settings.rag_llm_model")
    scope: str | None = Field(default=None, description="Optional file_path substring filter")
    file_paths: list[str] | None = Field(
        default=None, description="Exact file paths to restrict retrieval to (OR-combined CONTAINS filters)"
    )
    context_notes: str = Field(default="", description="Overview of user's context files for the system prompt")
    top_k: int | None = Field(default=None, description="Override settings.rag_top_k")
    hybrid: bool | None = Field(default=None, description="Override hybrid retrieval for this turn only")
    rerank: bool | None = Field(default=None, description="Override LLMRerank for this turn only")
    citations: bool | None = Field(default=None, description="Override inline [Source N] prefix for this turn only")
    num_queries: int | None = Field(
        default=None, description="Override QueryFusionRetriever LLM query-variant count for this turn only"
    )
    chat_mode: ChatMode = Field(default=ChatMode.CONDENSE_PLUS_CONTEXT, description="Chat engine mode")
    category: str | None = Field(
        default=None, description="MetadataFilter on frontmatter 'category' (TEXT_MATCH). Disables hybrid when set."
    )
    tags: list[str] | None = Field(
        default=None, description="MetadataFilter on frontmatter 'tags' (CONTAINS each, AND-combined). Disables hybrid when set."
    )
    hyde: bool | None = Field(default=None, description="HyDE — generate hypothetical answer for retrieval query")
    web_search: bool = Field(
        default=False, description="Augment RAG with parallel web search for time-sensitive or external queries"
    )
    fast: bool = Field(default=False, description="Skip retrieval entirely — send directly to LLM for fastest response")


class RagFileChatRequest(BaseModel):
    """SSE-streaming RAG chat grounded in a single file."""

    target_file: str = Field(..., description="Relative path under knowledge base dir")
    question: str = Field(..., description="Question about the file contents")


class RagFileQueryRequest(BaseModel):
    """One-shot retrieval over a single file's index."""

    target_file: str = Field(..., description="Relative path under knowledge base dir")
    question: str = Field(..., description="Query string")
    top_k: int | None = Field(default=None)


class RagDecomposeRequest(BaseModel):
    """Sub-question decomposition over the knowledge index.

    Backed by llama_index's ``SubQuestionQueryEngine`` — splits a complex
    question into sub-questions, runs each through the retriever, and
    returns each sub-answer with its own sources. Surfaces a flagship
    llama_index capability to the aiChat UI.
    """

    question: str = Field(..., description="Complex question to decompose")
    scope: str | None = Field(default=None, description="Optional file_path substring filter")
    file_paths: list[str] | None = Field(default=None, description="Exact file paths to restrict retrieval to")
    sub_q_top_k: int | None = Field(default=None, description="Per-sub-question retrieval depth")
    citations: bool | None = Field(default=None, description="Override settings.rag_inline_citations_enabled for decompose path")
    category: str | None = Field(
        default=None, description="MetadataFilter on frontmatter 'category' (TEXT_MATCH). Disables hybrid when set."
    )
    tags: list[str] | None = Field(
        default=None, description="MetadataFilter on frontmatter 'tags' (CONTAINS each, AND-combined). Disables hybrid when set."
    )
