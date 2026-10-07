"""Data model definitions (Schemas)
- Contains Pydantic models for all API requests and responses
- Organized by functional module: Module, RSS, etc.
"""
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ChatMode(str, Enum):
    """RAG chat engine mode."""
    CONDENSE = "condense"
    CONDENSE_PLUS_CONTEXT = "condense_plus_context"
    CONDENSE_QUESTION = "condense_question"
    CONTEXT = "context"
    SIMPLE = "simple"
    FAST = "fast"


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
    parameters: dict[str, Any] | str = Field(
        default_factory=dict,
        description="Parameters passed to the target function; supports dict or JSON string"
    )

    model_config = ConfigDict(arbitrary_types_allowed=True)


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

class ListDirectoryRequest(BaseModel):
    """List directory contents request."""
    target_dir: str = Field(default="", description="Directory path relative to static base")
    max_depth: int = Field(default=3, ge=1, le=10, description="Maximum recursion depth")

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

class ProjectFileWriteRequest(BaseModel):
    """Write a file directly into a project's source tree on disk.

    Symmetric with :class:`ProjectFileReadRequest`. Disk-only — no MongoDB
    dual-write, since project source files are not mirrored to the static
    collection. Used by the skill editor (writes
    ``.claude/skills/<name>/SKILL.md`` at the projects_root).
    """
    project: str = Field(..., description="Project name (or '.' for projects_root-relative)")
    target_file: str = Field(..., description="Relative path within the project")
    content: str = Field(..., description="File content (text or Base64 string)")
    is_base64: bool = Field(default=False, description="Whether the content is Base64 encoded")

class ProjectFolderDeleteRequest(BaseModel):
    """Delete a directory from a project's source tree on disk."""
    project: str = Field(..., description="Project name (or '.' for projects_root-relative)")
    target_dir: str = Field(..., description="Directory path to delete")

class ProjectFolderRenameRequest(BaseModel):
    """Rename (move) a directory within a project's source tree on disk."""
    project: str = Field(..., description="Project name (or '.' for projects_root-relative)")
    old_dir: str = Field(..., description="Old directory path")
    new_dir: str = Field(..., description="New directory path")

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

