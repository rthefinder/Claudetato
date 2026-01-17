import { PotatoHealthState } from '../potato/PotatoHealthModel';
import { FeeEpoch } from '../feeSource/FeeSource';
import { AllocationBreakdown } from '../strategy/AllocationEngine';
import fs from 'fs/promises';
import path from 'path';
import { getLogger } from '../../utils/logger';

const log = getLogger('ReportWriter');

export interface EpochReport {
  epochNumber: number;
  timestamp: string;
  sensors: {
    soilMoisture: number;
    temperature: number;
    humidity: number;
    daysSinceGermination: number;
  };
  potatoHealth: PotatoHealthState;
  fees: FeeEpoch;
  allocation: AllocationBreakdown;
  actions: Array<{ type: string; status: string; amount?: bigint }>;
}

export class ReportWriter {
  async write(report: EpochReport): Promise<string> {
    const reportDir = './reports';
    await fs.mkdir(reportDir, { recursive: true });

    const timestamp = new Date(report.timestamp).toISOString().replace(/[:.]/g, '-');
    const filename = `epoch_${String(report.epochNumber).padStart(6, '0')}_${timestamp}.json`;
    const filepath = path.join(reportDir, filename);

    const jsonContent = JSON.stringify(report, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2);

    await fs.writeFile(filepath, jsonContent, 'utf-8');
    log.info('Report written', { path: filepath });

    return filepath;
  }
}

export class SummaryWriter {
  async write(report: EpochReport): Promise<string> {
    const reportDir = './reports';
    await fs.mkdir(reportDir, { recursive: true });

    const timestamp = new Date(report.timestamp).toISOString().replace(/[:.]/g, '-');
    const filename = `summary_${String(report.epochNumber).padStart(6, '0')}_${timestamp}.txt`;
    const filepath = path.join(reportDir, filename);

    const summary = this.generateSummary(report);
    await fs.writeFile(filepath, summary, 'utf-8');
    log.info('Summary written', { path: filepath });

    return filepath;
  }

  private generateSummary(report: EpochReport): string {
    return `
Claude Potato - Epoch ${report.epochNumber}
==============================================

Time: ${report.timestamp}
Status: ${report.potatoHealth.state}
Health Score: ${report.potatoHealth.score}/100

Sensor Data:
  Soil Moisture: ${report.sensors.soilMoisture.toFixed(1)}%
  Temperature: ${report.sensors.temperature.toFixed(1)}°C
  Humidity: ${report.sensors.humidity.toFixed(1)}%
  Days Alive: ${report.sensors.daysSinceGermination}

Fees Collected: ${(Number(report.fees.totalFeesLamports) / 1_000_000_000).toFixed(4)} SOL

Actions:
${report.actions.map((a) => `  - ${a.type}: ${a.status}`).join('\n')}

Treasury:
  Reinvest: ${(Number(report.allocation.reinvestLamports) / 1_000_000_000).toFixed(4)} SOL
  Buyback: ${(Number(report.allocation.buybackLamports) / 1_000_000_000).toFixed(4)} SOL
  Burn: ${(Number(report.allocation.burnLamports) / 1_000_000_000).toFixed(4)} SOL

All systems nominal.
    `.trim();
  }
}
