/** Keyboard Shortcuts System — public API re-exports.
 *
 * Types + config live in shortcutTypes.ts.
 * KeyboardRegistry class lives in keyboardRegistry.ts.
 */

export type { ConflictRecord, ShortcutBinding, ShortcutScope } from './shortcutTypes';
export { displayKeys } from './shortcutTypes';
export { KeyboardRegistry, STORAGE_KEY } from './keyboardRegistry';

import { KeyboardRegistry } from './keyboardRegistry';
export const keyboardRegistry = new KeyboardRegistry();