"""Data model definitions (Schemas)
- Contains Pydantic models for all API requests and responses
- Organized by functional module: Module, RSS, etc.
"""
from typing import Optional, Dict, Any, Union, List
from pydantic import BaseModel, Field

# --- Module Schemas ---
class ExecuteRequest(BaseModel):
    """
    Generic module execution request model

    Example:
        {
            "module_name": "module.path",
            "method_name": "function_name",
            "parameters": {"key": "value"}
        }
    """
    module_name: str = Field(default="", description="Full path of the target module")
    method_name: str = Field(default="", description="Target function name")
    parameters: Union[Dict[str, Any], str] = Field(
        default_factory=lambda: {},
        description="Parameters passed to the target function; supports dict or JSON string"
    )

    class Config:
        arbitrary_types_allowed = True

class FileUploadRequest(BaseModel):
    """
    File upload request model (JSON mode)
    """
    filename: str = Field(..., description="File name")
    content: str = Field(..., description="File content (text or Base64 string)")
    is_base64: bool = Field(default=False, description="Whether the content is Base64 encoded")
    target_dir: str = Field(default="static", description="Target storage directory")

class ImageUploadToOssRequest(BaseModel):
    data_url: str = Field(..., description="DataURL or Base64 string")
    filename: str = Field(default="image.png", description="File name (including extension)")
    directory: str = Field(default="aicr", description="OSS directory prefix")

class FolderDeleteRequest(BaseModel):
    """
    Folder deletion request model
    """
    target_dir: str = Field(..., description="Directory path to delete")

class FileDeleteRequest(BaseModel):
    """
    File deletion request model
    """
    target_file: str = Field(..., description="File path to delete")

class FileReadRequest(BaseModel):
    """
    File read request model
    """
    target_file: str = Field(..., description="File path to read")

class ProjectFileReadRequest(BaseModel):
    """Read a file directly from a project's source tree on disk.

    Used by the YiVad story sidebar preview: paths stored on story/scenario
    cards (e.g. ``src/views/foo.vue``) belong to a specific project, and the
    preview must reflect the live content of that file on the project's disk
    — NOT a stale snapshot in YiAi's static dir or MongoDB.
    """
    project: str = Field(..., description="Project name (e.g. YiVad, YiPet, YiAi)")
    target_file: str = Field(..., description="Relative path within the project")

class FileWriteRequest(BaseModel):
    """
    File write request model
    """
    target_file: str = Field(..., description="File path to write to")
    content: str = Field(..., description="File content")
    is_base64: bool = Field(default=False, description="Whether the content is Base64 encoded")

class FileRenameRequest(BaseModel):
    """
    File rename request model
    """
    old_path: str = Field(..., description="Old file path")
    new_path: str = Field(..., description="New file path")

class FolderRenameRequest(BaseModel):
    """
    Folder rename request model
    """
    old_dir: str = Field(..., description="Old directory path")
    new_dir: str = Field(..., description="New directory path")

# --- Knowledge Base Schemas ---
class KnowledgeScanRequest(BaseModel):
    """Scan the ~/YiKnowledge markdown tree for a sidebar view."""
    category: Optional[str] = Field(default=None, description="Limit to one top-level category (industry/lessons/...). Empty = all.")

class KnowledgeReadRequest(BaseModel):
    """Read a single knowledge markdown file with parsed frontmatter."""
    target_file: str = Field(..., description="Relative path under the knowledge base dir")

class KnowledgeStoriesRequest(BaseModel):
    """List story.md entries under projects/{project}/."""
    project: Optional[str] = Field(default=None, description="Limit to one project (YiAi/YiPet/YiVad/...). Empty = all.")

class KnowledgeStoryReadRequest(BaseModel):
    """Read a specific story's story.md."""
    project: str = Field(..., description="Project name (e.g. YiVad)")
    story_name: str = Field(..., description="Story directory name (semantic, e.g. ai-chat-function)")

class KnowledgeFilesRequest(BaseModel):
    """Read metadata from the DB mirror (no disk scan)."""
    category: Optional[str] = Field(default=None, description="Filter by category (industry/lessons/.../static/__root__).")

class KnowledgeWriteRequest(BaseModel):
    """Write a markdown file with YAML frontmatter to the knowledge base."""
    target_file: str = Field(..., description="Relative path under the knowledge base dir, e.g. reports/q3-sales.md")
    content: str = Field(..., description="Markdown body (will be written after auto-generated frontmatter)")
    metadata: Optional[dict] = Field(default=None, description="Optional YAML frontmatter key-value pairs (title, tags, category, etc.)")

# --- RAG Schemas (llama_index) ---
class RagQueryRequest(BaseModel):
    """One-shot retrieval over the YiKnowledge VectorStoreIndex."""
    question: str = Field(..., description="Query string")
    top_k: Optional[int] = Field(default=None, description="Override settings.rag_top_k")
    scope: Optional[str] = Field(default=None, description="Substring filter on file_path (e.g. 'projects/YiVad/')")

class RagChatRequest(BaseModel):
    """SSE-streaming RAG chat over the knowledge index."""
    messages: List[Dict[str, Any]] = Field(..., description="[{role:'user'|'assistant'|'system', content}] — last must be user")
    scope: Optional[str] = Field(default=None, description="Optional file_path substring filter")

class RagFileChatRequest(BaseModel):
    """SSE-streaming RAG chat grounded in a single file."""
    target_file: str = Field(..., description="Relative path under knowledge base dir")
    question: str = Field(..., description="Question about the file contents")

class RagFileQueryRequest(BaseModel):
    """One-shot retrieval over a single file's index."""
    target_file: str = Field(..., description="Relative path under knowledge base dir")
    question: str = Field(..., description="Query string")
    top_k: Optional[int] = Field(default=None)

# --- RSS Schemas ---
class ParseRssRequest(BaseModel):
    """
    Parse single RSS source request

    Example:
        {
            "url": "https://example.com/rss.xml",
            "name": "Example RSS"
        }
    """
    url: str = Field(..., description="RSS source URL")
    name: Optional[str] = Field(None, description="Custom source name; auto-fetched if not provided")

class ParseAllRssRequest(BaseModel):
    """
    Batch parse RSS request

    Example:
        {
            "force": true
        }
    """
    force: Optional[bool] = Field(False, description="Whether to force refresh")

class SchedulerConfigRequest(BaseModel):
    """
    RSS scheduler configuration request

    Example:
        {
            "enabled": true,
            "type": "interval",
            "interval": 3600
        }
    """
    enabled: Optional[bool] = Field(None, description="Whether to enable the scheduler")
    type: Optional[str] = Field(None, description="Schedule type: interval or cron")
    interval: Optional[int] = Field(None, description="Interval in seconds; only valid for interval type")
    cron: Optional[Dict[str, Any]] = Field(None, description="Cron expression configuration; only valid for cron type")

# --- WeWork Schemas ---
class WeWorkWebhookRequest(BaseModel):
    """
    WeChat Work (WeCom) bot webhook request model

    Example:
        {
            "webhook_url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx",
            "content": "Message content to send"
        }
    """
    webhook_url: str = Field(..., description="WeChat Work (WeCom) bot webhook URL")
    content: str = Field(..., description="Message content to send")


# --- State Store Schemas ---

class StateRecord(BaseModel):
    """Generic state record model"""
    key: str = Field(default="", description="Unique record identifier")
    record_type: str = Field(..., min_length=1, description="Record type, e.g., conversation_summary")
    title: str = Field(default="", description="Record title; used for text search")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Flexible business payload")
    tags: List[str] = Field(default_factory=list, description="Tag list")
    created_time: str = Field(default="", description="Creation time (ISO 8601)")
    updated_time: str = Field(default="", description="Update time (ISO 8601)")


class SessionState(BaseModel):
    """Structured session state model"""
    key: str = Field(..., description="Must match the key in the sessions collection")
    page_content: str = Field(default="", description="Corresponds to legacy pageContent")
    messages: List[Dict[str, Any]] = Field(default_factory=list, description="Corresponds to legacy messages")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Extended metadata")
    created_time: str = Field(default="")
    updated_time: str = Field(default="")


class SkillExecutionRecord(BaseModel):
    """Skill execution result record model"""
    key: str = Field(default="", description="Unique record identifier")
    skill_name: str = Field(..., min_length=1, description="Skill name")
    status: str = Field(..., pattern=r"^(success|failed|timeout|cancelled)$", description="Execution status")
    duration_ms: float = Field(..., ge=0, description="Execution duration in milliseconds")
    input_summary: str = Field(default="", max_length=2000, description="Input summary")
    output_summary: str = Field(default="", max_length=2000, description="Output summary")
    error_message: str = Field(default="", max_length=4000, description="Error message")
    timestamp: str = Field(default="", description="Record time (ISO 8601)")
    tags: List[str] = Field(default_factory=lambda: ["skill_execution"], description="Tags")


class StateQueryRequest(BaseModel):
    """State record query request"""
    record_type: Optional[str] = Field(None, description="Filter by record type")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    title_contains: Optional[str] = Field(None, description="Fuzzy search on title")
    created_after: Optional[str] = Field(None, description="Lower bound of creation time (ISO 8601)")
    created_before: Optional[str] = Field(None, description="Upper bound of creation time (ISO 8601)")
    page_num: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=2000, ge=1, le=8000, description="Items per page")


class AdaptationResult(BaseModel):
    """Batch adaptation result"""
    success_count: int = Field(default=0, description="Number of successes")
    failure_count: int = Field(default=0, description="Number of failures")
    errors: List[Dict[str, Any]] = Field(default_factory=list, description="Error details")
