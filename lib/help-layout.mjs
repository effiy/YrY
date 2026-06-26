/**
 * Shared help-text layout helpers.
 *
 * Every skills/<name>/help.mjs should import from here instead of redefining
 * hdr(), subhdr(), item(), flag(), and scene().
 *
 * Usage:
 *   import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
 *   import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';
 */

import { INDENT, SUB_INDENT, LEFT_COLUMN_WIDTH, COLUMN_MIN_PADDING } from './constants.mjs';
import { bold, yellow } from './tty.mjs';

/** Format a top-level help header (bold, newline-padded).
 * @param {string} text
 * @returns {string} */
export function hdr(text) {
  return `\n${bold(text)}\n`;
}

/** Format a subheader (indented, bold).
 * @param {string} text
 * @returns {string} */
export function subhdr(text) {
  return `\n${INDENT}${bold(text)}\n`;
}

/** Format a two-column help item (command/option + description).
 * @param {string} cmd - Command or option text
 * @param {string} desc - Description
 * @param {(s: string) => string} [colorFn] - Optional color function (e.g. yellow)
 * @returns {string} Padded single-line item */
export function item(cmd, desc, colorFn) {
  const left = `${SUB_INDENT}${cmd}`;
  const pad = Math.max(COLUMN_MIN_PADDING, LEFT_COLUMN_WIDTH - left.length);
  return `${colorFn ? colorFn(left) : left}${" ".repeat(pad)}${desc}`;
}

/** Format a CLI flag item, choosing `-` vs `--` based on first token length.
 * @param {string} name - Flag name (e.g. "h" or "help")
 * @param {string} desc - Description
 * @param {(s: string) => string} [colorFn] - Optional color function
 * @returns {string} Padded flag item */
export function flag(name, desc, colorFn) {
  const firstToken = name.split(/\s/)[0];
  const prefix = firstToken.length === 1 ? "-" : "--";
  return item(`  ${prefix}${name}`, desc, colorFn || yellow);
}

/** Format a scene section title (indented, bold).
 * @param {string} title
 * @returns {string} */
export function scene(title) {
  return `\n${SUB_INDENT}${bold(title)}\n`;
}
