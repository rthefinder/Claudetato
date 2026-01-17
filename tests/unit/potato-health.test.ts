import { describe, it, expect } from 'vitest';
import { PotatoHealthModel, SensorReading } from '../src/core/potato/PotatoHealthModel';

describe('PotatoHealthModel', () => {
  const model = new PotatoHealthModel();

  it('should compute health for optimal conditions', () => {
    const reading: SensorReading = {
      timestamp: Date.now(),
      soilMoisture: 65,
      temperature: 22,
      humidity: 55,
      daysSinceGermination: 10,
    };

    const result = model.compute(reading);
    expect(result.score).toBeGreaterThan(70);
    expect(result.state).toBe('HEALTHY');
  });

  it('should compute health for stressed conditions', () => {
    const reading: SensorReading = {
      timestamp: Date.now(),
      soilMoisture: 20,
      temperature: 20,
      humidity: 35,
      daysSinceGermination: 5,
    };

    const result = model.compute(reading);
    expect(result.score).toBeLessThan(70);
    expect(result.state).toBe('DYING');
  });

  it('should return DEAD state at score 0', () => {
    const reading: SensorReading = {
      timestamp: Date.now(),
      soilMoisture: 0,
      temperature: 0,
      humidity: 0,
      daysSinceGermination: 0,
    };

    const result = model.compute(reading);
    expect(result.score).toBe(0);
    expect(result.state).toBe('DEAD');
  });
});
