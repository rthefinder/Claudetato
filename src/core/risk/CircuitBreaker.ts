import { env } from '../../config/env';
import { getLogger } from '../../utils/logger';

const log = getLogger('CircuitBreaker');

export class CircuitBreaker {
  private failureCount = 0;
  private isTripped = false;

  isActive(): boolean {
    return this.isTripped;
  }

  recordFailure(): void {
    this.failureCount++;
    log.warn('Circuit breaker failure recorded', {
      count: this.failureCount,
      threshold: env.circuitBreakerFailureThreshold,
    });

    if (this.failureCount >= env.circuitBreakerFailureThreshold) {
      this.isTripped = true;
      log.error('Circuit breaker ACTIVATED', { reason: 'Failure threshold exceeded' });
    }
  }

  reset(): void {
    this.failureCount = 0;
    this.isTripped = false;
    log.info('Circuit breaker RESET');
  }

  getStatus(): { isTripped: boolean; failureCount: number } {
    return { isTripped: this.isTripped, failureCount: this.failureCount };
  }
}
