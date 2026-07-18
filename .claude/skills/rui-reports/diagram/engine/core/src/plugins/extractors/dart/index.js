/**
 * Dart extractor for tree-sitter structural analysis + call graph.
 *
 * Approach (matching `KotlinExtractor` convention): mixin / extension / enum
 * declarations are folded into `StructuralAnalysis.classes[]` because the
 * shared schema does not have a first-class slot for them. Extension
 * declarations without a name surface as `"on <TargetType>"` so they aren't
 * silently dropped.
 *
 * Implementation is split across siblings to keep each file focused:
 *   - function.js   — pure signature parsing (name/params/return type)
 *   - class.js      — class/mixin/extension/enum body collection
 *   - import.js     — import/export directive extraction
 *   - calls.js      — call-graph walk (sibling-pairing + selector/ctor sites)
 *   - index.js      — orchestrator (this file)
 */
import { findChild } from "../base-extractor.js";
import { extractFunctionName, extractParams, extractReturnType, isExported } from "./function.js";
import {
    extractClassLikeDeclaration,
    extractExtensionDeclaration,
    extractEnumDeclaration,
} from "./class.js";
import { extractLibraryImport, extractLibraryExport } from "./import.js";
import { extractCallGraph } from "./calls.js";
export class DartExtractor {
    languageIds = ["dart"];
    extractStructure(rootNode) {
        const functions = [];
        const classes = [];
        const imports = [];
        const exports = [];
        for (let i = 0; i < rootNode.childCount; i++) {
            const node = rootNode.child(i);
            if (!node)
                continue;
            switch (node.type) {
                case "function_signature":
                    this.extractTopLevelFunction(node, functions, exports);
                    break;
                case "class_definition":
                    extractClassLikeDeclaration(node, "class_body", classes, functions, exports);
                    break;
                case "mixin_declaration":
                    extractClassLikeDeclaration(node, "class_body", classes, functions, exports);
                    break;
                case "extension_declaration":
                    extractExtensionDeclaration(node, classes, functions, exports);
                    break;
                case "enum_declaration":
                    extractEnumDeclaration(node, classes, exports);
                    break;
                case "import_or_export":
                    this.extractImportOrExport(node, imports, exports);
                    break;
            }
        }
        return { functions, classes, imports, exports };
    }
    extractCallGraph(rootNode) {
        return extractCallGraph(rootNode);
    }
    // ---- Private helpers (kept on the class only for parity with other
    // extractors; they delegate to the split modules) --------------------
    extractTopLevelFunction(sig, functions, exports) {
        const name = extractFunctionName(sig);
        if (!name)
            return;
        functions.push({
            name,
            lineRange: [sig.startPosition.row + 1, sig.endPosition.row + 1],
            params: extractParams(sig),
            returnType: extractReturnType(sig),
        });
        if (isExported(name)) {
            exports.push({ name, lineNumber: sig.startPosition.row + 1 });
        }
    }
    extractImportOrExport(declNode, imports, exports) {
        const libImport = findChild(declNode, "library_import");
        if (libImport) {
            extractLibraryImport(libImport, imports);
            return;
        }
        const libExport = findChild(declNode, "library_export");
        if (libExport) {
            extractLibraryExport(libExport, declNode, exports);
        }
    }
}
// Re-export the building blocks so other Dart-aware tooling can reach them
// without re-importing the split files.
export {
    isExported,
    extractFunctionName,
    extractParamName,
    extractParams,
    extractReturnType,
    constructorName,
} from "./function.js";
export {
    collectClassBody,
    extractClassLikeDeclaration,
    extractExtensionDeclaration,
    extractEnumDeclaration,
} from "./class.js";
export { extractLibraryImport, extractLibraryExport } from "./import.js";
export { extractCallGraph as extractDartCallGraph } from "./calls.js";
