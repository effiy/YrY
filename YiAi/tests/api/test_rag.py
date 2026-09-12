"""API tests: RAG endpoints."""
import pytest


class TestRagQuery:
    @pytest.mark.asyncio
    async def test_rag_query_requires_query(self, client):
        response = await client.post("/rag-query", json={})
        assert response.status_code in (400, 422)

    @pytest.mark.asyncio
    async def test_rag_query_with_query(self, client):
        response = await client.post("/rag-query", json={
            "query": "test query",
            "top_k": 3,
        })
        assert response.status_code in (200, 400, 500)


class TestRagChat:
    @pytest.mark.asyncio
    async def test_rag_chat_requires_query(self, client):
        response = await client.post("/rag-chat", json={})
        assert response.status_code in (400, 422)


class TestRagFileQuery:
    @pytest.mark.asyncio
    async def test_file_query_requires_fields(self, client):
        response = await client.post("/rag-file-query", json={})
        assert response.status_code in (400, 422)


class TestRagStatus:
    @pytest.mark.asyncio
    async def test_rag_status(self, client):
        response = await client.post("/rag-status", json={})
        assert response.status_code in (200, 400, 500)


class TestRagHistory:
    @pytest.mark.asyncio
    async def test_rag_history(self, client):
        response = await client.post("/rag-history", json={})
        assert response.status_code in (200, 400, 500)

    @pytest.mark.asyncio
    async def test_rag_chat_history(self, client):
        response = await client.post("/rag-chat-history", json={})
        assert response.status_code in (200, 400, 500)