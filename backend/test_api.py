"""Simple tests for the Emissions API.

These tests use FastAPI's TestClient. They are intended as a quick sanity
check. They require the same environment as the app (fastapi, uvicorn, pandas,
etc.).
"""
from pathlib import Path
from fastapi.testclient import TestClient

from backend.api_app import app, MANIFEST_PATH, MODEL_PATH


client = TestClient(app)


def test_health():
    r = client.get('/health')
    assert r.status_code == 200
    assert r.json() == {'status': 'ok'}


def test_metadata():
    r = client.get('/metadata')
    assert r.status_code == 200
    data = r.json()
    assert 'features' in data


def test_predict_minimal():
    # Call predict with an empty sample. The API will fill missing features with 0.
    r = client.post('/predict', json={'sample': {}})
    # If model file isn't present, API returns 503; otherwise 200 with JSON body.
    assert r.status_code in (200, 503, 400)
