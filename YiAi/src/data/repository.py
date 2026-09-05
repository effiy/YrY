import logging
import re
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from bson import ObjectId

from data.database import db
from domain.knowledge.writer import delete_entry_markdown
from shared.config import settings
from shared.utils import get_current_time, is_valid_date, is_number

logger = logging.getLogger(__name__)

_BUG_TYPE_DIR: Dict[str, str] = {
    "functional": "logic",
    "performance": "performance",
    "ui": "style",
    "security": "security",
    "compatibility": "compatibility",
    "regression": "regression",
    "data": "data",
    "other": "other",
}

_ISSUE_TYPE_DIR: Dict[str, str] = {
    "bug": "bug",
    "task": "task",
    "feature": "feature",
    "improvement": "improvement",
    "requirement": "requirement",
    "other": "other",
}

# --- Private Helpers ---

def _validate_collection_name(collection_name: Optional[str]) -> str:
    if not collection_name:
        raise ValueError("Collection name (collection_name) must be provided")
    return collection_name

def _build_published_date_filter(start_date: str, end_date: str) -> Dict[str, Any]:
    try:
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')

        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        date_patterns = []
        iso_date_values = []
        current_dt = start_dt

        while current_dt <= end_dt:
            year, month, day = current_dt.year, current_dt.month, current_dt.day
            month_name = month_names[month - 1]
            date_patterns.extend([
                f'{year}-{month:02d}-{day:02d}',
                f'{day:02d} {month_name} {year}',
                f'{day} {month_name} {year}',
            ])
            iso_date_values.append(f'{year}-{month:02d}-{day:02d}')
            current_dt += timedelta(days=1)

        date_patterns = list(set(date_patterns))
        iso_date_values = list(set(iso_date_values))

        if not date_patterns:
            return {}

        or_conditions = []
        for pattern in date_patterns:
            or_conditions.append({'pubDate': {'$regex': pattern, '$options': 'i'}})
            or_conditions.append({'published': {'$regex': pattern, '$options': 'i'}})

        if iso_date_values:
            or_conditions.append({'isoDate': {'$in': iso_date_values}})
            for iso_date in iso_date_values:
                or_conditions.append({'isoDate': {'$regex': iso_date, '$options': 'i'}})

        return {'$or': or_conditions}
    except ValueError:
        return {}

def _handle_iso_date_filter(key: str, value: Any, filter_dict: Dict[str, Any]) -> bool:
    """Handle isoDate special filter logic"""
    if key != 'isoDate' or not isinstance(value, str):
        return False

    if ',' in value:
        date_parts = [term.strip() for term in value.split(',') if term.strip()]
        if len(date_parts) == 2:
            start_date, end_date = date_parts
            if is_valid_date(start_date) and is_valid_date(end_date):
                published_filter = _build_published_date_filter(start_date, end_date)
                if not published_filter:
                    return False
                filter_dict.update(published_filter)
                return True
    else:
        if is_valid_date(value):
            published_filter = _build_published_date_filter(value, value)
            if not published_filter:
                return False
            filter_dict.update(published_filter)
            return True
    return False

def _handle_range_or_list_filter(key: str, value: Any, filter_dict: Dict[str, Any]) -> bool:
    """Handle range query or list query"""
    if not (hasattr(value, '__iter__') and not isinstance(value, (str, bytes, dict))):
        return False

    value_list = list(value) if not isinstance(value, list) else value
    if not value_list:
        return True

    if len(value_list) == 2:
        start, end = value_list
        if is_valid_date(start) and is_valid_date(end):
            filter_dict[key] = {'$gte': start, '$lt': end}
        elif is_number(start) and is_number(end):
            filter_dict[key] = {'$gte': float(start), '$lt': float(end)}
        elif is_number(start):
            filter_dict[key] = {'$gte': float(start)}
        elif is_number(end):
            filter_dict[key] = {'$lt': float(end)}
        else:
            filter_dict[key] = {'$in': value_list}
    else:
        filter_dict[key] = {'$in': value_list}
    return True

def _handle_string_search_filter(key: str, value: Any, filter_dict: Dict[str, Any]) -> bool:
    """Handle string fuzzy search"""
    if not isinstance(value, str):
        return False

    if ',' in value:
        search_terms = [term.strip() for term in value.split(',') if term.strip()]
        if search_terms:
            if '$or' in filter_dict:
                filter_dict['$or'].extend([
                    {key: re.compile(f'.*{re.escape(term)}.*', re.IGNORECASE)}
                    for term in search_terms
                ])
            else:
                filter_dict['$or'] = [
                    {key: re.compile(f'.*{re.escape(term)}.*', re.IGNORECASE)}
                    for term in search_terms
                ]
    else:
        filter_dict[key] = re.compile(f'.*{re.escape(value)}.*', re.IGNORECASE)
    return True

def _parse_ms_ts(value: Any) -> Optional[int]:
    """Best-effort conversion to a millisecond-precision epoch timestamp.

    The RSS corpus has historically used a mix of second-precision numeric
    timestamps, millisecond-precision numeric timestamps, numeric strings,
    ISO date strings, and ``createdTime``/``published`` free-form fields.
    Normalising at the repository layer lets callers pass plain ``int``
    ranges (e.g. from YiVad's date-nav component) without worrying about
    the per-document schema drift.
    """
    if value is None:
        return None
    if isinstance(value, (int, float)):
        i = int(value)
        # Treat <= 10 digits as epoch seconds, >= 13 as epoch ms. 11/12-digit
        # values (millennia / 10k years) are extremely unlikely and treated
        # as milliseconds to match the dominant pipeline output.
        return i * 1000 if len(str(abs(i))) <= 10 else i
    ts_str = str(value).strip()
    if not ts_str:
        return None
    if ts_str.isdigit():
        i = int(ts_str)
        return i * 1000 if len(ts_str) <= 10 else i
    try:
        from datetime import timezone as _tz
    except Exception:  # pragma: no cover - timezone is always importable
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return int(datetime.strptime(ts_str, fmt).replace(tzinfo=_tz.utc).timestamp() * 1000)
        except ValueError:
            continue
    try:
        return int(datetime.fromisoformat(ts_str.replace("Z", "+00:00")).timestamp() * 1000)
    except Exception:
        return None


def _apply_rss_date_filters(
    query_params: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Extract RSS-specific ``publishedStart`` / ``publishedEnd`` params and
    return ``{"start_ms": Optional[int], "end_ms": Optional[int]}`` so the
    caller can apply Python-level filtering after the Mongo read.

    The generic Mongo filter path cannot be used here because the RSS corpus
    has a mix of ``int`` / ``str`` / ISO-date values in
    ``published_parsed`` / ``createdTime`` / ``published``, and MongoDB
    compares strings and numbers as distinct types (e.g. the document
    ``{"published_parsed": "1724900000000"}`` would never match the query
    ``{"published_parsed": {"$gte": 1724800000000}}``). Doing the comparison
    in Python with :func:`_parse_ms_ts` normalises every document first.
    """
    if not ("publishedStart" in query_params or "publishedEnd" in query_params):
        return None
    start_ms = _parse_ms_ts(query_params.pop("publishedStart", None))
    end_ms = _parse_ms_ts(query_params.pop("publishedEnd", None))
    return {"start_ms": start_ms, "end_ms": end_ms}


def _rss_doc_published_ms(doc: Dict[str, Any]) -> Optional[int]:
    """Normalise a single RSS document to its epoch-ms published timestamp,
    trying the same fields and fallbacks as the dashboard stats endpoint.
    """
    for key in ("published_parsed", "createdTime", "published"):
        ts = _parse_ms_ts(doc.get(key))
        if ts is not None:
            return ts
    return None


def _build_filter(query_params: Dict[str, Any]) -> Dict[str, Any]:
    filter_dict: Dict[str, Any] = {}

    for key, value in query_params.items():
        if not value:
            continue

        # Mongo logical operators ($or/$and/$nor/...) and field-level
        # operator dicts ($regex/$ne/$gte/$lte/...) are passed through
        # untouched. Otherwise _handle_range_or_list_filter would wrap a
        # list of condition dicts into {$in: [...]}, corrupting $or, and
        # _handle_string_search_filter would drop dict values entirely.
        if key.startswith('$') or isinstance(value, dict):
            filter_dict[key] = value
            continue

        # key field uses exact match
        if key == 'key' and isinstance(value, str):
            filter_dict[key] = value
            continue

        if _handle_iso_date_filter(key, value, filter_dict):
            continue

        if _handle_range_or_list_filter(key, value, filter_dict):
            continue

        if _handle_string_search_filter(key, value, filter_dict):
            continue

        if isinstance(value, (int, float, bool)):
            filter_dict[key] = value

    return filter_dict

def _build_sort_list(sort_param: str, sort_order: int) -> List[tuple]:
    sort_list = []
    if sort_param == 'order':
        sort_list.append(('order', 1))
    else:
        sort_list.append((sort_param, sort_order))

    if sort_param != 'updatedTime':
        sort_list.append(('updatedTime', -1))
    if sort_param != 'createdTime':
        sort_list.append(('createdTime', -1))

    return sort_list

# --- Public Service Methods ---

async def query_documents(params: Dict[str, Any]) -> Dict[str, Any]:
    # Support cname and collection_name
    collection_name = params.get('collection_name') or params.get('cname')
    if not collection_name:
        raise ValueError("Collection name (collection_name/cname) is required")

    query_params = params.copy()
    query_params.pop('cname', None)
    query_params.pop('collection_name', None)

    # Handle filter parameter: if filter parameter exists, merge its content into query parameters
    filter_param = query_params.pop('filter', None)
    if filter_param and isinstance(filter_param, dict):
        # Merge filter content into query_params
        query_params.update(filter_param)

    # Compatibility with old parameters
    try:
        if 'limit' in query_params and 'pageSize' not in query_params:
            query_params['pageSize'] = int(query_params.pop('limit'))
        else:
            query_params.pop('limit', None)
    except (ValueError, TypeError):
        query_params.pop('limit', None)

    try:
        if 'page' in query_params and 'pageNum' not in query_params:
            query_params['pageNum'] = int(query_params.pop('page'))
        else:
            query_params.pop('page', None)
    except (ValueError, TypeError):
        query_params.pop('page', None)

    await db.initialize()
    collection_name = _validate_collection_name(collection_name)

    fields_param = query_params.pop('fields', None) or query_params.pop('select', None)
    exclude_fields_param = query_params.pop('excludeFields', None) or query_params.pop('exclude', None)

    try:
        page_num = max(1, int(query_params.pop('pageNum', 1)))
        page_size = min(settings.pagination_max_size, max(settings.pagination_min_size, int(query_params.pop('pageSize', settings.pagination_default_size))))
    except ValueError:
        raise ValueError("Pagination parameters must be valid integers")

    sort_param = query_params.pop('orderBy', 'timestamp' if collection_name == 'apis' else 'order')
    sort_order = -1 if query_params.pop('orderType', 'asc').lower() == 'desc' else 1

    rss_date_range: Optional[Dict[str, Any]] = None
    if collection_name == "rss":
        rss_date_range = _apply_rss_date_filters(query_params)
    filter_dict = _build_filter(query_params)

    logger.info(f"Querying collection: {collection_name}, Filter: {filter_dict}, rssDateRange: {rss_date_range}")
    sort_list = _build_sort_list(sort_param, sort_order)

    projection = {'_id': 0}
    if fields_param:
        fields = [f.strip() for f in str(fields_param).split(',') if f.strip()]
        if 'key' not in fields:
            fields.append('key')
        if collection_name == 'sessions':
            fields = [f for f in fields if f != 'pageContent']
        if collection_name == 'users':
            fields = [f for f in fields if f != 'password']
        projection = {'_id': 0, **{f: 1 for f in fields}}
    elif exclude_fields_param:
        exclude_fields = [f.strip() for f in str(exclude_fields_param).split(',') if f.strip()]
        # Ensure key field is not excluded
        if 'key' in exclude_fields:
            exclude_fields.remove('key')
        if collection_name == 'sessions' and 'pageContent' not in exclude_fields:
            exclude_fields.append('pageContent')
        if collection_name == 'users' and 'password' not in exclude_fields:
            exclude_fields.append('password')
        projection = {'_id': 0, **{f: 0 for f in exclude_fields}}
    elif collection_name == 'sessions':
        projection = {'_id': 0, 'pageContent': 0}
    elif collection_name == 'users':
        projection = {'_id': 0, 'password': 0}

    collection = db.db[collection_name]

    if rss_date_range is not None:
        # RSS date-range filter: the standard find() filter cannot correctly
        # compare numeric bounds against a string-typed ``published_parsed``
        # column (historic schema drift in the corpus). Skip Mongo-level
        # skip/limit, read all matched docs into memory, apply the date filter
        # in Python with :func:`_rss_doc_published_ms`, then manually slice.
        start_ms = rss_date_range.get("start_ms")
        end_ms = rss_date_range.get("end_ms")
        cursor = collection.find(filter_dict, projection).sort(sort_list)
        all_docs: List[Dict[str, Any]] = []
        async for doc in cursor:
            ts = _rss_doc_published_ms(doc)
            if ts is None:
                continue
            if start_ms is not None and ts < start_ms:
                continue
            if end_ms is not None and ts > end_ms:
                continue
            all_docs.append(doc)
        total = len(all_docs)
        start_idx = (page_num - 1) * page_size
        end_idx = start_idx + page_size
        data = all_docs[start_idx:end_idx]
    else:
        cursor = collection.find(filter_dict, projection) \
            .sort(sort_list) \
            .skip((page_num - 1) * page_size) \
            .limit(page_size)

        data = [doc async for doc in cursor]
        total = await collection.count_documents(filter_dict)
    total_pages = (total + page_size - 1) // page_size

    # Ensure every returned document has a key field
    for doc in data:
        if 'key' not in doc:
            # If document has no key, try to generate from _id or use default
            if '_id' in doc:
                doc['key'] = str(doc['_id'])
            else:
                doc['key'] = str(uuid.uuid4())
            logger.warning(f"Document missing key field, auto-generated: {doc['key']}")

    return {
        'list': data,
        'total': total,
        'pageNum': page_num,
        'pageSize': page_size,
        'totalPages': total_pages
    }

async def get_document_detail(params: Dict[str, Any]) -> Dict[str, Any]:
    collection_name = params.get('collection_name') or params.get('cname')
    doc_id = params.get('id')

    if not collection_name or not doc_id:
        raise ValueError("collection_name/cname and id are required")

    await db.initialize()
    collection = db.db[collection_name]
    projection = {'_id': 0}
    if collection_name == 'sessions':
        projection['pageContent'] = 0
    if collection_name == 'users':
        projection['password'] = 0
    document = await collection.find_one({'key': doc_id}, projection)

    if not document:
        raise ValueError(f"Data with ID {doc_id} not found")

    return document

async def create_document(params: Dict[str, Any]) -> Dict[str, Any]:
    collection_name = params.get('collection_name') or params.get('cname')
    data = params.get('data')

    if not collection_name:
        raise ValueError("Collection name (collection_name/cname) is required")

    if data is None:
        data = params.copy()
        data.pop('cname', None)
        data.pop('collection_name', None)

    await db.initialize()
    collection_name = _validate_collection_name(collection_name)
    if not data:
        raise ValueError("Create data cannot be empty")

    collection = db.db[collection_name]

    if collection_name == 'rss':
        link = data.get('link')
        if link:
            existing_item = await collection.find_one({'link': link})
            if existing_item:
                raise ValueError(f"Link field value '{link}' already exists, cannot create duplicate")

    data_copy = {k: (str(v) if isinstance(v, ObjectId) else v) for k, v in data.items()}
    current_time = get_current_time()
    # Honor a caller-supplied key (e.g. bugs' `bug_<ts>_<rand>` or sessions'
    # `aichat_<ts>_<rand>`) — the previous unconditional `str(uuid.uuid4())`
    # overwrote it, so bug.detail.vue showed a UUID while the markdown
    # file was written to `<caller_key>.md`, and the two never matched.
    if not data_copy.get('key'):
        data_copy['key'] = str(uuid.uuid4())
    data_copy.setdefault('createdTime', current_time)
    data_copy['updatedTime'] = current_time
    if collection_name == 'sessions':
        data_copy.pop('pageContent', None)

    try:
        max_order_doc = await collection.find_one(
            sort=[("order", -1)],
            projection={"order": 1}
        )
        max_order = max_order_doc.get("order", 0) if max_order_doc else 0
        data_copy['order'] = max_order + 1
    except Exception as e:
        logger.warning(f"Failed to get maximum sort value: {str(e)}")
        data_copy['order'] = 1

    try:
        await collection.insert_one(data_copy)
    except Exception as e:
        if 'duplicate key' in str(e).lower() or 'E11000' in str(e):
            if collection_name == 'rss':
                raise ValueError(f"Link field value '{data_copy.get('link', '')}' already exists, cannot create duplicate")
            else:
                raise ValueError("Data creation failed: unique constraint violation")
        raise

    return {'key': data_copy['key']}

async def update_document(params: Dict[str, Any]) -> Dict[str, Any]:
    collection_name = params.get('collection_name') or params.get('cname')
    data = params.get('data')
    file_path = params.get('file_path')

    if not collection_name:
        raise ValueError("Collection name (collection_name/cname) is required")
    if data is None:
        data = params.copy()
        data.pop('cname', None)
        data.pop('collection_name', None)
        data.pop('file_path', None)

    await db.initialize()
    collection_name = _validate_collection_name(collection_name)

    # sessions collection supports using file_path as query key
    if collection_name == 'sessions' and file_path:
        query_filter = {'file_path': file_path}
        query_label = f'file_path={file_path}'
    else:
        doc_id = data.get('key')
        if not doc_id:
            raise ValueError("Update data must contain key field")
        query_filter = {'key': doc_id}
        query_label = f'key={doc_id}'

    collection = db.db[collection_name]

    existing_doc = await collection.find_one(query_filter)
    if not existing_doc:
        # Upsert: insert the full data as a new document
        insert_data = data.copy()
        insert_data.pop('_id', None)
        insert_data['createdTime'] = get_current_time()
        insert_data['updatedTime'] = get_current_time()
        if collection_name == 'sessions':
            insert_data.pop('pageContent', None)
        await collection.insert_one(insert_data)
        return {'query': query_filter, 'created': True}

    # Remove non-updatable fields
    update_data = data.copy()
    update_data.pop('_id', None)
    update_data.pop('key', None)
    update_data.pop('createdTime', None)
    if collection_name == 'sessions':
        update_data.pop('pageContent', None)

    update_data['updatedTime'] = get_current_time()

    await collection.update_one(
        query_filter,
        {'$set': update_data}
    )

    return {'query': query_filter, 'updated': True}

async def upsert_document(params: Dict[str, Any]) -> Dict[str, Any]:
    collection_name = params.get('collection_name') or params.get('cname')
    filter_doc = params.get('filter')
    update_doc = params.get('update')

    if not collection_name:
        raise ValueError("Collection name (collection_name/cname) is required")
    if not filter_doc:
        raise ValueError("Filter (filter) is required")
    if not update_doc:
        raise ValueError("Update data (update) is required")

    await db.initialize()
    collection_name = _validate_collection_name(collection_name)
    collection = db.db[collection_name]

    # Ensure update_doc contains atomic operators
    if not any(k.startswith('$') for k in update_doc.keys()):
        # If no operator, assume $set
        update_doc = {'$set': update_doc}

    # Force add system fields
    if '$set' not in update_doc:
        update_doc['$set'] = {}
    update_doc['$set']['updatedTime'] = get_current_time()

    if '$setOnInsert' not in update_doc:
        update_doc['$setOnInsert'] = {}
    update_doc['$setOnInsert']['createdTime'] = get_current_time()

    if 'key' not in update_doc['$setOnInsert']:
        update_doc['$setOnInsert']['key'] = str(uuid.uuid4())
    if collection_name == 'sessions':
        if isinstance(update_doc.get('$set'), dict):
            update_doc['$set'].pop('pageContent', None)
            # If messages is an empty array, don't update (avoid overwriting existing message data)
            if 'messages' in update_doc['$set'] and update_doc['$set']['messages'] == []:
                update_doc['$set'].pop('messages', None)
        if isinstance(update_doc.get('$setOnInsert'), dict):
            update_doc['$setOnInsert'].pop('pageContent', None)

    result = await collection.update_one(filter_doc, update_doc, upsert=True)

    return {
        "matched_count": result.matched_count,
        "modified_count": result.modified_count,
        "upserted_id": str(result.upserted_id) if result.upserted_id else None
    }

async def count_documents(params: Dict[str, Any]) -> Dict[str, Any]:
    """Count documents in a collection, optionally grouped by a field.

    Args:
        params: { cname|collection_name, filter?: dict, groupBy?: str }

    Returns:
        If groupBy: { groups: [{value, count}], total: int }
        Otherwise:   { count: int }
    """
    collection_name = params.get('collection_name') or params.get('cname')
    if not collection_name:
        raise ValueError("Collection name (collection_name/cname) is required")

    query_params = params.copy()
    query_params.pop('cname', None)
    query_params.pop('collection_name', None)

    filter_param = query_params.pop('filter', None)
    if filter_param and isinstance(filter_param, dict):
        query_params.update(filter_param)

    group_by = query_params.pop('groupBy', None)

    await db.initialize()
    collection = db.db[collection_name]
    filter_dict = _build_filter(query_params)

    if group_by:
        pipeline = [
            {'$match': filter_dict},
            {'$group': {'_id': f'${group_by}', 'count': {'$sum': 1}}}
        ]
        cursor = collection.aggregate(pipeline)
        groups = [{'value': doc['_id'], 'count': doc['count']} async for doc in cursor]
        return {'groups': groups, 'total': sum(g['count'] for g in groups)}
    else:
        total = await collection.count_documents(filter_dict)
        return {'count': total}


async def delete_document(params: Dict[str, Any]) -> Dict[str, Any]:
    collection_name = params.get('collection_name') or params.get('cname')
    doc_id = params.get('key') or params.get('id')

    if not collection_name or not doc_id:
        raise ValueError("collection_name/cname and key are required")

    await db.initialize()
    collection_name = _validate_collection_name(collection_name)
    collection = db.db[collection_name]

    existing_doc = await collection.find_one({'key': doc_id})
    if not existing_doc:
        raise ValueError(f"Data with ID {doc_id} not found")

    if collection_name == "bugs":
        try:
            content_path = existing_doc.get("contentPath") or existing_doc.get("content_path") or ""
            if not content_path:
                project_key = (existing_doc.get("project_key") or existing_doc.get("project") or "unknown").lower()
                bug_type = existing_doc.get("type") or "other"
                type_dir = _BUG_TYPE_DIR.get(bug_type, "other")
                created_at_ms = existing_doc.get("createdAt") or existing_doc.get("created_time") or existing_doc.get("createdTime")
                if created_at_ms:
                    try:
                        date_str = datetime.fromtimestamp(int(created_at_ms) / 1000).strftime("%Y-%m-%d")
                    except (ValueError, OSError):
                        date_str = datetime.now().strftime("%Y-%m-%d")
                else:
                    date_str = datetime.now().strftime("%Y-%m-%d")
                content_path = f"projects/{project_key}/bugs/{date_str}/{type_dir}/{doc_id}.md"
            deleted_file = delete_entry_markdown(content_path)
            if deleted_file:
                logger.info(f"Deleted bug markdown file: {content_path}")
            else:
                logger.warning(f"Bug markdown file not found or failed to delete: {content_path}")
        except Exception as e:
            logger.warning(f"Failed to delete bug markdown for key={doc_id}: {e}")
    elif collection_name == "issues":
        try:
            content_path = existing_doc.get("contentPath") or existing_doc.get("content_path") or existing_doc.get("file_path") or ""
            if not content_path:
                project_key = (existing_doc.get("project_key") or existing_doc.get("project") or "unknown").lower()
                issue_type = existing_doc.get("issue_type") or "other"
                type_dir = _ISSUE_TYPE_DIR.get(issue_type, "other")
                date_source = (
                    existing_doc.get("created")
                    or existing_doc.get("start_date")
                    or existing_doc.get("created_at")
                    or existing_doc.get("createdAt")
                )
                date_str = None
                if date_source:
                    ds_str = str(date_source)[:10]
                    if len(ds_str) == 10 and ds_str[4] == "-" and ds_str[7] == "-":
                        date_str = ds_str
                    elif isinstance(date_source, (int, float)) or (isinstance(date_source, str) and date_source.isdigit()):
                        try:
                            date_str = datetime.fromtimestamp(int(date_source) / 1000).strftime("%Y-%m-%d")
                        except (ValueError, OSError):
                            pass
                if not date_str:
                    date_str = datetime.now().strftime("%Y-%m-%d")
                content_path = f"projects/{project_key}/issues/{date_str}/{type_dir}/{doc_id}.md"
            deleted_file = delete_entry_markdown(content_path)
            if deleted_file:
                logger.info(f"Deleted issue markdown file: {content_path}")
            else:
                logger.warning(f"Issue markdown file not found or failed to delete: {content_path}")
        except Exception as e:
            logger.warning(f"Failed to delete issue markdown for key={doc_id}: {e}")

    result = await collection.delete_one({'key': doc_id})

    if result.deleted_count == 0:
        raise ValueError(f"Data with ID {doc_id} not found")

    return {'key': doc_id, 'deleted': True}


async def list_story_task_dirs(params: Dict[str, Any]) -> Dict[str, Any]:
    """Query all story task directory listings under the story task panel in the sessions collection

    Iterate sessions collection, extract documents with projectName + storyName,
    deduplicate by projectName/storyName and return story task directory list.

    Args:
        params: Optional filter parameters
            - project_name: Filter by project name (optional)
            - page_num / page_size: Pagination (default 1 / 2000)

    Returns:
        {list: [{project_name, story_name, dir_path, session_count, latest_time}], total, ...}
    """
    await db.initialize()
    collection_name = settings.collection_sessions
    collection = db.db[collection_name]

    page_num = max(1, int(params.get('pageNum', params.get('page_num', 1))))
    page_size = min(8000, max(1, int(params.get('pageSize', params.get('page_size', 2000)))))
    project_filter = params.get('project_name', params.get('projectName'))

    match_stage: Dict[str, Any] = {
        'projectName': {'$exists': True, '$nin': [None, '']},
    }
    if project_filter:
        match_stage['projectName'] = project_filter

    pipeline: List[Dict[str, Any]] = [
        {'$match': match_stage},
        {
            '$group': {
                '_id': {
                    'projectName': '$projectName',
                    'storyName': '$storyName',
                },
                'session_count': {'$sum': 1},
                'latest_time': {'$max': '$updatedTime'},
            },
        },
        {'$sort': {'_id.projectName': 1, '_id.storyName': 1}},
        {'$skip': (page_num - 1) * page_size},
        {'$limit': page_size},
    ]

    cursor = collection.aggregate(pipeline)
    raw = [doc async for doc in cursor]

    dirs = []
    for doc in raw:
        proj = doc['_id']['projectName']
        story = doc['_id'].get('storyName', '')
        dirs.append({
            'project_name': proj,
            'story_name': story,
            'dir_path': f'docs/StoryTaskPanel/{proj}/{story}',
            'session_count': doc['session_count'],
            'latest_time': doc['latest_time'],
        })

    # count total via a lightweight aggregation
    count_pipeline: List[Dict[str, Any]] = [
        {'$match': match_stage},
        {'$group': {'_id': {'projectName': '$projectName', 'storyName': '$storyName'}}},
        {'$count': 'total'},
    ]
    count_cursor = collection.aggregate(count_pipeline)
    count_result = [c async for c in count_cursor]
    total = count_result[0]['total'] if count_result else 0

    return {
        'list': dirs,
        'total': total,
        'pageNum': page_num,
        'pageSize': page_size,
        'totalPages': (total + page_size - 1) // page_size if total else 0,
    }
