export interface AllocationConfig {
  healthy: { reinvest: number; buyback: number; burn: number };
  stressed: { reinvest: number; buyback: number; burn: number };
  dying: { reinvest: number; buyback: number; burn: number };
}

export interface PotatoHealthConfig {
  weights: {
    moisture: number;
    temperature: number;
    humidity: number;
  };
  bonusTimePerDay: number;
  stressThresholds: {
    moisture: [number, number]; // [min, max]
    temperature: [number, number];
    humidity: [number, number];
  };
  optimalRanges: {
    moisture: [number, number];
    temperature: [number, number];
    humidity: [number, number];
  };
  penalties: {
    multiStress2: number;
    multiStress3: number;
  };
}

export const ALLOCATION_STRATEGY: AllocationConfig = {
  healthy: { reinvest: 0.6, buyback: 0.35, burn: 0.05 },
  stressed: { reinvest: 0.8, buyback: 0.15, burn: 0.05 },
  dying: { reinvest: 1.0, buyback: 0.0, burn: 0.0 },
};

export const POTATO_HEALTH_STRATEGY: PotatoHealthConfig = {
  weights: {
    moisture: 0.35,
    temperature: 0.3,
    humidity: 0.2,
  },
  bonusTimePerDay: 0.5,
  stressThresholds: {
    moisture: [25, 90],
    temperature: [12, 28],
    humidity: [25, 80],
  },
  optimalRanges: {
    moisture: [40, 80],
    temperature: [18, 25],
    humidity: [40, 70],
  },
  penalties: {
    multiStress2: 15,
    multiStress3: 30,
  },
};
