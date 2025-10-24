from typing import Optional
from hedera import ContractExecuteTransaction, ContractCallQuery, Hbar

class HederaContractManager:
    def __init__(self, client, contract_id, abi):
        self.client = client
        self.contract_id = contract_id
        self.abi = abi

    async def execute_contract(self, function_name: str, params: list = None, gas: int = 100000) -> str:
        """Execute a contract transaction"""
        try:
            tx = ContractExecuteTransaction()\
                .setContractId(self.contract_id)\
                .setGas(gas)\
                .setFunction(function_name, params or [])\
                .setMaxTransactionFee(Hbar(2))

            response = await tx.executeAsync(self.client)
            receipt = await response.getReceiptAsync(self.client)
            
            return receipt.status.toString()
        except Exception as e:
            print(f"Contract execution failed: {e}")
            raise

    async def query_contract(self, function_name: str, params: list = None) -> bytes:
        """Query a contract view function"""
        try:
            query = ContractCallQuery()\
                .setContractId(self.contract_id)\
                .setGas(100000)\
                .setFunction(function_name, params or [])\
                .setQueryPayment(Hbar(1))

            response = await query.executeAsync(self.client)
            return response.getBytes()
        except Exception as e:
            print(f"Contract query failed: {e}")
            raise