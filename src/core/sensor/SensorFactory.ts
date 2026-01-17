import { getLogger } from '../../utils/logger';
import { SensorSource } from './SensorSource';
import { MockSensorSource } from './MockSensorSource';
import { FileSensorSource } from './FileSensorSource';
import { ApiSensorSource } from './ApiSensorSource';
import { env } from '../../config/env';

const log = getLogger('SensorFactory');

export function createSensorSource(): SensorSource {
  switch (env.sensorSource) {
    case 'file':
      if (!env.sensorFilePath) {
        throw new Error('SENSOR_FILE_PATH required for file source');
      }
      return new FileSensorSource(env.sensorFilePath);
    case 'api':
      if (!env.sensorApiUrl) {
        throw new Error('SENSOR_API_URL required for api source');
      }
      return new ApiSensorSource(env.sensorApiUrl);
    case 'mock':
    default:
      return new MockSensorSource();
  }
}
