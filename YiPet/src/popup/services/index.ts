/**
 * Popup service aggregator — re-exports chrome + notify factories.
 */
export type { ChromeService, TabRef } from './chrome';
export { createChromeService } from './chrome';
export { connect } from './connection';
export type { NotifyController } from './notification';
export { createNotifyController } from './notification';
