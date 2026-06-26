/**
 * Shared TTY/ANSI formatting helpers.
 *
 * Every script in the project that writes colored terminal output should import
 * from here instead of defining its own ANSI escapes.
 *
 * Usage:
 *   import { bold, dim, red, green, yellow, cyan } from '../../lib/tty.mjs';
 */

const ANSI_BOLD = 1;
const ANSI_DIM = 2;
const ANSI_UNDERLINE = 4;
const ANSI_RED = 31;
const ANSI_GREEN = 32;
const ANSI_YELLOW = 33;
const ANSI_CYAN = 36;
const ANSI_DEFAULT = 39;

const tty = process.stdout.isTTY;

/** @param {string} s */
export const bold = (s) => tty ? `\x1b[${ANSI_BOLD}m${s}\x1b[22m` : s;
/** @param {string} s */
export const dim = (s) => tty ? `\x1b[${ANSI_DIM}m${s}\x1b[22m` : s;
/** @param {string} s */
export const underline = (s) => tty ? `\x1b[${ANSI_UNDERLINE}m${s}\x1b[24m` : s;
/** @param {string} s */
export const red = (s) => tty ? `\x1b[${ANSI_RED}m${s}\x1b[${ANSI_DEFAULT}m` : s;
/** @param {string} s */
export const green = (s) => tty ? `\x1b[${ANSI_GREEN}m${s}\x1b[${ANSI_DEFAULT}m` : s;
/** @param {string} s */
export const yellow = (s) => tty ? `\x1b[${ANSI_YELLOW}m${s}\x1b[${ANSI_DEFAULT}m` : s;
/** @param {string} s */
export const cyan = (s) => tty ? `\x1b[${ANSI_CYAN}m${s}\x1b[${ANSI_DEFAULT}m` : s;
