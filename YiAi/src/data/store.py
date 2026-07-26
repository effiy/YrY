import logging
import re
import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from bson import ObjectId
from pymongo import ReturnDocument

from data.database import db
from shared.config import settings

logger = logging.getLogger(__name__)

class MongoDBService:
    """
    MongoDB database service wrapper
    Provides common database operations and data cleaning utilities
    """
    def __init__(self):
        """Initialize MongoDB service instance"""
        self.db_client = db

    async def ensure_initialized(self):
        """Ensure database connection is initialized"""
        await self.db_client.initialize()

    def is_valid_date(self, date_str: str) -> bool:
        """
        Validate if date string format is valid (YYYY-MM-DD)

        Args:
            date_str: Date string

        Returns:
            bool: Whether valid
        """
        if not isinstance(date_str, str):
            return False
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
            return True
        except ValueError:
            return False

    def is_number(self, value: Any) -> bool:
        """
        Validate if value is a number

        Args:
            value: Value to validate

        Returns:
            bool: Whether it is a number
        """
        if value is None:
            return False
        try:
            float(value)
            return True
        except (ValueError, TypeError):
            return False

    def parse_published_date(self, date_str: str) -> Optional[datetime]:
        """
        Parse published date in multiple formats

        Args:
            date_str: Date string

        Returns:
            Optional[datetime]: Parsed datetime object, returns None on failure
        """
        if not date_str:
            return None

        date_formats = [
            '%a, %d %b %Y %H:%M:%S %z',
            '%a, %d %b %Y %H:%M:%S',
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d',
            '%d %b %Y',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M:%S%z',
        ]

        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue

        return None

    def build_published_date_filter(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """
        Build published date query filter

        Args:
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)

        Returns:
            Dict[str, Any]: MongoDB query criteria
        """
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')

            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            date_patterns = []
            iso_date_values = []
            current_dt = start_dt

            while current_dt <= end_dt:
                year = current_dt.year
                month = current_dt.month
                day = current_dt.day
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

    def build_filter(self, query_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build MongoDB filter criteria from query parameters

        Args:
            query_params: Query parameters dictionary

        Returns:
            Dict[str, Any]: MongoDB filter dictionary
        """
        filter_dict = {}

        for key, value in query_params.items():
            if not value:
                continue

            if key == 'isoDate' and isinstance(value, str):
                if ',' in value:
                    date_parts = [term.strip() for term in value.split(',') if term.strip()]
                    if len(date_parts) == 2:
                        start_date, end_date = date_parts
                        if self.is_valid_date(start_date) and self.is_valid_date(end_date):
                            published_filter = self.build_published_date_filter(start_date, end_date)
                            if published_filter:
                                filter_dict.update(published_filter)
                            continue
                else:
                    if self.is_valid_date(value):
                        published_filter = self.build_published_date_filter(value, value)
                        if published_filter:
                            filter_dict.update(published_filter)
                            continue

            if hasattr(value, '__iter__') and not isinstance(value, (str, bytes, dict)):
                value_list = list(value) if not isinstance(value, list) else value
                if not value_list:
                    continue

                if len(value_list) == 2:
                    start, end = value_list
                    if self.is_valid_date(start) and self.is_valid_date(end):
                        filter_dict[key] = {'$gte': start, '$lt': end}
                    elif self.is_number(start) and self.is_number(end):
                        filter_dict[key] = {'$gte': float(start), '$lt': float(end)}
                    elif self.is_number(start):
                        filter_dict[key] = {'$gte': float(start)}
                    elif self.is_number(end):
                        filter_dict[key] = {'$lt': float(end)}
                else:
                    filter_dict[key] = {'$in': value_list}

            elif isinstance(value, str):
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

            elif isinstance(value, (int, float, bool)):
                filter_dict[key] = value

        return filter_dict

    def get_current_time(self) -> str:
        """
        Get current UTC time string

        Returns:
            str: Formatted time string (YYYY-MM-DD HH:MM:SS)
        """
        return datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

    def validate_collection_name(self, cname: Optional[str]) -> str:
        """
        Validate collection name exists

        Args:
            cname: Collection name

        Returns:
            str: Validated collection name

        Raises:
            ValueError: If collection name is empty
        """
        if not cname:
            raise ValueError("Collection name (cname) must be provided")
        return cname

    def build_sort_list(self, sort_param: str, sort_order: int) -> List[tuple]:
        """
        Build sort list

        Args:
            sort_param: Sort field name
            sort_order: Sort direction (1 or -1)

        Returns:
            List[tuple]: Sort criteria list
        """
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

    async def query_documents(self, cname: str, query_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Query document list

        Args:
            cname: Collection name
            query_params: Query parameters

        Returns:
            Dict[str, Any]: Dictionary containing list data and pagination info
        """
        await self.ensure_initialized()
        
        cname = self.validate_collection_name(cname)
        
        fields_param = query_params.pop('fields', None) or query_params.pop('select', None)
        exclude_fields_param = query_params.pop('excludeFields', None) or query_params.pop('exclude', None)

        try:
            page_num = max(1, int(query_params.pop('pageNum', 1)))
            page_size = min(8000, max(1, int(query_params.pop('pageSize', 2000))))
        except ValueError:
            raise ValueError("Pagination parameters must be valid integers")

        sort_param = query_params.pop('orderBy', 'timestamp' if cname == 'apis' else 'order')
        sort_order = -1 if query_params.pop('orderType', 'asc').lower() == 'desc' else 1

        filter_dict = self.build_filter(query_params)
        logger.info(f"Querying collection: {cname}, Filter: {filter_dict}")
        sort_list = self.build_sort_list(sort_param, sort_order)
        
        projection = {'_id': 0}
        if fields_param:
            fields = [f.strip() for f in str(fields_param).split(',') if f.strip()]
            if 'key' not in fields:
                fields.append('key')
            projection = {'_id': 0, **{f: 1 for f in fields}}
        elif exclude_fields_param:
            exclude_fields = [f.strip() for f in str(exclude_fields_param).split(',') if f.strip()]
            projection = {'_id': 0, **{f: 0 for f in exclude_fields}}

        collection = self.db_client.db[cname]
        
        cursor = collection.find(filter_dict, projection) \
            .sort(sort_list) \
            .skip((page_num - 1) * page_size) \
            .limit(page_size)

        data = [doc async for doc in cursor]
        total = await collection.count_documents(filter_dict)
        total_pages = (total + page_size - 1) // page_size

        return {
            'list': data,
            'total': total,
            'pageNum': page_num,
            'pageSize': page_size,
            'totalPages': total_pages
        }

    async def get_document_detail(self, cname: str, id: str) -> Dict[str, Any]:
        await self.ensure_initialized()
        
        collection = self.db_client.db[cname]
        document = await collection.find_one({'key': id}, {'_id': 0})

        if not document:
            raise ValueError(f"Data with ID {id} not found")

        return document

    async def create_document(self, cname: str, data: Dict[str, Any]) -> Dict[str, Any]:
        await self.ensure_initialized()
        
        cname = self.validate_collection_name(cname)
        if not data:
            raise ValueError("Create data cannot be empty")

        collection = self.db_client.db[cname]

        if cname == 'rss':
            link = data.get('link')
            if link:
                existing_item = await collection.find_one({'link': link})
                if existing_item:
                    raise ValueError(f"Link field value '{link}' already exists, cannot create duplicate")

        data_copy = {k: (str(v) if isinstance(v, ObjectId) else v) for k, v in data.items()}
        current_time = self.get_current_time()
        data_copy.update({
            'key': str(uuid.uuid4()),
            'createdTime': current_time,
            'updatedTime': current_time
        })

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
                if cname == 'rss':
                    raise ValueError(f"Link field value '{data_copy.get('link', '')}' already exists, cannot create duplicate")
                else:
                    raise ValueError(f"Data creation failed: unique constraint violation")
            raise

        return {'key': data_copy['key']}

    async def update_document(self, cname: str, data: Dict[str, Any]) -> str:
        """
        Update document

        Args:
            cname: Collection name
            data: Update data (must contain key or link)

        Returns:
            str: Updated document key

        Raises:
            ValueError: Missing identifier field or constraint violation
        """
        await self.ensure_initialized()
        
        cname = self.validate_collection_name(cname)
        
        key = data.get('key')
        link = data.get('link')
        content = data.get('content')

        if key:
            query_filter = {'key': key}
            identifier = key
            identifier_type = 'key'
        elif link:
            query_filter = {'link': link}
            identifier = link
            identifier_type = 'link'
        else:
            raise ValueError("Must provide key field or link field when updating data")

        excluded_fields = ['key'] if key else []
        data_for_check = {k: v for k, v in data.items() if k not in excluded_fields}
        if not data_for_check:
            raise ValueError("Update data cannot be empty")

        collection = self.db_client.db[cname]

        if cname == settings.collection_rss:
            new_link = data.get('link')
            if new_link:
                existing_item = await collection.find_one({'link': new_link})
                if existing_item:
                    existing_key = existing_item.get('key')
                    if key:
                        if existing_key != key:
                            raise ValueError(f"Link field value '{new_link}' is already used by another record (key: {existing_key})")
                    elif link:
                        if new_link != link and existing_key:
                            raise ValueError(f"Link field value '{new_link}' is already used by another record (key: {existing_key})")
            
            if key:
                data['key'] = key
            
            if content:
                data['contentHash'] = hashlib.md5(content.encode('utf-8')).hexdigest()

        update_data = {k: v for k, v in data.items() if k not in (['key'] if key else [])}
        update_data['updatedTime'] = self.get_current_time()

        try:
            result = await collection.find_one_and_update(
                query_filter,
                {"$set": update_data},
                return_document=ReturnDocument.AFTER
            )
        except Exception as e:
            if 'duplicate key' in str(e).lower() or 'E11000' in str(e):
                if cname == settings.collection_rss:
                    new_link = data.get('link')
                    raise ValueError(f"Link field value '{new_link}' already exists, cannot duplicate")
                else:
                    raise ValueError(f"Data update failed: unique constraint violation")
            raise

        if not result:
            raise ValueError(f"Data with {identifier_type} {identifier} not found")

        return result.get('key', identifier)

    async def delete_document(self, cname: str, id: str) -> bool:
        """
        Delete document

        Args:
            cname: Collection name
            id: Document Key

        Returns:
            bool: Whether deletion succeeded

        Raises:
            ValueError: Deletion failed (not found)
        """
        await self.ensure_initialized()
        
        cname = self.validate_collection_name(cname)
        
        collection = self.db_client.db[cname]
        result = await collection.delete_one({'key': id})
        
        if result.deleted_count == 0:
            raise ValueError(f"Data with ID {id} not found")

        return True

    async def upsert_document(self, cname: str, filter_dict: Dict[str, Any], update_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update or insert document (upsert)

        Args:
            cname: Collection name
            filter_dict: Query criteria
            update_data: Update data (MongoDB update syntax like $set, $setOnInsert)

        Returns:
            Dict[str, Any]: Operation result
        """
        await self.ensure_initialized()
        collection = self.db_client.db[cname]
        
        # Ensure update_data includes updatedTime
        if '$set' not in update_data:
            update_data['$set'] = {}
        update_data['$set']['updatedTime'] = self.get_current_time()

        # Ensure createdTime and key are included on insert
        if '$setOnInsert' not in update_data:
            update_data['$setOnInsert'] = {}
        update_data['$setOnInsert']['createdTime'] = self.get_current_time()
        if 'key' not in update_data['$setOnInsert']:
            update_data['$setOnInsert']['key'] = str(uuid.uuid4())
        
        result = await collection.update_one(filter_dict, update_data, upsert=True)
        
        return {
            "matched_count": result.matched_count,
            "modified_count": result.modified_count,
            "upserted_id": str(result.upserted_id) if result.upserted_id else None
        }
