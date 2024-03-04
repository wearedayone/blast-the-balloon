import listener, { queryEvent } from './listeners/game.listener.js';
import logger from './utils/logger.js';

logger.info('start setupEventListener ');
listener();
// queryEvent();
