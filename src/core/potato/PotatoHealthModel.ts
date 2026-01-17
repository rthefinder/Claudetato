import { POTATO_HEALTH_STRATEGY } from '../../config/strategy';
import { clamp } from '../../utils/math';
import { getLogger } from '../../utils/logger';

const log = getLogger('PotatoHealthModel');

export type PotatoState = 'HEALTHY' | 'STRESSED' | 'DYING' | 'DEAD';

export interface SensorReading {
  timestamp: number;
  soilMoisture: number; // 0-100%
  temperature: number; // °C
  humidity: number; // 0-100%
  daysSinceGermination: number;
}

export interface PotatoHealthState {
  score: number; // 0-100
  state: PotatoState;
  reading: SensorReading;
}

export class PotatoHealthModel {
  compute(reading: SensorReading): PotatoHealthState {
    const config = POTATO_HEALTH_STRATEGY;

    // Score components
    const moistureScore = this.computeMoistureScore(reading.soilMoisture);
    const tempScore = this.computeTemperatureScore(reading.temperature);
    const humidityScore = this.computeHumidityScore(reading.humidity);
    const timeBonus = Math.min(reading.daysSinceGermination * config.bonusTimePerDay, 10);
    const stressPenalty = this.computeStressPenalty(reading);

    // Weighted calculation
    const baseScore =
      moistureScore * config.weights.moisture +
      tempScore * config.weights.temperature +
      humidityScore * config.weights.humidity +
      timeBonus;

    // Apply penalty
    const finalScore = clamp(baseScore - stressPenalty, 0, 100);

    // Determine state
    const state = this.getState(finalScore);

    log.info('Health computed', {
      score: finalScore,
      state,
      moisture: moistureScore,
      temperature: tempScore,
      humidity: humidityScore,
      timeBonus,
      penalty: stressPenalty,
    });

    return {
      score: Math.round(finalScore),
      state,
      reading,
    };
  }

  private computeMoistureScore(moisture: number): number {
    if (moisture < 30) {
      return (moisture / 30) * 50;
    }
    if (moisture <= 80) {
      return 50 + ((moisture - 30) / 50) * 50;
    }
    return Math.max(0, 100 - ((moisture - 80) / 20) * 50);
  }

  private computeTemperatureScore(temp: number): number {
    if (temp < 10 || temp > 30) {
      return 0;
    }
    if (temp < 15 || temp > 27) {
      return 30 + (Math.abs(temp - 22.5) / 4.5) * 20;
    }
    if (temp < 18 || temp > 25) {
      return 50 + (Math.abs(temp - 22.5) / 3.5) * 40;
    }
    return 100;
  }

  private computeHumidityScore(humidity: number): number {
    if (humidity < 20) {
      return (humidity / 20) * 40;
    }
    if (humidity <= 70) {
      return 40 + ((humidity - 20) / 50) * 60;
    }
    return Math.max(0, 100 - ((humidity - 70) / 30) * 40);
  }

  private computeStressPenalty(reading: SensorReading): number {
    const config = POTATO_HEALTH_STRATEGY;
    let stressCount = 0;

    if (reading.soilMoisture < config.stressThresholds.moisture[0] ||
        reading.soilMoisture > config.stressThresholds.moisture[1]) {
      stressCount++;
    }

    if (reading.temperature < config.stressThresholds.temperature[0] ||
        reading.temperature > config.stressThresholds.temperature[1]) {
      stressCount++;
    }

    if (reading.humidity < config.stressThresholds.humidity[0] ||
        reading.humidity > config.stressThresholds.humidity[1]) {
      stressCount++;
    }

    if (stressCount >= 3) {
      return config.penalties.multiStress3;
    }
    if (stressCount === 2) {
      return config.penalties.multiStress2;
    }
    return 0;
  }

  private getState(score: number): PotatoState {
    if (score === 0) {
      return 'DEAD';
    }
    if (score < 40) {
      return 'DYING';
    }
    if (score < 70) {
      return 'STRESSED';
    }
    return 'HEALTHY';
  }
}
