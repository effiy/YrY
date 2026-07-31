"""Utility functions"""
import re
import json
import hashlib
import random
import string
import math
from typing import Union, Any, List, Dict, Optional, Generator
from datetime import datetime, timezone

# --- Text Processing ---

def estimate_tokens(text: Union[str, bytes]) -> int:
    """
    Estimate token count for text (simplified)
    ASCII characters (e.g. English) ~4 chars per token (0.25)
    Non-ASCII characters (e.g. CJK) count as 1 token
    """
    if not isinstance(text, str):
        return 0

    token_count = 0
    for char in text:
        if ord(char) > 127:
            token_count += 1
        else:
            token_count += 0.25

    return int(token_count)

def clean_text(text: str) -> str:
    """
    Clean text: strip leading/trailing whitespace, replace consecutive whitespace with single space
    """
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def truncate_text(text: str, length: int, ellipsis: str = "...") -> str:
    """
    Truncate text, append ellipsis if exceeds length
    """
    if not text or len(text) <= length:
        return text
    return text[:length] + ellipsis

def generate_md5(text: str) -> str:
    """Generate MD5 hash of string"""
    return hashlib.md5(text.encode('utf-8')).hexdigest()

def generate_random_string(length: int = 8, chars: str = string.ascii_letters + string.digits) -> str:
    """Generate random string of specified length"""
    return ''.join(random.choice(chars) for _ in range(length))

def extract_json_from_text(text: str) -> Optional[Union[Dict, List]]:
    """
    Try to extract and parse JSON from text
    Supports extracting JSON from markdown code blocks (```json ... ```)
    """
    if not text:
        return None

    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to extract Markdown code block
    pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
    match = re.search(pattern, text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try to find first { or [ to last } or ]
    try:
        start_idx = -1
        end_idx = -1

        # Find possible start position
        first_brace = text.find('{')
        first_bracket = text.find('[')

        if first_brace != -1 and (first_bracket == -1 or first_brace < first_bracket):
            start_idx = first_brace
        elif first_bracket != -1:
            start_idx = first_bracket

        # Find possible end position
        last_brace = text.rfind('}')
        last_bracket = text.rfind(']')

        if last_brace != -1 and (last_bracket == -1 or last_brace > last_bracket):
            end_idx = last_brace
        elif last_bracket != -1:
            end_idx = last_bracket

        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            json_str = text[start_idx:end_idx+1]
            return json.loads(json_str)
    except Exception:
        pass

    return None

# --- Time & Date ---

def get_current_time() -> str:
    """Get current UTC time string (ISO 8601 format with Z)"""
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

def is_valid_date(date_str: str) -> bool:
    """Validate date string format (YYYY-MM-DD)"""
    if not isinstance(date_str, str):
        return False
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False

# --- Numbers & Files ---

def is_number(value: Any) -> bool:
    """Validate if value is a number"""
    # bool 是 int 子类，但语义上不是数字；nan/inf 会破坏 Mongo 数值范围查询
    if value is None or isinstance(value, bool):
        return False
    try:
        result = float(value)
    except (ValueError, TypeError):
        return False
    if math.isnan(result) or math.isinf(result):
        return False
    return True

def format_file_size(size_in_bytes: int) -> str:
    """
    Convert byte size to human-readable format (KB, MB, GB)
    """
    if size_in_bytes == 0:
        return "0B"
    size_name = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
    i = int(math.floor(math.log(size_in_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_in_bytes / p, 2)
    return f"{s} {size_name[i]}"


def format_tokens(tokens: int) -> str:
    """
    Convert token count to human-readable format (K, M)
    Preserves full number for display while providing simplified version
    """
    if tokens < 1000:
        return f"{tokens}"
    elif tokens < 1000000:
        return f"{tokens/1000:.1f}K"
    else:
        return f"{tokens/1000000:.1f}M"


def format_tokens_with_commas(tokens: int) -> str:
    """
    Format token count with thousands separator
    """
    return f"{tokens:,}"

# --- Collection Processing ---

def chunk_list(lst: List[Any], size: int) -> Generator[List[Any], None, None]:
    """
    Split list into chunks of specified size
    """
    for i in range(0, len(lst), size):
        yield lst[i:i + size]
