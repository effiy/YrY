from domain.audit.decorator import audit_write
from data.repository import (  # noqa: F401
    query_documents,
    get_document_detail,
    count_documents,
    list_story_task_dirs,
)
from data.repository import (
    create_document as _create_document,
    update_document as _update_document,
    delete_document as _delete_document,
    upsert_document as _upsert_document,
)


@audit_write("CREATE")
async def create_document(params):
    return await _create_document(params)


@audit_write("UPDATE")
async def update_document(params):
    return await _update_document(params)


@audit_write("DELETE")
async def delete_document(params):
    return await _delete_document(params)


@audit_write("UPSERT")
async def upsert_document(params):
    return await _upsert_document(params)
