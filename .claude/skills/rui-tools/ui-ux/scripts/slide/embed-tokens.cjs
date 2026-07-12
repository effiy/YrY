#!/usr/bin/env node
/**
 * embed-tokens.cjs
 * Reads design-tokens.css and outputs embeddable inline CSS.
 * Use when generating standalone HTML files (infographics, slides, etc.)
 *
 * Usage:
 *   node embed-tokens.cjs           # Output full CSS
 *   node embed-tokens.cjs --minimal # Output only commonly used tokens
 *   node embed-tokens.cjs --style   # Wrap in <style> tags
 */

const fs = require('fs');
const path = require('path');

// Find project root (look for assets/design-tokens.css)
function findProjectRoot(startDir) {
  let dir = startDir;
  while (dir !== '/') {
    if (fs.existsSync(path.join(dir, 'assets', 'design-tokens.css'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

const projectRoot = findProjectRoot(process.cwd());
if (!projectRoot) {
  console.error('Error: Could not find assets/design-tokens.css');
  process.exit(1);
}

const tokensPath = path.join(projectRoot, 'assets', 'design-tokens.css');

// Minimal tokens commonly used in infographics/slides
const MINIMAL_TOKENS = [
  '--primitive-spacing-',
  '--primitive-fontSize-',
  '--primitive-fontWeight-',
  '--primitive-lineHeight-',
  '--primitive-radius-',
  '--primitive-shadow-glow-',
  '--primitive-gradient-',
  '--primitive-duration-',
  '--color-primary',
  '--color-secondary',
  '--color-accent',
  '--color-background',
  '--color-surface',
  '--color-foreground',
  '--color-border',
  '--typography-font-',
  '--card-',
];

function extractTokens(css, minimal = false) {
  // Extract :root block
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/g);
  if (!rootMatch) return '';

  let allVars = [];
  for (const block of rootMatch) {
    const vars = block.match(/--[\w-]+:\s*[^;]+;/g) || [];
    allVars = allVars.concat(vars);
  }

  if (minimal) {
    allVars = allVars.filter(v =>
      MINIMAL_TOKENS.some(token => v.includes(token))
    );
  }

  // Dedupe
  allVars = [...new Set(allVars)];

  return `:root {\n  ${allVars.join('\n  ')}\n}`;
}

/** Wrap CSS in a self-contained <style> tag block (no string concatenation). */
function wrapStyleTag(cssBlock) {
  return [
    '<style>',
    '/* Design Tokens (embedded for standalone HTML) */',
    cssBlock,
    '</style>',
  ].join('\n');
}

// Parse args
const args = process.argv.slice(2);
const minimal = args.includes('--minimal');
const wrapStyle = args.includes('--style');

try {
  const css = fs.readFileSync(tokensPath, 'utf-8');
  const tokens = extractTokens(css, minimal);

  if (wrapStyle) {
    console.log(wrapStyleTag(tokens));
  } else {
    console.log(`/* Design Tokens (embedded for standalone HTML) */\n${tokens}`);
  }
} catch (err) {
  console.error(`Error reading tokens: ${err.message}`);
  process.exit(1);
}
