/**
 * Theme configuration — content script entry point.
 *
 * Content script bundles (bootstrap.js, content.js) are emitted as IIFE
 * and cannot resolve imports at runtime. However, the source files are
 * processed by the bundler (Rsbuild), which inlines the shared module's
 * `applyThemeColors` implementation into the final bundle.
 *
 * This file serves as the content-script-side binding so that overlay.ts
 * (MAIN world) and relay.ts (ISOLATED world) can apply themes to the
 * shared DOM containers without each importing the shared module path
 * directly. The actual logic lives in `@/shared/theme/colors.ts`.
 *
 * @keep-in-sync src/shared/theme/colors.ts
 */

export {
  applyThemeColors,
  clearThemeColors,
  applyThemeHex,
  THEME_PALETTES,
  THEME_VAR_KEYS,
  NONE_PALETTE,
} from '@/shared/theme/colors';

export type { ThemePalette } from '@/shared/theme/colors';