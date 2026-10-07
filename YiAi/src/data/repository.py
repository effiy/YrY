"""Repository public API — re-exports from sub-modules for backward compatibility.

All functions are imported from their canonical homes in query.py, mutation.py,
and helpers.py. External callers should continue to import from data.repository.
"""

from data.helpers import (  # noqa: F401
    _BUG_TYPE_DIR,
    _ISSUE_TYPE_DIR,
    _QUERY_MAX_TIME_MS,
    _resolve_bug_markdown_path,
    _resolve_issue_markdown_path,
    _validate_collection_name,
)
from data.mutation import (  # noqa: F401
    create_document,
    delete_document,
    delete_project_cascade,
    list_story_task_dirs,
    update_document,
    upsert_document,
)
from data.query import (  # noqa: F401
    _build_sort_list,
    count_documents,
    get_document_detail,
    query_documents,
)
