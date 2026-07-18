/**
 * C# function-signature parsing helpers.
 *
 * Pure utilities for walking C# `parameter_list` and `method_declaration`
 * nodes. Pair with `class.js` (which owns the class-body iteration) and
 * `calls.js` (call-graph extraction).
 */
import { findChildren } from "../base-extractor.js";
/**
 * Extract parameter names from a C# `parameter_list` node.
 *
 * Each `parameter` child has a `name` field (identifier) and a `type` field.
 */
export function extractParams(paramsNode) {
    if (!paramsNode)
        return [];
    const params = [];
    const paramNodes = findChildren(paramsNode, "parameter");
    for (const param of paramNodes) {
        const nameNode = param.childForFieldName("name");
        if (nameNode) {
            params.push(nameNode.text);
        }
    }
    return params;
}
/**
 * Extract the return type text from a method_declaration node.
 *
 * In tree-sitter-c-sharp, the return type is the `returns` named field.
 * It can be a predefined_type (void, int, string), generic_name (List<T>),
 * identifier, nullable_type, etc.
 */
export function extractReturnType(node) {
    const typeNode = node.childForFieldName("returns");
    if (!typeNode)
        return undefined;
    return typeNode.text;
}
/**
 * Check if a C# declaration node has a specific modifier.
 *
 * Unlike Java (which has a single `modifiers` container), C# tree-sitter
 * emits multiple separate `modifier` nodes as direct children of the
 * declaration. Each modifier node contains a single keyword child
 * (e.g., `public`, `private`, `static`).
 */
export function hasModifier(node, modifier) {
    const modifierNodes = findChildren(node, "modifier");
    for (const mod of modifierNodes) {
        for (let i = 0; i < mod.childCount; i++) {
            const child = mod.child(i);
            if (child && child.text === modifier)
                return true;
        }
    }
    return false;
}
