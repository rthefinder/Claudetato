# Potato Health Scoring Model

## Overview

PotatoHealth is a deterministic, reproducible score calculated from real-time sensor data. It ranges from 0 to 100 and determines the state of the potato and the strategy for fee allocation.

## Health Score Formula

### Input Parameters

All sensor values are normalized to [0, 100] scale first.

#### 1. Soil Moisture Score (Sc_moisture)

Optimal range: 40-80% volumetric water content

```
if moisture < 30%:
  Sc_moisture = moisture / 30 * 50
elif moisture <= 80%:
  Sc_moisture = 50 + (moisture - 30) / 50 * 50
else:
  Sc_moisture = 100 - (moisture - 80) / 20 * 50
  (Capped at 0 if moisture > 100)
```

**Rationale**: 
- Below 30%: Drying out, linear penalty
- 30-80%: Optimal zone, linear increase
- Above 80%: Waterlogged, nonlinear penalty

#### 2. Temperature Stability Score (Sc_temp)

Optimal range: 18-25°C (64-77°F)

```
if temp < 10°C or temp > 30°C:
  Sc_temp = 0  (Critical stress)
elif temp < 15°C or temp > 27°C:
  Sc_temp = 30 + abs(temp - 22.5) / 4.5 * 20
elif temp < 18°C or temp > 25°C:
  Sc_temp = 50 + abs(temp - 22.5) / 3.5 * 40
else:
  Sc_temp = 100  (Optimal zone)
```

**Rationale**:
- Potatoes are cool-weather crops
- Extreme temps cause stress
- Stability matters more than exact value

#### 3. Humidity Score (Sc_humidity)

Optimal range: 40-70% relative humidity

```
if humidity < 20%:
  Sc_humidity = humidity / 20 * 40
elif humidity <= 70%:
  Sc_humidity = 40 + (humidity - 20) / 50 * 60
else:
  Sc_humidity = 100 - (humidity - 70) / 30 * 40
```

**Rationale**:
- Low humidity causes desiccation
- High humidity promotes fungal disease
- 40-70% is the sweet spot

#### 4. Time Alive Bonus (Bonus_time)

Linear bonus for survival duration

```
days_alive = time_elapsed / (24 * 3600 * 1000)
Bonus_time = min(days_alive * 0.5, 10)
```

**Rationale**:
- Surviving longer is inherently good
- Capped at +10 points (max 110 before penalty)
- Encourages system not to kill it immediately

#### 5. Stress Penalty (Penalty_stress)

Applied if multiple sensors are out of range simultaneously

```
stress_count = 0
if moisture < 25% or moisture > 90%: stress_count += 1
if temp < 12°C or temp > 28°C: stress_count += 1
if humidity < 25% or humidity > 80%: stress_count += 1

if stress_count == 2:
  Penalty_stress = 15
elif stress_count >= 3:
  Penalty_stress = 30
else:
  Penalty_stress = 0
```

**Rationale**:
- Single bad parameter is survivable
- Multiple simultaneous stressors are dangerous
- Cumulative penalties for crisis conditions

### Final Calculation

```
PotatoHealth = (
  Sc_moisture * 0.35 +
  Sc_temp * 0.30 +
  Sc_humidity * 0.20 +
  Bonus_time +
  (5 * (100 - min(Penalty_stress, 100)))
) - Penalty_stress

PotatoHealth = max(0, min(100, PotatoHealth))
```

**Weights**:
- Moisture: 35% (most critical for potatoes)
- Temperature: 30% (cold stress is significant)
- Humidity: 20% (disease prevention)
- Time Alive: +0.5 per day (encourages survival)
- Multi-stress penalty: -15 to -30 (non-linear)

## Health States

### HEALTHY (>= 70)

- All sensors in good ranges
- Minimal stress
- Growth likely
- Actions: Maintenance, optional buyback

### STRESSED (40-69)

- Some sensor values suboptimal
- Visible stress but not critical
- Growth may be stunted
- Actions: Reinvestment priority, limited buyback

### DYING (< 40)

- Multiple sensors out of range
- Significant stress visible
- Urgent intervention needed
- Actions: All resources to experiment, no buyback

### DEAD (0)

- Potato confirmed dead/rotted
- No recovery possible
- Actions: Post-mortem report, hold

## Example Calculations

### Scenario A: Optimal Conditions

```
Moisture: 65% -> Sc_moisture = 80
Temp: 22°C -> Sc_temp = 100
Humidity: 55% -> Sc_humidity = 100
Days alive: 10 -> Bonus_time = 5
Stress count: 0 -> Penalty_stress = 0

PotatoHealth = (80*0.35 + 100*0.30 + 100*0.20 + 5) - 0
            = (28 + 30 + 20 + 5) - 0
            = 83

Status: HEALTHY
```

### Scenario B: Dry Stress

```
Moisture: 20% -> Sc_moisture = 33
Temp: 20°C -> Sc_temp = 70
Humidity: 35% -> Sc_humidity = 45
Days alive: 5 -> Bonus_time = 2.5
Stress count: 2 (moisture + humidity) -> Penalty_stress = 15

PotatoHealth = (33*0.35 + 70*0.30 + 45*0.20 + 2.5) - 15
            = (11.55 + 21 + 9 + 2.5) - 15
            = 29

Status: DYING
```

### Scenario C: Heat + Humidity

```
Moisture: 60% -> Sc_moisture = 77
Temp: 28°C -> Sc_temp = 40
Humidity: 78% -> Sc_humidity = 28
Days alive: 20 -> Bonus_time = 10
Stress count: 2 (temp + humidity) -> Penalty_stress = 15

PotatoHealth = (77*0.35 + 40*0.30 + 28*0.20 + 10) - 15
            = (27 + 12 + 5.6 + 10) - 15
            = 40

Status: STRESSED
```

## Configurable Parameters

All weights and thresholds are configurable:

```yaml
# src/config/strategy.ts
potatoHealth:
  weights:
    moisture: 0.35
    temperature: 0.30
    humidity: 0.20
  bonusTimePerDay: 0.5
  stressThresholds:
    moisture: [25, 90]
    temperature: [12, 28]
    humidity: [25, 80]
  penalties:
    multiStress2: 15
    multiStress3: 30
  optimalRanges:
    moisture: [40, 80]
    temperature: [18, 25]
    humidity: [40, 70]
```

## Validation

The formula is validated by:

1. **Unit tests**: For each component calculation
2. **Edge cases**: Extreme sensor values
3. **Consistency**: Same inputs always yield same output
4. **Monotonicity**: Incremental sensor improvements = health improvement

See `tests/unit/potato-health.test.ts` for test cases.

## Future Improvements

Potential enhancements (not in v1):

- Sensor history (trend detection)
- Growth measurement (visual analysis)
- Disease detection (machine learning)
- Adaptive thresholds (based on potato variety)
- Multi-potato tracking (if experiments scale)
