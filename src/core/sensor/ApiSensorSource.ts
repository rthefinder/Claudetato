import { SensorSource, SensorReading } from './SensorSource';
import { getLogger } from '../../utils/logger';

const log = getLogger('ApiSensorSource');

export class ApiSensorSource implements SensorSource {
  constructor(private apiUrl: string) {}

  async initialize(): Promise<void> {
    log.info('ApiSensorSource initialized', { url: this.apiUrl });
  }

  async shutdown(): Promise<void> {
    log.info('ApiSensorSource shutdown');
  }

  async read(): Promise<SensorReading> {
    try {
      const response = await fetch(`${this.apiUrl}/sensor/reading`);
      const data = (await response.json()) as Record<string, unknown>;

      const reading: SensorReading = {
        timestamp: (data.timestamp as number) || Date.now(),
        soilMoisture: data.soilMoisture as number,
        temperature: data.temperature as number,
        humidity: data.humidity as number,
        daysSinceGermination: (data.daysSinceGermination as number) || 0,
      };

      log.debug('API sensor reading', reading);
      return reading;
    } catch (error) {
      log.error('Failed to fetch sensor data from API', { error, url: this.apiUrl });
      throw error;
    }
  }
}
