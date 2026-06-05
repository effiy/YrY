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

export function hdr(text) {
  return `\n${bold(text)}\n`;
}

export function subhdr(text) {
  return `\n${INDENT}${bold(text)}\n`;
}

export function item(cmd, desc, colorFn) {
  const left = `${SUB_INDENT}${cmd}`;
  const pad = Math.max(COLUMN_MIN_PADDING, LEFT_COLUMN_WIDTH - left.length);
  return `${colorFn ? colorFn(left) : left}${" ".repeat(pad)}${desc}`;
}

export function flag(name, desc) {
  const firstToken = name.split(/\s/)[0];
  const prefix = firstToken.length === 1 ? "-" : "--";
  return item(`  ${prefix}${name}`, desc, yellow);
}

export function scene(title) {
  return `\n${SUB_INDENT}${bold(title)}\n`;
}
