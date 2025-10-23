from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from typing import Dict
from hiero_sdk_python import Client

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

# Initialize Hiero client
try:
    client = Client()  # Will use environment variables automatically
except Exception as e:
    print(f"Failed to initialize Hiero client: {e}")
    client = None

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