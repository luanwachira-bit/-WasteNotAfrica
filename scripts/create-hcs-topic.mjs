import { Client, PrivateKey, TopicCreateTransaction } from "@hashgraph/sdk";
import 'dotenv/config';

async function createHCSTopic() {
    // Check for environment variables
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        throw new Error("❌ HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be present in .env file");
    }

    console.log("📡 Creating HCS Topic for WasteNot Africa...");

    // Create Hedera client
    const client = Client.forTestnet()
        .setOperator(
            process.env.HEDERA_ACCOUNT_ID,
            PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY)
        );

    try {
        // Create a new topic
        const transaction = new TopicCreateTransaction()
            .setTopicMemo("WasteNot Africa - Spoilage Prevention System")
            .setSubmitKey(PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY).publicKey);

        // Sign and submit
        const txResponse = await transaction.execute(client);

        // Get the receipt
        const receipt = await txResponse.getReceipt(client);

        // Get the topic ID
        const topicId = receipt.topicId;

        console.log(`✅ Topic created successfully!`);
        console.log(`🔑 Topic ID: ${topicId.toString()}`);
        console.log(`\n⚠️ Important: Add this topic ID to your .env file as HEDERA_TOPIC_ID`);

        return topicId.toString();

    } catch (error) {
        console.error("❌ Error creating topic:", error);
        throw error;
    } finally {
        client.close();
    }
}

// Run the creation
createHCSTopic()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });