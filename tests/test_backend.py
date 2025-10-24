import pytest
from fastapi.testclient import TestClient
from fastapi import WebSocket
import json
from backend.main import app
import asyncio
import websockets

client = TestClient(app)

def test_api_root():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "WasteNot Africa API"}

@pytest.mark.asyncio
async def test_websocket_connection():
    """Test WebSocket connection and data flow"""
    async with websockets.connect("ws://localhost:8000/ws") as websocket:
        # Send test sensor data
        test_data = {
            "temperature": 28,
            "humidity": 65,  # Normal humidity
            "farmer_address": "0.0.test123"
        }
        await websocket.send(json.dumps(test_data))
        
        # Receive response
        response = await websocket.recv()
        data = json.loads(response)
        
        # Verify response structure
        assert "sensor_data" in data
        assert "alert" in data
        assert "reward_tokens" in data
        assert data["reward_tokens"] == 0  # No tokens for normal humidity
        assert "Mazao yako ni salama" in data["alert"]

@pytest.mark.asyncio
async def test_high_humidity_alert():
    """Test high humidity scenario with token minting"""
    async with websockets.connect("ws://localhost:8000/ws") as websocket:
        # Send high humidity data
        test_data = {
            "temperature": 28,
            "humidity": 75,  # High humidity
            "farmer_address": "0.0.test123"
        }
        await websocket.send(json.dumps(test_data))
        
        # Receive response
        response = await websocket.recv()
        data = json.loads(response)
        
        # Verify alert and token minting
        assert data["reward_tokens"] == 10
        assert "humidity" in data["alert"].lower()
        assert data["transaction_status"] == "SUCCESS"