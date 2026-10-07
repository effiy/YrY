"""File and shell operation tools for the agent — file_read, file_write, bash, grep, find, ls, edit, read, write."""

import asyncio
import difflib
import fnmatch
import logging
import os
import re
import stat
from typing import Any

import aiofiles

from domain.ai.tools.core import ToolDefinition, ToolRegistry, _format_file_size, _is_path_allowed

logger = logging.getLogger(__name__)

# Security: allowed base directories for file operations
_ALLOWED_BASES = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "..", "YiKnowledge")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..")),  # YiAi project
]


def _resolve_path(rel_path: str) -> str:
    """Resolve a relative path to an absolute path within allowed bases."""
    clean = os.path.normpath(rel_path.strip().lstrip("/"))
    # Try each allowed base
    for base in _ALLOWED_BASES:
        candidate = os.path.normpath(os.path.join(base, clean))
        if os.path.exists(candidate):
            return candidate
    # Default: resolve relative to YiKnowledge
    return os.path.normpath(os.path.join(_ALLOWED_BASES[0], clean))


def _is_path_safe(abs_path: str) -> bool:
    """Check that the resolved path is within an allowed base directory."""
    real = os.path.realpath(abs_path) if os.path.exists(abs_path) else os.path.normpath(abs_path)
    for base in _ALLOWED_BASES:
        base_real = os.path.realpath(base)
        if real.startswith(base_real + os.sep) or real == base_real:
            return True
    return False


def register_file_tools(registry: ToolRegistry) -> None:
    """Register file and shell operation tools."""

    # ── file_read ───────────────────────────────────────────────────────
    async def _file_read(args: dict[str, Any]) -> dict[str, Any]:
        from domain.files import read_file
        path = str(args.get("path", "")).strip()
        if not path:
            return {"content": "", "error": "No file path provided"}
        if not _is_path_allowed(path):
            return {"content": "", "error": f"Access denied: path '{path}' is outside allowed directories"}
        try:
            result = await read_file(path)
            content = result.get("content", "")
            return {"content": content, "details": {"path": path}}
        except Exception as e:
            return {"content": "", "error": f"File read failed: {e}"}

    registry.register(ToolDefinition(
        name="file_read",
        description="Read the contents of a file from the YiKnowledge or project directory.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path relative to the knowledge base"},
            },
            "required": ["path"],
        },
        execute=_file_read,
    ))

    # ── file_write ──────────────────────────────────────────────────────
    async def _file_write(args: dict[str, Any]) -> dict[str, Any]:
        from domain.files import write_file
        path = str(args.get("path", "")).strip()
        content = str(args.get("content", ""))
        if not path:
            return {"content": "", "error": "No file path provided"}
        if not _is_path_allowed(path):
            return {"content": "", "error": f"Access denied: path '{path}' is outside allowed directories"}
        try:
            await write_file(path, content)
            return {"content": f"File written successfully: {path}", "details": {"path": path}}
        except Exception as e:
            return {"content": "", "error": f"File write failed: {e}"}

    registry.register(ToolDefinition(
        name="file_write",
        description="Write content to a file in the YiKnowledge or project directory. Use with caution.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path relative to the knowledge base"},
                "content": {"type": "string", "description": "Content to write to the file"},
            },
            "required": ["path", "content"],
        },
        execute=_file_write,
        requires_confirmation=True,
    ))

    # ── bash ───────────────────────────────────────────────────────────
    async def _bash(args: dict[str, Any]) -> dict[str, Any]:
        command = str(args.get("command", "")).strip()
        workdir = str(args.get("workdir", ".")).strip()
        if not command:
            return {"content": "", "error": "No command provided"}
        # Resolve working directory
        cwd = _resolve_path(workdir)
        if not _is_path_safe(cwd):
            return {"content": "", "error": f"Working directory not allowed: {workdir}"}
        if not os.path.isdir(cwd):
            cwd = _ALLOWED_BASES[0]
        try:
            proc = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=cwd,
            )
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30.0)
            out = stdout.decode("utf-8", errors="replace")
            err = stderr.decode("utf-8", errors="replace")
            if err:
                return {"content": f"STDOUT:\n{out}\n\nSTDERR:\n{err}", "details": {"exit_code": proc.returncode}}
            return {"content": out.strip() or "(no output)", "details": {"exit_code": proc.returncode}}
        except asyncio.TimeoutError:
            return {"content": "", "error": "Command timed out (30s)"}
        except Exception as e:
            return {"content": "", "error": f"Bash execution failed: {e}"}

    registry.register(ToolDefinition(
        name="bash",
        description="Execute a shell command in the project directory. Use for build, test, lint, git, and file operations.",
        parameters={
            "type": "object",
            "properties": {
                "command": {"type": "string", "description": "The shell command to execute"},
                "workdir": {"type": "string", "description": "Working directory (relative path, default: project root)"},
            },
            "required": ["command"],
        },
        execute=_bash,
        requires_confirmation=True,
    ))

    # ── grep ───────────────────────────────────────────────────────────
    async def _grep(args: dict[str, Any]) -> dict[str, Any]:
        pattern = str(args.get("pattern", "")).strip()
        path_filter = str(args.get("path", ".")).strip()
        if not pattern:
            return {"content": "", "error": "No pattern provided"}
        search_dir = _resolve_path(path_filter)
        if not _is_path_safe(search_dir):
            return {"content": "", "error": f"Path not allowed: {path_filter}"}
        if not os.path.isdir(search_dir):
            search_dir = _ALLOWED_BASES[0]
        try:
            compiled = re.compile(pattern)
        except re.error as e:
            return {"content": "", "error": f"Invalid regex: {e}"}
        results: list[str] = []
        count = 0
        max_results = 50
        for root, dirs, files in os.walk(search_dir):
            # Skip hidden dirs and node_modules
            dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ("node_modules", "__pycache__", ".git")]
            for fname in files:
                if count >= max_results:
                    break
                if fname.startswith("."):
                    continue
                fpath = os.path.join(root, fname)
                try:
                    async with aiofiles.open(fpath, encoding="utf-8", errors="replace") as f:
                        lineno = 0
                        async for line in f:
                            lineno += 1
                            if count >= max_results:
                                break
                            if compiled.search(line):
                                rel = os.path.relpath(fpath, search_dir)
                                results.append(f"{rel}:{lineno}: {line.rstrip()[:200]}")
                                count += 1
                except (OSError, UnicodeDecodeError):
                    pass
            if count >= max_results:
                break
        if not results:
            return {"content": f"No matches found for pattern: {pattern}"}
        return {"content": "\n".join(results), "details": {"match_count": count}}

    registry.register(ToolDefinition(
        name="grep",
        description="Search file contents with a regex pattern. Returns matching lines with file:line references.",
        parameters={
            "type": "object",
            "properties": {
                "pattern": {"type": "string", "description": "Regex pattern to search for"},
                "path": {"type": "string", "description": "Directory to search in (relative path, default: project root)"},
            },
            "required": ["pattern"],
        },
        execute=_grep,
    ))

    # ── find (glob) ────────────────────────────────────────────────────
    async def _find(args: dict[str, Any]) -> dict[str, Any]:
        pattern = str(args.get("pattern", "*")).strip()
        search_dir_str = str(args.get("path", ".")).strip()
        search_dir = _resolve_path(search_dir_str)
        if not _is_path_safe(search_dir):
            return {"content": "", "error": f"Path not allowed: {search_dir_str}"}
        if not os.path.isdir(search_dir):
            search_dir = _ALLOWED_BASES[0]
        results: list[str] = []
        max_results = 100
        for root, dirs, files in os.walk(search_dir):
            dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ("node_modules", "__pycache__", ".git")]
            for fname in files:
                if len(results) >= max_results:
                    break
                if fname.startswith("."):
                    continue
                if fnmatch.fnmatch(fname, pattern):
                    fpath = os.path.join(root, fname)
                    rel = os.path.relpath(fpath, search_dir)
                    try:
                        size = os.path.getsize(fpath)
                        results.append(f"{rel} ({_format_file_size(size)})")
                    except OSError:
                        results.append(rel)
            if len(results) >= max_results:
                break
        if not results:
            return {"content": f"No files found matching: {pattern}"}
        return {"content": "\n".join(results), "details": {"match_count": len(results)}}

    registry.register(ToolDefinition(
        name="find",
        description="Find files by name pattern (glob). Returns matching file paths with sizes.",
        parameters={
            "type": "object",
            "properties": {
                "pattern": {"type": "string", "description": "File name pattern with wildcards (e.g., *.py, test_*.ts)"},
                "path": {"type": "string", "description": "Directory to search in (relative path, default: project root)"},
            },
            "required": ["pattern"],
        },
        execute=_find,
    ))

    # ── ls ─────────────────────────────────────────────────────────────
    async def _ls(args: dict[str, Any]) -> dict[str, Any]:
        dir_path = str(args.get("path", ".")).strip()
        abs_path = _resolve_path(dir_path)
        if not _is_path_safe(abs_path):
            return {"content": "", "error": f"Path not allowed: {dir_path}"}
        if not os.path.isdir(abs_path):
            return {"content": "", "error": f"Not a directory: {dir_path}"}
        try:
            entries = sorted(os.listdir(abs_path))
        except OSError as e:
            return {"content": "", "error": f"Cannot list directory: {e}"}
        lines: list[str] = []
        for name in entries:
            if name.startswith("."):
                continue
            epath = os.path.join(abs_path, name)
            try:
                st = os.stat(epath)
                if stat.S_ISDIR(st.st_mode):
                    lines.append(f"📁 {name}/")
                else:
                    size = _format_file_size(st.st_size)
                    lines.append(f"📄 {name} ({size})")
            except OSError:
                lines.append(f"? {name}")
        if not lines:
            return {"content": "(empty directory)"}
        return {"content": "\n".join(lines), "details": {"entry_count": len(lines)}}

    registry.register(ToolDefinition(
        name="ls",
        description="List files and directories in a given path.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Directory path to list (relative, default: project root)"},
            },
        },
        execute=_ls,
    ))

    # ── edit ───────────────────────────────────────────────────────────
    async def _edit(args: dict[str, Any]) -> dict[str, Any]:
        file_path = str(args.get("path", "")).strip()
        old_string = str(args.get("old_string", ""))
        new_string = str(args.get("new_string", ""))
        if not file_path:
            return {"content": "", "error": "No file path provided"}
        if not old_string:
            return {"content": "", "error": "No old_string provided (the text to replace)"}
        abs_path = _resolve_path(file_path)
        if not _is_path_safe(abs_path):
            return {"content": "", "error": f"Path not allowed: {file_path}"}
        if not os.path.isfile(abs_path):
            return {"content": "", "error": f"File not found: {file_path}"}
        try:
            async with aiofiles.open(abs_path, encoding="utf-8") as f:
                content = await f.read()
        except Exception as e:
            return {"content": "", "error": f"Cannot read file: {e}"}
        count = content.count(old_string)
        if count == 0:
            return {"content": "", "error": "old_string not found in file"}
        if count > 1:
            return {"content": "", "error": f"old_string found {count} times — must be unique. Provide more context to make it unique."}
        new_content = content.replace(old_string, new_string)
        # Compute unified diff for preview (Pi: edit-diff pattern)
        diff_lines = list(difflib.unified_diff(
            content.splitlines(keepends=True),
            new_content.splitlines(keepends=True),
            fromfile=file_path,
            tofile=file_path,
        ))
        diff_text = "".join(diff_lines)
        try:
            async with aiofiles.open(abs_path, "w", encoding="utf-8") as f:
                await f.write(new_content)
        except Exception as e:
            return {"content": "", "error": f"Cannot write file: {e}"}
        result = f"File edited: {file_path}\nReplaced 1 occurrence.\n\n```diff\n{diff_text}\n```"
        return {"content": result, "details": {"path": file_path, "replacements": 1, "diff": diff_text}}

    registry.register(ToolDefinition(
        name="edit",
        description="Edit a file by replacing an exact string match. old_string must be unique in the file.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path to edit"},
                "old_string": {"type": "string", "description": "The exact text to replace (must be unique in the file)"},
                "new_string": {"type": "string", "description": "The replacement text"},
            },
            "required": ["path", "old_string", "new_string"],
        },
        execute=_edit,
        requires_confirmation=True,
    ))

    # ── read ───────────────────────────────────────────────────────────
    async def _read(args: dict[str, Any]) -> dict[str, Any]:
        file_path = str(args.get("path", "")).strip()
        offset = int(args.get("offset", 1)) - 1  # 1-indexed → 0-indexed
        limit = args.get("limit")
        if limit is not None:
            limit = int(limit)
        if not file_path:
            return {"content": "", "error": "No file path provided"}
        abs_path = _resolve_path(file_path)
        if not _is_path_safe(abs_path):
            return {"content": "", "error": f"Path not allowed: {file_path}"}
        if not os.path.isfile(abs_path):
            return {"content": "", "error": f"File not found: {file_path}"}
        try:
            async with aiofiles.open(abs_path, encoding="utf-8") as f:
                lines = (await f.read()).splitlines(True)
        except Exception as e:
            return {"content": "", "error": f"Cannot read file: {e}"}
        if offset < 0 or offset >= len(lines):
            return {"content": "", "error": f"Offset {offset + 1} out of range (file has {len(lines)} lines)"}
        selected = lines[offset:offset + limit] if limit else lines[offset:]
        content = "".join(selected)
        # Add line numbers
        numbered = []
        for i, line in enumerate(selected, start=offset + 1):
            numbered.append(f"{i:6}\t{line}")
        result = f"File: {file_path} (lines {offset + 1}-{offset + len(selected)} of {len(lines)})\n\n{''.join(numbered)}"
        total_chars = len(content)
        if total_chars > 8000:
            result = result[:8000] + f"\n\n... (truncated, {total_chars - 8000} more chars)"
        return {"content": result, "details": {"path": file_path, "lines": len(selected), "total_lines": len(lines), "offset": offset + 1}}

    registry.register(ToolDefinition(
        name="read",
        description="Read a file with optional offset and limit (line numbers). Use this to inspect file contents.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path to read"},
                "offset": {"type": "integer", "description": "Line number to start reading from (1-indexed, default: 1)"},
                "limit": {"type": "integer", "description": "Maximum number of lines to read"},
            },
            "required": ["path"],
        },
        execute=_read,
        requires_confirmation=False,
    ))

    # ── write ──────────────────────────────────────────────────────────
    async def _write(args: dict[str, Any]) -> dict[str, Any]:
        file_path = str(args.get("path", "")).strip()
        content = str(args.get("content", ""))
        if not file_path:
            return {"content": "", "error": "No file path provided"}
        abs_path = _resolve_path(file_path)
        if not _is_path_safe(abs_path):
            return {"content": "", "error": f"Path not allowed: {file_path}"}
        if os.path.exists(abs_path) and not args.get("overwrite", False):
            return {"content": "", "error": f"File already exists: {file_path}. Set overwrite=true to replace."}
        try:
            os.makedirs(os.path.dirname(abs_path), exist_ok=True)
            async with aiofiles.open(abs_path, "w", encoding="utf-8") as f:
                await f.write(content)
        except Exception as e:
            return {"content": "", "error": f"Cannot write file: {e}"}
        lines = content.count("\n") + 1
        return {"content": f"File written: {file_path}\n{lines} lines, {len(content)} chars.", "details": {"path": file_path, "lines": lines, "chars": len(content)}}

    registry.register(ToolDefinition(
        name="write",
        description="Create a new file or overwrite an existing one. Set overwrite=true to replace an existing file.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path to write"},
                "content": {"type": "string", "description": "Content to write to the file"},
                "overwrite": {"type": "boolean", "description": "Set to true to overwrite an existing file (default: false)"},
            },
            "required": ["path", "content"],
        },
        execute=_write,
        requires_confirmation=True,
    ))
