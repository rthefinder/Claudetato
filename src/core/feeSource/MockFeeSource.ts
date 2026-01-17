import { FeeSource, FeeEpoch } from './FeeSource';
import { getLogger } from '../../utils/logger';

const log = getLogger('MockFeeSource');

export class MockFeeSource implements FeeSource {
  async initialize(): Promise<void> {
    log.info('MockFeeSource initialized');
  }

  async trackFees(epochNumber: number): Promise<FeeEpoch> {
    // Simulate variable fee income
    const baseFee = 5_000_000n; // ~0.005 SOL
    const variance = Math.floor(Math.random() * 5_000_000);
    const totalFees = baseFee + BigInt(variance);

    const epoch: FeeEpoch = {
      epochNumber,
      timestamp: Date.now(),
      totalFeesLamports: totalFees,
      tokenPrice: 0.00005 + Math.random() * 0.00005,
    };

    log.debug('Mock fees tracked', {
      epoch: epochNumber,
      lamports: epoch.totalFeesLamports.toString(),
      price: epoch.tokenPrice,
    });

    return epoch;
  }
}
