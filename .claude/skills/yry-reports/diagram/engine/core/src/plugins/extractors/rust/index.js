/**
 * Rust extractor for tree-sitter structural analysis and call graph extraction.
 *
 * Handles functions, structs, enums, traits, impl blocks, use declarations,
 * visibility-based exports, and call graphs for Rust source code.
 *
 * Rust-specific mapping decisions:
 * - Structs, enums, and traits are mapped to the `classes` array.
 * - Methods inside `impl` blocks are stored as functions and also listed
 *   in the corresponding struct/enum's `methods` array.
 * - Trait method signatures (function_signature_item) are listed in the
 *   trait's `methods` array.
 * - Exports are determined by the `pub` visibility modifier.
 * - Enum variants are extracted as `properties` of the enum class entry.
 *
 * Implementation is split across siblings to keep each file focused:
 *   - function.js — pure param / return-type / visibility parsing
 *   - class.js    — struct / enum / trait / impl body extraction
 *   - import.js   — use declaration extraction
 *   - calls.js    — call-graph walk
 *   - index.js    — orchestrator (this file)
 */
import { extractFunction, extractStruct, extractEnum, extractTrait, extractImpl } from "./class.js";
import { extractUseDeclaration } from "./import.js";
import { extractCallGraph } from "./calls.js";
export class RustExtractor {
    languageIds = ["rust"];
    extractStructure(rootNode) {
        const functions = [];
        const classes = [];
        const imports = [];
        const exports = [];
        // Track methods per impl type so we can attach them to structs/enums
        const methodsByType = new Map();
        for (let i = 0; i < rootNode.childCount; i++) {
            const node = rootNode.child(i);
            if (!node)
                continue;
            switch (node.type) {
                case "function_item":
                    extractFunction(node, functions, exports);
                    break;
                case "struct_item":
                    extractStruct(node, classes, exports);
                    break;
                case "enum_item":
                    extractEnum(node, classes, exports);
                    break;
                case "trait_item":
                    extractTrait(node, classes, exports);
                    break;
                case "impl_item":
                    extractImpl(node, functions, exports, methodsByType);
                    break;
                case "use_declaration":
                    extractUseDeclaration(node, imports);
                    break;
            }
        }
        // Attach collected methods to their corresponding structs/enums/traits
        for (const cls of classes) {
            const methods = methodsByType.get(cls.name);
            if (methods) {
                cls.methods.push(...methods);
            }
        }
        return { functions, classes, imports, exports };
    }
    extractCallGraph(rootNode) {
        return extractCallGraph(rootNode);
    }
}
// Re-export the building blocks so other Rust-aware tooling can reach them
// without re-importing the split files.
export { extractFunction, extractStruct, extractEnum, extractTrait, extractImpl, } from "./class.js";
export { extractUseDeclaration } from "./import.js";
export { extractCallGraph as extractRustCallGraph } from "./calls.js";
export { extractParams, extractReturnType, isPublic } from "./function.js";
