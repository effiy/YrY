"""Code health analysis constants."""

import re

CACHE_COLLECTION = "code_health_cache"
CACHE_TTL_SECONDS = 3600

DEFAULT_EXTENSIONS = {".vue", ".ts", ".tsx", ".js", ".jsx", ".scss", ".css", ".py"}
DEFAULT_DUPLICATE_MIN_LINES = 6
DEFAULT_MAX_FILE_WARN = 300
DEFAULT_MAX_FILE_DANGER = 600
DEFAULT_COMMENT_RATE_WARN = 0.10
DEFAULT_COMMENT_RATE_DANGER = 0.05
DEFAULT_REUSE_RATE_WARN = 2.0
DEFAULT_REUSE_RATE_DANGER = 1.0
DEFAULT_DUPLICATE_RATE_WARN = 0.05
DEFAULT_DUPLICATE_RATE_DANGER = 0.15

_COMMENT_PATTERNS: dict[str, list[tuple[str, str | None]]] = {
    ".vue": [("//", None), ("/*", "*/"), ("<!--", "-->")],
    ".ts": [("//", None), ("/*", "*/")],
    ".tsx": [("//", None), ("/*", "*/"), ("<!--", "-->")],
    ".js": [("//", None), ("/*", "*/")],
    ".jsx": [("//", None), ("/*", "*/")],
    ".scss": [("//", None), ("/*", "*/")],
    ".css": [("/*", "*/")],
    ".py": [("#", None), ('"""', '"""'), ("'''", "'''")],
}

_VUE_IMPORT_RE = re.compile(
    r"""import\s+(?:(?:\{[^}]*\}|[\w*]+)\s*,?\s*)*\s*"""
    r"""from\s+['"]([^'"]+\.vue)['"]""",
    re.MULTILINE,
)
_VUE_COMPONENT_RE = re.compile(
    r"""import\s+(\w+)\s+from\s+['"]([^'"]+\.vue)['"]""",
    re.MULTILINE,
)
