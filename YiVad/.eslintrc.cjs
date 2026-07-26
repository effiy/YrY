// @see: http://eslint.cn

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  // Specifies how to parse syntax
  parser: "vue-eslint-parser",
  // Parser options with lower priority than parser's syntax config
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020,
    sourceType: "module",
    jsxPragma: "React",
    ecmaFeatures: {
      jsx: true
    }
  },
  // Inherits certain existing rules
  extends: ["plugin:vue/vue3-recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  /**
   * "off" or 0    ==>  turn off the rule
   * "warn" or 1   ==>  turn on as warning (does not affect code execution)
   * "error" or 2  ==>  turn on as error (code cannot execute, interface shows error)
   */
  rules: {
    // eslint (http://eslint.cn/docs/rules)
    "no-var": "error", // Require let or const instead of var
    "no-multiple-empty-lines": ["error", { max: 1 }], // Disallow multiple empty lines
    "prefer-const": "off", // Require const declarations for variables that are never reassigned after declared
    "no-use-before-define": "off", // Disallow the use of variables before they are defined

    // typeScript (https://typescript-eslint.io/rules)
    "@typescript-eslint/no-unused-vars": "error", // Disallow unused variables
    "@typescript-eslint/no-empty-function": "error", // Disallow empty functions
    "@typescript-eslint/prefer-ts-expect-error": "error", // Disallow @ts-ignore
    "@typescript-eslint/ban-ts-comment": "error", // Disallow @ts-<directive> comments or require descriptions after directives
    "@typescript-eslint/no-inferrable-types": "off", // Explicit types where they can be easily inferred may add unnecessary verbosity
    "@typescript-eslint/no-namespace": "off", // Disallow custom TypeScript modules and namespaces
    "@typescript-eslint/no-explicit-any": "off", // Disallow the any type
    "@typescript-eslint/ban-types": "off", // Disallow specific types
    "@typescript-eslint/no-var-requires": "off", // Allow require() imports
    "@typescript-eslint/no-non-null-assertion": "off", // Disallow non-null assertions using the ! postfix operator

    // vue (https://eslint.vuejs.org/rules)
    "vue/script-setup-uses-vars": "error", // Prevent variables used in <script setup> from being marked as unused
    "vue/v-slot-style": "error", // Enforce v-slot directive style
    "vue/no-mutating-props": "error", // Disallow mutating component props
    "vue/custom-event-name-casing": "error", // Enforce specific casing for custom event names
    "vue/html-closing-bracket-newline": "error", // Require or disallow a line break before closing brackets
    "vue/attribute-hyphenation": "error", // Enforce attribute naming style on custom components: my-prop="prop"
    "vue/attributes-order": "off", // Vue API ordering, enforce attributes order
    "vue/no-v-html": "off", // Disallow use of v-html
    "vue/require-default-prop": "off", // Require default value for each required prop
    "vue/multi-word-component-names": "off", // Require component names to always be multi-word
    "vue/no-setup-props-destructure": "off" // Disallow destructuring of props passed to setup
  }
};
