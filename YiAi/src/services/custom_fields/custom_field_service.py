"""
Custom Fields Service — dynamic field definitions for Issue/Bug/Project entities.

RPC entry: services.custom_fields.custom_field_service.<method>
"""
import logging
from datetime import datetime, timezone
from typing import Any

from data.database import db
from data.repository import query_documents, create_document, update_document, delete_document
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

COLLECTION = "custom_field_defs"

FIELD_TYPES = ["text", "number", "date", "select", "multi_select", "user", "url", "checkbox"]

DEFAULT_VALIDATION: dict[str, dict[str, Any]] = {
    "text": {"max_length": 500},
    "number": {"min": None, "max": None},
    "date": {},
    "select": {"options": []},
    "multi_select": {"options": []},
    "user": {},
    "url": {},
    "checkbox": {},
}


async def list_field_defs(parameters: dict[str, Any]) -> dict[str, Any]:
    """List custom field definitions, optionally filtered by entity_type."""
    entity_type = parameters.get("entity_type")
    filter_dict: dict[str, Any] = {}
    if entity_type:
        filter_dict["entity_type"] = entity_type

    result = await query_documents(
        COLLECTION,
        filter_dict,
        page_num=parameters.get("pageNum", 1),
        page_size=parameters.get("pageSize", 100),
        order_by="order",
        order_type="asc",
    )
    return result


async def create_field_def(parameters: dict[str, Any]) -> dict[str, Any]:
    """Create a custom field definition."""
    data = parameters.get("data", {})
    name = data.get("name", "").strip()
    entity_type = data.get("entity_type", "").strip()
    field_type = data.get("field_type", "").strip()

    if not all([name, entity_type, field_type]):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="name, entity_type, field_type are required")
    if field_type not in FIELD_TYPES:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"field_type must be one of {FIELD_TYPES}")

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "key": data.get("key") or f"cf_{entity_type}_{name.lower().replace(' ', '_')}",
        "name": name,
        "entity_type": entity_type,
        "field_type": field_type,
        "label": data.get("label", name),
        "description": data.get("description", ""),
        "required": data.get("required", False),
        "default_value": data.get("default_value"),
        "validation": {**DEFAULT_VALIDATION.get(field_type, {}), **data.get("validation", {})},
        "order": data.get("order", 0),
        "group": data.get("group", ""),
        "visible_to": data.get("visible_to", []),
        "created_at": now,
        "updated_at": now,
    }
    return await create_document(COLLECTION, doc)


async def update_field_def(parameters: dict[str, Any]) -> dict[str, Any]:
    """Update a custom field definition."""
    key = parameters.get("key", "")
    data = parameters.get("data", {})
    if not key:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="key is required")

    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    return await update_document(COLLECTION, key, data)


async def delete_field_def(parameters: dict[str, Any]) -> dict[str, Any]:
    """Delete a custom field definition."""
    key = parameters.get("key", "")
    if not key:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="key is required")
    return await delete_document(COLLECTION, key)