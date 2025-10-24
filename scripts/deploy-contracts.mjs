import { Client, PrivateKey, ContractCreateFlow, ContractFunctionParameters } from "@hashgraph/sdk";
import { ethers } from "ethers";
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Load contract artifacts (ABIs and Bytecode)
const wasteTokenArtifact = JSON.parse(
    fs.readFileSync(
        path.join(process.cwd(), 'artifacts/contracts/WasteToken.sol/WasteToken.json'),
        'utf8'
    )
);

const spoilageAgentArtifact = JSON.parse(
    fs.readFileSync(
        path.join(process.cwd(), 'artifacts/contracts/SpoilagePreventionAgent.sol/SpoilagePreventionAgent.json'),
        'utf8'
    )
);

async function deployContracts() {
    console.log("🚀 Starting contract deployment to Hedera Testnet...");

    // Check environment variables
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        throw new Error("❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env");
    }

    // Initialize Hedera client
    const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
    const client = Client.forTestnet()
        .setOperator(process.env.HEDERA_ACCOUNT_ID, operatorKey);

    try {
        // 1. Deploy WasteToken
        console.log("\n📝 Deploying WasteToken...");
        const wasteTokenBytecode = wasteTokenArtifact.bytecode;
        
        let contractTx = await new ContractCreateFlow()
            .setGas(1000000)
            .setBytecode(wasteTokenBytecode)
            .setConstructorParameters(
                new ContractFunctionParameters()
                    // No constructor parameters for WasteToken
            )
            .execute(client);

        let receipt = await contractTx.getReceipt(client);
        const wasteTokenAddress = receipt.contractId.toString();
        console.log(`✅ WasteToken deployed at: ${wasteTokenAddress}`);

        // 2. Deploy SpoilagePreventionAgent
        console.log("\n📝 Deploying SpoilagePreventionAgent...");
        const agentBytecode = spoilageAgentArtifact.bytecode;
        
        contractTx = await new ContractCreateFlow()
            .setGas(1000000)
            .setBytecode(agentBytecode)
            .setConstructorParameters(
                new ContractFunctionParameters()
                    .addAddress(wasteTokenAddress) // Pass WasteToken address to constructor
            )
            .execute(client);

        receipt = await contractTx.getReceipt(client);
        const agentAddress = receipt.contractId.toString();
        console.log(`✅ SpoilagePreventionAgent deployed at: ${agentAddress}`);

        // Update .env file with contract addresses
        const envAdditions = `
# Contract Addresses (Deployed ${new Date().toISOString()})
WASTE_TOKEN_ADDRESS=${wasteTokenAddress}
AGENT_CONTRACT_ADDRESS=${agentAddress}
`;

        fs.appendFileSync('.env', envAdditions);
        console.log("\n✅ Updated .env with contract addresses");

        // Return deployed addresses
        return {
            wasteTokenAddress,
            agentAddress
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    } finally {
        client.close();
    }
}

// Deploy contracts
deployContracts()
    .then((addresses) => {
        console.log("\n🎉 Deployment completed successfully!");
        console.log("📍 Addresses:", addresses);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Deployment failed:", error);
        process.exit(1);
    });