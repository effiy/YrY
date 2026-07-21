/**
 * Rust struct / enum / trait / impl body extraction.
 *
 * Each `extract*` function follows the same pattern: read the leading
 * `name` field, walk the body for members, push a class entry, and gate
 * exports on the `pub` modifier (via `isPublic`).
 */
import { findChild, findChildren } from "../base-extractor.js";
import { extractParams, extractReturnType, isPublic } from "./function.js";
/**
 * Extract a top-level function_item (free function, not a method on an
 * impl block). The class.js file owns method extraction inside `impl_item`.
 */
export function extractFunction(node, functions, exports) {
    const nameNode = node.childForFieldName("name");
    if (!nameNode)
        return;
    const paramsNode = node.childForFieldName("parameters");
    const params = extractParams(paramsNode ?? null);
    const returnType = extractReturnType(node);
    functions.push({
        name: nameNode.text,
        lineRange: [
            node.startPosition.row + 1,
            node.endPosition.row + 1,
        ],
        params,
        returnType,
    });
    if (isPublic(node)) {
        exports.push({
            name: nameNode.text,
            lineNumber: node.startPosition.row + 1,
        });
    }
}
/**
 * Extract a struct_item into the classes array. Public structs are
 * exported. Methods are attached later from `methodsByType` (collected by
 * `extractImpl`).
 */
export function extractStruct(node, classes, exports) {
    const nameNode = node.childForFieldName("name");
    if (!nameNode)
        return;
    const properties = [];
    const body = node.childForFieldName("body");
    if (body && body.type === "field_declaration_list") {
        const fields = findChildren(body, "field_declaration");
        for (const field of fields) {
            const fieldName = findChild(field, "field_identifier");
            if (fieldName) {
                properties.push(fieldName.text);
            }
        }
    }
    classes.push({
        name: nameNode.text,
        lineRange: [
            node.startPosition.row + 1,
            node.endPosition.row + 1,
        ],
        methods: [], // Methods are attached later from methodsByType
        properties,
    });
    if (isPublic(node)) {
        exports.push({
            name: nameNode.text,
            lineNumber: node.startPosition.row + 1,
        });
    }
}
/**
 * Extract an enum_item. Enum variants are surfaced as `properties` of the
 * resulting class entry. Public enums are exported.
 */
export function extractEnum(node, classes, exports) {
    const nameNode = node.childForFieldName("name");
    if (!nameNode)
        return;
    const properties = [];
    const body = node.childForFieldName("body");
    if (body && body.type === "enum_variant_list") {
        const variants = findChildren(body, "enum_variant");
        for (const variant of variants) {
            const variantName = variant.childForFieldName("name");
            if (variantName) {
                properties.push(variantName.text);
            }
        }
    }
    classes.push({
        name: nameNode.text,
        lineRange: [
            node.startPosition.row + 1,
            node.endPosition.row + 1,
        ],
        methods: [], // Methods are attached later if there's an impl block
        properties,
    });
    if (isPublic(node)) {
        exports.push({
            name: nameNode.text,
            lineNumber: node.startPosition.row + 1,
        });
    }
}
/**
 * Extract a trait_item. Trait bodies can contain `function_signature_item`
 * declarations (no body) and `function_item` defaults (with body). Both
 * shapes contribute to the trait's `methods` array. Public traits are
 * exported.
 */
export function extractTrait(node, classes, exports) {
    const nameNode = node.childForFieldName("name");
    if (!nameNode)
        return;
    const methods = [];
    const body = findChild(node, "declaration_list");
    if (body) {
        // Trait bodies contain function_signature_item for method declarations
        const sigs = findChildren(body, "function_signature_item");
        for (const sig of sigs) {
            const sigName = findChild(sig, "identifier");
            if (sigName) {
                methods.push(sigName.text);
            }
        }
        // Also handle default method implementations (function_item)
        const fns = findChildren(body, "function_item");
        for (const fn of fns) {
            const fnName = fn.childForFieldName("name");
            if (fnName) {
                methods.push(fnName.text);
            }
        }
    }
    classes.push({
        name: nameNode.text,
        lineRange: [
            node.startPosition.row + 1,
            node.endPosition.row + 1,
        ],
        methods,
        properties: [],
    });
    if (isPublic(node)) {
        exports.push({
            name: nameNode.text,
            lineNumber: node.startPosition.row + 1,
        });
    }
}
/**
 * Extract every `function_item` inside an `impl_item` body. Each method
 * is added to `functions[]` and its name is recorded in
 * `methodsByType[typeName]` so the orchestrator can attach it to the
 * matching struct / enum / trait. Public methods are exported.
 */
export function extractImpl(node, functions, exports, methodsByType) {
    const typeNode = node.childForFieldName("type");
    const typeName = typeNode ? typeNode.text : null;
    const body = node.childForFieldName("body");
    if (!body)
        return;
    const fns = findChildren(body, "function_item");
    for (const fn of fns) {
        const nameNode = fn.childForFieldName("name");
        if (!nameNode)
            continue;
        const paramsNode = fn.childForFieldName("parameters");
        const params = extractParams(paramsNode ?? null);
        const returnType = extractReturnType(fn);
        functions.push({
            name: nameNode.text,
            lineRange: [
                fn.startPosition.row + 1,
                fn.endPosition.row + 1,
            ],
            params,
            returnType,
        });
        // Track method association with the impl type
        if (typeName) {
            if (!methodsByType.has(typeName)) {
                methodsByType.set(typeName, []);
            }
            methodsByType.get(typeName).push(nameNode.text);
        }
        // pub methods inside impl blocks are exports
        if (isPublic(fn)) {
            exports.push({
                name: nameNode.text,
                lineNumber: fn.startPosition.row + 1,
            });
        }
    }
}
