/**
 * C/C++ extractor for tree-sitter structural analysis and call graph extraction.
 *
 * Handles:
 * - Free functions (function_definition)
 * - Classes (class_specifier) with methods, properties, and access specifiers
 * - Structs (struct_specifier) with fields
 * - #include directives mapped to imports
 * - Namespaces (namespace_definition) with recursive traversal
 * - Out-of-class method definitions (e.g., void Server::start())
 * - Call graph extraction from call_expression nodes
 *
 * C/C++ has no formal export syntax. Non-static top-level functions and
 * public class/struct members are treated as exports.
 *
 * Implementation is split across siblings to keep each file focused:
 *   - function.js — pure declarator / param / return-type parsing
 *   - class.js    — class_specifier / struct_specifier body collection
 *   - import.js   — #include directive extraction
 *   - calls.js    — call-graph walk
 *   - index.js    — orchestrator (this file)
 */
import { findChild } from "../base-extractor.js";
import { extractClassOrStruct } from "./class.js";
import { extractInclude } from "./import.js";
import { extractCallGraph } from "./calls.js";
import { extractFuncDeclName, extractParams, extractReturnType, isStatic } from "./function.js";
export class CppExtractor {
    languageIds = ["cpp", "c"];
    extractStructure(rootNode) {
        const functions = [];
        const classes = [];
        const imports = [];
        const exports = [];
        // Track methods associated with classes via out-of-class definitions
        const methodsByClass = new Map();
        walkTopLevel(rootNode, functions, classes, imports, exports, methodsByClass);
        // Attach out-of-class methods to their corresponding classes
        for (const cls of classes) {
            const methods = methodsByClass.get(cls.name);
            if (methods) {
                for (const m of methods) {
                    if (!cls.methods.includes(m)) {
                        cls.methods.push(m);
                    }
                }
            }
        }
        return { functions, classes, imports, exports };
    }
    extractCallGraph(rootNode) {
        return extractCallGraph(rootNode);
    }
}
/**
 * Walk top-level declarations. Recurses into namespace_definition bodies
 * to find nested declarations.
 */
function walkTopLevel(parentNode, functions, classes, imports, exports, methodsByClass) {
    for (let i = 0; i < parentNode.childCount; i++) {
        const node = parentNode.child(i);
        if (!node)
            continue;
        switch (node.type) {
            case "preproc_include":
                extractInclude(node, imports);
                break;
            case "class_specifier":
                extractClassOrStruct(node, "class", classes, functions, exports);
                break;
            case "struct_specifier":
                extractClassOrStruct(node, "struct", classes, functions, exports);
                break;
            case "function_definition":
                extractFunctionDef(node, functions, exports, methodsByClass);
                break;
            case "namespace_definition": {
                // Recurse into namespace body (declaration_list)
                const body = findChild(node, "declaration_list");
                if (body) {
                    walkTopLevel(body, functions, classes, imports, exports, methodsByClass);
                }
                break;
            }
            case "declaration": {
                // A top-level ";" terminated statement — could be a class/struct with a trailing ;
                // e.g., `class Foo { ... };` parses the class_specifier as a child of a
                // declaration in some contexts. Check for nested class/struct specifiers.
                const innerClass = findChild(node, "class_specifier");
                if (innerClass) {
                    extractClassOrStruct(innerClass, "class", classes, functions, exports);
                }
                const innerStruct = findChild(node, "struct_specifier");
                if (innerStruct) {
                    extractClassOrStruct(innerStruct, "struct", classes, functions, exports);
                }
                break;
            }
        }
    }
}
/**
 * Extract a free function or out-of-class method definition.
 *
 * For qualified names (e.g., `void Server::start()`), the method is:
 * - Added to the functions array
 * - Tracked in methodsByClass for later association with the class
 * - Exported if non-static
 *
 * Static functions are NOT exported.
 */
function extractFunctionDef(node, functions, exports, methodsByClass) {
    const funcDecl = node.childForFieldName("declarator");
    if (!funcDecl || funcDecl.type !== "function_declarator")
        return;
    const info = extractFuncDeclName(funcDecl);
    if (!info)
        return;
    const paramsNode = funcDecl.childForFieldName("parameters");
    const params = extractParams(paramsNode);
    const returnType = extractReturnType(node);
    functions.push({
        name: info.name,
        lineRange: [
            node.startPosition.row + 1,
            node.endPosition.row + 1,
        ],
        params,
        returnType,
    });
    // Track out-of-class method definitions (e.g., void Server::start())
    if (info.qualifier) {
        if (!methodsByClass.has(info.qualifier)) {
            methodsByClass.set(info.qualifier, []);
        }
        methodsByClass.get(info.qualifier).push(info.name);
    }
    // Non-static top-level functions are exports
    if (!isStatic(node)) {
        exports.push({
            name: info.name,
            lineNumber: node.startPosition.row + 1,
        });
    }
}
// Re-export the building blocks so other C++-aware tooling can reach them
// without re-importing the split files.
export { extractClassOrStruct } from "./class.js";
export { extractInclude } from "./import.js";
export { extractCallGraph as extractCppCallGraph } from "./calls.js";
export { unwrapDeclaratorName, extractFuncDeclName, extractParams, extractReturnType, isStatic, } from "./function.js";
