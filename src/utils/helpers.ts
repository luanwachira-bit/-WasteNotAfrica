import { SensorData, TransactionResult } from '../types';
import { ALERT_THRESHOLDS } from '../config';

export const generateEventId = (data: SensorData): string => {
  const str = `${data.farmer_address}${data.humidity}${data.temperature}${data.timestamp}`;
  return Buffer.from(str).toString('base64');
};

export const analyzeSensorData = (data: SensorData) => {
  const risks = [];
  
  if (data.humidity >= ALERT_THRESHOLDS.humidity.critical) {
    risks.push('CRITICAL_HUMIDITY');
  } else if (data.humidity >= ALERT_THRESHOLDS.humidity.high) {
    risks.push('HIGH_HUMIDITY');
  }
  
  if (data.temperature >= ALERT_THRESHOLDS.temperature.critical) {
    risks.push('CRITICAL_TEMPERATURE');
  } else if (data.temperature >= ALERT_THRESHOLDS.temperature.high) {
    risks.push('HIGH_TEMPERATURE');
  }
  
  return {
    hasRisk: risks.length > 0,
    risks,
    severity: risks.some(r => r.startsWith('CRITICAL')) ? 'CRITICAL' : 'HIGH'
  };
};

export const formatTransactionResult = (status: string, hash?: string, error?: string): TransactionResult => ({
  status: status as TransactionResult['status'],
  hash,
  error
});

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));