"""Health endpoint smoke test."""

import asyncio

from httpx import ASGITransport, AsyncClient
from main import app


def test_api_health_returns_200_and_healthy_status() -> None:
    """GET /api/health returns 200 with httpx.AsyncClient against the ASGI app."""

    async def _run() -> None:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/health")
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "healthy"

    asyncio.run(_run())
