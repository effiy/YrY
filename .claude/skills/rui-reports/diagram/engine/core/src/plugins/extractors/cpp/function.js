/**
 * C/C++ function-signature parsing helpers.
 *
 * Pure utilities that unwrap declarator trees, walk parameter lists, and
 * surface the return type / static modifier. Pair with `class.js` and
 * `calls.js`; never mutates the higher-level result arrays.
 */
import { findChild, findChildren } from "../base-extractor.js";
/**
 * Recursively unwrap nested declarators (pointer_declarator, reference_declarator,
 * array_declarator) to find the leaf identifier name.
 *
 * C/C++ parameter declarators can be deeply nested:
 *   `char** pp` => pointer_declarator -> pointer_declarator -> identifier("pp")
 *   `const std::string& ref` => reference_declarator -> identifier("ref")
 *   `int arr[]` => array_declarator -> identifier("arr")
 */
export function unwrapDeclaratorName(node) {
    if (node.type === "identifier" || node.type === "field_identifier") {
        return node.text;
    }
    // Dig into the nested declarator field
    const inner = node.childForFieldName("declarator");
    if (inner) {
        return unwrapDeclaratorName(inner);
    }
    // Fallback: look for direct identifier/field_identifier child
    const id = findChild(node, "identifier") ?? findChild(node, "field_identifier");
    return id ? id.text : null;
}
/**
 * Extract the function/method name from a function_declarator node.
 *
 * The declarator field can be:
 * - `identifier` for free functions: `int baz(int y)`
 * - `field_identifier` for in-class declarations/definitions: `void start();`
 * - `qualified_identifier` for out-of-class definitions: `void Server::start()`
 *
 * For qualified_identifier, we extract just the final name (e.g., "start"),
 * but also return the qualifier (e.g., "Server") to associate methods with classes.
 */
export function extractFuncDeclName(funcDecl) {
    const declNode = funcDecl.childForFieldName("declarator");
    if (!declNode)
        return null;
    if (declNode.type === "identifier" || declNode.type === "field_identifier") {
        return { name: declNode.text, qualifier: null };
    }
    if (declNode.type === "qualified_identifier") {
        const nameNode = declNode.childForFieldName("name");
        // The qualifier is the namespace_identifier before ::
        const nsNode = findChild(declNode, "namespace_identifier");
        return {
            name: nameNode ? nameNode.text : declNode.text,
            qualifier: nsNode ? nsNode.text : null,
        };
    }
    return { name: declNode.text, qualifier: null };
}
/**
 * Extract parameter names from a parameter_list node.
 *
 * Each parameter_declaration has a `declarator` field which may be an identifier,
 * pointer_declarator, reference_declarator, or array_declarator. We recursively
 * unwrap to find the actual name.
 */
export function extractParams(paramsNode) {
    if (!paramsNode)
        return [];
    const params = [];
    const decls = findChildren(paramsNode, "parameter_declaration");
    for (const decl of decls) {
        const declNode = decl.childForFieldName("declarator");
        if (declNode) {
            const name = unwrapDeclaratorName(declNode);
            if (name) {
                params.push(name);
            }
        }
    }
    return params;
}
/**
 * Extract the return type text from a function_definition node.
 *
 * The return type is the `type` named field on function_definition.
 * Can be primitive_type, qualified_identifier, type_identifier, etc.
 */
export function extractReturnType(node) {
    const typeNode = node.childForFieldName("type");
    if (typeNode) {
        return typeNode.text;
    }
    return undefined;
}
/**
 * Check if a function_definition has a `storage_class_specifier` child with "static".
 */
export function isStatic(node) {
    const storage = findChild(node, "storage_class_specifier");
    return storage !== null && storage.text === "static";
}
