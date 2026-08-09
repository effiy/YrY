/**
 * Mermaid theme configuration — maps the 15 themes from
 * .claude/skills/mermaid to mermaid's `themeVariables` API.
 *
 * The skill provides bg, fg, accent, muted, line, surface, border colors;
 * this module maps each to the corresponding mermaid themeVariable keys
 * and auto-derives missing values for themes with only bg+fg.
 *
 * Reference: .claude/skills/mermaid/references/THEMES.md
 */
import type { MermaidConfig } from "mermaid";

/** Subset of mermaid themeVariables we populate. */
export type MermaidThemeVars = NonNullable<MermaidConfig["themeVariables"]>;

// ── Color helpers ──────────────────────────────────────────────────────────

/** Parse hex color to RGB tuple. */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/** Blend two hex colors by ratio (0 = a, 1 = colorB). */
function blend(a: string, colorB: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(colorB);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Add an absolute luminance delta to a hex color (clamped 0-255). */
function adjustLuminance(hex: string, delta: number): string {
  // Simple approach: add delta to each channel equally (perceptual-agnostic but works)
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const [r, g, b] = hexToRgb(hex);
  return `#${clamp(r + delta).toString(16).padStart(2, "0")}${clamp(g + delta).toString(16).padStart(2, "0")}${clamp(b + delta).toString(16).padStart(2, "0")}`;
}

/** Lighten a dark color for surface/background use. */
function lighten(hex: string, amount: number): string {
  return blend(hex, "#ffffff", amount);
}

/** Darken a light color for muted/secondary use. */
function darken(hex: string, amount: number): string {
  return blend(hex, "#000000", amount);
}

// ── Theme definitions ──────────────────────────────────────────────────────

interface ThemeColors {
  bg: string;
  fg: string;
  accent?: string;
  muted?: string;
  line?: string;
  surface?: string;
  border?: string;
}

/**
 * Build a full mermaid themeVariables object from a theme's color set.
 * When a color is omitted, it is auto-derived from bg/fg/accent.
 */
function buildThemeVars(c: ThemeColors): MermaidThemeVars {
  const accent = c.accent ?? c.fg;
  const muted = c.muted ?? (isDark(c.bg) ? lighten(c.bg, 0.15) : darken(c.bg, 0.08));
  const line = c.line ?? blend(c.bg, accent, 0.35);
  const surface = c.surface ?? (isDark(c.bg) ? lighten(c.bg, 0.1) : darken(c.bg, 0.04));
  const border = c.border ?? blend(c.bg, accent, 0.25);

  return {
    // Primary — used for node fills
    primaryColor: accent,
    primaryBorderColor: border,
    primaryTextColor: c.fg,

    // Secondary — used for note/alt blocks
    secondaryColor: muted,
    secondaryBorderColor: border,
    secondaryTextColor: c.fg,

    // Tertiary — used for deeper nesting
    tertiaryColor: surface,
    tertiaryBorderColor: border,
    tertiaryTextColor: c.fg,

    // Edges
    lineColor: line,

    // Background fills
    mainBkg: c.bg,
    background: c.bg,
    clusterBkg: surface,
    clusterBorder: border,

    // Labels and edge labels
    edgeLabelBackground: surface,
    labelBoxBkgColor: surface,
    labelBoxBorderColor: border,
    labelTextColor: c.fg,

    // Titles
    titleColor: c.fg,

    // Nodes
    nodeBorder: line,
    nodeTextColor: c.fg,

    // Notes
    noteBkgColor: surface,
    noteTextColor: c.fg,
    noteBorderColor: border,

    // Sequence diagram actors
    actorBorder: line,
    actorBkg: surface,
    actorTextColor: c.fg,
    actorLineColor: line,

    // Sequence diagram signals
    signalColor: c.fg,
    signalTextColor: c.fg,

    // Sequence diagram activations
    activationBorderColor: border,
    activationBkgColor: muted,

    // Sequence diagram loops
    loopTextColor: c.fg,

    // Sequence numbers
    sequenceNumberColor: muted,
  };
}

/** Rough heuristic: is this hex color "dark"? */
function isDark(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return r + g + b < 384; // midpoint of 3×255=765
}

// ── 15 Theme definitions (from .claude/skills/mermaid/references/THEMES.md) ──

const THEME_DEFS: Record<string, ThemeColors> = {
  // ── Light themes (6) ──
  "zinc-light":        { bg: "#ffffff", fg: "#27272a" },
  "tokyo-night-light": { bg: "#d5d6db", fg: "#34548a" },
  "catppuccin-latte":  { bg: "#eff1f5", fg: "#8839ef" },
  "nord-light":        { bg: "#eceff4", fg: "#5e81ac" },
  "github-light":      { bg: "#ffffff", fg: "#0969da" },
  "solarized-light":   { bg: "#fdf6e3", fg: "#268bd2" },

  // ── Dark themes (9) ──
  "zinc-dark":           { bg: "#18181b", fg: "#a1a1aa" },
  "tokyo-night":         { bg: "#1a1b26", fg: "#a9b1d6", accent: "#7aa2f7",
                           muted: "#565f89", line: "#3d59a1", surface: "#292e42", border: "#3d59a1" },
  "tokyo-night-storm":   { bg: "#24283b", fg: "#a9b1d6", accent: "#7aa2f7",
                           muted: "#565f89", line: "#3d59a1", surface: "#1f2335", border: "#3d59a1" },
  "catppuccin-mocha":    { bg: "#1e1e2e", fg: "#cba6f7" },
  "nord":                { bg: "#2e3440", fg: "#d8dee9" },
  "dracula":             { bg: "#282a36", fg: "#f8f8f2",
                           accent: "#bd93f9", muted: "#44475a", line: "#6272a4", surface: "#383a59", border: "#6272a4" },
  "github-dark":         { bg: "#0d1117", fg: "#4493f8" },
  "solarized-dark":      { bg: "#002b36", fg: "#268bd2" },
  "one-dark":            { bg: "#282c34", fg: "#abb2bf" },
};

// ── Public API ─────────────────────────────────────────────────────────────

/** All available theme names. */
export const MERMAID_THEME_NAMES = Object.keys(THEME_DEFS) as readonly string[];

/** Default light-mode theme. */
export const LIGHT_THEME_DEFAULT = "github-light";

/** Default dark-mode theme. */
export const DARK_THEME_DEFAULT = "tokyo-night";

/**
 * Get the full mermaid config (theme + themeVariables) for a given theme.
 *
 * @param isDark - Whether the app is in dark mode (used to pick default theme)
 * @param themeName - Optional specific theme name from THEME_DEFS
 */
export function getMermaidThemeConfig(
  isDark: boolean,
  themeName?: string,
): { theme: "base"; themeVariables: MermaidThemeVars } {
  const name = themeName ?? (isDark ? DARK_THEME_DEFAULT : LIGHT_THEME_DEFAULT);
  const def = THEME_DEFS[name] ?? THEME_DEFS[isDark ? DARK_THEME_DEFAULT : LIGHT_THEME_DEFAULT];
  return {
    theme: "base" as const,
    themeVariables: buildThemeVars(def),
  };
}
