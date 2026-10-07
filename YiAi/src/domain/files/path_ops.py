"""Path resolution, URL building, and path-traversal safety checks.

Extracted from local.py: _static_url and _resolve_project_path provide
reusable helpers for building static URLs and safely resolving project
file paths with traversal protection.
"""
import os

from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException


def _static_url(rel_path: str) -> str:
    return f"{settings.static_base_url.rstrip('/')}/{rel_path}"


def _resolve_project_path(project: str, target_file: str) -> tuple[str, str]:
    """Resolve ``<projects_root>/<project>/<target_file>`` with path-traversal
    protection, returning ``(abs_path, project_name)``.

    Path forms accepted (story cards are inconsistent about prefixing, so we
    tolerate all three):

    1. ``src/foo.vue`` (project-relative) → resolved under
       ``<projects_root>/<project>/``.
    2. ``YiAi/src/foo.vue`` (project-prefixed) → leading ``<project>/`` is
       stripped, then resolved under ``<projects_root>/<project>/``.
    3. ``YiKnowledge/engineer/learn/projects/YiAi/.../scene.md`` (knowledge-prefixed) →
       resolved under ``<knowledge_base_dir>`` (YiKnowledge lives as a
       sibling of the projects, not inside any one project).

    When the first segment of ``target_file`` matches a directory directly
    under ``projects_root`` (e.g. ``.claude``), the actual project is
    auto-detected from that segment and the caller-supplied ``project`` is
    overridden. This lets skill paths like ``.claude/skills/<name>/SKILL.md``
    resolve against ``<projects_root>/.claude/`` regardless of the project
    the caller passed in.
    """
    project_name = (project or "").strip()
    if not project_name or "/" in project_name or ".." in project_name:
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"Invalid project: {project}"
        )

    raw = (target_file or "").strip().replace("\\", "/")
    if not raw or raw.startswith("/") or ".." in raw.split("/"):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"Invalid path: {target_file}"
        )

    # Knowledge files live under the shared YiKnowledge tree, not under any
    # single project. Strip the "YiKnowledge/" prefix and resolve against
    # the configured knowledge_base_dir (default ../YiKnowledge).
    knowledge_prefix = "YiKnowledge/"
    if raw.startswith(knowledge_prefix):
        rel = raw[len(knowledge_prefix):]
        if not rel or rel.startswith("/") or ".." in rel.split("/"):
            raise BusinessException(
                ErrorCode.INVALID_PARAMS, message=f"Invalid path: {target_file}"
            )
        base_dir = os.path.realpath(os.path.abspath(settings.knowledge_base_dir))
        abs_path = os.path.realpath(os.path.join(base_dir, os.path.normpath(rel)))
        if abs_path != base_dir and not abs_path.startswith(base_dir + os.sep):
            raise BusinessException(
                ErrorCode.INVALID_PARAMS, message="Invalid path"
            )
        return abs_path, project_name

    # Project source file. Story cards store paths with the project prefix
    # already prepended ("YiAi/src/foo.py" or "YiVad/src/bar.vue"); the
    # project on the story may be "YiAi" but the file may live in a sibling
    # project. Detect the actual project from the path's first segment when
    # it matches a directory under projects_root; otherwise fall back to the
    # caller-supplied project name.
    root_abs = os.path.realpath(os.path.abspath(settings.projects_root))
    segments = raw.split("/")
    first = segments[0] if segments else ""
    first_abs = os.path.realpath(os.path.join(root_abs, first)) if first else None
    if first and first_abs != root_abs and first_abs.startswith(root_abs + os.sep) and os.path.isdir(first_abs):
        project_name = first
        rel = raw[len(first) + 1:]
    else:
        project_prefix = f"{project_name}/"
        if raw.startswith(project_prefix):
            rel = raw[len(project_prefix):]
        else:
            rel = raw
    if not rel or rel.startswith("/") or ".." in rel.split("/"):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"Invalid path: {target_file}"
        )

    project_abs = os.path.realpath(os.path.join(root_abs, project_name))
    if project_abs != root_abs and not project_abs.startswith(root_abs + os.sep):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"Invalid project: {project}"
        )
    abs_path = os.path.realpath(os.path.join(project_abs, os.path.normpath(rel)))
    if abs_path != project_abs and not abs_path.startswith(project_abs + os.sep):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message="Invalid path"
        )
    return abs_path, project_name
