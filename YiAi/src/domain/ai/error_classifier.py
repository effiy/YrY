"""Error classification for AI chat — Pi-inspired user-friendly messages."""

_ERROR_PATTERNS = {
    "connection_refused": "Cannot connect to the AI service. Please check that the LLM server is running and reachable.",
    "connection_error": "Connection to AI service lost. The server may be restarting or unreachable. Please try again in a moment.",
    "timeout": "The AI service took too long to respond. This may be due to high load or a complex query. Please try again with a shorter message.",
    "model_not_found": "The requested model is not available. Please check the model name or install it on the server.",
    "context_overflow": "The conversation is too long for the model's context window. Please start a new conversation or summarize the previous discussion.",
    "rate_limit": "Too many requests. Please wait a moment before sending another message.",
    "unknown": "An unexpected error occurred. Please try again.",
}


def classify_error(error: str) -> dict[str, str]:
    error_lower = (error or "").lower()
    if any(kw in error_lower for kw in ("connection refused", "connect", "econnrefused")):
        return {"type": "connection_refused", "message": _ERROR_PATTERNS["connection_refused"]}
    if any(kw in error_lower for kw in ("timeout", "timed out")):
        return {"type": "timeout", "message": _ERROR_PATTERNS["timeout"]}
    if any(kw in error_lower for kw in ("not found", "not_found", "no such model")):
        return {"type": "model_not_found", "message": _ERROR_PATTERNS["model_not_found"]}
    if any(kw in error_lower for kw in ("context", "overflow", "token limit", "too long")):
        return {"type": "context_overflow", "message": _ERROR_PATTERNS["context_overflow"]}
    if any(kw in error_lower for kw in ("rate", "throttl", "too many")):
        return {"type": "rate_limit", "message": _ERROR_PATTERNS["rate_limit"]}
    if any(kw in error_lower for kw in ("connection", "network", "unreachable", "dns")):
        return {"type": "connection_error", "message": _ERROR_PATTERNS["connection_error"]}
    return {"type": "unknown", "message": _ERROR_PATTERNS["unknown"]}
