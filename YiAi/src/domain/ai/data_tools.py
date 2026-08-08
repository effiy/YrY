"""
Generic MongoDB data tools for the aiChat agent.

Rather than hard-coding one tool per business object (menus, rss, …), the agent
gets a small generic surface over `services.database.data_service` and *reasons*
over the data model itself:

    db_schema  — introspect the shape of a known collection
    db_list    — query documents (read-only, any collection)
    db_create  — insert a document (writable allowlist + confirmation)
    db_update  — update a document by key (writable allowlist + confirmation)
    db_delete  — delete a document by key (writable allowlist + confirmation)

The "domain knowledge" — e.g. the nested `menus` document shape — lives in the
schema registry below and is returned to the LLM as context, not encoded as
imperative Python. So "add a menu entry" becomes: db_schema → db_list (check for
path clashes) → db_create, with the human approving the write.

Capability scoping: reads are open (non-destructive); writes are restricted to
`_WRITABLE_COLLECTIONS` (a safety policy, not business logic) and gated by the
agent loop's confirmation step.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List

from domain.ai.tools import ToolDefinition

logger = logging.getLogger(__name__)

# Collections the agent may mutate. Reads are unrestricted. This is a safety
# scope, not a business rule — extend it as other collections become safe to
# write from chat (e.g. "knowledge_files", "rss_sources").
_WRITABLE_COLLECTIONS = frozenset({"menus"})

# ── Schema registry (agent-readable domain knowledge) ──────────────────────
# Returned verbatim by `db_schema` so the LLM builds correct documents. Keep
# each entry self-contained: the agent introspects it at call time.
_COLLECTION_SCHEMAS: Dict[str, Dict[str, Any]] = {
    "menus": {
        "description": (
            "YiVad sidebar menu + dynamic route catalog. One document per menu "
            "entry; the tree is rebuilt from `parent` (a path) on every request."
        ),
        "writable": True,
        "fields": {
            "key": "unique string id, e.g. 'menu_myfeature'. Omit to auto-generate.",
            "path": "route path, e.g. '/my-feature'. Children reference this path as their parent.",
            "name": "route name — KeepAlive cache key + v-auth permission prefix.",
            "component": "view path relative to src/views/, e.g. '/my-feature/index'. Empty string for group nodes.",
            "redirect": "optional redirect target (group nodes).",
            "parent": "the parent node's path, or null for a top-level menu.",
            "order": "integer sort key (the sidebar re-sorts alphabetically by meta.title).",
            "meta": {
                "title": "sidebar + browser tab label (sidebar sorts alphabetically by this).",
                "icon": "Element Plus icon name, e.g. 'Setting'.",
                "isLink": "external URL or empty string.",
                "isHide": "boolean — hide from the sidebar (detail pages).",
                "isFull": "boolean — full-screen page.",
                "isAffix": "boolean — pin the tab.",
                "isKeepAlive": "boolean — cache the page component.",
            },
        },
    },
}


def _require_cname(args: Dict[str, Any]) -> str:
    cname = str(args.get("cname", "")).strip()
    if not cname:
        raise ValueError("'cname' (collection name) is required")
    return cname


def _require_writable(cname: str) -> None:
    if cname not in _WRITABLE_COLLECTIONS:
        raise ValueError(
            f"Collection '{cname}' is read-only for the agent. "
            f"Writable collections: {', '.join(sorted(_WRITABLE_COLLECTIONS))}"
        )


def _coerce_fields(fields: Any) -> str | None:
    """Normalize fields to a comma-separated string (data_service contract)."""
    if fields is None:
        return None
    if isinstance(fields, (list, tuple)):
        return ",".join(str(f) for f in fields)
    return str(fields).strip() or None


def _format_schema(cname: str, entry: Dict[str, Any]) -> str:
    lines = [f"Collection '{cname}': {entry.get('description', '')}"]
    if entry.get("writable"):
        lines.append("Writable by the agent: yes (requires confirmation).")
    else:
        lines.append("Writable by the agent: no (read-only).")
    lines.append("Document fields:")
    for field, desc in (entry.get("fields") or {}).items():
        if isinstance(desc, dict):
            lines.append(f"- {field}: {{")
            for sub, subdesc in desc.items():
                lines.append(f"    {sub}: {subdesc}")
            lines.append("  }")
        else:
            lines.append(f"- {field}: {desc}")
    return "\n".join(lines)


async def _schema(args: Dict[str, Any]) -> Dict[str, Any]:
    cname = str(args.get("cname", "")).strip()
    try:
        if cname:
            if cname not in _COLLECTION_SCHEMAS:
                known = ", ".join(sorted(_COLLECTION_SCHEMAS))
                return {
                    "content": f"No schema registered for collection '{cname}'. Known schemas: {known or '(none)'}.",
                    "error": f"unknown collection '{cname}'",
                }
            return {"content": _format_schema(cname, _COLLECTION_SCHEMAS[cname]),
                    "details": {"cname": cname}}
        blocks = [_format_schema(cn, e) for cn, e in sorted(_COLLECTION_SCHEMAS.items())]
        return {"content": "\n\n".join(blocks) or "No schemas registered.",
                "details": {"count": len(_COLLECTION_SCHEMAS)}}
    except Exception as e:
        logger.warning(f"db_schema failed: {e}")
        return {"content": "", "error": f"db_schema failed: {e}"}


async def _list(args: Dict[str, Any]) -> Dict[str, Any]:
    from services.database.data_service import query_documents

    try:
        cname = _require_cname(args)
        params: Dict[str, Any] = {
            "cname": cname,
            "limit": max(1, min(int(args.get("limit", 100)), 1000)),
        }
        if args.get("filter") and isinstance(args["filter"], dict):
            params["filter"] = args["filter"]
        fields = _coerce_fields(args.get("fields"))
        if fields:
            params["fields"] = fields
        if args.get("orderBy"):
            params["orderBy"] = str(args["orderBy"])
        if args.get("orderType"):
            params["orderType"] = str(args["orderType"])

        result = await query_documents(params)
        docs = result.get("list", [])
        if not docs:
            return {"content": f"Collection '{cname}' has no matching documents.",
                    "details": {"total": 0}}
        lines = [f"Collection '{cname}' ({result.get('total', len(docs))} total, showing {len(docs)}):"]
        for d in docs:
            snippet = json_dumps_safe(d)
            lines.append(f"- key={d.get('key', '')} {snippet[:300]}")
        return {"content": "\n".join(lines),
                "details": {"total": result.get("total", len(docs))}}
    except Exception as e:
        logger.warning(f"db_list failed: {e}")
        return {"content": "", "error": f"db_list failed: {e}"}


async def _create(args: Dict[str, Any]) -> Dict[str, Any]:
    from services.database.data_service import create_document

    try:
        cname = _require_cname(args)
        _require_writable(cname)
        data = args.get("data")
        if not isinstance(data, dict) or not data:
            return {"content": "", "error": "db_create requires a non-empty 'data' object"}
        result = await create_document({"cname": cname, "data": data})
        key = result.get("key") or data.get("key")
        return {
            "content": f"Created document in '{cname}': key={key}",
            "details": {"cname": cname, "key": key},
        }
    except Exception as e:
        logger.warning(f"db_create failed: {e}")
        return {"content": "", "error": f"db_create failed: {e}"}


async def _update(args: Dict[str, Any]) -> Dict[str, Any]:
    from services.database.data_service import update_document

    try:
        cname = _require_cname(args)
        _require_writable(cname)
        key = str(args.get("key", "")).strip()
        if not key:
            return {"content": "", "error": "db_update requires 'key'"}
        data = args.get("data")
        if not isinstance(data, dict):
            return {"content": "", "error": "db_update requires a 'data' object of fields to change"}
        # data_service.update_document reads the key from inside `data`.
        await update_document({"cname": cname, "data": {**data, "key": key}})
        return {"content": f"Updated document in '{cname}': key={key}",
                "details": {"cname": cname, "key": key}}
    except Exception as e:
        logger.warning(f"db_update failed: {e}")
        return {"content": "", "error": f"db_update failed: {e}"}


async def _delete(args: Dict[str, Any]) -> Dict[str, Any]:
    from services.database.data_service import delete_document

    try:
        cname = _require_cname(args)
        _require_writable(cname)
        key = str(args.get("key", "")).strip()
        if not key:
            return {"content": "", "error": "db_delete requires 'key'"}
        await delete_document({"cname": cname, "key": key})
        return {"content": f"Deleted document from '{cname}': key={key}",
                "details": {"cname": cname, "key": key}}
    except Exception as e:
        logger.warning(f"db_delete failed: {e}")
        return {"content": "", "error": f"db_delete failed: {e}"}


def json_dumps_safe(d: Dict[str, Any]) -> str:
    try:
        import json
        return json.dumps(d, ensure_ascii=False)
    except Exception:
        return str(d)


def register_data_tools(registry) -> None:
    """Register the generic data tools on a ToolRegistry."""
    registry.register(ToolDefinition(
        name="db_list",
        description=(
            "Query documents from a MongoDB collection. Read-only. "
            "'cname' is the collection (e.g. 'menus'). Optional 'filter' is a Mongo query dict "
            "(e.g. {\"path\": \"/system\"}), 'limit' (default 100, max 1000), 'fields' (comma-separated "
            "or list), 'orderBy'/'orderType'. Use to inspect data and to check for conflicts "
            "(e.g. duplicate menu paths) before creating/updating."
        ),
        parameters={
            "type": "object",
            "properties": {
                "cname": {"type": "string", "description": "MongoDB collection name, e.g. 'menus'"},
                "filter": {"type": "object", "description": "Mongo query filter dict"},
                "limit": {"type": "integer", "description": "Max documents to return (default 100)"},
                "fields": {"type": "string", "description": "Comma-separated fields to project, e.g. 'key,path,name,parent'"},
                "orderBy": {"type": "string", "description": "Sort field (default 'order')"},
                "orderType": {"type": "string", "description": "'asc' or 'desc'"},
            },
            "required": ["cname"],
        },
        execute=_list,
    ))

    registry.register(ToolDefinition(
        name="db_schema",
        description=(
            "Return the documented shape of a collection so you can build correct documents. "
            "Pass 'cname' for one collection (e.g. 'menus'), or omit it to list all known schemas. "
            "Call this before db_create/db_update on a collection you are not sure about."
        ),
        parameters={
            "type": "object",
            "properties": {
                "cname": {"type": "string", "description": "Collection name, e.g. 'menus'. Omit to list all."},
            },
            "required": [],
        },
        execute=_schema,
    ))

    registry.register(ToolDefinition(
        name="db_create",
        description=(
            "Insert a document into a writable collection. Requires 'cname' and a 'data' object. "
            "Writable collections: menus. For the menus shape, call db_schema first. "
            "The write requires user confirmation."
        ),
        parameters={
            "type": "object",
            "properties": {
                "cname": {"type": "string", "description": "Writable collection name (e.g. 'menus')"},
                "data": {"type": "object", "description": "The document to insert (see db_schema for the shape)"},
            },
            "required": ["cname", "data"],
        },
        execute=_create,
        requires_confirmation=True,
    ))

    registry.register(ToolDefinition(
        name="db_update",
        description=(
            "Update an existing document in a writable collection by 'key'. Requires 'cname', 'key' "
            "(from db_list), and a 'data' object of fields to change. Writable collections: menus. "
            "For the menus shape, call db_schema first. The write requires user confirmation."
        ),
        parameters={
            "type": "object",
            "properties": {
                "cname": {"type": "string", "description": "Writable collection name (e.g. 'menus')"},
                "key": {"type": "string", "description": "Document key to update"},
                "data": {"type": "object", "description": "Fields to change (see db_schema for the shape)"},
            },
            "required": ["cname", "key", "data"],
        },
        execute=_update,
        requires_confirmation=True,
    ))

    registry.register(ToolDefinition(
        name="db_delete",
        description=(
            "Delete a document from a writable collection by 'key'. Requires 'cname' and 'key' (from db_list). "
            "Writable collections: menus. The write requires user confirmation."
        ),
        parameters={
            "type": "object",
            "properties": {
                "cname": {"type": "string", "description": "Writable collection name (e.g. 'menus')"},
                "key": {"type": "string", "description": "Document key to delete"},
            },
            "required": ["cname", "key"],
        },
        execute=_delete,
        requires_confirmation=True,
    ))
