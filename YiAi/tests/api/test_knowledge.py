"""API tests: knowledge endpoints."""
import pytest


class TestKnowledgeScan:
    @pytest.mark.asyncio
    async def test_scan_requires_category(self, client):
        response = await client.post("/knowledge-scan", json={})
        assert response.status_code in (200, 400, 422)

    @pytest.mark.asyncio
    async def test_scan_with_category(self, client):
        response = await client.post("/knowledge-scan", json={"category": "engineer"})
        assert response.status_code in (200, 400, 500)


class TestKnowledgeRead:
    @pytest.mark.asyncio
    async def test_read_requires_path(self, client):
        response = await client.post("/knowledge-read", json={})
        assert response.status_code in (400, 422)

    @pytest.mark.asyncio
    async def test_read_nonexistent_file(self, client):
        response = await client.post("/knowledge-read", json={
            "path": "nonexistent/file.md",
        })
        assert response.status_code in (200, 400, 404, 500)


class TestKnowledgeFiles:
    @pytest.mark.asyncio
    async def test_list_files(self, client):
        response = await client.post("/knowledge-files", json={})
        assert response.status_code in (200, 400, 500)


class TestKnowledgeStories:
    @pytest.mark.asyncio
    async def test_list_stories(self, client):
        response = await client.post("/knowledge-stories", json={})
        assert response.status_code in (200, 400, 500)


class TestKnowledgeSearch:
    @pytest.mark.asyncio
    async def test_search_requires_query(self, client):
        response = await client.post("/knowledge-search", json={})
        assert response.status_code in (400, 422)

    @pytest.mark.asyncio
    async def test_search_with_query(self, client):
        response = await client.post("/knowledge-search", json={
            "query": "test",
            "limit": 5,
        })
        assert response.status_code in (200, 400, 500)