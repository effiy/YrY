/**
 * PHP extractor for tree-sitter structural analysis and call graph extraction.
 *
 * Handles functions, classes, interfaces, use imports, and call graphs
 * for PHP source code parsed by tree-sitter-php.
 *
 * PHP-specific mapping decisions:
 * - `function_definition` nodes map to the `functions` array.
 * - `class_declaration` and `interface_declaration` map to the `classes` array.
 * - `property_declaration` nodes within classes map to class properties.
 * - `namespace_use_declaration` nodes (PHP `use` statements) map to imports.
 * - PHP has no formal export syntax, so public classes, interfaces, and
 *   top-level functions are treated as exports.
 * - Call graph covers `function_call_expression`, `member_call_expression`,
 *   and `scoped_call_expression`.
 *
 * Implementation is split across siblings to keep each file focused:
 *   - function.js — pure param / return-type / path-segment parsing
 *   - class.js    — class / interface / method / property extraction
 *   - import.js   — namespace_use_declaration extraction
 *   - calls.js    — call-graph walk
 *   - index.js    — orchestrator (this file)
 */
import { findChild } from "../base-extractor.js";
import { extractFunction, extractClass, extractInterface, getName } from "./class.js";
import { extractUseDeclaration } from "./import.js";
import { extractCallGraph } from "./calls.js";
export class PhpExtractor {
    languageIds = ["php"];
    extractStructure(rootNode) {
        const functions = [];
        const classes = [];
        const imports = [];
        const exports = [];
        // tree-sitter-php wraps everything under `program`. The children of
        // `program` include `php_tag`, `namespace_definition`, `namespace_use_declaration`,
        // `class_declaration`, `function_definition`, etc.
        walkStatements(rootNode, functions, classes, imports, exports);
        return { functions, classes, imports, exports };
    }
    extractCallGraph(rootNode) {
        return extractCallGraph(rootNode);
    }
}
/**
 * Walk top-level statements, extracting functions, classes, interfaces, and imports.
 * Handles both direct children and declarations nested inside block-scoped
 * `namespace_definition` nodes (`namespace Foo { class Bar {} }`).
 */
function walkStatements(parent, functions, classes, imports, exports) {
    for (let i = 0; i < parent.childCount; i++) {
        const node = parent.child(i);
        if (!node)
            continue;
        switch (node.type) {
            case "function_definition":
                extractFunction(node, functions);
                exports.push({
                    name: getName(node),
                    lineNumber: node.startPosition.row + 1,
                });
                break;
            case "class_declaration":
                extractClass(node, classes, functions);
                exports.push({
                    name: getName(node),
                    lineNumber: node.startPosition.row + 1,
                });
                break;
            case "interface_declaration":
                extractInterface(node, classes);
                exports.push({
                    name: getName(node),
                    lineNumber: node.startPosition.row + 1,
                });
                break;
            case "namespace_use_declaration":
                extractUseDeclaration(node, imports);
                break;
            case "namespace_definition": {
                // Block-scoped namespaces (`namespace Foo { ... }`) nest declarations
                // inside a compound_statement body. Declarative namespaces (`namespace Foo;`)
                // have no body — their declarations are already siblings at the root.
                const body = findChild(node, "compound_statement");
                if (body) {
                    walkStatements(body, functions, classes, imports, exports);
                }
                break;
            }
        }
    }
}
// Re-export the building blocks so other PHP-aware tooling can reach them
// without re-importing the split files.
export { extractFunction, extractClass, extractInterface, getName } from "./class.js";
export { extractUseDeclaration } from "./import.js";
export { extractCallGraph as extractPhpCallGraph } from "./calls.js";
export { extractParams, extractReturnType, lastSegment } from "./function.js";
