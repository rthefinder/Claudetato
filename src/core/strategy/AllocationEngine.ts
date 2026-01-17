import { ALLOCATION_STRATEGY } from '../../config/strategy';
import { PotatoState } from '../potato/PotatoHealthModel';
import { getLogger } from '../../utils/logger';

const log = getLogger('AllocationEngine');

export interface AllocationBreakdown {
  reinvestLamports: bigint;
  buybackLamports: bigint;
  burnLamports: bigint;
}

export class AllocationEngine {
  allocate(totalFeesLamports: bigint, potatoState: PotatoState): AllocationBreakdown {
    const strategy =
      potatoState === 'HEALTHY'
        ? ALLOCATION_STRATEGY.healthy
        : potatoState === 'STRESSED'
          ? ALLOCATION_STRATEGY.stressed
          : potatoState === 'DYING'
            ? ALLOCATION_STRATEGY.dying
            : { reinvest: 0, buyback: 0, burn: 0 };

    const reinvestLamports = BigInt(Math.floor(Number(totalFeesLamports) * strategy.reinvest));
    const buybackLamports = BigInt(Math.floor(Number(totalFeesLamports) * strategy.buyback));
    const burnLamports = BigInt(Math.floor(Number(totalFeesLamports) * strategy.burn));

    const result = { reinvestLamports, buybackLamports, burnLamports };

    log.info('Allocation calculated', {
      state: potatoState,
      total: totalFeesLamports.toString(),
      reinvest: reinvestLamports.toString(),
      buyback: buybackLamports.toString(),
      burn: burnLamports.toString(),
    });

    return result;
  }
}
