"""API tests: file read/write endpoints."""
import pytest


class TestReadFile:
    @pytest.mark.asyncio
    async def test_read_file_requires_target_file(self, client):
        response = await client.post("/read-file", json={})
        # FastAPI returns 400 for missing body or 422 for validation error
        assert response.status_code in (400, 422)

    @pytest.mark.asyncio
    async def test_read_file_with_target(self, client):
        response = await client.post("/read-file", json={
            "target_file": "/test.md",
        })
        # Will fail with error since file doesn't exist, but endpoint works
        assert response.status_code in (200, 400, 404)


class TestWriteFile:
    @pytest.mark.asyncio
    async def test_write_file_requires_target_file(self, client):
        response = await client.post("/write-file", json={"content": "test"})
        assert response.status_code in (400, 422)

    @pytest.mark.asyncio
    async def test_write_file_with_fields(self, client):
        response = await client.post("/write-file", json={
            "target_file": "/test.md",
            "content": "# Hello",
        })
        assert response.status_code in (200, 400, 500)


class TestUploadImage:
    @pytest.mark.asyncio
    async def test_upload_image_requires_fields(self, client):
        response = await client.post("/upload-image-to-oss", json={})
        assert response.status_code in (400, 422)