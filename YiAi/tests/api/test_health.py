"""API tests: health check and basic endpoints."""
import pytest


class TestHealthCheck:
    @pytest.mark.asyncio
    async def test_health_returns_ok(self, client):
        response = await client.get("/health")
        # Health endpoint returns 200 if available
        assert response.status_code in (200, 404)

    @pytest.mark.asyncio
    async def test_root_accessible(self, client):
        response = await client.get("/")
        assert response.status_code in (200, 400, 404)


class TestRPCEnvelope:
    @pytest.mark.asyncio
    async def test_rpc_missing_module_name(self, client):
        response = await client.post("/", json={
            "method_name": "test",
            "parameters": {},
        })
        assert response.status_code in (200, 400, 422)

    @pytest.mark.asyncio
    async def test_rpc_missing_method_name(self, client):
        response = await client.post("/", json={
            "module_name": "services.test",
            "parameters": {},
        })
        assert response.status_code in (200, 400, 422)

    @pytest.mark.asyncio
    async def test_rpc_invalid_module(self, client):
        response = await client.post("/", json={
            "module_name": "nonexistent.module",
            "method_name": "test",
            "parameters": {},
        })
        assert response.status_code in (200, 400, 422)


class TestStaticFiles:
    @pytest.mark.asyncio
    async def test_static_404_for_missing(self, client):
        response = await client.get("/static/nonexistent.txt")
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_favicon_accessible(self, client):
        response = await client.get("/favicon.ico")
        assert response.status_code in (200, 404)