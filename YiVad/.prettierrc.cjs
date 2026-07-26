// @see: https://www.prettier.cn

module.exports = {
  // Specify the maximum line length
  printWidth: 130,
  // Indentation tab width | number of spaces
  tabWidth: 2,
  // Use tabs instead of spaces for indentation (true: tabs, false: spaces)
  useTabs: false,
  // Use semicolons at the end of statements (true: yes, false: no)
  semi: true,
  // Use single quotes instead of double quotes (true: single quotes, false: double quotes)
  singleQuote: false,
  // Decide whether to quote property names in object literals. Options: "<as-needed|consistent|preserve>"
  quoteProps: "as-needed",
  // Use single quotes instead of double quotes in JSX (true: single quotes, false: double quotes)
  jsxSingleQuote: false,
  // Print trailing commas wherever possible in multi-line. Options: "<none|es5|all>"
  trailingComma: "none",
  // Print spaces between brackets in object literals (true: yes, false: no)
  bracketSpacing: true,
  // Put the > of a multi-line element at the end of the last line instead of alone on the next line
  bracketSameLine: false,
  // Include parentheses around a sole arrow function parameter (avoid: omit parens, always: include parens)
  arrowParens: "avoid",
  // Specify which parser to use, no need to write @prettier at the top of files
  requirePragma: false,
  // Insert a special @prettier pragma at the top of files to specify they have been formatted with Prettier
  insertPragma: false,
  // Control how text should be wrapped
  proseWrap: "preserve",
  // How whitespace is handled in HTML. "css" - respect CSS display defaults, "strict" - whitespace is sensitive, "ignore" - whitespace is insensitive
  htmlWhitespaceSensitivity: "css",
  // Control indentation of <script> and <style> tags in Vue single-file components
  vueIndentScriptAndStyle: false,
  // Line ending style. Options: "<auto|lf|crlf|cr>"
  endOfLine: "auto",
  // Format code within the given character offset range (rangeStart: start, rangeEnd: end)
  rangeStart: 0,
  rangeEnd: Infinity
};
