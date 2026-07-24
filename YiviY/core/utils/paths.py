"""路径 / 文件名相关的纯字符串工具。

跨模块复用的小工具,不依赖 yt-dlp / torch / streamlit 等重型依赖,
所以可以无 try/except 直接导出。
"""
import re


def sanitize_filename(filename: str) -> str:
    """Remove or replace illegal characters from a filename.

    Strips characters that are illegal on common filesystems
    (``<>:"/\\|?*``), trims leading/trailing dots and spaces, and
    falls back to ``'video'`` if the result is empty.
    """
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    filename = filename.strip('. ')
    return filename if filename else 'video'
