import { Client, PrivateKey, ContractId } from '@hashgraph/sdk';
import { HEDERA_CONFIG } from '../config';

class HederaService {
  private static instance: HederaService;
  private client: Client;

  private constructor() {
    this.client = Client.forNetwork(HEDERA_CONFIG.network as any)
      .setOperator(
        HEDERA_CONFIG.accountId!,
        PrivateKey.fromStringECDSA(HEDERA_CONFIG.privateKey!)
      );
  }

  public static getInstance(): HederaService {
    if (!HederaService.instance) {
      HederaService.instance = new HederaService();
    }
    return HederaService.instance;
  }

  public getClient(): Client {
    return this.client;
  }

  public async submitMessageToTopic(topicId: string, message: string): Promise<string> {
    try {
      const response = await this.client.submitMessageToTopic(topicId, message);
      const receipt = await response.getReceipt(this.client);
      return receipt.status.toString();
    } catch (error) {
      console.error('Failed to submit message:', error);
      throw error;
    }
  }

  public async callContract(contractId: string, functionName: string, params: any[]): Promise<any> {
    try {
      const response = await this.client.callContract(ContractId.fromString(contractId), functionName, params);
      return response.getResult();
    } catch (error) {
      console.error(`Failed to call contract function ${functionName}:`, error);
      throw error;
    }
  }

  public close(): void {
    this.client.close();
  }
}