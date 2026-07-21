/**
 * Aggregator: every concrete language extractor must be registered here.
 *
 * Refactor note (2026-07-19): C#, Dart, Kotlin, and PHP extractors were removed from
 * the built-in tree-sitter set. Keep this list in sync with
 * `languages/configs/index.js` so default plugin registration only advertises
 * languages with shipped extraction support.
 */
import { CppExtractor } from "./cpp/index.js";
import { RustExtractor } from "./rust/index.js";
import { GoExtractor } from "./go-extractor.js";
import { PythonExtractor } from "./python-extractor.js";
import { JavaExtractor } from "./java-extractor.js";
import { RubyExtractor } from "./ruby-extractor.js";
import { TypeScriptExtractor } from "./typescript-extractor.js";

export {
    CppExtractor,
    RustExtractor,
    GoExtractor,
    PythonExtractor,
    JavaExtractor,
    RubyExtractor,
    TypeScriptExtractor,
};

export const builtinExtractors = [
    new TypeScriptExtractor(),
    new CppExtractor(),
    new RustExtractor(),
    new GoExtractor(),
    new PythonExtractor(),
    new JavaExtractor(),
    new RubyExtractor(),
];
