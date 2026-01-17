import { getLogger } from '../../utils/logger';
import { ExecutionEngine } from './ExecutionEngine';

const log = getLogger('EpochScheduler');

export class EpochScheduler {
  private intervalHandle: NodeJS.Timeout | null = null;
  private epochCounter = 1;

  async start(engine: ExecutionEngine, intervalMinutes: number): Promise<void> {
    log.info('Epoch scheduler starting', { intervalMinutes });

    const intervalMs = intervalMinutes * 60 * 1000;

    // Execute first epoch immediately
    await engine.executeEpoch(this.epochCounter++);

    // Schedule subsequent epochs
    this.intervalHandle = setInterval(async () => {
      try {
        await engine.executeEpoch(this.epochCounter++);
      } catch (error) {
        log.error('Epoch execution error', { error });
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      log.info('Epoch scheduler stopped');
    }
  }
}
