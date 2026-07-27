/**
 * Build-time environment access via Vite's import.meta.env.
 * All values are inlined at build time — tree-shaken in production.
 */

/** True when running `vite build --mode development`. */
export const IS_DEV: boolean = import.meta.env.DEV;

/** True when running `vite build` (the default production mode). */
export const IS_PROD: boolean = import.meta.env.PROD;

/** The mode string: 'development' | 'production' | custom. */
export const MODE: string = import.meta.env.MODE;

/** API base URL — configured via .env / .env.production. */
export const API_BASE: string = import.meta.env.VITE_API_BASE || 'http://localhost:10086';

/** Log level — configured via .env / .env.production. */
export const LOG_LEVEL: string = import.meta.env.VITE_LOG_LEVEL || (IS_DEV ? 'debug' : 'error');
