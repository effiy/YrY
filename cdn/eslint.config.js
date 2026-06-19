/**
 * ESLint v9 flat config — yry-cdn
 *
 * 范围:
 *   - shared.js / shared-reports.js / js/<name>.js (浏览器 IIFE 库,window 全局)
 *   - yry-<name>/index.js (Vue 3 自定义元素 loader)
 *   - scripts/<name>.mjs (工程化脚本)
 *
 * 规则要点:
 *   - 浏览器代码:允许 window/document/fetch (env browser)
 *   - 工程脚本:ESM + Node 18 (env node)
 *   - 严禁 class/extends(项目铁律·范式合规)
 *   - 严禁空 catch (--no-empty-catch)
 */

export default [
  {
    ignores: [
      'node_modules/**',
      'fonts/**',
      '健康报告/**', // 历史档案(已重构至 docs/健康报告/),占位以避免 ESLint 缓存路径漂移
      '故事任务面板/**',
      'components.manifest.json',
      'cdn-summary.json',
      'health-report.json',
      'releases.json'
    ]
  },
  // ── 浏览器代码 (shared.js / shared-reports.js / js/<name>.js / yry-<name>/index.js) ──
  {
    files: ['shared.js', 'shared-reports.js', 'js/**/*.js', 'yry-*/index.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        DOMParser: 'readonly',
        CustomEvent: 'readonly',
        URL: 'readonly',
        HTMLElement: 'readonly',
        customElements: 'readonly',
        // 第三方运行时依赖 (consumers 提供)
        Vue: 'readonly',
        html2canvas: 'readonly',
        jspdf: 'readonly',
        cytoscape: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-console': 'off',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'warn',
      'no-var': 'warn',
      strict: ['error', 'function']
    }
  },
  // ── Node ESM 脚本 ──
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: false }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error'
    }
  }
];
