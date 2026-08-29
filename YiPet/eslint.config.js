// @see: https://eslint.org/docs/latest/use/configure/configuration-files
import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: [
      "*.sh",
      "node_modules",
      "*.md",
      "*.woff",
      "*.ttf",
      ".vscode",
      ".idea",
      "dist",
      "/public",
      "/docs",
      ".husky",
      ".local",
      "/bin",
      "stats.html"
    ]
  },
  js.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.{js,jsx,ts,tsx,vue}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es6,
        NodeJS: "readonly"
      }
    },
    rules: {
      "no-var": "error",
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "prefer-const": "off",
      "no-use-before-define": "off",
      "no-unused-vars": ["error", { args: "after-used", argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-useless-assignment": "off",

      "vue/v-slot-style": "error",
      "vue/no-mutating-props": "error",
      "vue/custom-event-name-casing": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/attribute-hyphenation": "error",
      "vue/attributes-order": "off",
      "vue/no-v-html": "off",
      "vue/require-default-prop": "off",
      "vue/multi-word-component-names": "off",
      "vue/no-setup-props-destructure": "off"
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off"
    }
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vue.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        parser: tsParser,
        ecmaFeatures: { jsx: true },
        extraFileExtensions: [".vue"]
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off"
    }
  },
  prettier
];