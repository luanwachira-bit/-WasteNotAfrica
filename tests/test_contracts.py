import pytest
import asyncio
import os
from datetime import datetime
from hedera import Client, PrivateKey, ContractId
from dotenv import load_dotenv
from backend.hedera_contracts import HederaContractManager

# Load environment variables
load_dotenv()

@pytest.fixture
def hedera_client():
    """Initialize Hedera testnet client"""
    client = Client.forTestnet().setOperator(
        os.getenv("HEDERA_ACCOUNT_ID"),
        PrivateKey.fromStringECDSA(os.getenv("HEDERA_PRIVATE_KEY"))
    )
    yield client
    client.close()

@pytest.fixture
def waste_token(hedera_client):
    """Initialize WasteToken contract manager"""
    contract_id = ContractId.fromString(os.getenv("WASTE_TOKEN_ADDRESS"))
    with open('artifacts/contracts/WasteToken.sol/WasteToken.json') as f:
        abi = json.load(f)['abi']
    return HederaContractManager(hedera_client, contract_id, abi)

@pytest.fixture
def agent_contract(hedera_client):
    """Initialize SpoilagePreventionAgent contract manager"""
    contract_id = ContractId.fromString(os.getenv("AGENT_CONTRACT_ADDRESS"))
    with open('artifacts/contracts/SpoilagePreventionAgent.sol/SpoilagePreventionAgent.json') as f:
        abi = json.load(f)['abi']
    return HederaContractManager(hedera_client, contract_id, abi)

@pytest.mark.asyncio
async def test_waste_token_deployment(waste_token):
    """Test if WasteToken is properly deployed"""
    # Query token name
    name = await waste_token.query_contract("name")
    assert name == "WasteNot Africa Token"
    
    # Query token symbol
    symbol = await waste_token.query_contract("symbol")
    assert symbol == "WASTE"

@pytest.mark.asyncio
async def test_spoilage_prevention_agent(agent_contract, hedera_client):
    """Test spoilage prevention agent functionality"""
    # Test event processing with high humidity
    event_id = hash(f"test_event_{datetime.now().timestamp()}")
    humidity = 75
    alert = "Test Alert"
    
    status = await agent_contract.execute_contract(
        "logSpoilageRiskAndReward",
        [event_id, humidity, alert]
    )
    assert status == "SUCCESS"

@pytest.mark.asyncio
async def test_token_minting_flow(agent_contract, waste_token, hedera_client):
    """Test complete token minting flow"""
    # Get initial balance
    operator_id = os.getenv("HEDERA_ACCOUNT_ID")
    initial_balance = await waste_token.query_contract(
        "balanceOf",
        [operator_id]
    )
    
    # Trigger spoilage prevention event
    event_id = hash(f"test_mint_{datetime.now().timestamp()}")
    status = await agent_contract.execute_contract(
        "logSpoilageRiskAndReward",
        [event_id, 80, "High Humidity Alert"]
    )
    assert status == "SUCCESS"
    
    # Check new balance
    new_balance = await waste_token.query_contract(
        "balanceOf",
        [operator_id]
    )
    assert new_balance > initial_balance