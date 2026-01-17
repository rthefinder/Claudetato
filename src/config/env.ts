import dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  // Solana
  solanaRpcUrl: string;
  solanaNetwork: 'devnet' | 'testnet' | 'mainnet-beta';
  featureWallet: string;
  feeTokenMint: string;

  // Experiment
  experimentMode: 'dry-run' | 'live';
  potatoHealthFormula: string;
  epochIntervalMinutes: number;

  // Sensor
  sensorSource: 'mock' | 'file' | 'api';
  sensorFilePath?: string;
  sensorApiUrl?: string;

  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logFile?: string;

  // Risk
  maxSpendPerEpochLamports: number;
  circuitBreakerFailureThreshold: number;
  dexPreference: 'mock' | 'raydium' | 'orca';

  // Optional
  webhookUrl?: string;
  slackWebhook?: string;
  emailAlerts: boolean;
}

function parseEnv(): EnvConfig {
  const config: EnvConfig = {
    solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    solanaNetwork: (process.env.SOLANA_NETWORK || 'devnet') as 'devnet' | 'testnet' | 'mainnet-beta',
    featureWallet: process.env.FEE_WALLET || '',
    feeTokenMint: process.env.FEE_TOKEN_MINT || '',
    experimentMode: (process.env.EXPERIMENT_MODE || 'dry-run') as 'dry-run' | 'live',
    potatoHealthFormula: process.env.POTATO_HEALTH_FORMULA || 'v1',
    epochIntervalMinutes: parseInt(process.env.EPOCH_INTERVAL_MINUTES || '30', 10),
    sensorSource: (process.env.SENSOR_SOURCE || 'mock') as 'mock' | 'file' | 'api',
    sensorFilePath: process.env.SENSOR_FILE_PATH,
    sensorApiUrl: process.env.SENSOR_API_URL,
    logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
    logFile: process.env.LOG_FILE,
    maxSpendPerEpochLamports: parseInt(process.env.MAX_SPEND_PER_EPOCH_LAMPORTS || '1000000', 10),
    circuitBreakerFailureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '3', 10),
    dexPreference: (process.env.DEX_PREFERENCE || 'mock') as 'mock' | 'raydium' | 'orca',
    webhookUrl: process.env.WEBHOOK_URL,
    slackWebhook: process.env.SLACK_WEBHOOK,
    emailAlerts: process.env.EMAIL_ALERTS === 'enabled',
  };

  // Validate required fields
  if (!config.featureWallet) {
    throw new Error('FEE_WALLET environment variable is required');
  }

  if (!config.feeTokenMint) {
    throw new Error('FEE_TOKEN_MINT environment variable is required');
  }

  return config;
}

export const env = parseEnv();
