import { describe, it, expect } from 'vitest';
import { ExecutionEngine } from '../src/core/executor/ExecutionEngine';
import { MockSensorSource } from '../src/core/sensor/MockSensorSource';
import { MockFeeSource } from '../src/core/feeSource/MockFeeSource';

describe('ExecutionEngine', () => {
  it('should execute epoch with mock sources', async () => {
    const sensor = new MockSensorSource();
    const fees = new MockFeeSource();

    await sensor.initialize();
    await fees.initialize();

    const engine = new ExecutionEngine(sensor, fees);
    const report = await engine.executeEpoch(1);

    expect(report).toBeDefined();
    expect(report?.epochNumber).toBe(1);
    expect(report?.potatoHealth.score).toBeGreaterThanOrEqual(0);
    expect(report?.potatoHealth.score).toBeLessThanOrEqual(100);
  });

  it('should have circuit breaker inactive initially', () => {
    const sensor = new MockSensorSource();
    const fees = new MockFeeSource();

    const engine = new ExecutionEngine(sensor, fees);
    const status = engine.getCircuitBreakerStatus();

    expect(status.isTripped).toBe(false);
    expect(status.failureCount).toBe(0);
  });
});
