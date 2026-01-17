import { DexInterface, SwapParams, SwapResult } from './interfaces';
import { getLogger } from '../utils/logger';

const log = getLogger('MockDex');

export class MockDex implements DexInterface {
  async swap(params: SwapParams): Promise<SwapResult> {
    // Simulate a swap with 1% slippage
    const outputAmount = (params.amount * 90n) / 100n;
    const executionPrice = Number(outputAmount) / Number(params.amount);

    log.info('Mock swap executed', {
      inputAmount: params.amount.toString(),
      outputAmount: outputAmount.toString(),
      price: executionPrice,
    });

    return {
      success: true,
      inputAmount: params.amount,
      outputAmount,
      executionPrice,
    };
  }

  async getPrice(_inputMint: string, _outputMint: string): Promise<number> {
    // Mock price
    return 0.00005;
  }
}
