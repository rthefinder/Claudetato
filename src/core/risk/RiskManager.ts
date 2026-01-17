import { AllocationBreakdown } from '../strategy/AllocationEngine';
import { env } from '../../config/env';
import { getLogger } from '../../utils/logger';

const log = getLogger('RiskManager');

export interface RiskValidation {
  isValid: boolean;
  reason?: string;
}

export class RiskManager {
  validateAllocation(allocation: AllocationBreakdown): RiskValidation {
    const total =
      allocation.reinvestLamports +
      allocation.buybackLamports +
      allocation.burnLamports;

    if (total > BigInt(env.maxSpendPerEpochLamports)) {
      return {
        isValid: false,
        reason: `Total spend ${total} exceeds max ${env.maxSpendPerEpochLamports}`,
      };
    }

    log.debug('Allocation validation passed', {
      total: total.toString(),
      max: env.maxSpendPerEpochLamports,
    });

    return { isValid: true };
  }
}
