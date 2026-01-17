export interface FeeEpoch {
  epochNumber: number;
  timestamp: number;
  totalFeesLamports: bigint;
  tokenPrice: number;
}

export interface FeeSource {
  trackFees(epochNumber: number): Promise<FeeEpoch>;
  initialize(): Promise<void>;
}
