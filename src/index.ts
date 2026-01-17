import { getLogger } from './utils/logger';
import { createSensorSource } from './core/sensor/SensorFactory';
import { createFeeSource } from './core/feeSource/FeeFactory';
import { ExecutionEngine } from './core/executor/ExecutionEngine';
import { EpochScheduler } from './core/executor/EpochScheduler';
import { env } from './config/env';

const log = getLogger('Main');

async function main(): Promise<void> {
  try {
    log.info('Claude Potato starting', {
      mode: env.experimentMode,
      network: env.solanaNetwork,
      intervalMinutes: env.epochIntervalMinutes,
    });

    // Initialize sources
    const sensorSource = createSensorSource();
    const feeSource = createFeeSource();

    await sensorSource.initialize();
    await feeSource.initialize();

    // Create execution engine
    const engine = new ExecutionEngine(sensorSource, feeSource);

    // Start scheduler
    const scheduler = new EpochScheduler();
    await scheduler.start(engine, env.epochIntervalMinutes);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      log.info('Shutdown signal received');
      scheduler.stop();
      await sensorSource.shutdown();
      process.exit(0);
    });
  } catch (error) {
    log.error('Fatal error', { error });
    process.exit(1);
  }
}

main();
