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
    name: str | None = Field(None, description="Custom source name; auto-fetched if not provided")

class ParseAllRssRequest(BaseModel):
    """
    Batch parse RSS request

    Example:
        {
            "force": true
        }
    """
    force: bool | None = Field(False, description="Whether to force refresh")

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
    enabled: bool | None = Field(None, description="Whether to enable the scheduler")
    type: str | None = Field(None, description="Schedule type: interval or cron")
    interval: int | None = Field(None, description="Interval in seconds; only valid for interval type")
    cron: dict[str, Any] | None = Field(None, description="Cron expression configuration; only valid for cron type")

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
    payload: dict[str, Any] = Field(default_factory=dict, description="Flexible business payload")
    tags: list[str] = Field(default_factory=list, description="Tag list")
    created_time: str = Field(default="", description="Creation time (ISO 8601)")
    updated_time: str = Field(default="", description="Update time (ISO 8601)")


class SessionState(BaseModel):
    """Structured session state model"""
    key: str = Field(..., description="Must match the key in the sessions collection")
    page_content: str = Field(default="", description="Page content for RAG context")
    messages: list[dict[str, Any]] = Field(default_factory=list, description="Chat messages")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Extended metadata")
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
    tags: list[str] = Field(default_factory=lambda: ["skill_execution"], description="Tags")


class StateQueryRequest(BaseModel):
    """State record query request"""
    record_type: str | None = Field(None, description="Filter by record type")
    tags: list[str] | None = Field(None, description="Filter by tags")
    title_contains: str | None = Field(None, description="Fuzzy search on title")
    created_after: str | None = Field(None, description="Lower bound of creation time (ISO 8601)")
    created_before: str | None = Field(None, description="Upper bound of creation time (ISO 8601)")
    page_num: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=2000, ge=1, le=8000, description="Items per page")


class AdaptationResult(BaseModel):
    """Batch adaptation result"""
    success_count: int = Field(default=0, description="Number of successes")
    failure_count: int = Field(default=0, description="Number of failures")
    errors: list[dict[str, Any]] = Field(default_factory=list, description="Error details")
