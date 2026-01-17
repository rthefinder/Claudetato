import fs from 'fs/promises';
import { SensorSource, SensorReading } from './SensorSource';
import { getLogger } from '../../utils/logger';

const log = getLogger('FileSensorSource');

export class FileSensorSource implements SensorSource {
  constructor(private filePath: string) {}

  async initialize(): Promise<void> {
    try {
      await fs.access(this.filePath);
      log.info('FileSensorSource initialized', { path: this.filePath });
    } catch {
      throw new Error(`Sensor file not found: ${this.filePath}`);
    }
  }

  async shutdown(): Promise<void> {
    log.info('FileSensorSource shutdown');
  }

  async read(): Promise<SensorReading> {
    const content = await fs.readFile(this.filePath, 'utf-8');
    const data = JSON.parse(content);

    const reading: SensorReading = {
      timestamp: data.timestamp || Date.now(),
      soilMoisture: data.soilMoisture,
      temperature: data.temperature,
      humidity: data.humidity,
      daysSinceGermination: data.daysSinceGermination || 0,
    };

    log.debug('File sensor reading', reading);
    return reading;
  }
}
