import { describe, it, expect } from 'vitest';
import { AllocationEngine } from '../src/core/strategy/AllocationEngine';

describe('AllocationEngine', () => {
  const engine = new AllocationEngine();

  it('should allocate 60% reinvest for HEALTHY state', () => {
    const totalFees = 1_000_000n;
    const result = engine.allocate(totalFees, 'HEALTHY');

    expect(result.reinvestLamports).toBe(600_000n);
    expect(result.buybackLamports).toBe(350_000n);
    expect(result.burnLamports).toBe(50_000n);
  });

  it('should allocate 80% reinvest for STRESSED state', () => {
    const totalFees = 1_000_000n;
    const result = engine.allocate(totalFees, 'STRESSED');

    expect(result.reinvestLamports).toBe(800_000n);
    expect(result.buybackLamports).toBe(150_000n);
    expect(result.burnLamports).toBe(50_000n);
  });

  it('should allocate 100% reinvest for DYING state', () => {
    const totalFees = 1_000_000n;
    const result = engine.allocate(totalFees, 'DYING');

    expect(result.reinvestLamports).toBe(1_000_000n);
    expect(result.buybackLamports).toBe(0n);
    expect(result.burnLamports).toBe(0n);
  });

  it('should allocate 0% for DEAD state', () => {
    const totalFees = 1_000_000n;
    const result = engine.allocate(totalFees, 'DEAD');

    expect(result.reinvestLamports).toBe(0n);
    expect(result.buybackLamports).toBe(0n);
    expect(result.burnLamports).toBe(0n);
  });
});
