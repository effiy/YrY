"""Knowledge service layer — thin RPC-friendly wrappers around the
``domain.knowledge`` write/delete helpers.

The RPC executor calls ``target_function(parameters_dict)`` with a single
positional dict (see ``domain/execution/executor.py``). The domain functions
``write_entry_markdown`` / ``delete_entry_markdown`` take positional args
(``rel_path``, ``content``, ``meta``), so they can't be called directly via
RPC. These wrappers accept a single dict and delegate — mirroring how
``services/database/data_service.py`` re-exports ``data/repository.py``.
"""
from __future__ import annotations

from typing import Any, Dict

from domain.knowledge.scanner import (
    list_bugs as _list_bugs,
    read_bug_markdown as _read_bug_markdown,
    list_stories as _list_stories,
    read_story_markdown as _read_story_markdown,
)
from domain.knowledge.writer import (
    write_entry_markdown as _write_entry_markdown,
    delete_entry_markdown as _delete_entry_markdown,
    entry_exists as _entry_exists,
)


def write_entry_markdown(params: Dict[str, Any]) -> Dict[str, Any]:
    """RPC entry point. ``params``: ``{ rel_path, content, meta }``.

    Returns ``{ path: <rel_path> }`` on success.
    """
    rel_path = params.get("rel_path") or params.get("path") or ""
    content = params.get("content") or ""
    meta = params.get("meta") or {}
    written = _write_entry_markdown(rel_path, content, meta)
    return {"path": written, "exists": True}


def delete_entry_markdown(params: Dict[str, Any]) -> Dict[str, Any]:
    """RPC entry point. ``params``: ``{ rel_path }`` (or ``path``).

    Returns ``{ deleted: bool }``.
    """
    rel_path = params.get("rel_path") or params.get("path") or ""
    deleted = _delete_entry_markdown(rel_path)
    return {"deleted": deleted}


def entry_exists(params: Dict[str, Any]) -> Dict[str, Any]:
    """RPC entry point. ``params``: ``{ rel_path }`` (or ``path``)."""
    rel_path = params.get("rel_path") or params.get("path") or ""
    return {"exists": _entry_exists(rel_path)}


def list_bugs(params: Dict[str, Any]) -> Dict[str, Any]:
    """RPC entry point. ``params``: ``{ project? }`` — same as ``/knowledge-bugs`` REST.

    Returns ``{ bugs: [...], total: N }`` where each bug carries the full
    ``BugDocument`` fields (title, severity, status, contentPath, …) sourced
    from the markdown frontmatter.
    """
    project = params.get("project") or params.get("project_key") or None
    return _list_bugs(project=project)


def read_bug(params: Dict[str, Any]) -> Dict[str, Any]:
    """RPC entry point. ``params``: ``{ content_path }`` (or ``path``).

    Returns ``{ bug: BugDocument, content: BugContent }`` for a single file.
    """
    content_path = params.get("content_path") or params.get("path") or params.get("contentPath") or ""
    return _read_bug_markdown(content_path)


def list_stories(params: Dict[str, Any]) -> Dict[str, Any]:
    """RPC entry point. ``params``: ``{ project? }`` — mirrors ``/knowledge-stories``."""
    project = params.get("project") or None
    return _list_stories(project=project)


def read_story(params: Dict[str, Any]) -> Dict[str, Any]:
    """RPC entry point. ``params``: ``{ project, story_name }``."""
    project = params.get("project") or ""
    story_name = params.get("story_name") or params.get("storyName") or ""
    return _read_story_markdown(project, story_name)
