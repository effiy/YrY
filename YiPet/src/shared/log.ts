/**
 * Dev-gated logger — stripped from production bundles by tree-shaking.
 * All debug/info calls are wrapped in `if (IS_DEV)` blocks that Vite removes.
 */

import { IS_DEV, LOG_LEVEL } from './env';

type Level = 'debug' | 'info' | 'warn' | 'error';
const LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level: Level): boolean {
  return LEVELS[level] >= LEVELS[LOG_LEVEL as Level] || false;
}

export const logger = {
  debug(...args: unknown[]): void {
    if (IS_DEV && shouldLog('debug')) console.debug('[YiPet DEBUG]', ...args);
  },
  info(...args: unknown[]): void {
    if (shouldLog('info')) console.info('[YiPet]', ...args);
  },
  warn(...args: unknown[]): void {
    if (shouldLog('warn')) console.warn('[YiPet WARN]', ...args);
  },
  error(...args: unknown[]): void {
    console.error('[YiPet ERROR]', ...args);
  },
};
