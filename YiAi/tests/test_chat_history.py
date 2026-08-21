"""Tests for domain/rag/chat_history.py — in-memory chat history ring buffer."""
import pytest
from domain.rag.chat_history import (
    record_chat_turn,
    list_chat_history,
    clear_chat_history,
    MAX_CHAT_HISTORY,
)


class TestRecordChatTurn:
    def setup_method(self):
        clear_chat_history()

    def test_basic_record(self):
        record = record_chat_turn(
            question="What is YiVad?",
            answer="YiVad is an admin dashboard.",
            sources=[{"file_path": "test.md", "score": 0.95, "text": "content"}],
        )
        assert record["question"] == "What is YiVad?"
        assert record["answer"] == "YiVad is an admin dashboard."
        assert record["source_count"] == 1
        assert record["top_score"] == 0.95
        assert "id" in record

    def test_empty_sources(self):
        record = record_chat_turn(question="test", answer="answer", sources=[])
        assert record["source_count"] == 0
        assert record["top_score"] == 0.0
        assert record["avg_score"] == 0.0

    def test_sources_without_scores(self):
        record = record_chat_turn(
            question="test", answer="answer",
            sources=[{"file_path": "x.md"}],
        )
        assert record["top_score"] == 0.0

    def test_timestamp_present(self):
        record = record_chat_turn(question="test", answer="answer", sources=[])
        assert "timestamp" in record
        assert "T" in record["timestamp"]

    def test_config_block(self):
        record = record_chat_turn(
            question="test", answer="answer", sources=[],
            hybrid=True, rerank=False, citations=True, num_queries=3,
            category="engineer", tags=["vue"],
        )
        assert record["config"]["hybrid"] is True
        assert record["config"]["citations"] is True
        assert record["config"]["num_queries"] == 3
        assert record["config"]["category"] == "engineer"
        assert record["config"]["tags"] == ["vue"]

    def test_scope_preserved(self):
        record = record_chat_turn(
            question="test", answer="answer", sources=[],
            scope="engineer/learn/",
        )
        assert record["scope"] == "engineer/learn/"

    def test_latency_ms(self):
        record = record_chat_turn(
            question="test", answer="answer", sources=[],
            latency_ms=1234.5,
        )
        assert record["latency_ms"] == 1234

    def test_multiple_scores(self):
        record = record_chat_turn(
            question="test", answer="answer",
            sources=[
                {"file_path": "a.md", "score": 0.9},
                {"file_path": "b.md", "score": 0.5},
                {"file_path": "c.md", "score": 0.1},
            ],
        )
        assert record["source_count"] == 3
        assert record["top_score"] == 0.9
        assert record["avg_score"] == pytest.approx(0.5)


class TestListChatHistory:
    def setup_method(self):
        clear_chat_history()

    def test_newest_first(self):
        record_chat_turn(question="first", answer="a", sources=[])
        record_chat_turn(question="second", answer="b", sources=[])
        result = list_chat_history()
        assert result[0]["question"] == "second"
        assert result[1]["question"] == "first"

    def test_empty(self):
        clear_chat_history()
        assert list_chat_history() == []


class TestRingBuffer:
    def setup_method(self):
        clear_chat_history()

    def test_evicts_oldest(self):
        for i in range(MAX_CHAT_HISTORY + 5):
            record_chat_turn(question=f"q{i}", answer="a", sources=[])
        result = list_chat_history()
        assert len(result) == MAX_CHAT_HISTORY
        # Most recent is last inserted
        assert result[0]["question"] == f"q{MAX_CHAT_HISTORY + 4}"


class TestClear:
    def test_clear(self):
        record_chat_turn(question="test", answer="a", sources=[])
        clear_chat_history()
        assert list_chat_history() == []