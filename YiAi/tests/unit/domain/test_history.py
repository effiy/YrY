"""Tests for domain/rag/history.py — in-memory retrieval history ring buffer."""
import pytest
from domain.rag.history import (
    record_query,
    list_history,
    clear_history,
    MAX_HISTORY,
)


class TestRecordQuery:
    def setup_method(self):
        clear_history()

    def test_basic_record(self):
        record = record_query(
            question="What is YiVad?",
            scope="engineer/",
            top_k=5,
            sources=[{"file_path": "test.md", "score": 0.95, "text": "content"}],
            latency_ms=150.0,
        )
        assert record["question"] == "What is YiVad?"
        assert record["scope"] == "engineer/"
        assert record["top_k"] == 5
        assert record["result_count"] == 1
        assert record["top_score"] == 0.95
        assert record["latency_ms"] == 150
        assert "id" in record

    def test_empty_sources(self):
        record = record_query(
            question="test", scope="", top_k=3, sources=[], latency_ms=50.0,
        )
        assert record["result_count"] == 0
        assert record["top_score"] == 0.0
        assert record["avg_score"] == 0.0

    def test_timestamp_present(self):
        record = record_query(
            question="test", scope="", top_k=3, sources=[], latency_ms=50.0,
        )
        assert "timestamp" in record
        assert "T" in record["timestamp"]

    def test_config_block(self):
        record = record_query(
            question="test", scope="", top_k=3, sources=[], latency_ms=50.0,
            hybrid=True, rerank=False, citations=True, num_queries=3,
            category="engineer", tags=["vue"],
        )
        assert record["config"]["hybrid"] is True
        assert record["config"]["citations"] is True
        assert record["config"]["num_queries"] == 3
        assert record["config"]["category"] == "engineer"
        assert record["config"]["tags"] == ["vue"]

    def test_multiple_scores(self):
        record = record_query(
            question="test", scope="", top_k=3, latency_ms=50.0,
            sources=[
                {"file_path": "a.md", "score": 0.9},
                {"file_path": "b.md", "score": 0.5},
                {"file_path": "c.md", "score": 0.1},
            ],
        )
        assert record["result_count"] == 3
        assert record["top_score"] == 0.9
        assert record["avg_score"] == pytest.approx(0.5)


class TestListHistory:
    def setup_method(self):
        clear_history()

    def test_newest_first(self):
        record_query(question="first", scope="", top_k=3, sources=[], latency_ms=50.0)
        record_query(question="second", scope="", top_k=3, sources=[], latency_ms=50.0)
        result = list_history()
        assert result[0]["question"] == "second"
        assert result[1]["question"] == "first"

    def test_empty(self):
        assert list_history() == []


class TestRingBuffer:
    def setup_method(self):
        clear_history()

    def test_evicts_oldest(self):
        for i in range(MAX_HISTORY + 5):
            record_query(question=f"q{i}", scope="", top_k=3, sources=[], latency_ms=50.0)
        result = list_history()
        assert len(result) == MAX_HISTORY
        assert result[0]["question"] == f"q{MAX_HISTORY + 4}"


class TestClear:
    def test_clear(self):
        record_query(question="test", scope="", top_k=3, sources=[], latency_ms=50.0)
        clear_history()
        assert list_history() == []