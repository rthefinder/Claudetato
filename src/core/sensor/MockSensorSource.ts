import { SensorSource, SensorReading } from './SensorSource';
import { getLogger } from '../../utils/logger';

const log = getLogger('MockSensorSource');

export class MockSensorSource implements SensorSource {
  private dayCount = 0;
  private startTime = Date.now();

  async initialize(): Promise<void> {
    log.info('MockSensorSource initialized');
  }

  async shutdown(): Promise<void> {
    log.info('MockSensorSource shutdown');
  }

  async read(): Promise<SensorReading> {
    const elapsed = Date.now() - this.startTime;
    const days = elapsed / (1000 * 60 * 60 * 24);

    // Simulate realistic potato conditions
    const moisture = 60 + Math.sin(days * 0.5) * 10 + Math.random() * 5;
    const temperature = 22 + Math.sin(days * 0.3) * 2 + Math.random() * 1;
    const humidity = 55 + Math.cos(days * 0.4) * 8 + Math.random() * 3;

    const reading: SensorReading = {
      timestamp: Date.now(),
      soilMoisture: Math.max(0, Math.min(100, moisture)),
      temperature: Math.max(0, Math.min(40, temperature)),
      humidity: Math.max(0, Math.min(100, humidity)),
      daysSinceGermination: Math.floor(days),
    };

    log.debug('Mock sensor reading', reading);
    return reading;
  }
}
