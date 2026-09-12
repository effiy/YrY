/**
 * Theme System Foundation — YP-09-33.
 *
 * Provides theme token management, CSS variable injection, and
 * runtime theme switching with persistence to chrome.storage.local.
 */
interface ThemeTokens {
  primary: string;
  primaryRgb: string;
  primaryGradient: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

interface ThemePreset {
  id: string;
  name: string;
  tokens: ThemeTokens;
  isDark: boolean;
}

const PRESETS: ThemePreset[] = [
  {
    id: 'default-light',
    name: 'Default Light',
    isDark: false,
    tokens: {
      primary: '#5470c6',
      primaryRgb: '84, 112, 198',
      primaryGradient: 'linear-gradient(135deg, #5470c6, #4460b0)',
      surface: '#ffffff',
      surfaceSecondary: '#f5f7fa',
      text: '#303133',
      textSecondary: '#909399',
      border: '#e4e7ed',
      shadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: 'default-dark',
    name: 'Default Dark',
    isDark: true,
    tokens: {
      primary: '#7b9cf6',
      primaryRgb: '123, 156, 246',
      primaryGradient: 'linear-gradient(135deg, #7b9cf6, #6a8be6)',
      surface: '#1e1e2e',
      surfaceSecondary: '#2a2a3c',
      text: '#e4e7ed',
      textSecondary: '#909399',
      border: '#3a3a4c',
      shadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    isDark: false,
    tokens: {
      primary: '#e6a23c',
      primaryRgb: '230, 162, 60',
      primaryGradient: 'linear-gradient(135deg, #f5a623, #e6a23c)',
      surface: '#fff8f0',
      surfaceSecondary: '#fff0e0',
      text: '#5c3d1a',
      textSecondary: '#a68a6a',
      border: '#f0d8b0',
      shadow: '0 2px 12px rgba(230, 162, 60, 0.2)',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    isDark: true,
    tokens: {
      primary: '#67c23a',
      primaryRgb: '103, 194, 58',
      primaryGradient: 'linear-gradient(135deg, #67c23a, #5aaf30)',
      surface: '#1a2e1a',
      surfaceSecondary: '#223822',
      text: '#d4e8c8',
      textSecondary: '#8aaa7a',
      border: '#3a5a2a',
      shadow: '0 2px 12px rgba(103, 194, 58, 0.2)',
    },
  },
];

const STORAGE_KEY = 'yipet:theme';

class ThemeSystem {
  private _currentThemeId: string = 'default-light';
  private _customThemes: Map<string, ThemeTokens> = new Map();

  get currentId(): string {
    return this._currentThemeId;
  }

  get presets(): ThemePreset[] {
    return PRESETS;
  }

  getCurrentPreset(): ThemePreset | undefined {
    return PRESETS.find(p => p.id === this._currentThemeId);
  }

  /** Apply a theme by ID (preset or custom). */
  async apply(themeId: string): Promise<void> {
    const preset = PRESETS.find(p => p.id === themeId);
    const tokens = preset?.tokens ?? this._customThemes.get(themeId);
    if (!tokens) return;

    this._currentThemeId = themeId;
    this._injectTokens(tokens);

    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: themeId });
    } catch {
      // best effort
    }
  }

  /** Register a custom theme. */
  async registerCustom(id: string, tokens: ThemeTokens): Promise<void> {
    this._customThemes.set(id, tokens);
  }

  /** Remove a custom theme. */
  async removeCustom(id: string): Promise<void> {
    this._customThemes.delete(id);
    if (this._currentThemeId === id) {
      await this.apply('default-light');
    }
  }

  /** Restore persisted theme on init. */
  async restore(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const saved = result[STORAGE_KEY] as string | undefined;
      if (saved) {
        await this.apply(saved);
        return;
      }
    } catch {
      // best effort
    }
    await this.apply('default-light');
  }

  /** Get current tokens. */
  getCurrentTokens(): ThemeTokens | undefined {
    const preset = PRESETS.find(p => p.id === this._currentThemeId);
    return preset?.tokens ?? this._customThemes.get(this._currentThemeId);
  }

  private _injectTokens(tokens: ThemeTokens): void {
    const root = document.documentElement;
    root.style.setProperty('--yipet-primary', tokens.primary);
    root.style.setProperty('--yipet-primary-rgb', tokens.primaryRgb);
    root.style.setProperty('--yipet-primary-gradient', tokens.primaryGradient);
    root.style.setProperty('--yipet-surface', tokens.surface);
    root.style.setProperty('--yipet-surface-secondary', tokens.surfaceSecondary);
    root.style.setProperty('--yipet-text', tokens.text);
    root.style.setProperty('--yipet-text-secondary', tokens.textSecondary);
    root.style.setProperty('--yipet-border', tokens.border);
    root.style.setProperty('--yipet-shadow', tokens.shadow);
  }
}

export const themeSystem = new ThemeSystem();
export type { ThemeTokens, ThemePreset };