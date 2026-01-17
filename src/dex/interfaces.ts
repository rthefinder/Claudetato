export interface SwapParams {
  inputToken: string;
  outputToken: string;
  amount: bigint;
  slippage: number;
}

export interface SwapResult {
  success: boolean;
  inputAmount: bigint;
  outputAmount: bigint;
  executionPrice: number;
}

export interface DexInterface {
  swap(params: SwapParams): Promise<SwapResult>;
  getPrice(inputMint: string, outputMint: string): Promise<number>;
}
