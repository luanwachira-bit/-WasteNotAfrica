export interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: string;
  farmer_address: string;
}

export interface AlertMessage {
  message: string;
  isHighPriority: boolean;
  timestamp: string;
}

export interface TransactionResult {
  status: 'SUCCESS' | 'FAILED' | 'NOT_REQUIRED';
  hash?: string;
  error?: string;
}

export interface BroadcastData {
  sensor_data: SensorData;
  alert: string;
  reward_tokens: number;
  transaction_status: string;
}

export interface ContractAddresses {
  wasteToken: string;
  agent: string;
  topic: string;
}