from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
from typing import Dict, List
import asyncio
from datetime import datetime
import json
import google.generativeai as genai
from hedera import (
    Client, PrivateKey, ContractId, 
    ContractExecuteTransaction, ContractCallQuery,
    Hbar
)

# Load contract ABIs
import json
with open('artifacts/contracts/WasteToken.sol/WasteToken.json') as f:
    WASTE_TOKEN_ABI = json.load(f)['abi']
with open('artifacts/contracts/SpoilagePreventionAgent.sol/SpoilagePreventionAgent.json') as f:
    AGENT_ABI = json.load(f)['abi']

# Load environment variables
load_dotenv()

app = FastAPI(title="WasteNot Africa API")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections
active_connections: List[WebSocket] = []

# Initialize Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.0-pro")

# Initialize Hedera client
try:
    client = Client.forTestnet().setOperator(
        os.getenv("HEDERA_ACCOUNT_ID"),
        PrivateKey.fromStringECDSA(os.getenv("HEDERA_PRIVATE_KEY"))
    )
    
    # Initialize contract IDs
    waste_token_id = ContractId.fromString(os.getenv("WASTE_TOKEN_ADDRESS"))
    agent_contract_id = ContractId.fromString(os.getenv("AGENT_CONTRACT_ADDRESS"))
    
except Exception as e:
    print(f"Failed to initialize Hedera client: {e}")
    client = None
    waste_token_id = None
    agent_contract_id = None

# WebSocket connection manager
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            
            # Process sensor data through agent
            sensor_data = {
                "temperature": data.get("temperature", 0),
                "humidity": data.get("humidity", 0),
                "timestamp": datetime.now().isoformat()
            }

            # Generate Swahili alert if needed
            if sensor_data["humidity"] > 70:
                response = await model.generate_content(
                    "Translate to Swahili and format as an urgent alert: "
                    f"Warning! High humidity detected ({sensor_data['humidity']}%). "
                    "Move produce to shaded area for 24 hours."
                )
                alert = response.text
            else:
                alert = "Mazao yako ni salama!"

            # Broadcast to all clients
            broadcast_data = {
                "sensor_data": sensor_data,
                "alert": alert,
                "reward_tokens": 10 if sensor_data["humidity"] > 70 else 0
            }
            
            await asyncio.gather(*[
                conn.send_json(broadcast_data) 
                for conn in active_connections
            ])
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        active_connections.remove(websocket)

@app.get("/")
async def root():
    return {"message": "WasteNot Africa API"}

@app.get("/api/balance")
async def get_balance():
    if not client:
        raise HTTPException(status_code=500, message="Hedera client not initialized")
    try:
        balance = await client.get_account_balance(os.getenv("OPERATOR_ID"))
        return {"balance": str(balance)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/create-waste-token")
async def create_waste_token(token_data: Dict):
    if not client:
        raise HTTPException(status_code=500, detail="Hiero client not initialized")
    try:
        # Using the Hiero SDK to create a token
        # This is a placeholder - implement actual token creation logic
        token_props = {
            "name": token_data.get("name", "WASTE"),
            "symbol": token_data.get("symbol", "WST"),
            "decimals": token_data.get("decimals", 2)
        }
        response = await client.create_token(token_props)
        return {"token_id": str(response.token_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)