"""Tests for models/schemas.py — Pydantic model validation."""
import pytest
from models.schemas import (
    ExecuteRequest,
    AgentChatRequest,
    FileReadRequest,
    FileWriteRequest,
    FileDeleteRequest,
    FolderDeleteRequest,
    FileRenameRequest,
    FolderRenameRequest,
    KnowledgeScanRequest,
    KnowledgeReadRequest,
    KnowledgeWriteRequest,
    KnowledgeDeleteRequest,
    RagQueryRequest,
    RagChatRequest,
    RagFileChatRequest,
    StateRecord,
    StateQueryRequest,
    SkillExecutionRecord,
    ChatMode,
)


class TestExecuteRequest:
    def test_defaults(self):
        req = ExecuteRequest()
        assert req.module_name == ""
        assert req.method_name == ""
        assert req.parameters == {}

    def test_valid_request(self):
        req = ExecuteRequest(
            module_name="services.database.data_service",
            method_name="query_documents",
            parameters={"cname": "sessions"}
        )
        assert req.module_name == "services.database.data_service"
        assert req.method_name == "query_documents"
        assert req.parameters == {"cname": "sessions"}

    def test_parameters_as_json_string(self):
        req = ExecuteRequest(parameters='{"cname": "sessions"}')
        assert req.parameters == '{"cname": "sessions"}'


class TestAgentChatRequest:
    def test_defaults(self):
        req = AgentChatRequest()
        assert req.messages == []
        assert req.model == "qwen3.5:4b"
        assert req.max_turns == 10
        assert req.resume is False

    def test_with_messages(self):
        req = AgentChatRequest(
            messages=[{"role": "user", "content": "hello"}],
            session_id="abc123"
        )
        assert len(req.messages) == 1
        assert req.session_id == "abc123"


class TestFileRequests:
    def test_read_request(self):
        req = FileReadRequest(target_file="notes/test.md")
        assert req.target_file == "notes/test.md"

    def test_write_request(self):
        req = FileWriteRequest(target_file="notes/test.md", content="# Hello")
        assert req.content == "# Hello"

    def test_delete_request(self):
        req = FileDeleteRequest(target_file="notes/test.md")
        assert req.target_file == "notes/test.md"

    def test_folder_delete(self):
        req = FolderDeleteRequest(target_dir="notes/old")
        assert req.target_dir == "notes/old"

    def test_rename_request(self):
        req = FileRenameRequest(old_path="a.md", new_path="b.md")
        assert req.old_path == "a.md"
        assert req.new_path == "b.md"

    def test_folder_rename(self):
        req = FolderRenameRequest(old_dir="old", new_dir="new")
        assert req.old_dir == "old"
        assert req.new_dir == "new"


class TestKnowledgeRequests:
    def test_scan_default(self):
        req = KnowledgeScanRequest()
        assert req.category is None

    def test_scan_with_category(self):
        req = KnowledgeScanRequest(category="engineer")
        assert req.category == "engineer"

    def test_read(self):
        req = KnowledgeReadRequest(target_file="notes/test.md")
        assert req.target_file == "notes/test.md"

    def test_write(self):
        req = KnowledgeWriteRequest(
            target_file="notes/test.md",
            content="# Hello",
            metadata={"title": "Test", "tags": ["a", "b"]}
        )
        assert req.content == "# Hello"
        assert req.metadata["title"] == "Test"

    def test_delete(self):
        req = KnowledgeDeleteRequest(target_file="notes/test.md")
        assert req.target_file == "notes/test.md"


class TestRagRequests:
    def test_query_request(self):
        req = RagQueryRequest(question="What is YiVad?")
        assert req.question == "What is YiVad?"
        assert req.top_k is None

    def test_query_with_scope(self):
        req = RagQueryRequest(question="test", scope="engineer/", top_k=5)
        assert req.scope == "engineer/"
        assert req.top_k == 5

    def test_chat_request(self):
        req = RagChatRequest(messages=[{"role": "user", "content": "hello"}])
        assert len(req.messages) == 1

    def test_chat_request_empty_messages_raises(self):
        with pytest.raises(Exception):
            RagChatRequest(messages=[])

    def test_file_chat_request(self):
        req = RagFileChatRequest(target_file="notes/test.md", question="what?")
        assert req.target_file == "notes/test.md"
        assert req.question == "what?"


class TestStateRecord:
    def test_defaults(self):
        rec = StateRecord(record_type="test")
        assert rec.record_type == "test"
        assert rec.key == ""
        assert rec.payload == {}
        assert rec.tags == []

    def test_full(self):
        rec = StateRecord(
            key="rec1",
            record_type="conversation_summary",
            title="Summary",
            payload={"text": "hello"},
            tags=["important"]
        )
        assert rec.key == "rec1"
        assert rec.title == "Summary"


class TestStateQueryRequest:
    def test_defaults(self):
        req = StateQueryRequest()
        assert req.page_num == 1
        assert req.page_size == 2000

    def test_page_size_out_of_range_raises(self):
        with pytest.raises(Exception):
            StateQueryRequest(page_size=10000)

    def test_page_num_negative_raises(self):
        with pytest.raises(Exception):
            StateQueryRequest(page_num=0)


class TestSkillExecutionRecord:
    def test_valid_status(self):
        rec = SkillExecutionRecord(
            skill_name="test-skill",
            status="success",
            duration_ms=150.0
        )
        assert rec.status == "success"

    def test_invalid_status_raises(self):
        with pytest.raises(Exception):
            SkillExecutionRecord(
                skill_name="test",
                status="invalid",
                duration_ms=100.0
            )

    def test_negative_duration_raises(self):
        with pytest.raises(Exception):
            SkillExecutionRecord(
                skill_name="test",
                status="success",
                duration_ms=-1.0
            )


class TestChatMode:
    def test_valid_values(self):
        assert ChatMode.CONDENSE_PLUS_CONTEXT == "condense_plus_context"
        assert ChatMode.CONDENSE_QUESTION == "condense_question"
        assert ChatMode.CONTEXT == "context"
        assert ChatMode.SIMPLE == "simple"

    def test_invalid_value_raises(self):
        with pytest.raises(Exception):
            ChatMode("invalid")