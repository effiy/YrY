import { TS_JS_LANGS } from './constants.js';

const REQUIRE_LITERAL_RE = /\brequire\(\s*(['"])([^'"`\n]+?)\1\s*\)/g;
const KOTLIN_IMPORT_RE =
  /^\s*import\s+(\w+(?:\.\w+)*(?:\.\*)?)(?:\s+as\s+\w+)?\s*$/gm;
const RUBY_REQUIRE_RE =
  /\b(require_relative|require)\s*\(?\s*(['"])([^'"`\n]+?)\2/g;
const RUST_MOD_RE = /^\s*(?:pub(?:\s*\([^)]*\))?\s+)?mod\s+(\w+)\s*;\s*$/gm;

function stripJsLikeComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
}

function stripRubyComments(content) {
  return content.replace(/#[^\n]*/g, '');
}

function extractRequireSources(content) {
  const sources = [];
  let match;
  const stripped = stripJsLikeComments(content);
  REQUIRE_LITERAL_RE.lastIndex = 0;
  while ((match = REQUIRE_LITERAL_RE.exec(stripped)) !== null) {
    sources.push(match[2]);
  }
  return sources;
}

function extractKotlinSources(content) {
  const sources = [];
  let match;
  KOTLIN_IMPORT_RE.lastIndex = 0;
  while ((match = KOTLIN_IMPORT_RE.exec(content)) !== null) {
    sources.push(match[1]);
  }
  return sources;
}

function extractRustModSources(content) {
  const sources = [];
  let match;
  const stripped = stripJsLikeComments(content);
  RUST_MOD_RE.lastIndex = 0;
  while ((match = RUST_MOD_RE.exec(stripped)) !== null) {
    sources.push(`self::${match[1]}`);
  }
  return sources;
}

export function parseRubyImports(content) {
  const out = [];
  let match;
  const stripped = stripRubyComments(content);
  RUBY_REQUIRE_RE.lastIndex = 0;
  while ((match = RUBY_REQUIRE_RE.exec(stripped)) !== null) {
    out.push({
      kind: match[1] === 'require_relative' ? 'relative' : 'absolute',
      source: match[3],
    });
  }
  return out;
}

export function extractExtraImportSources(file, content) {
  if (TS_JS_LANGS.has(file.language)) {
    return extractRequireSources(content);
  }
  if (file.language === 'kotlin') {
    return extractKotlinSources(content);
  }
  if (file.language === 'rust') {
    return extractRustModSources(content);
  }
  return [];
}
