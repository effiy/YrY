/**
 * C# extractor for tree-sitter structural analysis and call graph extraction.
 *
 * Handles classes, interfaces, methods, constructors, properties, fields,
 * using directives, visibility-based exports, and call graphs for C# source code.
 *
 * C#-specific mapping decisions:
 * - Classes and interfaces are mapped to the `classes` array.
 * - Constructors are mapped to the `functions` array (named after the class).
 * - Methods (including interface method signatures) are listed in the
 *   containing class/interface's `methods` array and also in the `functions` array.
 * - Properties (e.g., `public string Name { get; set; }`) are extracted into
 *   the containing class's `properties` array alongside fields.
 * - Exports are determined by the `public` modifier on classes, interfaces,
 *   methods, constructors, properties, and fields.
 * - Namespaces: both block-scoped (`namespace Foo { ... }`) and file-scoped
 *   (`namespace Foo;`) are traversed to find declarations.
 * - Using directives are mapped to imports, with the last dotted component
 *   as the specifier.
 *
 * Implementation is split across siblings to keep each file focused:
 *   - function.js — pure param / return-type / modifier parsing
 *   - class.js    — class / interface / method / property / field extraction
 *   - import.js   — using directive extraction
 *   - calls.js    — call-graph walk
 *   - index.js    — orchestrator (this file)
 */
import { extractClass, extractInterface } from "./class.js";
import { extractUsing } from "./import.js";
import { extractCallGraph } from "./calls.js";
export class CSharpExtractor {
    languageIds = ["csharp"];
    extractStructure(rootNode) {
        const functions = [];
        const classes = [];
        const imports = [];
        const exports = [];
        walkTopLevel(rootNode, functions, classes, imports, exports);
        return { functions, classes, imports, exports };
    }
    extractCallGraph(rootNode) {
        return extractCallGraph(rootNode);
    }
}
/**
 * Walk the top-level nodes of a compilation_unit, recursing into
 * namespace bodies to find declarations.
 */
function walkTopLevel(node, functions, classes, imports, exports) {
    for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (!child)
            continue;
        switch (child.type) {
            case "using_directive":
                extractUsing(child, imports);
                break;
            case "namespace_declaration":
                // Recurse into namespace body (declaration_list)
                walkNamespaceBody(child, functions, classes, imports, exports);
                break;
            case "file_scoped_namespace_declaration":
                // File-scoped namespace: declarations are siblings at the root,
                // not children of this node. Nothing to recurse into.
                break;
            case "class_declaration":
                extractClass(child, functions, classes, exports);
                break;
            case "interface_declaration":
                extractInterface(child, functions, classes, exports);
                break;
        }
    }
}
/**
 * Walk into a namespace_declaration's body (declaration_list) to find
 * classes, interfaces, and nested namespaces.
 */
function walkNamespaceBody(nsNode, functions, classes, imports, exports) {
    const body = nsNode.childForFieldName("body");
    if (!body)
        return;
    for (let i = 0; i < body.childCount; i++) {
        const child = body.child(i);
        if (!child)
            continue;
        switch (child.type) {
            case "class_declaration":
                extractClass(child, functions, classes, exports);
                break;
            case "interface_declaration":
                extractInterface(child, functions, classes, exports);
                break;
            case "namespace_declaration":
                // Nested namespaces
                walkNamespaceBody(child, functions, classes, imports, exports);
                break;
        }
    }
}
// Re-export the building blocks so other C#-aware tooling can reach them
// without re-importing the split files.
export { extractClass, extractInterface } from "./class.js";
export { extractUsing } from "./import.js";
export { extractCallGraph as extractCSharpCallGraph } from "./calls.js";
export { extractParams, extractReturnType, hasModifier } from "./function.js";
