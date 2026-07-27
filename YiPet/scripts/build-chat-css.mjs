/**
 * Build chat.css from component-level source files.
 *
 * Auto-discovers CSS files from src/chat/styles/ (shared)
 * and src/chat/components/ (co-located component CSS).
 *
 * Concatenates in dependency order and writes to public/cdn/styles/chat.css.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const stylesDir = resolve(root, 'src/chat/styles');
const componentsDir = resolve(root, 'src/chat/components');
const outputPath = resolve(root, 'dist', 'cdn', 'styles', 'chat.css');

// ── File discovery ────────────────────────────────────────────────────

function readCSS(filePath) {
  return readFileSync(filePath, 'utf-8').trimEnd();
}

// Shared CSS — loaded first and last
const sharedFirst = ['tokens.css', 'layout.css'];
const sharedLast = ['chat-markdown.css', 'animations.css', 'scrollbar.css'];

// Component CSS — in dependency order (co-located with TSX)
const componentOrder = [
  'ChatWindow/ChatWindow.css',
  'ChatHeader/ChatHeader.css',
  'ChatMessages/ChatMessages.css',
  'MessageBubble/MessageBubble.css',
  'WelcomeCard/WelcomeCard.css',
  'ChatInput/ChatInput.css',
  'ChatSidebar/ChatSidebar.css',
  'SearchBar/SearchBar.css',
  'SessionListItem/SessionListItem.css',
];

// ── Build ─────────────────────────────────────────────────────────────

const parts = [];
let totalLines = 0;
const errors = [];

function addFile(label, filePath) {
  try {
    const content = readCSS(filePath);
    parts.push(content);
    const lines = content.split('\n').length;
    totalLines += lines;
    console.log(`  ✓ ${label} (${lines} lines)`);
  } catch (err) {
    errors.push(`${label}: ${err.message}`);
    console.log(`  ✗ ${label} — SKIPPED`);
  }
}

// Shared-first
for (const name of sharedFirst) {
  addFile(name, resolve(stylesDir, name));
}

// Components
for (const name of componentOrder) {
  addFile(name, resolve(componentsDir, name));
}

// Shared-last
for (const name of sharedLast) {
  addFile(name, resolve(stylesDir, name));
}

if (errors.length > 0) {
  console.error(`\n  ⚠️  ${errors.length} file(s) missing (non-fatal)`);
}

const output = parts.join('\n\n') + '\n';

const outDir = resolve(root, 'dist', 'cdn', 'styles');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(outputPath, output, 'utf-8');
console.log(`\n  📦 ${outputPath} (${totalLines} lines total)`);
