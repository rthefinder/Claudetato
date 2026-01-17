# Claude Potato - Claudetato

CA: 2mpdtniP9J69mr1nEfx9MfZ5hCYWRYtjTta6VZfNpump

https://x.com/claudetato

![claudetatologo](https://github.com/user-attachments/assets/c6434ce6-5d11-49d3-981e-927849696cfa)



An open-source, deterministic AI experiment on Solana.

A real potato is planted and monitored 24/7. An AI system observes environmental data and decides how to help it grow. The token ($claudetato) funds the experiment and records growth data on-chain.

**This is an experiment, not a promise. Not affiliated with Anthropic, Claude, or any real company.**

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Solana CLI (optional, for devnet testing)

### Installation

```bash
git clone https://github.com/rthefinder/Claudetato.git
cd Claudetato
pnpm install
```

### Configuration

Create a `.env` file (see `.env.example` template):

```bash
# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Experiment
EXPERIMENT_MODE=dry-run

# Fee tracking wallet
FEE_WALLET=<your-wallet-pubkey>

# Logging
LOG_LEVEL=info
```

### Running

```bash
# Development with hot reload
pnpm dev

# Build
pnpm build

# Start
pnpm start

# Tests
pnpm test

# Simulate one epoch
pnpm simulate-epoch

# Compute potato health
pnpm compute-health
```

## Project Overview

### The Experiment
<img width="1024" height="341" alt="claudebanneretato" src="https://github.com/user-attachments/assets/b6b09d0f-b2ba-4772-80b4-42d1bba9afe6" />

1. **Physical Setup**: A potato planted in monitored soil
2. **Sensors**: Temperature, humidity, soil moisture, elapsed time
3. **AI System**: Observes data, makes rule-based decisions
4. **Goal**: Keep the potato alive and growing over time

### Potato Health Model

**PotatoHealth** is a deterministic score in range [0, 100] computed from:

- Soil Moisture Score (weighted)
- Temperature Stability Score (weighted)
- Humidity Score (weighted)
- Time Alive Bonus (linear)
- Stress Penalty (for extreme values)

**States**:
- HEALTHY: >= 70
- STRESSED: 40–69
- DYING: < 40
- DEAD: 0

See [docs/potato-health.md](docs/potato-health.md) for the full formula.

### Token Mechanics

$claudetato serves two purposes:

1. **Fee Funding**: Creator fees from trading fund the experiment
2. **Data Recording**: On-chain transactions link to off-chain potato progress

**What $claudetato does NOT do:**
- Provide yield or returns
- Grant governance rights
- Guarantee any outcome
- Claim scientific validity

See [docs/mechanics.md](docs/mechanics.md) for detailed fee allocation rules.

### Epoch Execution

The system runs in **epochs** (default: every 30–60 minutes):

1. Read sensor data
2. Detect fee inflows
3. Compute PotatoHealth
4. Execute strategy (buyback, burn, report)
5. Write results to JSON/TXT reports

See [docs/architecture.md](docs/architecture.md) for system design.

## Configuration

See [docs/runbook.md](docs/runbook.md) for full configuration guide.

### Core Settings

```env
# Network
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Experiment
EXPERIMENT_MODE=dry-run|live
POTATO_HEALTH_FORMULA=v1
EPOCH_INTERVAL_MINUTES=30

# Fee tracking
FEE_WALLET=<creator-wallet-pubkey>
FEE_TOKEN_MINT=<$claudetato-mint>

# Logging
LOG_LEVEL=debug|info|warn|error

# Risk
MAX_SPEND_PER_EPOCH_LAMPORTS=1000000
CIRCUIT_BREAKER_FAILURE_THRESHOLD=3
```

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# UI mode
pnpm test:ui
```

## Development

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Format
pnpm format

# Build
pnpm build

# Clean build artifacts
pnpm clean
```

## Important Disclaimers

### Not a Scientific Claim

Claude Potato is an **experiment**, not scientific research. Results are not peer-reviewed and should not be treated as establishing biological facts.

### Not Affiliated with Anthropic/Claude

This project is **not affiliated** with Anthropic, Claude the AI, or any official entity. "Claude" is used purely as a narrative reference for an autonomous decision-making system.

### No Guarantee of Potato Survival

The experiment may fail at any time due to biological, environmental, or technical factors. There is no guarantee the potato will survive or grow.

### Token Characteristics

- **No yield**: $claudetato provides no returns or income
- **No governance**: Holders have no voting or control rights
- **Experimental use only**: Created to fund and document an experiment
- **No promise of utility**: The token may have no utility at all
- **High risk**: The entire experiment could fail

See [docs/DISCLAIMER.md](docs/DISCLAIMER.md) for full legal terms.

## Security

### What We Do

- No private keys in code
- All secrets in environment variables
- Dry-run mode for testing
- Circuit breaker for failure protection
- Max spend limits per epoch
- Comprehensive logging

### What We Don't Do

- No leverage trading
- No admin withdrawals
- No discretionary human trading
- No hidden fees or allocations

## Contributing

This is an open-source experiment. Contributions welcome:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License. See LICENSE file for details.

## Links

- **Concept**: [docs/concept.md](docs/concept.md)
- **Experiment Details**: [docs/potato-experiment.md](docs/potato-experiment.md)
- **Health Model**: [docs/potato-health.md](docs/potato-health.md)
- **Mechanics**: [docs/mechanics.md](docs/mechanics.md)
- **Architecture**: [docs/architecture.md](docs/architecture.md)
- **Risk & Limitations**: [docs/risk.md](docs/risk.md)
- **Runbook**: [docs/runbook.md](docs/runbook.md)
- **Disclaimer**: [docs/DISCLAIMER.md](docs/DISCLAIMER.md)

## Status

EXPERIMENT ACTIVE

Current PotatoHealth: *Check reports directory for latest*

---

**Remember**: This is an experiment. Proceed with caution and realistic expectations.
