"""Query transformation utilities for the RAG engine.

Pure heuristic functions — no I/O, no LLM calls. Time-sensitivity detection,
date-context injection, and planning-request recognition.

Public surface (used by engine.py + response_synthesizer.py):
    - ``_enhance_query_for_retrieval(question)`` → enriched query string
    - ``_is_time_sensitive(question)``           → bool
    - ``_is_planning_request(question)``         → bool
    - ``_get_date_context()``                    → dict of date strings
    - ``_detect_time_sensitivity(question)``     → str | None
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import re

# Time-sensitive query patterns for query enhancement + date-aware prompt.
# Ordered from most specific to least specific — first match wins.
_TIME_PATTERNS = [
    (re.compile(r"今天|今日|\btoday\b"), "today"),
    (re.compile(r"昨天|昨日|\byesterday\b"), "yesterday"),
    (re.compile(r"明天|明日|\btomorrow\b"), "tomorrow"),
    (re.compile(r"后天|the day after tomorrow"), "day_after_tomorrow"),
    (re.compile(r"最近|近期|近来|\brecently\b|\blately\b|过去几天|这几天|近几天|近[三日]天"), "recent"),
    (re.compile(r"本周|这周|这个星期|这星期|\bthis week\b"), "this_week"),
    (re.compile(r"上周|上个星期|上星期|\blast week\b"), "last_week"),
    (re.compile(r"下周|下个星期|下星期|\bnext week\b"), "next_week"),
    (re.compile(r"本月|这个月|这月|\bthis month\b"), "this_month"),
    (re.compile(r"上月|上个月|上月份|\blast month\b"), "last_month"),
    (re.compile(r"今年|今年来|本年|\bthis year\b"), "this_year"),
    (re.compile(r"刚[刚才]|刚刚|just now|不久前"), "just_now"),
    (re.compile(r"可能发生|可能会|预测|将会|未来|前景|趋势|展望|预期|预计"), "predictive"),
    (re.compile(r"(?:最近|近期|过去)(?:有什么|有哪些|什么)新(?:消息|进展|动态|变化|情况)"), "recent"),
    (re.compile(r"最新|最近更新|最新消息|最新进展|最新动态"), "recent"),
]

# Planning intent patterns — detect when the user wants a schedule/plan.
_PLANNING_PATTERNS = [
    re.compile(r"安排.*计划|计划.*安排|帮我安排|制定.*计划|规划|日程"),
    re.compile(r"(今天|明天|今日|明日).*(做什么|干什么|安排|计划|日程)"),
    re.compile(r"根据.*(昨天|最近|近期).*(安排|计划)"),
]


def _get_date_context() -> dict[str, str]:
    """Return current date information for prompt injection."""
    now = datetime.now(timezone.utc)
    yesterday = now - timedelta(days=1)
    last_week = now - timedelta(days=7)
    # first day of last month
    if now.month == 1:
        last_month_start = datetime(now.year - 1, 12, 1)
    else:
        last_month_start = datetime(now.year, now.month - 1, 1)
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    weekday = weekdays[now.weekday()]
    return {
        "current_date": f"{now.strftime('%Y-%m-%d')} ({weekday})",
        "iso_date": now.strftime("%Y-%m-%d"),
        "year": str(now.year),
        "month": now.strftime("%Y-%m"),
        "yesterday": yesterday.strftime("%Y-%m-%d"),
        "last_week": last_week.strftime("%Y-%m-%d"),
        "last_month": last_month_start.strftime("%Y-%m"),
    }


def _detect_time_sensitivity(question: str) -> str | None:
    """Detect if a question has time-sensitive or predictive intent.

    Returns None if no patterns detected, or a category string like
    "today", "predictive", "this_week", etc.
    """
    text = question.lower()
    for pattern, category in _TIME_PATTERNS:
        if pattern.search(text):
            return category
    return None


def _is_time_sensitive(question: str) -> bool:
    """Check if question contains time-sensitive or predictive language."""
    return _detect_time_sensitivity(question) is not None


def _is_planning_request(question: str) -> bool:
    """Check if the question is asking for a schedule or daily plan."""
    return any(pattern.search(question) for pattern in _PLANNING_PATTERNS)


def _is_standalone_question(question: str) -> bool:
    """Check if a question is self-contained — no pronouns or follow-up markers.

    Standalone questions don't need LLM condensation because they don't
    reference prior conversation turns. Skipping condensation saves ~0.5-1s.
    """
    q = (question or "").strip()
    if len(q) < 15:
        return False  # very short — likely needs context

    q_lower = q.lower()

    # Follow-up markers — these always reference prior context
    followup = ("and ", "also ", "what about ", "how about ", "so ", "then ",
                "那 ", "还有 ", "那么 ", "另外 ", "此外 ", "所以 ", "然后 ")
    for f in followup:
        if q_lower.startswith(f):
            return False

    # Pronouns — indicate reference to prior turns
    pronouns = (" it ", " they ", " this ", " that ", " these ", " those ",
                " he ", " she ", " him ", " her ", " them ", " its ", " their ",
                " 它 ", " 他 ", " 她 ", " 这 ", " 那 ", " 其 ", " 此 ")
    return all(p not in f" {q_lower} " for p in pronouns)


def _extract_keywords(question: str) -> str:
    """Extract key terms from a query to boost BM25 retrieval.

    For Chinese: identifies 2-4 character sequences that look like named
    entities or technical terms (containing Chinese chars, not pure stop words).
    For English: extracts words >3 chars, excluding common stop words.

    Returns a space-separated string of up to 5 key terms, or empty string
    if nothing meaningful is found. Appended to the retrieval query to improve
    BM25 keyword matching without degrading vector embedding quality.
    """
    import re

    # English stop words (lowercase)
    _stop = {
        "what", "when", "where", "which", "who", "whom", "whose", "why", "how",
        "this", "that", "these", "those", "there", "their", "they", "them",
        "about", "above", "after", "again", "been", "being", "below", "between",
        "both", "could", "does", "doing", "down", "during", "each", "from",
        "have", "having", "here", "into", "just", "like", "more", "most",
        "much", "over", "same", "should", "some", "such", "than", "then",
        "under", "until", "very", "with", "would", "your", "the", "and",
        "for", "are", "but", "not", "you", "all", "can", "had", "her",
        "was", "one", "our", "out", "has", "did", "get", "its", "let",
    }

    # Chinese stop characters/words — filtered from keyword extraction
    _cn_stop = {
        "是什么", "什么是", "为什么", "怎么样", "如何", "哪些", "哪个", "哪里",
        "什么时候", "怎么", "多少", "请问", "帮我", "能否", "可以", "应该",
        "需要", "是否", "的", "了", "吗", "呢", "吧", "啊", "哦", "嗯",
        "在", "是", "有", "和", "与", "或", "及", "等", "我", "你", "他", "她",
        "这", "那", "一个", "这个", "那个", "什么", "最近", "近期", "近来", "最新", "目前", "当前", "现在", "今天",
        "昨天", "明天", "已经", "还是", "可能", "不会", "不是",
        "没有", "知道", "觉得", "认为", "能够", "进行", "使用",
        "通过", "关于", "对于", "根据", "按照", "因为", "所以", "但是",
        "虽然", "如果", "的话", "来说", "之后", "之前", "以后", "以前",
        "一下", "一些", "一种", "各种", "其他", "不同", "相关", "有关",
        "项目", "进展", "怎样", "情况", "问题", "方法", "方式",
        "过程", "结果", "内容", "信息", "数据", "资料", "文档", "文件",
    }

    terms: list[str] = []
    q = question.strip()

    # Extract Chinese bigrams/trigrams that look like content terms
    # Use sliding windows of 2-3 chars, step 1, for better coverage
    cn_chars = re.findall(r"[\u4e00-\u9fff]+", q)
    for word in cn_chars:
        if len(word) < 2:
            continue
        # For short words (2-3 chars), check directly
        if 2 <= len(word) <= 3:
            if word not in _cn_stop and word not in terms:
                terms.append(word)
        else:
            # For longer sequences, take 2-3 char sliding windows
            for i in range(len(word) - 1):
                for sz in (2, 3):
                    if i + sz <= len(word):
                        chunk = word[i:i + sz]
                        if chunk not in _cn_stop and chunk not in terms:
                            terms.append(chunk)
                    if len(terms) >= 8:  # early stop
                        break
                if len(terms) >= 8:
                    break

    # Extract English key terms (>3 chars, not stop words)
    en_words = re.findall(r"[a-zA-Z]{4,}", q)
    for w in en_words:
        wl = w.lower()
        if wl not in _stop and wl not in terms:
            terms.append(w)

    # Limit to top 5 terms to avoid polluting the query
    return " ".join(terms[:5])


def _enhance_query_for_retrieval(question: str) -> str:
    """Add date context and keywords for better retrieval.

    For time-sensitive queries, adds date prefixes. For all other queries,
    extracts key terms and appends them to boost BM25 keyword matching
    without polluting the vector embedding.
    """
    time_cat = _detect_time_sensitivity(question)
    is_planning = _is_planning_request(question)

    # Planning without specific time reference → default to recent range
    if is_planning and not time_cat:
        date_ctx = _get_date_context()
        return f"{date_ctx['yesterday']} {date_ctx['iso_date']} {question}"

    if not time_cat:
        # Extract keywords to boost BM25 retrieval for non-time queries
        kw = _extract_keywords(question)
        return f"{question} {kw}" if kw else question

    date_ctx = _get_date_context()

    # Only add date prefixes for explicitly anchored time references.
    # "recent", "predictive", "just_now" are handled by the date-aware
    # prompt — adding date strings to the embedding query adds noise.
    anchored = {
        "today": date_ctx["current_date"],
        "yesterday": date_ctx["yesterday"],
        "tomorrow": f"{date_ctx['iso_date']} upcoming",
        "day_after_tomorrow": f"{date_ctx['iso_date']} upcoming",
        "this_week": date_ctx["month"],
        "last_week": date_ctx["last_week"],
        "next_week": f"{date_ctx['month']} upcoming",
        "this_month": date_ctx["month"],
        "last_month": date_ctx["last_month"],
        "this_year": date_ctx["year"],
    }

    prefix = anchored.get(time_cat)
    if prefix:
        return f"{prefix} {question}"

    # For "recent", "just_now", "predictive" — no date prefix needed;
    # the date-aware system prompt handles these
    return question
