/**
 * Aggregator: every concrete language extractor must be registered here.
 *
 * Refactor note (2026-07-18): extractors whose implementation file grew
 * beyond ~400 lines are now split into a sibling directory of the same
 * name (e.g. `cpp-extractor.js` → `cpp/index.js`). Small extractors
 * stay as flat single files. The public class names are unchanged so
 * downstream consumers (e.g. `parser.js`) keep working.
 */
export { DartExtractor } from "./dart/index.js";
export { CppExtractor } from "./cpp/index.js";
export { CSharpExtractor } from "./csharp/index.js";
export { RustExtractor } from "./rust/index.js";
export { GoExtractor } from "./go-extractor.js";
export { PythonExtractor } from "./python-extractor.js";
export { JavaExtractor } from "./java-extractor.js";
export { KotlinExtractor } from "./kotlin-extractor.js";
export { RubyExtractor } from "./ruby-extractor.js";
export { PhpExtractor } from "./php/index.js";
export { TypeScriptExtractor } from "./typescript-extractor.js";
