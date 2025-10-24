import { config } from 'dotenv';
import { ContractAddresses } from '../types';

// Load environment variables
config();

export const NETWORK = process.env.NETWORK || 'testnet';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const HEDERA_CONFIG = {
  accountId: process.env.HEDERA_ACCOUNT_ID,
  privateKey: process.env.HEDERA_PRIVATE_KEY,
  network: NETWORK
};

export const CONTRACT_ADDRESSES: ContractAddresses = {
  wasteToken: process.env.WASTE_TOKEN_ADDRESS || '',
  agent: process.env.AGENT_CONTRACT_ADDRESS || '',
  topic: process.env.HEDERA_TOPIC_ID || ''
};

export const AI_CONFIG = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-1.0-pro'
};

export const ALERT_THRESHOLDS = {
  humidity: {
    high: 70,
    critical: 85
  },
  temperature: {
    high: 30,
    critical: 35
  }
};

export const REWARD_CONFIG = {
  standardAmount: 10,
  criticalAmount: 20,
  currency: 'WASTE'
};