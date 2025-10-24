import { Client, PrivateKey, TopicMessageSubmitTransaction, TokenMintTransaction } from "@hashgraph/sdk";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Tool } from '@langchain/core/tools';
import 'dotenv/config';

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

const client = Client.forTestnet().setOperator(
  process.env.HEDERA_ACCOUNT_ID,
  PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY)
);

// Define tools
class SubmitToHCSTool extends Tool {
  name = "submit_to_hcs";
  description = "Submit a JSON message to a Hedera Consensus Service topic";

  constructor(topicId) {
    super();
    this.topicId = topicId;
  }

  async _call(message) {
    try {
      const tx = await new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(message)
        .execute(client);

      const receipt = await tx.getReceipt(client);
      return `Message submitted to ${this.topicId}. Sequence: ${receipt.topicSequenceNumber}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
}

class MintWasteTokensTool extends Tool {
  name = "mint_waste_tokens";
  description = "Mint WASTE tokens to operator account";

  constructor(tokenId) {
    super();
    this.tokenId = tokenId;
  }

  async _call(amount) {
    try {
      const tx = await new TokenMintTransaction()
        .setTokenId(this.tokenId)
        .setAmount(parseInt(amount))
        .execute(client);

      const receipt = await tx.getReceipt(client);
      return `✅ ${amount} WASTE tokens minted. Tx: ${tx.transactionId}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
}

// Placeholder IDs - will be replaced after contract deployment
export const hcsTool = new SubmitToHCSTool("0.0.7119414"); // Created on Oct 24, 2025
export const tokenTool = new MintWasteTokensTool("0.0.5678");
export { model };