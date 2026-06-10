"""Configuration constants extracted from merge-batch-graphs.py for single-responsibility."""

# ── Node ID normalization ─────────────────────────────────────────────────
VALID_NODE_PREFIXES = {
    "file", "func", "function", "class", "module", "concept",
    "config", "document", "service", "table", "endpoint",
    "pipeline", "schema", "resource",
    "domain", "flow", "step",
    "article", "entity", "topic", "claim", "source",
}

TYPE_TO_PREFIX: dict[str, str] = {
    "file": "file",
    "function": "function",
    "func": "function",
    "class": "class",
    "module": "module",
    "concept": "concept",
    "config": "config",
    "document": "document",
    "service": "service",
    "table": "table",
    "endpoint": "endpoint",
    "pipeline": "pipeline",
    "schema": "schema",
    "resource": "resource",
    "domain": "domain",
    "flow": "flow",
    "step": "step",
    "article": "article",
    "entity": "entity",
    "topic": "topic",
    "claim": "claim",
    "source": "source",
}

# ── Complexity normalization ──────────────────────────────────────────────
COMPLEXITY_MAP: dict[str, str] = {
    "low": "simple",
    "easy": "simple",
    "medium": "moderate",
    "intermediate": "moderate",
    "high": "complex",
    "hard": "complex",
    "difficult": "complex",
}

VALID_COMPLEXITY = {"simple", "moderate", "complex"}

# ── Direction normalization ───────────────────────────────────────────────
_DIRECTION_ALIASES: dict[str, str] = {"both": "bidirectional", "mutual": "bidirectional"}
_VALID_DIRECTIONS: frozenset[str] = frozenset({"forward", "backward", "bidirectional"})

# ── Tested-by linker configuration ────────────────────────────────────────
_JS_TS_EXTS: tuple[str, ...] = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".vue")
_JS_TS_TEST_EXTS: frozenset[str] = frozenset(_JS_TS_EXTS)

_MIRROR_PRODUCTION_ROOTS: tuple[str, ...] = ("src", "app", "lib", "")

_TEST_NAME_PATTERNS: dict[str, tuple[tuple[str, ...], tuple[str, ...]]] = {
    ".go": ((), ("_test",)),
    ".py": (("test_",), ("_test",)),
    ".java": ((), ("Test", "Tests", "IT")),
    ".kt": ((), ("Test", "Tests")),
    ".cs": ((), ("Test", "Tests")),
    ".c": (("test_",), ("_test",)),
    ".cpp": (("test_",), ("_test",)),
    ".cc": (("test_",), ("_test",)),
}
