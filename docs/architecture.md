# System Architecture

## High-Level Overview

```
Sensors (Real-time)
    ↓
SensorSource (abstraction)
    ↓
Epoch Scheduler (30-60 min intervals)
    ↓
Execution Engine
├─ Read Fee Data
├─ Compute PotatoHealth
├─ Determine Strategy
├─ Execute Actions
└─ Write Reports
    ↓
Solana (fee tracking, optional on-chain reports)
    ↓
Reports (JSON + TXT)
```

## Core Components

### 1. Sensor Sources

**Purpose**: Abstract interface for sensor data

```typescript
// src/core/sensor/SensorSource.ts
interface SensorReading {
  timestamp: number;
  soilMoisture: number;     // 0-100%
  temperature: number;      // °C
  humidity: number;         // 0-100%
  daysSinceGermination: number;
}

interface SensorSource {
  read(): Promise<SensorReading>;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}
```

**Implementations**:

- `MockSensorSource`: Returns synthetic data
- `FileSensorSource`: Reads from JSON file
- `ApiSensorSource`: Stub for future HTTP integration

**Configuration** (env):
```env
SENSOR_SOURCE=mock|file|api
SENSOR_FILE_PATH=./data/sensors.json
SENSOR_API_URL=http://localhost:3000
```

### 2. Fee Sources

**Purpose**: Track $claudetato creator fees

```typescript
// src/core/feeSource/FeeSource.ts
interface FeeEpoch {
  epochNumber: number;
  timestamp: number;
  totalFeesLamports: bigint;
  tokenPrice: number;
}

interface FeeSource {
  trackFees(): Promise<FeeEpoch>;
  initialize(): Promise<void>;
}
```

**Implementations**:

- `MockFeeSource`: Returns synthetic fees
- `WalletWatcherFeeSource`: Polls Solana wallet

### 3. Potato Health Model

**Purpose**: Calculate deterministic health score

```typescript
// src/core/potato/PotatoHealthModel.ts
class PotatoHealthModel {
  compute(reading: SensorReading): PotatoHealthState {
    // Implement formula from docs/potato-health.md
    // Returns: { score: 0-100, state: HEALTHY|STRESSED|DYING|DEAD }
  }
}
```

**No randomness**: Same inputs = same output

### 4. Allocation Engine

**Purpose**: Determine fee allocation

```typescript
// src/core/strategy/AllocationEngine.ts
class AllocationEngine {
  allocate(
    totalFees: bigint,
    potatoHealth: PotatoHealthState,
  ): AllocationBreakdown {
    // Returns: { reinvest%, buyback%, burn% }
    // Based on health state from docs/mechanics.md
  }
}
```

### 5. Execution Engine

**Purpose**: Orchestrate all epoch operations

```typescript
// src/core/executor/ExecutionEngine.ts
class ExecutionEngine {
  async executeEpoch(epochNumber: number): Promise<EpochReport> {
    1. read sensor data
    2. track fees
    3. compute health
    4. allocate budget
    5. execute actions
    6. write reports
    return report
  }
}
```

### 6. Epoch Scheduler

**Purpose**: Run engine at fixed intervals

```typescript
// src/core/executor/EpochScheduler.ts
class EpochScheduler {
  start(intervalMinutes: number = 30): void {
    // Every N minutes, call engine.executeEpoch()
  }
}
```

### 7. Risk Management

**Purpose**: Safety guards

```typescript
// src/core/risk/
- RiskManager: Validates all actions
- CircuitBreaker: Stops on failures
```

### 8. Reporting

**Purpose**: Generate reports

```typescript
// src/core/reporting/
- ReportWriter: JSON output
- SummaryWriter: TXT output
```

## Data Flow

### Epoch Execution (Detailed)

```
Start Epoch N
│
├─ SENSE
│  ├─ SensorSource.read()
│  │  → SensorReading {moisture, temp, humidity, days}
│  └─ Store in state
│
├─ FEES
│  ├─ FeeSource.trackFees()
│  │  → FeeEpoch {total lamports, timestamp}
│  └─ Store in state
│
├─ HEALTH
│  ├─ PotatoHealthModel.compute(reading)
│  │  → PotatoHealthState {score: 0-100, state: HEALTHY|...}
│  └─ Determine action strategy
│
├─ ALLOCATE
│  ├─ AllocationEngine.allocate(fees, health)
│  │  → {reinvest: 60%, buyback: 35%, burn: 5%}
│  └─ Calculate exact lamport amounts
│
├─ RISK CHECK
│  ├─ RiskManager.validate(plan)
│  │  ├─ Check max spend
│  │  ├─ Check circuit breaker
│  │  └─ Approve or reject
│  └─ If rejected: skip actions, log warning
│
├─ EXECUTE
│  ├─ If REINVEST action:
│  │  └─ Transfer to experiment wallet
│  ├─ If BUYBACK action:
│  │  └─ Execute swap (if health >= STRESSED)
│  └─ If BURN action:
│     └─ Burn tokens (if health >= STRESSED)
│
├─ REPORT
│  ├─ ReportWriter.write()
│  │  → {epoch, timestamp, sensors, health, actions, txs}
│  │  → Saved to reports/epoch_N_timestamp.json
│  └─ SummaryWriter.write()
│     → Saved to reports/epoch_N_timestamp.txt
│
└─ End Epoch N
   (Schedule Epoch N+1)
```

## Component Relationships

```
┌─────────────────────────────────────────┐
│       EpochScheduler (entry point)      │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│         ExecutionEngine (orchestrator)  │
└─────────────────────────────────────────┘
     ↓         ↓         ↓         ↓
     │         │         │         │
     ↓         ↓         ↓         ↓
┌────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐
│Sensor  │ │Fee     │ │Potato   │ │Allocation│
│Source  │ │Source  │ │Health   │ │Engine    │
└────────┘ └────────┘ └─────────┘ └──────────┘
                            ↓
                      ┌─────────────┐
                      │Risk Manager │
                      │+ Circuit    │
                      │  Breaker    │
                      └─────────────┘
                            ↓
                    ┌──────────────────┐
                    │Action Execution  │
                    │(Solana swaps,    │
                    │ transfers, burns)│
                    └──────────────────┘
                            ↓
                      ┌─────────────┐
                      │Report Writer│
                      │+ Summary    │
                      └─────────────┘
```

## State Management

### Global State

```typescript
interface GlobalState {
  currentEpoch: number;
  potatoAlive: boolean;
  treasuryBalance: bigint;
  circuitBreakerTripped: boolean;
  lastEpochTimestamp: number;
}
```

### Epoch State

```typescript
interface EpochState {
  epochNumber: number;
  sensorReading: SensorReading;
  feesCollected: bigint;
  healthScore: number;
  healthState: "HEALTHY" | "STRESSED" | "DYING" | "DEAD";
  allocation: AllocationBreakdown;
  actions: Action[];
  report: EpochReport;
}
```

### Persistence

State stored in:
- **Memory**: Current epoch only
- **Disk**: JSON reports (permanent archive)
- **Optional**: SQLite for historical queries

## Async/Concurrency

### Single-Threaded Epoch Model

- Only one epoch executes at a time
- No concurrent actions
- Simpler state management
- Predictable behavior

### Scheduler Thread

- Runs on interval
- Queues next epoch
- Waits for previous to complete
- Handles retries

## Error Handling

### Sensor Read Failures

```
If SensorSource.read() fails:
├─ Log error
├─ Use last known good reading
├─ Increment failure counter
└─ If counter > threshold:
   └─ Circuit breaker activates
```

### Fee Tracking Failures

```
If FeeSource.trackFees() fails:
├─ Log error
├─ Assume 0 fees this epoch
├─ Increment failure counter
└─ If counter > threshold:
   └─ Circuit breaker activates
```

### Action Execution Failures

```
If swap/transfer fails:
├─ Log error
├─ Don't retry (deterministic)
├─ Increment failure counter
└─ If counter > threshold:
   └─ Circuit breaker activates
```

### Circuit Breaker

```
if (failureCount > THRESHOLD):
  ├─ Set circuitBreakerTripped = true
  ├─ Skip all actions until reset
  ├─ Log critical alert
  └─ Await manual restart
```

## Logging Strategy

All events logged via Pino:

```typescript
import { getLogger } from './utils/logger';

const log = getLogger('ExecutionEngine');

log.info('Epoch start', { epochNumber: 5 });
log.warn('Sensor read failed', { error, retrying: true });
log.error('Circuit breaker activated', { reason: 'Too many failures' });
```

Logs streamed to:
- Console (with pretty formatting)
- File: `logs/app.log`
- Optional: External logging service

## Metrics & Observability

Using Prometheus client:

```typescript
// Track metrics
epochDuration.observe(timeMs);
potatoHealthGauge.set(score);
feesCollectedCounter.add(amount);
actionsExecutedCounter.inc();
```

Metrics available at `GET /metrics` (if HTTP server enabled)

## Dry-Run Mode

For testing without real transactions:

```env
EXPERIMENT_MODE=dry-run
```

In dry-run:
- Sensor data read normally
- Health computed normally
- Fees **not** tracked (mocked)
- Actions **not** executed (logged only)
- Reports written normally

Perfect for local development & testing.

## Deployment Options

### Option 1: Docker

```bash
docker run -it \
  --env-file .env \
  -v $(pwd)/reports:/app/reports \
  claudetato:latest
```

### Option 2: Node.js Direct

```bash
node dist/index.js
```

### Option 3: PM2 (Production)

```bash
pm2 start dist/index.js --name claudetato
pm2 save
pm2 startup
```

### Option 4: Systemd

```
/etc/systemd/system/claudetato.service
[Service]
ExecStart=/usr/bin/node /path/to/dist/index.js
```

## Testing Strategy

### Unit Tests

- Potato health formula
- Allocation engine
- Risk manager
- Math utilities

### Integration Tests

- Execution engine with mock sources
- Report generation
- Error handling & circuit breaker

### E2E Tests (Optional)

- Devnet test with real Solana client
- Mock DEX swaps
- Report publication

Run with:
```bash
pnpm test
pnpm test -- --coverage
```
