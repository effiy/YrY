"""Integration tests for domain/rag/chat_history.py — in-memory ring buffer."""
import pytest
from domain.rag.chat_history import (
    record_chat_turn,
    list_chat_history,
    clear_chat_history,
    MAX_CHAT_HISTORY,
)


class TestRecordChatTurn:
    def test_records_basic_turn(self):
        clear_chat_history()
        record = record_chat_turn(
            question="What is RAG?",
            answer="RAG is Retrieval-Augmented Generation.",
            sources=[{"content": "RAG combines retrieval with generation.", "score": 0.9}],
        )
        assert record["question"] == "What is RAG?"
        assert record["answer"] == "RAG is Retrieval-Augmented Generation."
        assert record["source_count"] == 1
        assert record["top_score"] == 0.9
        assert "id" in record
        assert "timestamp" in record

    def test_records_empty_sources(self):
        clear_chat_history()
        record = record_chat_turn(
            question="test",
            answer="no sources found",
            sources=[],
        )
        assert record["source_count"] == 0
        assert record["top_score"] == 0.0
        assert record["avg_score"] == 0.0

    def test_records_config_fields(self):
        clear_chat_history()
        record = record_chat_turn(
            question="test",
            answer="answer",
            sources=[],
            scope="engineer",
            chat_mode="best",
            latency_ms=150.5,
            hybrid=True,
            rerank=True,
            citations=True,
            num_queries=3,
            category="tech",
            tags=["python", "rag"],
        )
        assert record["scope"] == "engineer"
        assert record["chat_mode"] == "best"
        assert record["latency_ms"] == 150
        assert record["config"]["hybrid"] is True
        assert record["config"]["rerank"] is True
        assert record["config"]["citations"] is True
        assert record["config"]["num_queries"] == 3
        assert record["config"]["category"] == "tech"
        assert record["config"]["tags"] == ["python", "rag"]

    def test_defaults_are_sane(self):
        clear_chat_history()
        record = record_chat_turn(
            question="test",
            answer="answer",
            sources=[],
        )
        assert record["scope"] == ""
        assert record["config"]["hybrid"] is False
        assert record["config"]["tags"] == []


class TestListChatHistory:
    def test_newest_first(self):
        clear_chat_history()
        record_chat_turn(question="first", answer="a1", sources=[])
        record_chat_turn(question="second", answer="a2", sources=[])
        history = list_chat_history()
        assert history[0]["question"] == "second"
        assert history[1]["question"] == "first"

    def test_empty_list(self):
        clear_chat_history()
        assert list_chat_history() == []


class TestMaxHistory:
    def test_trims_oldest(self):
        clear_chat_history()
        for i in range(MAX_CHAT_HISTORY + 5):
            record_chat_turn(question=f"q{i}", answer="a", sources=[])
        history = list_chat_history()
        assert len(history) == MAX_CHAT_HISTORY
        assert history[0]["question"] == f"q{MAX_CHAT_HISTORY + 4}"
        assert history[-1]["question"] == "q5"


class TestClearChatHistory:
    def test_clears_buffer(self):
        record_chat_turn(question="test", answer="a", sources=[])
        clear_chat_history()
        assert list_chat_history() == []