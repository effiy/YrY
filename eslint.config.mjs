// ESLint flat config — 项目自带规则，不依赖 @eslint/js 包
// 迁移自 .eslintrc.json (ESLint v9+ 不再读旧格式)

const recommendedRules = {
  // eslint:recommended 等价子集 — 仅启用项目实际需要的规则
  'no-cond-assign': 'error',
  'no-constant-condition': 'warn',
  'no-debugger': 'error',
  'no-dupe-keys': 'error',
  'no-dupe-args': 'error',
  'no-duplicate-case': 'error',
  'no-empty': 'warn',
  'no-extra-semi': 'error',
  'no-irregular-whitespace': 'error',
  'no-mixed-spaces-and-tabs': 'error',
  'no-redeclare': 'error',
  'no-sparse-arrays': 'error',
  'no-undef': 'error',
  'no-unexpected-multiline': 'error',
  'no-unreachable': 'error',
  'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
  'no-useless-escape': 'warn',
  'use-isnan': 'error',
  'valid-typeof': 'error',
  // 项目范式约束
  'no-console': 'off',
  'prefer-const': 'error',
  'no-var': 'error',
  'eqeqeq': ['error', 'always', { null: 'ignore' }],
};

const testGlobals = {
  describe: 'readonly', it: 'readonly', test: 'readonly', expect: 'readonly',
  beforeAll: 'readonly', afterAll: 'readonly', beforeEach: 'readonly', afterEach: 'readonly',
  vi: 'readonly',
};

const nodeGlobals = {
  console: 'readonly', process: 'readonly', Buffer: 'readonly',
  __dirname: 'readonly', __filename: 'readonly',
  module: 'readonly', require: 'readonly', URL: 'readonly',
  setTimeout: 'readonly', clearTimeout: 'readonly',
  setInterval: 'readonly', clearInterval: 'readonly',
  queueMicrotask: 'readonly', performance: 'readonly',
  structuredClone: 'readonly', fetch: 'readonly',
  AbortController: 'readonly', AbortSignal: 'readonly',
  URLSearchParams: 'readonly', URL: 'readonly',
};

export default [
  {
    ignores: [
      'node_modules/', 'dist/', '.claude/', 'cdn/', 'coverage/',
      'docs/', 'package-lock.json',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...nodeGlobals },
    },
    rules: recommendedRules,
  },
  {
    files: [
      '**/tests/**/*.test.mjs',
      'lib/tests/**/*.mjs',
      'lib/test-harness.mjs',
      'lib/test-helpers.mjs',
      'lib/vitest-adapter.mjs',
      'skills/rui/tests/infrastructure/**/*.mjs',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...nodeGlobals, ...testGlobals },
    },
  },
];
