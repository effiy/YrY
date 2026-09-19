import { ref, readonly, onBeforeUnmount } from 'vue';
import {
  applyThemeColors,
  applyElementTheme,
  clearThemeColors,
  clearElementTheme,
  resolvePalette,
  THEME_PALETTES,
  NONE_PALETTE,
  type ThemePalette,
  type ColorScheme,
} from '@/shared/theme';

const STORAGE_KEYS = {
  colorIndex: 'yipet:theme:color-index',
  isDark: 'yipet:theme:is-dark',
} as const;

type ScopeToken = 'menu' | 'aside' | 'header';

const SCOPE_VAR_OVERRIDES: Record<ScopeToken, Partial<Record<keyof ThemePalette, string>>> = {
  header: {
    surfaceRaised: '--yp-header-bg',
    borderSubtle: '--yp-header-border',
    textPrimary: '--yp-header-text-primary',
    textSecondary: '--yp-header-text-secondary',
    accent: '--yp-header-accent',
  },
  menu: {
    surfaceBase: '--yp-surface-sunken',
    surfaceSunken: '--yp-surface-base',
    borderSubtle: '--yp-border-subtle',
  },
  aside: {
    surfaceBase: '--yp-surface-sunken',
    surfaceSunken: '--yp-surface-base',
    borderSubtle: '--yp-border-subtle',
  },
};

const registeredScopes = new WeakSet<HTMLElement>();
const mediaQuery = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null;

function safeGetItem(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSetItem(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* noop */ }
}

export function useTheme(options?: { autoFollowSystem?: boolean; persist?: boolean }) {
  const autoFollowSystem = options?.autoFollowSystem ?? false;
  const persist = options?.persist ?? true;

  const initialColor = Number(safeGetItem(STORAGE_KEYS.colorIndex) ?? '1');
  const initialDark = persist
    ? safeGetItem(STORAGE_KEYS.isDark) === 'true'
    : true;

  const colorIndex = ref<number>(Number.isInteger(initialColor) ? initialColor : 1);
  const isDark = ref<boolean>(initialDark);
  const currentPalette = ref<ThemePalette>(resolvePalette(colorIndex.value).palette);
  const currentScheme = ref<ColorScheme>(isDark.value ? 'dark' : 'light');

  function refreshPaletteRefs(): void {
    const { palette, scheme } = resolvePalette(colorIndex.value);
    currentPalette.value = palette;
    currentScheme.value = colorIndex.value < 0 ? 'light' : scheme;
  }

  function applyToRoot(root: HTMLElement): void {
    if (!root) return;
    clearThemeColors(root);
    clearElementTheme(root);
    applyThemeColors(root, colorIndex.value);
    applyElementTheme(root, colorIndex.value);
  }

  function clearFromRoot(root: HTMLElement): void {
    if (!root) return;
    clearThemeColors(root);
    clearElementTheme(root);
  }

  function applyScopeVars(root: HTMLElement, scope: ScopeToken): void {
    if (!root || registeredScopes.has(root)) return;
    const overrides = SCOPE_VAR_OVERRIDES[scope];
    if (!overrides) return;
    const style = root.style;
    for (const [, cssVar] of Object.entries(overrides)) {
      const source = getComputedStyle(root).getPropertyValue(cssVar).trim();
      if (source) style.setProperty(cssVar, source);
    }
    registeredScopes.add(root);
  }

  function setColorIndex(idx: number): void {
    const safe = colorIndex.value === idx;
    if (safe && !persist) return;
    colorIndex.value = idx;
    if (persist) safeSetItem(STORAGE_KEYS.colorIndex, String(idx));
    refreshPaletteRefs();
    const root = document.getElementById('yipet-chat-root') ?? document.getElementById('yipet-overlay') as HTMLElement | null;
    if (root) applyToRoot(root);
  }

  function nextPalette(): void {
    if (colorIndex.value < 0) { setColorIndex(0); return; }
    const next = (colorIndex.value + 1) % THEME_PALETTES.length;
    setColorIndex(next);
  }

  function setDark(dark: boolean): void {
    isDark.value = dark;
    if (persist) safeSetItem(STORAGE_KEYS.isDark, String(dark));
    refreshPaletteRefs();
    document.documentElement.classList.toggle('dark', dark);
  }

  function toggleDark(): void {
    setDark(!isDark.value);
  }

  function setPaletteNone(): void {
    setColorIndex(-1);
  }

  function resetDefaults(): void {
    setColorIndex(1);
    setDark(true);
  }

  const onSystemThemeChange = (e: MediaQueryListEvent): void => {
    if (!autoFollowSystem) return;
    setDark(e.matches);
  };

  if (autoFollowSystem && mediaQuery) {
    setDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', onSystemThemeChange);
  }

  onBeforeUnmount(() => {
    if (mediaQuery) mediaQuery.removeEventListener('change', onSystemThemeChange);
  });

  refreshPaletteRefs();

  return {
    isDark: readonly(isDark),
    colorIndex: readonly(colorIndex),
    palette: readonly(currentPalette),
    scheme: readonly(currentScheme),
    setColorIndex,
    nextPalette,
    setDark,
    toggleDark,
    setPaletteNone,
    resetDefaults,
    applyToRoot,
    clearFromRoot,
    applyScopeVars,
    palettes: THEME_PALETTES,
    nonePalette: NONE_PALETTE,
  };
}

export { THEME_PALETTES, NONE_PALETTE };