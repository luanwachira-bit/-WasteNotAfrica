export const DEFAULT_GAS_LIMIT = 1000000;
export const DEFAULT_QUERY_PAYMENT = 1; // in Hbar
export const MAX_TRANSACTION_FEE = 2; // in Hbar

export const WEBSOCKET_EVENTS = {
  SENSOR_DATA: 'SENSOR_DATA',
  ALERT: 'ALERT',
  TOKEN_MINT: 'TOKEN_MINT',
  ERROR: 'ERROR'
} as const;

export const ERROR_MESSAGES = {
  HEDERA_CONNECTION: 'Failed to connect to Hedera network',
  CONTRACT_EXECUTION: 'Contract execution failed',
  INVALID_ADDRESS: 'Invalid Hedera address provided',
  WEBSOCKET_ERROR: 'WebSocket connection error',
  MISSING_ENV: 'Missing required environment variables'
} as const;

export const SUCCESS_MESSAGES = {
  TOKEN_MINTED: 'WASTE tokens minted successfully',
  ALERT_LOGGED: 'Alert logged to HCS successfully',
  DATA_PROCESSED: 'Sensor data processed successfully'
} as const;

export const SWAHILI_MESSAGES = {
  SAFE: 'Mazao yako ni salama!',
  HIGH_HUMIDITY: 'Tahadhari! Unyevu ni mwingi. Hamisha mazao mahali pakavu.',
  HIGH_TEMPERATURE: 'Tahadhari! Joto ni kubwa. Hamisha mazao kwenye kivuli.',
  SYSTEM_ERROR: 'Samahani, kuna hitilafu ya kimtandao.'
} as const;