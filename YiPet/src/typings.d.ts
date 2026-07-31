/**
 * Module type declarations — ambient type definitions for non-TS imports.
 *
 * Usage: declare *.css, *.png, *.svg, etc. so TypeScript can resolve
 * these imports without error. The actual bundling is handled by Rsbuild.
 */

/* ── Style Modules ─────────────────────────────────────────────────────── */

declare module '*.css';

/* ── Image Assets ──────────────────────────────────────────────────────── */

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}
