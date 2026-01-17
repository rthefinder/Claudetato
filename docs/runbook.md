# Operations Runbook

## Pre-Launch Checklist

### Week 1: Setup

- [ ] Acquire potato (russet or white variety recommended)
- [ ] Prepare soil (standard potting mix)
- [ ] Install sensors (moisture, temp, humidity)
- [ ] Calibrate sensors (run baseline readings)
- [ ] Test data pipeline (JSON output working)
- [ ] Verify Node.js 20+ installed
- [ ] Clone repository and install deps (`pnpm install`)
- [ ] Create `.env` file with test values
- [ ] Run dry-run mode locally (`pnpm dev`)

### Week 2: Testing

- [ ] Run unit tests (`pnpm test`)
- [ ] Run integration tests with mock data
- [ ] Test email alerts (if configured)
- [ ] Verify report generation
- [ ] Test Docker build (`docker build -t claudetato .`)
- [ ] Test Solana devnet connection
- [ ] Deploy to staging environment
- [ ] Run 24 hours in dry-run mode

### Week 3: Deployment

- [ ] Get Pump.fun approval
- [ ] Deploy token on Pump.fun
- [ ] Verify token contract works
- [ ] Set creator fee properly
- [ ] Test fee collection
- [ ] Move to live mode
- [ ] Start epoch 1

## Daily Operations

### Morning (6am local time)

1. **Check Potato Visually**
   ```bash
   - Take photo of soil and any visible growth
   - Look for discoloration, wilting, pests
   - Note any changes since yesterday
   ```

2. **Check System Health**
   ```bash
   - View latest report: cat reports/epoch_*.json | tail -1
   - Check PotatoHealth score
   - Check for any warnings/errors in logs
   ```

3. **Review Overnight Epochs**
   ```bash
   - How many epochs ran? (expect 1-2 if 30-60 min intervals)
   - Any action failures?
   - Any anomalous sensor readings?
   ```

### Noon (12pm local time)

1. **Sensor Verification**
   ```bash
   - Manually measure soil moisture (compare to sensor)
   - Check room temperature (compare to sensor)
   - Record in local log
   ```

2. **Fee Tracking Check**
   ```bash
   - Check Solana wallet balance
   - Verify fees being collected
   - Note any significant market activity
   ```

### Evening (6pm local time)

1. **Daily Report**
   ```
   Day N Report:
   - Potato Health: X/100
   - Fee Income: Y SOL
   - Actions: [list]
   - Anomalies: [if any]
   - Status: NOMINAL / WARNING / CRITICAL
   ```

2. **Backup Reports**
   ```bash
   cp -r reports/ backup/reports_$(date +%Y%m%d)
   ```

## Weekly Operations

### Every Monday

1. **Historical Analysis**
   - Plot PotatoHealth over week
   - Analyze any trends
   - Document in weekly report

2. **Treasury Review**
   - Check total fees collected
   - Review allocations
   - Verify no unexpected spending

3. **Code Review**
   - Check for any updates/PRs
   - Review failed epochs (if any)
   - Plan improvements

### Every Friday

1. **Community Update**
   - Generate tweet summary
   - Post to social media
   - Engage with comments

2. **Backup & Archive**
   - Archive week's reports to long-term storage
   - Verify backups readable
   - Clean up local temp files

## Incident Response

### Alert: PotatoHealth Dropped 20+ Points

**Immediate Actions**:
1. Check sensor readings (are they real?)
2. Visually inspect potato
3. Review recent epochs
4. Check environmental conditions

**If Sensor Error**:
```bash
# Validate sensor
pnpm compute-health  # Run manual calculation
# Update sensor calibration if needed
```

**If Real Drop**:
```bash
# Increase monitoring frequency
# Prepare emergency actions (watering, etc.)
# Alert community
```

### Alert: No Fees Detected for 3 Hours

**Immediate Actions**:
1. Check token is trading on Pump.fun
2. Verify wallet address is correct
3. Check RPC connection
4. Manually query wallet via CLI:
   ```bash
   solana balance <wallet> --url devnet
   ```

**If Trading but No Fees**:
- Possible Pump.fun issue
- Fee destination misconfigured
- Need manual investigation

**If Not Trading**:
- Token trading paused
- Liquidity drained
- May need to close experiment or add capital

### Alert: Circuit Breaker Activated

**Critical - System Paused**

1. Immediately check logs:
   ```bash
   tail -100 logs/app.log | grep -i error
   ```

2. Determine failure type:
   - Sensor failure?
   - Network outage?
   - RPC error?
   - Swap failure?

3. Investigate root cause:
   ```bash
   # Sensor test
   node -e "require('./src/core/sensor/MockSensorSource').read()"
   
   # Fee test
   solana balance <wallet> --url <rpc>
   ```

4. If fixable:
   - Fix issue
   - Reset failure counter
   - Restart system

5. If not fixable:
   - Activate manual circuit breaker
   - Notify community
   - Plan next steps

### Alert: Potato Health = 0 (DEAD)

**Experiment Over**

1. **Immediate**:
   - Stop buyback/burn actions (if configured)
   - Preserve treasury
   - Take final photos

2. **Analysis**:
   - Review full epoch history
   - Identify where health declined
   - Determine cause of death
   - Document lessons

3. **Reporting**:
   ```bash
   pnpm generate-postmortem
   # Creates comprehensive final report
   ```

4. **Community**:
   - Announce experiment conclusion
   - Share post-mortem findings
   - Discuss what was learned

## Manual Interventions

### Emergency Watering

If soil moisture too low and auto-watering failed:

```bash
# 1. Record current state
pnpm snapshot-balances > watering_pre.json

# 2. Manually water potato (250ml for standard pot)

# 3. Wait 15 minutes for sensor to settle

# 4. Record post-watering
pnpm snapshot-balances > watering_post.json

# 5. Compare readings
diff watering_pre.json watering_post.json
```

### Manual Health Recomputation

To verify health calculation is correct:

```bash
pnpm compute-health

# Output:
# Soil Moisture: 65 → Score: 80
# Temperature: 22.5 → Score: 100
# Humidity: 58 → Score: 100
# Days Alive: 10 → Bonus: 5
# Stress Penalty: 0
# Final: 83 (HEALTHY)
```

### Force Epoch Execution

To test system without waiting for scheduler:

```bash
pnpm simulate-epoch --epoch 999 --dry-run

# Output:
# Epoch 999 (DRY-RUN)
# PotatoHealth: 75
# Allocation: {...}
# Actions: [...]
# Report saved to: reports/epoch_999_*.json
```

### Reset System State

If system corrupts its state:

```bash
# 1. Stop the system
# 2. Back up reports
cp -r reports/ reports_backup_$(date +%s)

# 3. Clear state (start fresh next epoch)
rm -f .state.json

# 4. Restart
pnpm start

# System will rebuild state from reports
```

## Environment Variables

### Required

```env
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
FEE_WALLET=<your-solana-pubkey>
FEE_TOKEN_MINT=<claudetato-mint-address>
```

### Experiment Configuration

```env
EXPERIMENT_MODE=dry-run|live
SENSOR_SOURCE=mock|file|api
EPOCH_INTERVAL_MINUTES=30
POTATO_HEALTH_FORMULA=v1
```

### Logging

```env
LOG_LEVEL=debug|info|warn|error
LOG_FILE=logs/app.log
```

### Risk Management

```env
MAX_SPEND_PER_EPOCH_LAMPORTS=1000000
CIRCUIT_BREAKER_FAILURE_THRESHOLD=3
DEX_PREFERENCE=mock|raydium|orca
```

### Optional

```env
WEBHOOK_URL=https://...  # Real-time alerts
SLACK_WEBHOOK=https://... # Slack notifications
EMAIL_ALERTS=enabled|disabled
```

## Monitoring Dashboard

### Metrics to Track

1. **Potato Health**: Current score (0-100)
2. **Fees Collected**: Total per day/week/month
3. **Treasury Balance**: Current SOL balance
4. **Epoch Success Rate**: % epochs completed successfully
5. **Uptime**: % time system was running

### View Local Metrics

```bash
# Option 1: Console logs
tail -f logs/app.log

# Option 2: JSON reports (latest)
jq .potatoHealth reports/epoch_*.json | tail -1

# Option 3: Prometheus (if enabled)
curl http://localhost:9090/metrics | grep claudetato
```

## Disaster Recovery

### If All Data Lost

1. **Rebuild from blockchain**:
   - All transactions logged on Solana
   - Can verify from explorer
   - Treasury balance on-chain

2. **Rebuild from git**:
   - Code fully reproducible
   - Exact same binary deployed
   - Tests verify correctness

3. **Partial state recovery**:
   - Last known health score in reports
   - Last known fees in transaction history
   - Can resume from last good epoch

### If RPC Permanently Down

1. Switch to backup RPC:
   ```env
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```

2. Or use local validator (if available)

3. Or pause experiment until resolved

### If Token Contract Fails

1. Analyze failure on blockchain
2. If recoverable: fix and redeploy
3. If not: migrate to new token
4. Notify community immediately

## Shutdown Procedure

When ending experiment:

1. **Notify Community** (48hr notice)
   - Post announcement
   - Explain why
   - Share final reports

2. **Stop Automatic Actions**
   - Set `EXPERIMENT_MODE=dry-run`
   - Restart system
   - Verify actions queued but not executed

3. **Final Report**
   ```bash
   pnpm generate-postmortem
   ```

4. **Archive Everything**
   ```bash
   tar -czf claudetato_final_$(date +%Y%m%d).tar.gz reports/ logs/
   ```

5. **Publish Archives**
   - Upload to long-term storage
   - Link in final announcement
   - Ensure community can access

6. **Treasury Disposition**
   - Keep SOL: Store in cold wallet
   - Burn remaining $claudetato: Send to burn address
   - Or: Return to community (if feasible)

## Support & Communication

### Where to Ask Questions

- GitHub Issues: Technical problems
- Discussions: General questions
- Twitter: Community updates

### Escalation Path

1. **Normal Question**: Ask on GitHub Discussions
2. **Bug Report**: Create GitHub Issue with logs
3. **Critical Issue**: Twitter DM or email
4. **Security**: Email security contact (see SECURITY.md)

## Logs Location

All logs stored in `logs/` directory:

- `logs/app.log`: Main application log
- `logs/error.log`: Error-level events
- `logs/audit.log`: All transactions (if configured)

Rotate logs daily, keep 30 days history.

## Backup Strategy

```
reports/ → Daily snapshot → Weekly archive → Monthly deep storage
```

- Daily: `backup_$(date +%Y%m%d)/reports/`
- Weekly: `aws s3 sync reports/ s3://claudetato-backup/week_N/`
- Monthly: Offline external drive

Verify backups readable monthly.
