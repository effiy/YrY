// @see: https://stylelint.io

module.exports = {
  root: true,
  // Inherit certain existing rules
  extends: [
    "stylelint-config-standard", // Configure stylelint extensions
    "stylelint-config-html/vue", // Configure Vue template style formatting
    "stylelint-config-standard-scss", // Configure stylelint SCSS plugin
    "stylelint-config-recommended-vue/scss", // Configure Vue SCSS style formatting
    "stylelint-config-recess-order" // Configure stylelint CSS property order plugin
  ],
  overrides: [
    // Scan <style> tags in .vue/html files
    {
      files: ["**/*.{vue,html}"],
      customSyntax: "postcss-html"
    }
  ],
  rules: {
    "function-url-quotes": "always", // URL quotes "always(require quotes)"|"never(no quotes)"
    "color-hex-length": "long", // Specify shorthand or longhand for hex colors "short(hex shorthand)"|"long(hex longhand)"
    "rule-empty-line-before": "never", // Require or disallow empty lines before rules
    "font-family-no-missing-generic-family-keyword": null, // Disallow missing generic font family keywords
    "scss/at-import-partial-extension": null, // Fix issue with @import for SCSS files
    "property-no-unknown": null, // Disallow unknown properties
    "no-empty-source": null, // Disallow empty sources
    "selector-class-pattern": null, // Enforce selector class name format
    "value-no-vendor-prefix": null, // Disable vendor-prefix (for multi-line ellipsis -webkit-box)
    "no-descending-specificity": null, // Disallow selectors of lower specificity from overriding higher specificity
    "value-keyword-case": null, // Fix SCSS v-bind uppercase word errors
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global", "v-deep", "deep"]
      }
    ]
  },
  ignoreFiles: ["**/*.js", "**/*.jsx", "**/*.tsx", "**/*.ts"]
};
