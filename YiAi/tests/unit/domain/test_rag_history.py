"""Tests for domain/rag/history.py — in-memory ring buffer."""
import pytest
from domain.rag.history import (
    record_query,
    list_history,
    clear_history,
    MAX_HISTORY,
)


class TestRecordQuery:
    def test_records_basic_query(self):
        clear_history()
        record = record_query(
            question="What is RAG?",
            scope="engineer",
            top_k=5,
            sources=[{"content": "RAG combines retrieval with generation.", "score": 0.9}],
            latency_ms=45.2,
        )
        assert record["question"] == "What is RAG?"
        assert record["scope"] == "engineer"
        assert record["top_k"] == 5
        assert record["result_count"] == 1
        assert record["top_score"] == 0.9
        assert record["latency_ms"] == 45
        assert "id" in record
        assert "timestamp" in record

    def test_records_empty_sources(self):
        clear_history()
        record = record_query(
            question="test",
            scope="",
            top_k=5,
            sources=[],
            latency_ms=10,
        )
        assert record["result_count"] == 0
        assert record["top_score"] == 0.0
        assert record["avg_score"] == 0.0

    def test_records_config_fields(self):
        clear_history()
        record = record_query(
            question="test",
            scope="all",
            top_k=10,
            sources=[],
            latency_ms=50,
            hybrid=True,
            rerank=True,
            citations=True,
            num_queries=3,
            category="tech",
            tags=["python", "rag"],
        )
        assert record["config"]["hybrid"] is True
        assert record["config"]["rerank"] is True
        assert record["config"]["citations"] is True
        assert record["config"]["num_queries"] == 3
        assert record["config"]["category"] == "tech"
        assert record["config"]["tags"] == ["python", "rag"]

    def test_defaults_are_sane(self):
        clear_history()
        record = record_query(
            question="test",
            scope="",
            top_k=5,
            sources=[],
            latency_ms=10,
        )
        assert record["config"]["hybrid"] is False
        assert record["config"]["tags"] == []


class TestListHistory:
    def test_newest_first(self):
        clear_history()
        record_query(question="first", scope="", top_k=5, sources=[], latency_ms=10)
        record_query(question="second", scope="", top_k=5, sources=[], latency_ms=10)
        history = list_history()
        assert history[0]["question"] == "second"
        assert history[1]["question"] == "first"

    def test_empty_list(self):
        clear_history()
        assert list_history() == []


class TestMaxHistory:
    def test_trims_oldest(self):
        clear_history()
        for i in range(MAX_HISTORY + 5):
            record_query(question=f"q{i}", scope="", top_k=5, sources=[], latency_ms=10)
        history = list_history()
        assert len(history) == MAX_HISTORY
        assert history[0]["question"] == f"q{MAX_HISTORY + 4}"
        assert history[-1]["question"] == "q5"


class TestClearHistory:
    def test_clears_buffer(self):
        record_query(question="test", scope="", top_k=5, sources=[], latency_ms=10)
        clear_history()
        assert list_history() == []