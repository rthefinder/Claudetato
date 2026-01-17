import { getLogger } from '../../utils/logger';
import { SensorSource } from '../sensor/SensorSource';
import { FeeSource } from '../feeSource/FeeSource';
import { PotatoHealthModel, PotatoHealthState } from '../potato/PotatoHealthModel';
import { AllocationEngine, AllocationBreakdown } from '../strategy/AllocationEngine';
import { RiskManager } from '../risk/RiskManager';
import { CircuitBreaker } from '../risk/CircuitBreaker';
import { ReportWriter, SummaryWriter, EpochReport } from '../reporting/ReportWriter';
import { env } from '../../config/env';

const log = getLogger('ExecutionEngine');

export class ExecutionEngine {
  private circuitBreaker = new CircuitBreaker();

  constructor(
    private sensorSource: SensorSource,
    private feeSource: FeeSource,
    private healthModel = new PotatoHealthModel(),
    private allocationEngine = new AllocationEngine(),
    private riskManager = new RiskManager(),
    private reportWriter = new ReportWriter(),
    private summaryWriter = new SummaryWriter(),
  ) {}

  async executeEpoch(epochNumber: number): Promise<EpochReport | null> {
    log.info('Starting epoch execution', { epochNumber });

    if (this.circuitBreaker.isActive()) {
      log.error('Circuit breaker is active, skipping epoch');
      return null;
    }

    try {
      // Step 1: Read sensor data
      const sensorReading = await this.sensorSource.read();
      log.debug('Sensor data read', sensorReading);

      // Step 2: Track fees
      const feeEpoch = await this.feeSource.trackFees(epochNumber);
      log.debug('Fees tracked', { fees: feeEpoch.totalFeesLamports.toString() });

      // Step 3: Compute health
      const healthState = this.healthModel.compute(sensorReading);
      log.info('Potato health computed', {
        score: healthState.score,
        state: healthState.state,
      });

      // Step 4: Allocate budget
      const allocation = this.allocationEngine.allocate(feeEpoch.totalFeesLamports, healthState.state);

      // Step 5: Validate allocation
      const validation = this.riskManager.validateAllocation(allocation);
      if (!validation.isValid) {
        log.warn('Allocation validation failed', { reason: validation.reason });
        this.circuitBreaker.recordFailure();
        return null;
      }

      // Step 6: Generate report
      const report: EpochReport = {
        epochNumber,
        timestamp: new Date().toISOString(),
        sensors: {
          soilMoisture: sensorReading.soilMoisture,
          temperature: sensorReading.temperature,
          humidity: sensorReading.humidity,
          daysSinceGermination: sensorReading.daysSinceGermination,
        },
        potatoHealth: healthState,
        fees: feeEpoch,
        allocation,
        actions: this.generateActions(healthState.state, allocation),
      };

      // Step 7: Write reports
      if (env.experimentMode === 'live') {
        await this.reportWriter.write(report);
        await this.summaryWriter.write(report);
      } else {
        log.debug('Dry-run mode: reports not persisted');
      }

      log.info('Epoch execution completed', {
        epochNumber,
        health: healthState.score,
        actions: report.actions.length,
      });

      return report;
    } catch (error) {
      log.error('Epoch execution failed', { error, epochNumber });
      this.circuitBreaker.recordFailure();
      return null;
    }
  }

  private generateActions(state: string, allocation: AllocationBreakdown): Array<{ type: string; status: string; amount?: bigint }> {
    const actions = [];

    if (allocation.reinvestLamports > 0n) {
      actions.push({
        type: 'reinvest',
        status: 'queued',
        amount: allocation.reinvestLamports,
      });
    }

    if (allocation.buybackLamports > 0n) {
      actions.push({
        type: 'buyback',
        status: 'queued',
        amount: allocation.buybackLamports,
      });
    }

    if (allocation.burnLamports > 0n) {
      actions.push({
        type: 'burn',
        status: 'queued',
        amount: allocation.burnLamports,
      });
    }

    return actions;
  }

  getCircuitBreakerStatus(): { isTripped: boolean; failureCount: number } {
    return this.circuitBreaker.getStatus();
  }

  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }
}
