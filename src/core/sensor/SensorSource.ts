import { SensorReading } from './PotatoHealthModel';

export interface SensorSource {
  read(): Promise<SensorReading>;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}
