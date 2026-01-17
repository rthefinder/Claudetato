# Token Mechanics & Fee Allocation

## Overview

Creator fees from $claudetato trades are collected and allocated deterministically based on the current PotatoHealth state.

All allocation decisions are:
- **Deterministic**: Same health score = same allocation
- **Transparent**: Logged and reported per epoch
- **Immutable**: No discretionary changes

## Fee Collection

### Creator Fee Sources

Fees are collected from:

1. **Primary**: Pump.fun bonding curve trading (creator fee)
2. **Secondary**: DEX trading fees (if applicable)
3. **Monitoring**: Tracked via Solana wallet watching

### Tracking Mechanism

```typescript
interface FeeEpoch {
  epochNumber: number;
  timestamp: number;
  totalFeesCollected: bigint; // in lamports
  tokenPrice: number;
  feeEquivalent: number; // in $claudetato tokens
}
```

Fees are sampled per epoch (default: 30-60 minutes).

## Allocation Strategy

### By Health State

#### HEALTHY (PotatoHealth >= 70)

```
Total Fees = F

Allocation:
- Experiment Reinvestment: 60% of F
- Optional Buyback: 35% of F
- Burn: 5% of F
```

**Rationale**:
- Potato is thriving, reduce reinvestment
- Allow some market buyback
- Small burn for deflationary pressure

#### STRESSED (40 <= PotatoHealth < 70)

```
Allocation:
- Experiment Reinvestment: 80% of F
- Optional Buyback: 15% of F
- Burn: 5% of F
```

**Rationale**:
- Potato needs more support
- Reduce discretionary spending
- Maintain small buyback to support price

#### DYING (PotatoHealth < 40)

```
Allocation:
- Experiment Reinvestment: 100% of F
- Optional Buyback: 0% of F
- Burn: 0% of F
```

**Rationale**:
- Emergency mode
- All resources to experiment
- No market operations

#### DEAD (PotatoHealth == 0)

```
Allocation:
- Hold all fees
- Generate post-mortem report
- No further actions
```

**Rationale**:
- Experiment over
- Preserve remaining treasury for analysis

## Execution Model

### Per-Epoch Workflow

```
1. Detect fee inflows to wallet
2. Compute PotatoHealth from sensors
3. Determine allocation percentages (from state above)
4. Execute actions:
   - Reinvestment: Transfer SOL to experiment wallet
   - Buyback: Execute swap if conditions met
   - Burn: Transfer to burn address (optional)
5. Log all actions
6. Generate JSON + TXT report
```

### Risk Controls

#### 1. Max Spend Per Epoch

```
MAX_LAMPORTS_PER_EPOCH = 1,000,000  // ~0.001 SOL (configurable)

if spend > MAX_LAMPORTS_PER_EPOCH:
  spend = MAX_LAMPORTS_PER_EPOCH
  log warning
```

#### 2. Circuit Breaker

```
if execution_failures > FAILURE_THRESHOLD (default: 3):
  circuit_breaker_engaged = true
  pause all automatic actions
  alert operators
```

#### 3. Minimum Fee Threshold

```
if fees_in_epoch < MIN_FEE (default: 1000 lamports):
  skip actions this epoch
  just log report
```

## Example Epoch: Healthy State

### Inputs

```
Epoch: 10
PotatoHealth: 78 (HEALTHY)
Fees collected: 5.0 SOL (5,000,000 lamports)
Current price: $0.0001 per $claudetato
```

### Allocation

```
Experiment: 60% = 3.0 SOL
Buyback: 35% = 1.75 SOL
Burn: 5% = 0.25 SOL
```

### Execution

```
1. Transfer 3.0 SOL to Experiment Wallet
   Tx: [hash]
   Reason: "reinvestment - potato healthy"

2. Execute Buyback
   Input: 1.75 SOL
   Output: ~17,500,000 $claudetato tokens (estimated)
   Reason: "market support - maintain liquidity"
   Tx: [hash]

3. Burn Tokens
   Amount: 0.25 SOL worth of $claudetato
   Reason: "deflationary pressure"
   Tx: [hash]

4. Report
   Timestamp: [UTC]
   Potato State: HEALTHY
   Actions taken: 3
   Gas spent: 0.001 SOL
   Remaining treasury: [balance]
```

## Reporting

### JSON Report

```json
{
  "epoch": 10,
  "timestamp": "2026-01-17T14:30:00Z",
  "sensors": {
    "soilMoisture": 65,
    "temperature": 22.5,
    "humidity": 58
  },
  "potatoHealth": 78,
  "healthState": "HEALTHY",
  "fees": {
    "collected": 5000000,
    "unit": "lamports"
  },
  "allocation": {
    "reinvestment_lamports": 3000000,
    "buyback_lamports": 1750000,
    "burn_lamports": 250000
  },
  "actions": [
    {
      "type": "reinvestment",
      "amount": 3000000,
      "tx": "tx_hash_1",
      "status": "success"
    },
    {
      "type": "buyback",
      "amount": 1750000,
      "swapOutput": 17500000,
      "tx": "tx_hash_2",
      "status": "success"
    },
    {
      "type": "burn",
      "amount": 250000,
      "tx": "tx_hash_3",
      "status": "success"
    }
  ],
  "treasury": {
    "solBalance": 2.5,
    "claudetatoBalance": 45000000
  }
}
```

### TXT Summary (Tweet-Ready)

```
Epoch 10 Report:
Potato Health: 78/100 (HEALTHY)
Conditions: Moisture 65%, Temp 22.5°C, Humidity 58%
Fees: 5.0 SOL collected
Actions: Reinvested 3 SOL, Bought back 1.75 SOL, Burned 0.25 SOL
Treasury: 2.5 SOL, 45M $claudetato
All systems nominal.
```

## Buyback Strategy

### When to Buyback

- Only in HEALTHY or STRESSED states
- Only if fees > MIN_FEE
- Only if circuit breaker is OFF
- Only if last 3 epochs had no failures

### Which DEX

Priority order:
1. Mock DEX (for testing)
2. Raydium (if real connector available)
3. Orca (fallback)

Use configurable `DEX_PREFERENCE` in env:

```env
DEX_PREFERENCE=mock|raydium|orca
```

### Buyback Execution

```typescript
// Pseudo-code
async function executeBuyback(
  amountSol: bigint,
  potatoHealthState: HealthState,
) {
  const dex = await selectDex();
  
  const result = await dex.swap({
    inputToken: NATIVE_SOL,
    outputToken: CLAUDETATO_MINT,
    amount: amountSol,
    slippage: 5, // 5% max slippage
  });
  
  if (result.success) {
    log.info('Buyback successful', {
      solSpent: amountSol,
      tokensReceived: result.outputAmount,
      price: result.executionPrice,
    });
  } else {
    circuitBreaker.recordFailure();
  }
}
```

## Burn Strategy

### Burn Mechanics

Tokens are burned by sending to:

```
Burn Address: 11111111111111111111111111111112
(The system program, accepted burn address)
```

### Burn Amount

- HEALTHY: 5% of fees (converted to tokens)
- STRESSED: 5% of fees
- DYING: 0%
- DEAD: 0%

### Burn Frequency

- Every epoch (if fees > MIN_FEE)
- Cumulative tracking of total burned
- Reported in JSON + archived

## Treasury Management

### Wallet Structure

```
Creator Wallet (fee collection)
├── Experiment Wallet (reinvestment fund)
│   └── Used for sensor hardware, upkeep
└── Burn/Swap Wallet (operational)
    └── Used for buyback/burn txs
```

### Balance Monitoring

Every epoch:
1. Check Creator Wallet balance
2. Check Experiment Wallet balance
3. Check Burn Wallet balance
4. Log all balances
5. Alert if any wallet is critically low

### Emergency Procedures

If any wallet < MIN_OPERATIONAL_BALANCE:

1. Pause automatic actions
2. Alert operators
3. Log critical alert
4. Await manual intervention

## Transparency & Auditability

### Published Data

All epoch data published to:

1. **Local filesystem**: `reports/` directory
2. **Optional on-chain**: Transaction memo fields
3. **Optional webhook**: Real-time updates to external service

### Audit Trail

Every transaction includes:
- Epoch number
- Health state at time of execution
- Fee amount
- Allocation decision
- Execution status
- Gas cost

### Historical Archive

All reports retained in:
```
reports/
├── epoch_001_2026-01-17T12-30-00.json
├── epoch_001_2026-01-17T12-30-00.txt
├── epoch_002_2026-01-17T13-00-00.json
├── epoch_002_2026-01-17T13-00-00.txt
└── ...
```

## No Discretionary Changes

**This is critical**: 

- No manual adjustments to percentages mid-epoch
- No special cases or exceptions
- No human override of automated decisions
- All changes require code + deployment

If changes needed, the process is:

1. Update config values
2. Commit to git
3. Tag as new version
4. Deploy new binary
5. Restart system (with clear notification)

## Configurable Parameters

See `src/config/strategy.ts`:

```typescript
export const ALLOCATION_CONFIG = {
  HEALTHY: { reinvest: 0.60, buyback: 0.35, burn: 0.05 },
  STRESSED: { reinvest: 0.80, buyback: 0.15, burn: 0.05 },
  DYING: { reinvest: 1.0, buyback: 0.0, burn: 0.0 },
  MAX_LAMPORTS_PER_EPOCH: 1_000_000,
  MIN_FEE_THRESHOLD: 1_000,
  CIRCUIT_BREAKER_THRESHOLD: 3,
};
```

All changes tracked in version control.
