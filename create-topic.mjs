// create-topic.mjs
import { Client, PrivateKey, TopicCreateTransaction } from '@hashgraph/sdk';
import 'dotenv/config';

const client = Client.forTestnet().setOperator(
  process.env.HEDERA_ACCOUNT_ID,
  PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY)
);

const tx = await new TopicCreateTransaction()
  .setTopicMemo("WasteNot Africa Alerts")
  .execute(client);

const receipt = await tx.getReceipt(client);
console.log("🔖 Topic ID:", receipt.topicId.toString());
console.log(`🔗 View: https://hashscan.io/testnet/topic/${receipt.topicId}`);

client.close();