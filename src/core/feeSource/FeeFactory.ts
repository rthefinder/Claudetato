import { FeeSource } from './FeeSource';
import { MockFeeSource } from './MockFeeSource';
import { WalletWatcherFeeSource } from './WalletWatcherFeeSource';
import { env } from '../../config/env';
import { getLogger } from '../../utils/logger';

const log = getLogger('FeeFactory');

export function createFeeSource(): FeeSource {
  if (env.experimentMode === 'dry-run') {
    log.info('Creating mock fee source (dry-run mode)');
    return new MockFeeSource();
  }

  log.info('Creating wallet watcher fee source (live mode)');
  return new WalletWatcherFeeSource();
}
