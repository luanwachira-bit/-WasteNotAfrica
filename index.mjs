// index.mjs
import 'dotenv/config';
import {
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenType
} from '@hashgraph/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// === 1. SETUP ===
const client = Client.forTestnet().setOperator(
  process.env.HEDERA_ACCOUNT_ID,
  PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY)
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// === 2. SIMULATE IOT DATA ===
const sensorData = {
  temperature: 28,
  humidity: 75,
  timestamp: new Date().toISOString()
};

console.log("📡 Simulated Sensor Data:", sensorData);

// === 3. GET AI ALERT FROM GEMINI ===
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
const prompt = `You are an agricultural advisor in Kenya. Respond in Swahili only, with a maximum of 15 words. The current humidity is ${sensorData.humidity}%. Give one urgent tip to prevent tomato spoilage.`;

const result = await model.generateContent(prompt);
const response = await result.response;
const aiAlert = response.text();
console.log("🤖 AI Alert:", aiAlert);

// === 4. CREATE TOPIC (RUN ONCE, THEN HARD-CODE ID) ===
// Uncomment ONLY on first run, then replace TOPIC_ID below
/*
const topicTx = await new TopicCreateTransaction()
  .setTopicMemo("WasteNot Africa Alerts")
  .execute(client);
const topicReceipt = await topicTx.getReceipt(client);
const TOPIC_ID = topicReceipt.topicId;
console.log("🔖 Topic Created:", TOPIC_ID.toString());
*/

const TOPIC_ID = "0.0.7119131"; // ← Paste your topic ID here after first run

// === 5. SUBMIT TO HEDERA CONSENSUS ===
const message = JSON.stringify({ ...sensorData, alert: aiAlert });
const submitTx = await new TopicMessageSubmitTransaction()
  .setTopicId(TOPIC_ID)
  .setMessage(message)
  .execute(client);

const submitReceipt = await submitTx.getReceipt(client);
console.log("✅ Message submitted. Sequence:", submitReceipt.topicSequenceNumber);
console.log(`🔗 View on HashScan: https://hashscan.io/testnet/topic/${TOPIC_ID}?transactionId=${submitReceipt.transactionId}`);

// === 6. CREATE & MINT TOKENS (IF HUMIDITY > 70%) ===
if (sensorData.humidity > 70) {
  // Create WASTE token (run once, then hard-code ID)
  /*
  const tokenTx = await new TokenCreateTransaction()
    .setTokenName("WasteNot Token")
    .setTokenSymbol("WASTE")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(1000000) // 10,000 WASTE
    .setTreasuryAccountId(client.operatorAccountId)
    .setSupplyKey(client.operatorPublicKey) // <-- THE FIX IS HERE
    .execute(client);
  const tokenReceipt = await tokenTx.getReceipt(client);
  const TOKEN_ID = tokenReceipt.tokenId;
  console.log("🪙 Token Created:", TOKEN_ID.toString());
  */

  const TOKEN_ID = "0.0.7119139"; // ← Paste your token ID here

  // Mint 10 tokens to farmer (yourself for demo)
  const mintTx = await new TokenMintTransaction()
    .setTokenId(TOKEN_ID)
    .setAmount(1000) // 10.00 WASTE (2 decimals)
    .execute(client);
  
  const mintReceipt = await mintTx.getReceipt(client);
  console.log("🎁 10 WASTE tokens minted!");
  console.log(`🔗 Token Tx: https://hashscan.io/testnet/transaction/${mintReceipt.transactionId}`);
}

client.close();
console.log("\n🎉 Prototype complete! All data is on Hedera testnet.");
