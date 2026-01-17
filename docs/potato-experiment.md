# Potato Experiment - Physical Setup

## Overview

A real potato is planted in soil and monitored continuously via sensors. The autonomous system ("Claude") receives real-time sensor data and makes decisions to optimize potato health.

## Physical Hardware

### The Potato

- **Variety**: Standard white or russet potato
- **Planting depth**: 4-6 inches
- **Soil type**: Standard potting mix or garden soil
- **Initial state**: Documented via photos and initial measurements

### Sensor Suite

#### 1. Soil Moisture Sensor

- **Type**: Capacitive soil moisture sensor
- **Range**: 0-100% volumetric water content
- **Update frequency**: Every 5 minutes
- **Accuracy**: ±3%
- **Location**: 3 inches below soil surface

#### 2. Temperature Sensor

- **Type**: DHT22 (Humidity + Temperature)
- **Temperature range**: -40°C to 80°C
- **Accuracy**: ±0.5°C
- **Location**: 1 inch above soil surface (ambient)

#### 3. Humidity Sensor

- **Type**: DHT22
- **Humidity range**: 0-100% RH
- **Accuracy**: ±2%
- **Location**: 1 inch above soil surface

#### 4. Time Tracking

- **System**: NTP-synced clock
- **Granularity**: Second-level precision
- **Purpose**: Track elapsed time since germination

### Environmental Controls (Optional, Documented)

The following may be adjusted based on sensor feedback:

- **Watering**: Manual or automated drip system
- **Lighting**: 12-16 hour day/night cycle (if controlled)
- **Temperature**: Room temperature + optional heating/cooling
- **Airflow**: Natural or fan-based circulation

Note: Controls are documented but not enforced by code. The system can only *recommend* adjustments; humans execute them.

## Data Pipeline

### Real-Time Data Collection

```
Sensors -> Arduino/Raspberry Pi -> Data Logger -> JSON File
                                                      ↓
                                            Transmitted to Claude
```

### Data Format (JSON)

```json
{
  "timestamp": "2026-01-17T12:30:00Z",
  "epochNumber": 5,
  "daysSinceGermination": 12,
  "sensors": {
    "soilMoisture": {
      "value": 65.2,
      "unit": "percent",
      "status": "healthy"
    },
    "temperature": {
      "value": 22.5,
      "unit": "celsius",
      "status": "optimal"
    },
    "humidity": {
      "value": 58.3,
      "unit": "percent",
      "status": "healthy"
    }
  },
  "potentialActions": [
    {
      "action": "water",
      "reason": "soil_moisture_below_target",
      "recommendedAmount": "250ml"
    }
  ]
}
```

## Monitoring & Logging

### Daily Log

- Morning: Photo of potato and soil
- Noon: Check sensors are reading correctly
- Evening: Verify no failures or anomalies

### Weekly Report

- Overall progress assessment
- Photos of growth (if visible)
- Sensor trend analysis
- Any interventions performed

### Monthly Archive

- High-resolution photos
- Sensor data summary
- On-chain activity
- Health model progression

## Success Metrics

The potato is considered **healthy** if:

1. Alive (no signs of rot or disease)
2. Growing (visible sprouts or foliage)
3. Responsive to care (sensor adjustments affect growth)

The potato is considered **stressed** if:

- Wilting despite adequate moisture
- Discoloration
- Stunted growth
- Pest/disease signs

The potato is considered **dying** if:

- Extensive rot
- Complete wilting
- No growth for 2+ weeks
- Fungal/bacterial infection

## Failure Modes

The experiment can fail due to:

- **Biological**: Disease, pests, genetic factors
- **Environmental**: Extreme temperature, flooding, drought
- **Technical**: Sensor failure, system crash, data loss
- **External**: Physical damage, contamination, human error

Each failure mode is documented and contributes to the post-mortem report.

## Documentation Standards

All interventions are logged with:

1. **Timestamp**: Exact date/time
2. **Action taken**: What was done
3. **Rationale**: Why it was done
4. **Expected outcome**: What was hoped to happen
5. **Actual outcome**: What actually happened

This creates a complete audit trail for the experiment.

## Photos & Evidence

- **Baseline**: Initial potato before planting
- **Weekly**: Growth progression
- **Crisis**: Any anomalies or concerns
- **Final**: Post-mortem state

All photos timestamped and archived.
