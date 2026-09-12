"""Cache key conventions and TTL configuration."""

import hashlib


def rag_query_key(query_text: str, knowledge_base: str = "default") -> str:
    content = f"{knowledge_base}:{query_text.strip().lower()}"
    return f"rag:query:{_hash(content)}"


def embedding_key(file_path: str, model_name: str) -> str:
    return f"emb:doc:{_hash(f'{file_path}:{model_name}')}"


def llm_response_key(messages_json: str, model_name: str) -> str:
    return f"llm:chat:{_hash(f'{model_name}:{messages_json}')}"


def data_document_key(collection: str, doc_id: str) -> str:
    return f"data:{collection}:{doc_id}"


def data_query_key(collection: str, filter_json: str) -> str:
    return f"data:query:{_hash(f'{collection}:{filter_json}')}"


def menu_tree_key() -> str:
    return "data:menus:tree"


def user_info_key(username: str) -> str:
    return f"data:users:{username}"


def _hash(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()[:16]


# TTL configuration (seconds)
CACHE_TTL = {
    "rag:query": 300,          # 5 minutes
    "emb:doc": 86400,          # 24 hours
    "llm:chat": 600,           # 10 minutes
    "data:document": 60,       # 1 minute
    "data:query": 60,          # 1 minute
    "data:menus": 3600,        # 1 hour
    "data:users": 300,         # 5 minutes
}