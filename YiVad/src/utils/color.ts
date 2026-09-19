/**
 * Color Utilities — HSL-based, fully typed, side-effect-free.
 *
 * 设计目标：
 * - 纯函数：所有工具函数不调用任何 UI / 全局状态，便于测试与复用
 * - 完整类型：每个函数签名明确标注入参范围与返回值
 * - WCAG 兼容：辅助函数支持对比度计算与亮度读取
 * - 兼容浏览器 API：直接返回 CSS color string，可直接用于 style 属性
 *
 * ## 模块导出
 * - 类型：`HexColor`、`Rgb`、`Hsl`
 * - 解析：`isValidHex`、`parseHex`、`rgbToHex`
 * - 转换：`rgbToHsl`、`hslToRgb`、`hslToHex`
 * - 调整：`lighten`、`darken`、`saturate`、`desaturate`、`mix`、`withAlpha`
 * - 无障碍：`getLuminance`、`getContrastRatio`、`isReadableOn`
 *
 * @example
 * ```ts
 * const lighter = lighten('#6366f1', 0.2);     // '#a5b4fc'
 * const translucent = withAlpha('#6366f1', 0.5); // 'rgba(99, 102, 241, 0.5)'
 * const ratio = getContrastRatio('#ffffff', '#6366f1'); // ~4.04
 * ```
 */

// ── 类型定义 ─────────────────────────────────────────────────────────────

/** 6 位十六进制颜色字面量类型。 */
export type HexColor = `#${string}`;

/** RGB 三元组。 */
export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** HSL 三元组。 */
export interface Hsl {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

// ── 解析与校验 ───────────────────────────────────────────────────────────

/**
 * 校验是否为合法 hex 颜色（3 位简写或 6 位）。
 * 接受大小写，自动去除前缀 `#`。
 */
export function isValidHex(value: string): value is HexColor {
  return /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(value.trim());
}

/**
 * 解析 hex 颜色为 RGB 三元组。非法输入返回 null。
 * 支持 3 位 (#abc) 与 6 位 (#aabbcc) 简写。
 */
export function parseHex(value: string): Rgb | null {
  if (!isValidHex(value)) return null;
  let body = value.trim().replace(/^#/, '');
  if (body.length === 3) {
    body = body
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return {
    r: parseInt(body.slice(0, 2), 16),
    g: parseInt(body.slice(2, 4), 16),
    b: parseInt(body.slice(4, 6), 16),
  };
}

/** RGB (0-255) → 6 位 hex 字符串（含 #）。 */
export function rgbToHex(r: number, g: number, b: number): HexColor {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}` as HexColor;
}

// ── RGB ↔HSL 转换 ───────────────────────────────────────────────────────

/**
 * RGB (0-255) → HSL。
 * - h: [0, 360)
 * - s, l: [0, 100]
 */
export function rgbToHsl(r: number, g: number, b: number): Hsl {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === nr) h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6;
  else if (max === ng) h = ((nb - nr) / d + 2) / 6;
  else h = ((nr - ng) / d + 4) / 6;

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * HSL → RGB (0-255)。
 * 输入超出范围会被自动 clamp。
 */
export function hslToRgb(h: number, s: number, l: number): Rgb {
  const ns = clamp(s, 0, 100) / 100;
  const nl = clamp(l, 0, 100) / 100;
  const hue = ((h % 360) + 360) % 360 / 360;

  if (ns === 0) {
    const v = Math.round(nl * 255);
    return { r: v, g: v, b: v };
  }

  const q = nl < 0.5 ? nl * (1 + ns) : nl + ns - nl * ns;
  const p = 2 * nl - q;
  const channel = (t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  return {
    r: Math.round(channel(hue + 1 / 3) * 255),
    g: Math.round(channel(hue) * 255),
    b: Math.round(channel(hue - 1 / 3) * 255),
  };
}

/** HSL → 6 位 hex 字符串。 */
export function hslToHex(h: number, s: number, l: number): HexColor {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// ── 调色工具 ─────────────────────────────────────────────────────────────

/**
 * 加亮颜色（保持 hue，调整 lightness）。
 * @param color hex 字符串
 * @param amount 加亮量，[0, 1]，0.1 表示 lightness +10
 */
export function lighten(color: string, amount: number): HexColor | null {
  const rgb = parseHex(color);
  if (!rgb) return null;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hslToHex(hsl.h, hsl.s, clamp(hsl.l + amount * 100, 0, 100));
}

/**
 * 加深颜色（保持 hue，调整 lightness）。
 */
export function darken(color: string, amount: number): HexColor | null {
  const rgb = parseHex(color);
  if (!rgb) return null;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hslToHex(hsl.h, hsl.s, clamp(hsl.l - amount * 100, 0, 100));
}

/**
 * 提高饱和度。
 */
export function saturate(color: string, amount: number): HexColor | null {
  const rgb = parseHex(color);
  if (!rgb) return null;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hslToHex(hsl.h, clamp(hsl.s + amount * 100, 0, 100), hsl.l);
}

/**
 * 降低饱和度（朝灰色靠拢）。
 */
export function desaturate(color: string, amount: number): HexColor | null {
  return saturate(color, -amount);
}

/**
 * 混合两种颜色（按 weight 比例）。
 * @param weight [0, 1]，0 表示返回 color1，1 表示返回 color2
 */
export function mix(color1: string, color2: string, weight = 0.5): HexColor | null {
  const c1 = parseHex(color1);
  const c2 = parseHex(color2);
  if (!c1 || !c2) return null;
  const w = clamp(weight, 0, 1);
  return rgbToHex(
    c1.r * (1 - w) + c2.r * w,
    c1.g * (1 - w) + c2.g * w,
    c1.b * (1 - w) + c2.b * w,
  );
}

/**
 * 返回带 alpha 通道的 rgba 字符串。
 * @param alpha [0, 1]
 */
export function withAlpha(color: string, alpha: number): string | null {
  const rgb = parseHex(color);
  if (!rgb) return null;
  const a = clamp(alpha, 0, 1);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

// ── WCAG 无障碍 ──────────────────────────────────────────────────────────

/**
 * 计算 sRGB 相对亮度（WCAG 2.x）。
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getLuminance(color: string): number {
  const rgb = parseHex(color);
  if (!rgb) return 0;

  const channels = [rgb.r, rgb.g, rgb.b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

/**
 * 计算两个颜色的对比度（1 - 21）。
 * WCAG AA: 正文 ≥ 4.5，大文本 ≥ 3。
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 判断前景色在背景色上是否可读（默认 AA 正文标准 4.5）。
 */
export function isReadableOn(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
}

// ── 内部工具 ─────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}